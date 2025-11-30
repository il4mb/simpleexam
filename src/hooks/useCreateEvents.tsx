import { nanoid } from "nanoid";
import { useCallback, useRef } from "react";

export function useCreateEvents<EventName extends string, EventArgsMap extends Record<EventName | string, any>>() {

    const collectionRef = useRef<Map<EventName, Map<string, (args: any) => void>>>(new Map());

    const addEventListener = useCallback(<E extends EventName>(event: E, callback: (args: EventArgsMap[E]) => void) => {

        const id = nanoid();
        const collection = collectionRef.current;

        if (!collection.has(event)) {
            collection.set(event, new Map());
        }

        const map = collection.get(event)!;
        map.set(id, callback);

        return () => {
            map.delete(id);
            if (map.size === 0) {
                collection.delete(event);
            }
        };
    }, []);

    const emit = useCallback(<E extends EventName>(event: E, args?: EventArgsMap[E]) => {
        const map = collectionRef.current.get(event);
        if (!map) return;
        map.forEach((cb) => {
            try {
                cb(args || {})
            } catch (error) {
                console.error("Failed emit callback", error);
            }
        });
    }, []);

    return { addEventListener, emit };
}
