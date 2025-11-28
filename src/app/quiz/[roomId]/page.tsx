'use client'
import Participants from '@/components/rooms/Participants';
import { Box, Button, Grid, Stack } from '@mui/material';
import QuestionEditor from '@/components/questions/QuestionEditor';
import { useRoomManager } from '@/contexts/RoomManager';
import { AnimatePresence } from 'motion/react';
import ClientLobby from '@/components/rooms/ClientLobby';
import RoomHeader from '@/components/rooms/RoomHeader';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import QuizClientLobby from '@/components/quiz/QuizClientLobby';
import QuizHostLobby from '@/components/quiz/QuizHostLobby';

export default function QuizPage() {

    const pathname = usePathname();
    const { isHost, room } = useRoomManager();

    const navItems = [
        {
            href: `/quiz/${room?.id}/`,
            label: 'Quiz Editor',
            match: (path: string) => path === `/quiz/${room?.id}/` || path === `/quiz/${room?.id}`
        },
        {
            href: `/quiz/${room?.id}/results`,
            label: 'Final Results',
            match: (path: string) => path === `/quiz/${room?.id}/results`
        },
    ];

    const isActive = (href: string, matchFn?: (path: string) => boolean) => {
        if (matchFn) {
            return matchFn(pathname);
        }
        return pathname === href;
    };


    if (!isHost && ["playing", "paused"].includes(room.status)) {

        return <QuizClientLobby />
    }

    return (
        <>
            <Box py={0.5} />
            <RoomHeader />
            <Box py={1} />

            {isHost && room && (
                <Stack direction="row" spacing={1}>
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.match);
                        return (
                            <Button
                                key={item.href}
                                variant={active ? "contained" : "outlined"}
                                component={Link}
                                href={item.href}
                                size="small"
                                sx={{
                                    fontWeight: active ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: active ? "0px 0px 0px 1px currentColor, -4px 4px 0px currentColor" : "",
                                    "&:hover": {
                                        boxShadow: active ? "0px 0px 0px 1px currentColor, -4px 4px 0px currentColor" : "",
                                    }
                                }}>
                                {item.label}
                            </Button>
                        )
                    })}
                </Stack>
            )}

            {/* Main content area */}
            <Box component="main" sx={{ mb: 12 }}>
                <AnimatePresence>
                    {isHost ? (
                        <>
                            {["playing", "paused"].includes(room.status)
                                ? (<QuizHostLobby />)
                                : (
                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                                            <QuestionEditor />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                                            <Participants />
                                        </Grid>
                                    </Grid>
                                )}

                        </>
                    ) : (
                        <ClientLobby />
                    )}
                </AnimatePresence>
            </Box>
        </>
    );
}