"use client"
import { createContext, useContext, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Question } from '@/types';
import { ydoc, mainPersistence } from '@/libs/yjs';
import * as Y from 'yjs';
import { useYArray } from '@/hooks/useY';
import { nanoid } from 'nanoid';
import QuizProvider from './QuizProvider';


interface QuestionsContextType {
    questions: Question[];
    addQuestion: (text: string) => string | undefined;
    removeQuestion: (id: string) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    reorder: (newOrder: Question[]) => void;
    updateQuestionText: (id: string, text: string) => void;
    updateOptionText: (questionId: string, optionIndex: number, text: string) => void;
    addOption: (questionId: string) => void;
    removeOption: (questionId: string, optionIndex: number) => void;
    setCorrectAnswer: (questionId: string, optionIndex: number) => void;
    updateDuration: (questionId: string, duration: number) => void;
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

    const yQuestions = useMemo(() => {
        let arr = yRoom.get('questions');
        if (!arr) {
            arr = new Y.Array<Question>();
            yRoom.set('questions', arr);
        }
        return arr as Y.Array<Question>;
    }, [yRoom]);
    const questions = useYArray(yQuestions);

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
            text: text.trim(),
            options: ['', ''],
            duration: 30,
        };

        ydoc.transact(() => {
            yQuestions.push([newQuestion]);
        });

        return id;
    }, [yQuestions]);

    // Remove question
    const removeQuestion = useCallback((id: string) => {
        ydoc.transact(() => {
            const index = questions.findIndex(q => q.id === id);
            if (index !== -1) {
                yQuestions.delete(index, 1);
            }
        });
    }, [yQuestions, questions]);

    // Update question with partial updates
    const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
        ydoc.transact(() => {
            const index = questions.findIndex(q => q.id === id);
            if (index !== -1) {
                const currentQuestion = questions[index];
                const updatedQuestion = { ...currentQuestion, ...updates };
                yQuestions.delete(index, 1);
                yQuestions.insert(index, [updatedQuestion]);
            }
        });
    }, [yQuestions, questions]);

    // Reorder questions
    const reorder = useCallback((newOrder: Question[]) => {
        ydoc.transact(() => {
            yQuestions.delete(0, yQuestions.length);
            yQuestions.insert(0, newOrder);
        });
    }, [yQuestions]);

    // Specific update functions for better performance
    const updateQuestionText = useCallback((id: string, text: string) => {
        updateQuestion(id, { text: text.trim() });
    }, [updateQuestion]);

    const updateOptionText = useCallback((questionId: string, optionIndex: number, text: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newOptions = [...question.options];
            newOptions[optionIndex] = text;
            updateQuestion(questionId, { options: newOptions });
        }
    }, [questions, updateQuestion]);

    const addOption = useCallback((questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question && question.options.length < 6) {
            updateQuestion(questionId, { options: [...question.options, ''] });
        }
    }, [questions, updateQuestion]);

    const removeOption = useCallback((questionId: string, optionIndex: number) => {
        const question = questions.find(q => q.id === questionId);
        if (question && question.options.length > 2) {
            const newOptions = question.options.filter((_, idx) => idx !== optionIndex);
            const newCorrectAnswer = question.correctAnswer === optionIndex ? undefined :
                question.correctAnswer && question.correctAnswer > optionIndex ? question.correctAnswer - 1 : question.correctAnswer;

            updateQuestion(questionId, {
                options: newOptions,
                correctAnswer: newCorrectAnswer
            });
        }
    }, [questions, updateQuestion]);

    const setCorrectAnswer = useCallback((questionId: string, optionIndex: number) => {
        updateQuestion(questionId, { correctAnswer: optionIndex });
    }, [updateQuestion]);

    const updateDuration = useCallback((questionId: string, duration: number) => {
        updateQuestion(questionId, { duration: Math.max(5, Math.min(300, duration)) });
    }, [updateQuestion]);

    const value = useMemo(() => ({
        questions,
        addQuestion,
        removeQuestion,
        updateQuestion,
        reorder,
        updateQuestionText,
        updateOptionText,
        addOption,
        removeOption,
        setCorrectAnswer,
        updateDuration,
    }), [
        questions,
        addQuestion,
        removeQuestion,
        updateQuestion,
        reorder,
        updateQuestionText,
        updateOptionText,
        addOption,
        removeOption,
        setCorrectAnswer,
        updateDuration,
    ]);

    return (
        <QuestionsContext.Provider value={value}>
            <QuizProvider yRoom={yRoom}>
                {children}
            </QuizProvider>
        </QuestionsContext.Provider>
    );
}