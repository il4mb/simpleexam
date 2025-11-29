import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { Answer, Question } from '@/types';


export type QuizState = {
    // Quiz state
    isQuizActive: boolean;
    isQuizPaused: boolean;
    isQuizEnded: boolean;
    questionIndex: number;
    questionStartTime: number;
    autoPlay: boolean;
    timeLeft: number;
    transition: boolean;
    transitionDelay: number;
    isTransitioning: boolean;

    // Questions
    currentQuestion: Question | undefined;
    totalQuestions: number;

    // User actions
    readyUids: string[];
    imReady: () => void;
    submitAnswer: (questionId: string, optionsId: string[]) => void;
    getUserAnswer: (questionId: string) => Answer | null | undefined;
    getQuestionAnswers: (questionId: string) => Answer[];
    getUserStats: (userId: string) => {
        totalAnswered: number;
        totalTimeSpent: number;
        averageTime: number;
    };

    // Host controls
    isHost: boolean;
    startQuiz: () => void;
    nextQuiz: () => void;
    prevQuiz: () => void;
    finishQuiz: () => void;
    pauseQuiz: () => void;
    resumeQuiz: () => void;
    jumpToQuestion: (targetIndex: number) => void;
    setAutoPlay: (autoPlay: boolean) => void;

    // Statistics
    quizStats: {
        totalQuestions: number;
        totalParticipants: number;
        currentQuestionAnswers: number;
        currentQuestionParticipants: number;
        totalAnswers: number;
        completionRate: number;
        averageAnswersPerQuestion: number;
    };
    answers: Answer[];

    // Navigation helpers
    isFirstQuestion: boolean;
    isLastQuestion: boolean;
    hasNextQuestion: boolean;
    hasPreviousQuestion: boolean;

    // Progress
    progress: number;
    elapsedTime: number;
    remainingQuestions: number;
}
export const QuizContext = createContext<QuizState | undefined>(undefined);


export const useQuiz = () => {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error("useQuiz should call inside <QuizProvider/>");
    return ctx;
}



export function useQuizQuestion() {

    const { questionIndex, questionStartTime } = useQuiz();
    const { questions } = useQuestions();
    const question = useMemo<Question | undefined>(() => questions[questionIndex], [questions, questionIndex]);

    return useMemo(() => ({
        question,
        questionIndex,
        startTime: questionStartTime
    }), [questionStartTime, questionIndex, question]);
}