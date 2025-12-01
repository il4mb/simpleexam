import { useQuiz } from '@/hooks/useQuiz';
import { Context } from '@/hooks/useRecords';
import { getYType, useYMap } from '@/hooks/useY';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import * as Y from "yjs";

export interface RecordsProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<any>;
    isHost: boolean;
}

export default function RecordsProvider({ children, yRoom, isHost }: RecordsProviderProps) {

    const { addEventListener } = useQuiz();

    // ensure yRoom.records exists
    const yRecords = useMemo<Y.Map<any>>(() => {
        let rec = yRoom.get("records");
        if (getYType(rec) !== "YMap") {
            yRoom.doc?.transact(() => {
                rec = new Y.Map();
                yRoom.set("records", rec);
            });
        }
        return rec as Y.Map<any>;
    }, [yRoom]);

    // auto subscribe Y.Map → React state
    const records = useYMap<Record<string, any>>(yRecords, true);

    // ensure each record key is Y.Map
    const getRecord = useCallback((key: string): Y.Map<any> => {
        let map = yRecords.get(key);
        if (getYType(map) !== "YMap") {
            yRecords.doc?.transact(() => {
                map = new Y.Map();
                yRecords.set(key, map);
            });
        }
        return map as Y.Map<any>;
    }, [yRecords]);

    // host-only: reset all records
    useEffect(() => {
        if (!isHost) return;
        return addEventListener("start", () => {
            yRoom.doc?.transact(() => {
                const rec = yRoom.get("records") as Y.Map<any>;
                rec.clear();
                // yRoom.set("records", rec);
            });
        });
    }, [isHost, addEventListener, yRoom]);

    const values = useMemo(() => ({
        records,
        yRecords,
        getRecord
    }), [records, yRecords, getRecord]);

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
}
