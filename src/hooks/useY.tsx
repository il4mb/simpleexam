import { useSyncExternalStore, useRef } from "react";
import * as Y from "yjs";

export function useYArray<T>(yArray: Y.Array<T>): T[] {
    const cacheRef = useRef<T[]>(yArray.toArray());

    return useSyncExternalStore(
        // subscribe
        (callback) => {
            const observer = () => {
                cacheRef.current = yArray.toArray(); // update cached snapshot
                callback();
            };
            yArray.observe(observer);
            return () => yArray.unobserve(observer);
        },

        // getSnapshot
        () => cacheRef.current,

        // getServerSnapshot (for SSR)
        () => cacheRef.current
    );
}

export function useYMap<T extends Record<string, any>>(yMap: Y.Map<T>): T {
    const cacheRef = useRef<T>({ ...Object.fromEntries(yMap.entries()) } as T);

    return useSyncExternalStore(
        // subscribe
        (callback) => {
            const observer = () => {
                cacheRef.current = {
                    ...Object.fromEntries(yMap.entries()) as T,
                };
                callback();
            };
            yMap.observe(observer);
            return () => yMap.unobserve(observer);
        },

        // getSnapshot
        () => cacheRef.current,

        // getServerSnapshot (SSR)
        () => cacheRef.current
    );
}