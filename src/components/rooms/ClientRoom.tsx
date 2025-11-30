import { RoomData } from '@/types';
import { Box, Container, Grid, Typography } from '@mui/material';
import RoomHeader from './RoomHeader';
import CameraProvider from '@/contexts/CameraProvider';
import { MotionStack } from '../motion';
import QuizClient from '../quiz/QuizClient';
import QuizLeaderboards from '../quiz/QuizLeaderboards';
import { EmojiEvents } from '@mui/icons-material';
import CurrentUserStats from '../stats/CurrentUserStats';
import Participants from './Participants';
import ExpressionDetector from '@/contexts/ExpressionDetector';
import { useQuiz } from '@/hooks/useQuiz';

export interface ClientRoomProps {
    room: RoomData;
}
export default function ClientRoom({ room }: ClientRoomProps) {

    const { isCurrentUserJoined } = useQuiz();
    const isInPlay = ["paused", "playing"].includes(room.status);
    const isPrepared = room.status == "prepared";
    const isInQuiz = (isInPlay && isCurrentUserJoined) || isPrepared;

    return (
        <CameraProvider enabled={isInQuiz} room={room}>
            <ExpressionDetector>
                {isInQuiz ? (
                    <QuizClient isInLobby={isInPlay} />
                ) : (
                    <Container>
                        <MotionStack mb={3}>
                            <Box py={0.5} />
                            <RoomHeader />
                            <Box py={1} />
                        </MotionStack>
                        <Grid container spacing={4} sx={{ mb: 5 }}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <CurrentUserStats />
                                {room.enableLeaderboard && (
                                    <>
                                        <Box py={3} />
                                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                                            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                                <EmojiEvents sx={{ fontSize: 40, color: 'gold', mr: 1, verticalAlign: 'middle' }} />
                                                Papan Peringkat
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                Pemeringkatan waktu nyata berdasarkan kinerja
                                            </Typography>
                                        </Box>
                                        <QuizLeaderboards showTabs={false} />
                                    </>
                                )}
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ position: "sticky", top: 0 }}>
                                    <Participants />
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                )}
            </ExpressionDetector>
        </CameraProvider>
    );
}