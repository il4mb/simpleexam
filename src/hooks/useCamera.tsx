import { ExpressionName } from "@/types";
import { createContext, useContext } from "react";

export type EventName = "expressionDetected" | "faceDetected";

export type EventArgs = {
    expressionDetected: {
        expression: ExpressionName;
        probability: number;
    };
    faceDetected: {
        isDetected: boolean;
    };
};

export type Unsubscribe = () => void;

// Generic event listener type
export type Listener<E extends EventName> = (args: EventArgs[E]) => void;


export type CameraState = {
    ready: boolean;
    addEventListener: <E extends EventName>(event: E, callback: Listener<E>) => Unsubscribe;
}
export const Context = createContext<CameraState | undefined>(undefined);

export const useCamera = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useCamera should call inside <CameraProvider/>");
    return ctx;
}