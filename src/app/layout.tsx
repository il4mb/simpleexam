import SessionProvider from "@/contexts/SessionProvider";
import SnackbarProvider from "@/contexts/SnackbarProvider";
import Theme from "@/theme/Theme";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "EdudoExam — Real-time Quiz & Ujian Online",
    description: "Platform ujian dan kuis online real-time yang cepat, ringan, dan aman. Dukungan mobile, PWA, serta kolaborasi kelas.",
};


export default function RootLayout({ children }: Readonly<{ children: ReactNode; }>) {
    return (
        <html lang="id" data-color-scheme="dark">
            <body>
                <Theme>
                    <SnackbarProvider>
                        <SessionProvider>
                            {children}
                        </SessionProvider>
                    </SnackbarProvider>
                </Theme>
            </body>
        </html>
    );
}
