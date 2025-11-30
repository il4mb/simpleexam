import FloatingCamera from '@/components/FloatingCamera';
import { CameraState, Context, EventArgs, EventName } from '@/hooks/useCamera';
import { ExpressionName, RoomData } from '@/types';
import { nanoid } from 'nanoid';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CameraProviderProps {
    children?: ReactNode;
    enabled: boolean;
    room: RoomData;
    onExpressionDetected?: (expression: ExpressionName, probability: number) => void;
    onFaceDetected?: (isDetected: boolean) => void;
    onReady?: () => void;
}
export default function CameraProvider({ children, room, enabled, onExpressionDetected, onFaceDetected, onReady }: CameraProviderProps) {

    const listenersRef = useRef<Map<string, Map<string, (args: any) => void>>>(new Map());
    const [cameraReady, setCameraReady] = useState(false);
    const handleOnReady = () => {
        setCameraReady(true);
        onReady?.();
    }


    const addEventListener: CameraState["addEventListener"] = useCallback((event, callback) => {
        const id = nanoid();
        const listeners = listenersRef.current;
        if (!listeners.has(event)) {
            listeners.set(event, new Map());
        }
        const eventListeners = listeners.get(event)!;
        eventListeners.set(id, callback);

        return () => {
            eventListeners.delete(id);
            if (eventListeners.size == 0) {
                listeners.delete(event);
            }
        };
    }, []);

    const emit = useCallback(<E extends EventName>(event: E, args: EventArgs[E]) => {
        const eventListeners = listenersRef.current.get(event);
        if (!eventListeners) return;
        eventListeners.forEach((cb) => cb(args));
    }, []);


    const handleExpressionDetected = useCallback((expression: ExpressionName, probability: number) => {
        emit("expressionDetected", { expression, probability });
        onExpressionDetected?.(expression, probability);
    }, [onExpressionDetected]);

    const handleFaceDetected = useCallback((isDetected: boolean) => {
        emit("faceDetected", { isDetected });
        onFaceDetected?.(isDetected);
    }, [onFaceDetected]);



    useEffect(() => {
        if (!room.enableAiExpression) {
            return setCameraReady(true);
        }
        setCameraReady(false);
    }, [enabled, room.enableAiExpression]);

    const valueContext = useMemo<CameraState>(() => ({
        ready: cameraReady,
        addEventListener
    }), [cameraReady, addEventListener]);

    return (
        <Context.Provider value={valueContext}>
            {children}
            {Boolean(enabled && room.enableAiExpression) && (
                <FloatingCamera
                    onReady={handleOnReady}
                    onExpressionDetected={handleExpressionDetected as any}
                    onFaceDetected={handleFaceDetected} />
            )}
        </Context.Provider>
    );
}

