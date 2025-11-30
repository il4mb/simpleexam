import { useQuiz } from '@/hooks/useQuiz';
import { Context, ExprRecord } from '@/hooks/useRecords';
import { useYMap } from '@/hooks/useY';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import * as Y from "yjs";


export interface RecordsProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<any>;
}
export default function RecordsProvider({ children, yRoom }: RecordsProviderProps) {

    const { addEventListener } = useQuiz();
    const yRecords = useMemo<Y.Map<any>>(() => {
        let recordsMap = yRoom.get("records");
        if (!recordsMap) {
            recordsMap = new Y.Map();
            yRoom.doc?.transact(() => {
                yRoom.set("records", recordsMap);
            });
        }
        return recordsMap;
    }, [yRoom]);
    const yExpressions = useMemo<Y.Map<any>>(() => {
        let expressionsMap = yRecords.get("expressions");
        if (!expressionsMap) {
            expressionsMap = new Y.Map();
            yRoom.doc?.transact(() => {
                yRecords.set("expressions", expressionsMap);
            });
        }
        return expressionsMap;
    }, [yRecords]);
    const records = useYMap<Record<string, any>>(yRecords);
    const expsRecords = useYMap<Record<string, ExprRecord>>(yExpressions);
    const expressions = useMemo(() => Object.values(expsRecords), [expsRecords]);

    const transaction = useCallback((callback: () => void) => {
        yRoom.doc?.transact(callback);
    }, [yRoom]);


    useEffect(() => {
        return addEventListener("start", () => {
            yRoom.doc?.transact(() => {
                yRecords.clear();
            });
        });
    }, []);

    const values = useMemo(() => ({
        records,
        expressions,
        yRecords,
        yExpressions,
        transaction
    }), [records, expressions, yRecords, yExpressions, transaction]);

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
}