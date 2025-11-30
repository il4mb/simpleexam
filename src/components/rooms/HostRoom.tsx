import { Badge, Box, Button, ButtonGroup, Container, Grid, Stack, Typography } from '@mui/material';
import RoomHeader from './RoomHeader';
import { RoomData } from '@/types';
import QuizHost from '../quiz/QuizHost';
import QuestionEditor from '../questions/QuestionEditor';
import Participants from './Participants';
import { MotionBox } from '../motion';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import QuizLeaderboards from '../quiz/QuizLeaderboards';
import { useAnswers } from '@/hooks/useAnswers';
import DownloadResults from '../quiz/DownloadResults';

export interface HostRoomProps {
    room: RoomData;
}
export default function HostRoom({ room }: HostRoomProps) {

    const { quizStats } = useAnswers();
    const [tabIndex, setTabIndex] = useState(0);

    const isInPlay = ["paused", "playing"].includes(room.status);
    const isPrepared = room.status == "prepared";
    const isInQuiz = isInPlay || isPrepared;

    const handleClickTab = (index: number) => () => {
        setTabIndex(index);
    }

    return (
        <Stack>
            <Container>
                <Box py={1} />
                <RoomHeader />
                <Box py={1} />
            </Container>

            <AnimatePresence mode={"popLayout"}>
                {isInQuiz ? (
                    <MotionBox key={"in-quiz"} initial={{ y: -100 }} animate={{ y: 0 }}>
                        <QuizHost room={room} isInLobby={isInPlay} />
                    </MotionBox>
                ) : (
                    <Container key={"in-room"}>
                        <MotionBox initial={{ y: 100 }} animate={{ y: 0 }}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                                    <ButtonGroup sx={{ mb: 2 }}>
                                        <Button sx={{ width: 80, fontWeight: 800 }} variant={tabIndex == 0 ? "contained" : "outlined"} onClick={handleClickTab(0)}>
                                            Editor
                                        </Button>
                                        <Badge color={"warning"} badgeContent={quizStats.totalAnswers}>
                                            <Button sx={{ width: 80, fontWeight: 800 }} variant={tabIndex == 1 ? "contained" : "outlined"} onClick={handleClickTab(1)}>
                                                Hasil
                                            </Button>
                                        </Badge>
                                    </ButtonGroup>
                                    {tabIndex == 0 ? (
                                        <QuestionEditor />
                                    ) : tabIndex == 1 ? (
                                        <Stack>
                                            <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                                                <Typography fontSize={22} fontWeight={800} mb={2}>
                                                    Menampilkan Hasil Quiz
                                                </Typography>
                                                <DownloadResults />
                                            </Stack>
                                            <QuizLeaderboards />
                                        </Stack>
                                    ) : (
                                        <>
                                            <Typography>
                                                Tidak dikenali
                                            </Typography>
                                        </>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                                    <Participants />
                                </Grid>
                            </Grid>
                        </MotionBox>
                    </Container>
                )}
            </AnimatePresence>


        </Stack>
    );
}