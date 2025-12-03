"use client"

import { ReactNode, useEffect } from 'react';

export interface layoutProps {
    children?: ReactNode;
}
export default function layout({ children }: layoutProps) {

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js");
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
}