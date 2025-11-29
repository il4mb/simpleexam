import FloatingCamera from '@/components/FloatingCamera';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export interface CameraProviderProps {
    children?: ReactNode;
    enabled: boolean;
    onExpressionDetected?: (expression: string, probability: number) => void;
    onFaceDetected?: (isDetected: boolean) => void;
    onReady?: () => void;
}
export default function CameraProvider({ children, enabled, onExpressionDetected, onFaceDetected, onReady }: CameraProviderProps) {

    const [cameraReady, setCameraReady] = useState(false);
    const handleOnReady = () => {
        setCameraReady(true);
        onReady?.();
    }

    useEffect(() => {
        setCameraReady(false);
    }, [enabled]);

    const valueContext = useMemo<CameraState>(() => ({
        ready: cameraReady
    }), [cameraReady]);

    return (
        <Context.Provider value={valueContext}>
            {children}
            {enabled && (
                <FloatingCamera
                    onReady={handleOnReady}
                    onExpressionDetected={onExpressionDetected}
                    onFaceDetected={onFaceDetected} />
            )}
        </Context.Provider>
    );
}

export type CameraState = {
    ready: boolean;
}
const Context = createContext<CameraState | undefined>(undefined);

export const useCamera = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useCamera should call inside <CamerProvider/>");
    return ctx;
}