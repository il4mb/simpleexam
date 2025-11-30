import { EventArgs, useCamera } from '@/hooks/useCamera';
import { useQuizQuestion } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useCurrentUser } from './SessionProvider';
import { useRecords } from '@/hooks/useRecords';

export const EXPRESSIONS = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];

export default function ExpressionDetector({ children }: { children?: ReactNode }) {
    const user = useCurrentUser();
    const { addEventListener } = useCamera();
    const { question } = useQuizQuestion();
    const { yExpressions, yRecords } = useRecords();
    const bufferRef = useRef<number[]>([]);

    const handleOnExpDetected = useCallback(({ expression }: EventArgs["expressionDetected"]) => {
        const expIndex = EXPRESSIONS.indexOf(expression);
        if (expIndex < 0) return;
        if (bufferRef.current.length != EXPRESSIONS.length) {
            bufferRef.current = Array(EXPRESSIONS.length).fill(0);
        }
        bufferRef.current[expIndex] += 1;
    }, [question, user]);

    useEffect(() => {
        bufferRef.current = Array(EXPRESSIONS.length).fill(0);
        const syncInterval = setInterval(() => {
            if (!question || !user) return;
            const id = `${user.id}:${question.id}`;
            const buf = bufferRef.current;
            yRecords.doc?.transact(() => {
                yExpressions.set(id, {
                    uid: user.id,
                    qid: question.id,
                    buffer: buf
                });
            });
        }, 5000);

        return () => clearInterval(syncInterval);
    }, [yExpressions, yRecords, question?.id]);

    useEffect(() => {
        return addEventListener("expressionDetected", handleOnExpDetected);
    }, [handleOnExpDetected]);

    return <>{children}</>;
}
