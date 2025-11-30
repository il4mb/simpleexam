import { createContext, useContext } from "react";
import * as Y from "yjs";

export type ExprRecord = {
    uid: string;
    qid: string;
    buffer: number[];
}

export type RecordsState = {
    records: Record<string, any>;
    expressions: ExprRecord[];
    yRecords: Y.Map<any>;
    yExpressions: Y.Map<any>;
    transaction: (callback: () => void) => void;
}

export const Context = createContext<RecordsState | undefined>(undefined);

export const useRecords = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useRecords should call inside <RecordsProvider/>");
    return ctx;
}