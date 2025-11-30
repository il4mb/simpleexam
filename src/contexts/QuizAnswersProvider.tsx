import * as Y from "yjs";
import { Answer } from '@/types';
import { useYMap } from '@/hooks/useY';
import { Context } from '@/hooks/useAnswers';
import { useRoomManager } from './RoomManager';
import { useQuestions } from './QuestionsProvider';
import { useCurrentUser } from './SessionProvider';
import { useQuiz, useQuizQuestion } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';

type TAnswersRoom = {
    questionStartTime?: number;
    answers?: Answer[];
    startTime?: number;
    endTime?: number;
}
export interface AnswersProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<any>;
}
export default function QuizAnswersProvider({ children, yRoom }: AnswersProviderProps) {

    const { addEventListener } = useQuiz();
    const { questions } = useQuestions();
    const { question } = useQuizQuestion();
    const { room } = useRoomManager<TAnswersRoom>();
    const currentUser = useCurrentUser();

    const yAnswers = useMemo(() => {
        let map = yRoom.get('answersMap');
        if (!map) {
            map = new Y.Map<Record<string, Answer>>();
            yRoom.set('answersMap', map);
        }
        return map as Y.Map<Record<string, Answer>>;
    }, [yRoom]);
    const answersMap = useYMap<Record<string, Answer>>(yAnswers);
    const answers = useMemo(() => Object.values(answersMap), [answersMap]);

    // Answer submission
    const submitAnswer = useCallback((questionId: string, optionsId: string[]) => {
        const uid = currentUser?.id;

        if (!uid || !yRoom.doc || room.status != "playing") return;
        if (!optionsId) {
            console.warn("No options selected");
            return;
        }
        const now = Date.now();
        const answerKey = `${uid}:${questionId}`;
        const answerData: Answer = {
            uid,
            questionId,
            optionsId,
            timestamp: now,
            timeSpent: now - (room.questionStartTime || 0)
        };

        try {
            yRoom.doc.transact(() => {
                // @ts-ignore
                yAnswers.set(answerKey, answerData);
            });
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    }, [currentUser?.id, room.questionStartTime, room.status, yRoom, yAnswers]);

    // Get user's answer for specific question
    const getUserAnswer = useCallback((questionId: string) => {
        const uid = currentUser?.id;
        if (!uid) return null;
        return answers.find(answer => answer.uid === uid && answer.questionId === questionId);
    }, [currentUser?.id, answers]);

    // Get all answers for specific question
    const getQuestionAnswers = useCallback((questionId: string) => {
        return answers.filter(answer => answer.questionId === questionId);
    }, [answers]);

    // Get user statistics
    const getUserStats = useCallback((userId: string) => {
        const userAnswers = answers.filter(answer => answer.uid === userId);
        const totalAnswered = userAnswers.length;
        const totalTimeSpent = userAnswers.reduce((total, answer) => total + answer.timeSpent, 0);
        const averageTime = totalAnswered > 0 ? totalTimeSpent / totalAnswered : 0;

        return {
            totalAnswered,
            totalTimeSpent,
            averageTime
        };
    }, [answers]);


    // Quiz statistics
    const quizStats = useMemo(() => {
        const totalQuestions = questions.length;
        const totalParticipants = new Set(answers.map(a => a.uid)).size;
        const currentQuestionAnswers = question ? getQuestionAnswers(question.id) : [];
        const currentQuestionParticipants = new Set(currentQuestionAnswers.map(a => a.uid)).size;
        const totalAnswers = answers.length;

        return {
            totalQuestions,
            totalParticipants,
            currentQuestionAnswers: currentQuestionAnswers.length,
            currentQuestionParticipants,
            totalAnswers,
            completionRate: totalParticipants > 0 ? (currentQuestionParticipants / totalParticipants) * 100 : 0,
            averageAnswersPerQuestion: totalQuestions > 0 ? totalAnswers / totalQuestions : 0
        };
    }, [questions, question]);


    useEffect(() => {
        return addEventListener("start", () => {
            yAnswers.clear();
        });
    }, []);
    useEffect(() => {
        return addEventListener("initializing", () => {
            yAnswers.clear();
        });
    }, []);


    const values = useMemo(() => ({
        answers,
        quizStats,
        getQuestionAnswers,
        getUserAnswer,
        getUserStats,
        submitAnswer
    }), [
        answers,
        quizStats,
        getQuestionAnswers,
        getUserAnswer,
        getUserStats,
        submitAnswer
    ])


    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
}

