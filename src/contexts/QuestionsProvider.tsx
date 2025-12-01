"use client"
import { createContext, useContext, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Question, QuestionOption } from '@/types';
import { ydoc, mainPersistence } from '@/libs/yjs';
import * as Y from 'yjs';
import { getYType, useYMap } from '@/hooks/useY';
import { nanoid } from 'nanoid';
import QuizProvider from './QuizProvider';

interface QuestionsContextType {
    questions: Question[];
    questionsMap: Record<string, Question>;
    addQuestion: (text: string) => string | undefined;
    removeQuestion: (id: string) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    reorder: (newOrder: Question[]) => void;
    updateOption: (questionId: string, optionId: string, patch: Partial<QuestionOption>) => void;
    addOption: (questionId: string) => void;
    removeOption: (questionId: string, optionIndex: number) => void;
    importQuestions: (questions: Omit<Question, "options">[]) => void;
    importOptions: (options: (Omit<QuestionOption, "id"> & { qid: string; })[]) => void;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export function useQuestions() {
    const context = useContext(QuestionsContext);
    if (context === undefined) {
        throw new Error('useQuestions must be used within a QuestionsProvider');
    }
    return context;
}

interface QuestionsProviderProps {
    children: ReactNode;
    yRoom: Y.Map<unknown>;
}

export default function QuestionsProvider({ children, yRoom }: QuestionsProviderProps) {

    const yQuestionsMap = useMemo(() => {
        let map = yRoom.get('questions');
        if (getYType(map) != "YMap") {
            map = new Y.Map<Question>();
            yRoom.set('questions', map);
        }
        return map as Y.Map<Question>;
    }, [yRoom]);

    // Use useYMap with deep observation for nested options
    const questionsMap = useYMap<Record<string, Question>>(yQuestionsMap, true);

    // Convert map to array for easier use in components, sorted by order
    const questions = useMemo(() => {
        return Object.values(questionsMap)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(question => ({
                ...question,
                // Ensure options have proper structure
                options: question.options?.map(opt => ({
                    ...opt,
                    id: opt.id || nanoid(6) // Ensure option has ID
                })) || []
            }));
    }, [questionsMap]);

    const syncToLocal = useCallback(() => {
        mainPersistence.set("questions", questions as any);
    }, [questions]);

    useEffect(() => {
        syncToLocal();
    }, [syncToLocal]);

    // Add new question
    const addQuestion = useCallback((text: string) => {
        if (!text.trim()) return;
        const id = nanoid();
        const newQuestion: Question = {
            id,
            text: text.replace(/\s+$/, ' ').replace(/^\s+/, ''),
            options: [
                { id: nanoid(6), text: '', correct: true, score: 10 },
                { id: nanoid(6), text: '', correct: false }
            ],
            multiple: false,
            duration: 30,
            order: Object.keys(questionsMap).length,
        };

        ydoc.transact(() => {
            yQuestionsMap.set(id, newQuestion);
        });

        return id;
    }, [yQuestionsMap, questionsMap]);

    const importQuestions = useCallback((questions: Omit<Question, 'options'>[]) => {
        ydoc.transact(() => {
            const currentLength = Object.keys(questionsMap).length;

            questions.forEach((item, index) => {
                const id = item.id || nanoid();
                const newQuestion: Question = {
                    options: [
                        { id: nanoid(6), text: '', correct: true, score: 10 },
                        { id: nanoid(6), text: '', correct: false }
                    ],
                    ...item,
                    id,
                    order: currentLength + index,
                    duration: Math.max(item.duration || 30, 30),
                    text: item.text.replace(/\s+$/, ' ').replace(/^\s+/, ''),
                };
                yQuestionsMap.set(id, newQuestion);
            });
        });
    }, [yQuestionsMap, questionsMap]);

    const importOptions = useCallback((options: (Omit<QuestionOption, 'id'> & { qid: string })[]) => {
        ydoc.transact(() => {
            // Group options by question ID
            const optionsByQuestion = new Map<string, Omit<QuestionOption, 'id'>[]>();

            options.forEach(option => {
                const qid = option.qid;
                if (!qid) return;

                if (!optionsByQuestion.has(qid)) {
                    optionsByQuestion.set(qid, []);
                }
                optionsByQuestion.get(qid)!.push({
                    text: option.text,
                    correct: option.correct,
                    score: option.score
                });
            });

            // Update each question with new options
            optionsByQuestion.forEach((newOptions, qid) => {
                const existingQuestion = yQuestionsMap.get(qid);
                if (existingQuestion) {
                    // Replace existing options with new ones, generating new IDs
                    const updatedOptions: QuestionOption[] = newOptions.map(opt => ({
                        ...opt,
                        id: nanoid(6), // Generate new unique IDs for options
                        score: opt.correct ? (opt.score ?? 0) : 0 // Ensure score is set
                    }));

                    // Ensure at least 2 options
                    if (updatedOptions.length < 2) {
                        console.warn(`Question ${qid} needs at least 2 options`);
                        return;
                    }

                    const updatedQuestion: Question = {
                        ...existingQuestion,
                        options: updatedOptions
                    };

                    yQuestionsMap.set(qid, updatedQuestion);
                } else {
                    console.warn(`Question with ID ${qid} not found, skipping options import`);
                }
            });
        });
    }, [yQuestionsMap]);

    // Remove question
    const removeQuestion = useCallback((id: string) => {
        ydoc.transact(() => {
            yQuestionsMap.delete(id);

            // Recalculate order for remaining questions
            const remainingQuestions = Array.from(yQuestionsMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0));

            remainingQuestions.forEach((question, index) => {
                if (question.id !== id) {
                    yQuestionsMap.set(question.id, { ...question, order: index });
                }
            });
        });
    }, [yQuestionsMap]);

