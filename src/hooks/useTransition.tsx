import { useCallback, useEffect, useRef, useState } from "react";

export function useTransition<T extends (...args: any[]) => any>(delayMs: number) {
    const [transition, setTransition] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const withTransition = useCallback((action: T) => {
        // start transition
        setTransition(true);

        // clear previous timer
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            action();           // run callback
            setTransition(false); // end transition
        }, delayMs);
    }, [delayMs]);

    // cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return [transition, withTransition] as const;
}
