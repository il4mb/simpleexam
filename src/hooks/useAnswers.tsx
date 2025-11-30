import { Answer } from "@/types";
import { createContext, useContext } from "react";

export type AnswersContext = {
    answers: Answer[];
    quizStats: {
        totalQuestions: number;
        totalParticipants: number;
        currentQuestionAnswers: number;
        currentQuestionParticipants: number;
        totalAnswers: number;
        completionRate: number;
        averageAnswersPerQuestion: number;
    };
    getQuestionAnswers: (questionId: string) => Answer[];
    getUserAnswer: (questionId: string) => Answer | null | undefined;
    getUserStats: (userId: string) => {
        totalAnswered: number;
        totalTimeSpent: number;
        averageTime: number;
    };
    submitAnswer: (questionId: string, optionsId: string[]) => void;
}

export const Context = createContext<AnswersContext | undefined>(undefined);

export const useAnswers = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useAnswers should call inside <AnswersProvider/>");
    return ctx;
}