    // Update question with partial updates
    const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
        const currentQuestion = questionsMap[id];
        if (!currentQuestion) return;

        ydoc.transact(() => {
            const updatedQuestion = { ...currentQuestion, ...updates };
            yQuestionsMap.set(id, updatedQuestion);
        });
    }, [yQuestionsMap, questionsMap]);

    // Reorder questions
    const reorder = useCallback((newOrder: Question[]) => {
        ydoc.transact(() => {
            // Clear the map
            const tempQuestions = Array.from(yQuestionsMap.values());
            yQuestionsMap.clear();

            // Add questions back with new order
            newOrder.forEach((question, index) => {
                const existingQuestion = tempQuestions.find(q => q.id === question.id);
                const questionWithOrder = {
                    ...(existingQuestion || question),
                    order: index
                };
                yQuestionsMap.set(question.id, questionWithOrder);
            });
        });
    }, [yQuestionsMap]);

    const updateOption = useCallback((questionId: string, optionId: string, patch: Partial<QuestionOption>) => {
        const question = questionsMap[questionId];
        if (!question) return;

        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, ...patch } : opt
        );

        ydoc.transact(() => {
            yQuestionsMap.set(questionId, {
                ...question,
                options: newOptions
            });
        });
    }, [yQuestionsMap, questionsMap]);

    const addOption = useCallback((questionId: string) => {
        const question = questionsMap[questionId];
        if (!question || question.options.length >= 6) return;

        ydoc.transact(() => {
            yQuestionsMap.set(questionId, {
                ...question,
                options: [
                    ...question.options,
                    { id: nanoid(6), text: '', correct: false }
                ]
            });
        });
    }, [yQuestionsMap, questionsMap]);

    const removeOption = useCallback((questionId: string, optionIndex: number) => {
        const question = questionsMap[questionId];
        if (!question || question.options.length <= 2) return;

        const newOptions = question.options.filter((_, idx) => idx !== optionIndex);

        ydoc.transact(() => {
            yQuestionsMap.set(questionId, {
                ...question,
                options: newOptions
            });
        });
    }, [yQuestionsMap, questionsMap]);

    const value = useMemo(() => ({
        questions,
        questionsMap,
        addQuestion,
        removeQuestion,
        updateQuestion,
        reorder,
        updateOption,
        addOption,
        removeOption,
        importQuestions,
        importOptions
    }), [
        questions,
        questionsMap,
        addQuestion,
        removeQuestion,
        updateQuestion,
        reorder,
        updateOption,
        addOption,
        removeOption,
        importQuestions,
        importOptions
    ]);

    return (
        <QuestionsContext.Provider value={value}>
            <QuizProvider yRoom={yRoom}>
                {children}
            </QuizProvider>
        </QuestionsContext.Provider>
    );
}