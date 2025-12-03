import SessionProvider from "@/contexts/SessionProvider";
import SnackbarProvider from "@/contexts/SnackbarProvider";
import Theme from "@/theme/Theme";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    metadataBase: new URL("https://quiz.edudoexam.com"),

    title: {
        default: "EdudoExam — Real-time Quiz & Ujian Online",
        template: "%s | EdudoExam"
    },

    description: "Platform ujian dan kuis online real-time yang cepat, ringan, dan aman. Dukungan mobile, PWA, serta kolaborasi kelas.",

    keywords: [
        "ujian online",
        "quiz online",
        "real-time quiz",
        "edudoexam",
        "ujian sekolah",
        "platform pendidikan",
        "cbt online",
        "learning management system",
        "kelas digital",
        "assessment online"
    ],

    authors: [{ name: "EdudoExam Team" }],
    creator: "EdudoExam",
    publisher: "EdudoExam",

    applicationName: "EdudoExam",

    alternates: {
        canonical: "https://quiz.edudoexam.com"
    },

    openGraph: {
        type: "website",
        locale: "id_ID",
        url: "https://quiz.edudoexam.com",
        siteName: "EdudoExam",
        title: "EdudoExam — Real-time Quiz & Ujian Online",
        description: "Platform kuis dan ujian real-time dengan performa cepat dan ringan.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "EdudoExam Preview"
            }
        ]
    },

    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-512.png",
    },

    manifest: "/manifest.json",

    twitter: {
        card: "summary_large_image",
        title: "EdudoExam — Real-time Quiz Online",
        description: "Aplikasi ujian online modern, cepat, dan real-time.",
        images: ["/og-image.png"]
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-video-preview": -1,
            "max-snippet": -1
        }
    }
};


export default function RootLayout({ children }: Readonly<{ children: ReactNode; }>) {
    return (
        <html lang="id">
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
