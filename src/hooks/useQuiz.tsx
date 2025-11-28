import { createContext, useContext } from "react";
export type QuizState = {
    imReady: () => void;
    readyUids: string[];
}
export const QuizContext = createContext<QuizState | undefined>(undefined);


export const useQuiz = () => {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error("useQuiz should call inside <QuizProvider/>");
    return ctx;
}