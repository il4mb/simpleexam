import { useSyncExternalStore, useRef, useCallback } from "react";
import * as Y from "yjs";

export function useYArray<T>(yArray: Y.Array<T>, deep = false): T[] {
    const cacheRef = useRef<T[]>(yArray.toArray());

    return useSyncExternalStore(
        // subscribe
        (callback) => {
            const observer = () => {
                cacheRef.current = yArray.toArray(); // update cached snapshot
                callback();
            };
            if (deep) {
                yArray.observeDeep(observer);
                return () => {
                    yArray.unobserveDeep(observer);
                }
            }

            yArray.observe(observer);
            return () => yArray.unobserve(observer);
        },

        // getSnapshot
        () => cacheRef.current,

        // getServerSnapshot (for SSR)
        () => cacheRef.current
    );
}

export function useYMap<T>(yMap: Y.Map<any> | undefined, deep = false): T {

    const empty = useRef({} as T);
    const cacheRef = useRef<T>(yMap ? yMap.toJSON() as T : empty.current);

    const subscribe = useCallback((callback: () => void) => {
        if (!yMap) return () => {};

        const observer = () => {
            cacheRef.current = yMap.toJSON() as T; 
            callback();
        };

        if (deep) {
            yMap.observeDeep(observer);
            return () => yMap.unobserveDeep(observer);
        } else {
            yMap.observe(observer);
            return () => yMap.unobserve(observer);
        }
    }, [yMap, deep]);

    const getSnapshot = () => cacheRef.current;

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getYType(yObject: any) {
    if (yObject instanceof Y.Map) return 'YMap';
    if (yObject instanceof Y.Array) return 'YArray';
    if (yObject instanceof Y.Text) return 'YText';
    return false;
}

export function useYMapKey<T>(yMap: Y.Map<any> | undefined, key: string): T | undefined {
    const cacheRef = useRef<T | undefined>(yMap ? (yMap.get(key) as T) : undefined);

    const subscribe = useCallback((callback: () => void) => {
        if (!yMap) return () => {};
        const observer = (event: Y.YMapEvent<any>) => {
            if (event.keysChanged && event.keysChanged.has(key)) {
                cacheRef.current = yMap.get(key) as T | undefined;
                callback();
            }
        };
        yMap.observe(observer);
        return () => yMap.unobserve(observer);
    }, [yMap, key]);

    const getSnapshot = () => cacheRef.current;
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}