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
