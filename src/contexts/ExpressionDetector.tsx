import { EventArgs, useCamera } from '@/hooks/useCamera';
import { useQuizQuestion } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useCurrentUser } from './SessionProvider';
import { useRecords } from '@/hooks/useRecords';
import * as Y from "yjs";
import { useRoomManager } from './RoomManager';

export const EXPRESSIONS = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];

export default function ExpressionDetector({ children }: { children?: ReactNode }) {

    const user = useCurrentUser();
    const { room } = useRoomManager();
    const { addEventListener } = useCamera();
    const { question } = useQuizQuestion();
    const { getRecord } = useRecords();

    const yExpressions = getRecord("expressions");
    const bufferRef = useRef<number[]>(Array(EXPRESSIONS.length).fill(0));

    const getOrCreateRecord = useCallback(() => {
        if (!user?.id || !question?.id) return null;

        const id = `${user.id}:${question.id}`;
        let rec = yExpressions.get(id);

        if (!rec) {
            yExpressions.doc?.transact(() => {
                if (!yExpressions.has(id)) {
                    rec = new Y.Map();
                    rec.set("uid", user.id);
                    rec.set("qid", question.id);
                    rec.set("buffer", new Y.Array());
                    yExpressions.set(id, rec);
                } else {
                    rec = yExpressions.get(id);
                }
            });
        }
        return rec as Y.Map<any>;
    }, [user?.id, question?.id, yExpressions]);


    const handleOnExpDetected = useCallback(({ expression }: EventArgs["expressionDetected"]) => {
        const expIndex = EXPRESSIONS.indexOf(expression);
        if (expIndex < 0) return;
        bufferRef.current[expIndex] += 1;
    }, []);

    useEffect(() => {
        // Reset local buffer whenever relevant context changes
        bufferRef.current = Array(EXPRESSIONS.length).fill(0);

        let syncInterval: NodeJS.Timeout | null = null;

        const syncNow = () => {
            const yRecord = getOrCreateRecord();
            if (!yRecord) return;

            const buf = bufferRef.current;
            // Avoid noisy writes when there's nothing detected
            if (buf.every(v => v === 0)) return;

            yRecord.doc?.transact(() => {
                let ybuf = yRecord.get("buffer") as Y.Array<number>;
                if (!ybuf) {
                    ybuf = new Y.Array();
                    yRecord.set("buffer", ybuf);
                }
                if (ybuf.length > 0) ybuf.delete(0, ybuf.length);
                ybuf.insert(0, [...buf]);

                // Add a timestamp to help hosts detect fresh updates
                yRecord.set("lastUpdated", Date.now());
            });
        };

        if (room.status === "playing") {
            // Flush immediately when entering playing and then every 5s
            syncNow();
            syncInterval = setInterval(syncNow, 5000);
        }

        return () => {
            if (syncInterval) clearInterval(syncInterval);
            // Final attempt to persist remaining counts
            syncNow();
        };
    }, [getOrCreateRecord, room.status, question?.id, user?.id]);

    useEffect(() => {
        return addEventListener("expressionDetected", handleOnExpDetected);
    }, [addEventListener, handleOnExpDetected]);

    return <>{children}</>;
}