import { createContext, useContext, useMemo } from 'react';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { Question } from '@/types';

export type QuizEventName = "initializing" | "start" | "pause" | "resume" | "finish" | "question-next" | "question-prev";
export type QuizEventArgs = {
    "question-next": { nextIndex: number, prevIndex: number };
    "question-prev": { nextIndex: number, prevIndex: number };
}

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
    totalQuizableParticipant: number;
    canPlayQuiz: boolean;

    // Questions
    currentQuestion: Question | undefined;
    totalQuestions: number;

    // User actions
    readyUids: string[];
    isCurrentUserJoined: boolean;
    imReady: () => void;

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

    // @ts-ignore
    addEventListener: <E extends QuizEventName>(event: E, callback: (args: QuizEventArgs[E]) => void) => () => void

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