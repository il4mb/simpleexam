import { useQuestions } from "@/contexts/QuestionsProvider";
import { useParticipants } from "./useParticipants";
import { ExprRecord, useRecords } from "./useRecords";
import { useMemo } from "react";
import { EXPRESSIONS } from "@/contexts/ExpressionDetector";
import { ExpressionData, Question, User } from "@/types";

type ExpressionResults = {
    question: Question;
    expressions: {
        user?: User;
        data: ExpressionData;
    }[];
}
export const useExpressionResults = () => {

    const { participants } = useParticipants();
    const { questions } = useQuestions();
    const { records } = useRecords();
    const expressions = useMemo<ExprRecord[]>(() => Object.values(records.expressions || {}), [records]);

    return useMemo<ExpressionResults[]>(() => { 
        return questions.map(question => {
            return {
                question,
                expressions: expressions.filter(expr => expr.qid == question.id).map((record) => {
                    const buffer = record.buffer || [];
                    const user = participants.find(u => u.id == record.uid);
                    const entries = EXPRESSIONS.map((name, index) => [name, buffer[index] || 0])
                    return {
                        user,
                        data: Object.fromEntries(entries) as ExpressionData
                    }
                })
            }
        })
    }, [participants, questions, expressions]);
}