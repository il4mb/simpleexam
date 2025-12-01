import { Badge, Box, Button, ButtonGroup, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import RoomHeader from './RoomHeader';
import { RoomData } from '@/types';
import QuizHost from '../quiz/QuizHost';
import QuestionEditor from '../questions/QuestionEditor';
import Participants from './Participants';
import { floatingVariants, itemVariants, MotionBox, MotionStack, MotionTypography } from '../motion';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import QuizLeaderboards from '../quiz/QuizLeaderboards';
import { useAnswers } from '@/hooks/useAnswers';
import DownloadResults from '../quiz/DownloadResults';
import Empty from '@/icon/Empty';
import { useQuiz } from '@/hooks/useQuiz';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { getColor } from '@/theme/colors';

export interface HostRoomProps {
    room: RoomData;
}
export default function HostRoom({ room }: HostRoomProps) {

    const { quizStats } = useAnswers();
    const { totalQuizableParticipant, canPlayQuiz, totalQuestions } = useQuiz();
    const [tabIndex, setTabIndex] = useState(0);

    const isInPlay = ["paused", "playing"].includes(room.status);
    const isPrepared = room.status == "prepared";
    const isInQuiz = isInPlay || isPrepared;

    const handleClickTab = (index: number) => () => {
        setTabIndex(index);
    }

    return (
        <Box>
            <Container sx={{ pb: 10 }}>
                <MotionStack mb={3}>
                    <Box py={0.5} />
                    <RoomHeader />
                    <Box py={1} />
                </MotionStack>
                {!isInQuiz && (
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
                                        {quizStats.totalAnswers > 0 ? (
                                            <>
                                                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                                                    <Typography fontSize={22} fontWeight={800} mb={2}>
                                                        Menampilkan Hasil Quiz
                                                    </Typography>
                                                    <DownloadResults />
                                                </Stack>
                                                <QuizLeaderboards />
                                            </>
                                        ) : (
                                            <>
                                                <Stack justifyContent={"center"} alignItems={"center"} minHeight={400}>

                                                    <MotionBox variants={floatingVariants}
                                                        initial="hidden"
                                                        animate="float">
                                                        <Box component={Empty} sx={{ width: 200, height: 200 }} />
                                                    </MotionBox>
                                                    <MotionTypography
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        fontSize={22}
                                                        fontWeight={800}>
                                                        Belum ada Hasil Quiz
                                                    </MotionTypography>
                                                    <MotionTypography
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        color='text.secondary'>
                                                        Belum ada hasil, silahkan mulai kuis untuk mendapatkan hasil.
                                                    </MotionTypography>
                                                </Stack>

                                                <MotionBox initial={{ y: 20 }} animate={{ y: 0 }}>
                                                    <Stack component={Paper} sx={{ p: 3 }}>
                                                        <Typography fontWeight={800} fontSize={20}>
                                                            {canPlayQuiz ? "Semua sudah siap" : "Sepertinya ada yg kurang nih"}
                                                        </Typography>
                                                        <MotionStack initial={{ y: 10 }} animate={{ y: 0, }} direction={"row"} alignItems={"center"} spacing={1}>
                                                            <MotionBox sx={{ color: getColor(totalQuizableParticipant >= 3 ? "success" : "error")[300] }}>
                                                                {totalQuizableParticipant >= 3 ? <CheckBox /> : <DisabledByDefault />}
                                                            </MotionBox>
                                                            <Typography>
                                                                Untuk memulai quiz setidaknya ada 3 peserta tidak termasuk anda sebagai host
                                                            </Typography>
                                                        </MotionStack>
                                                        <MotionStack initial={{ y: 10 }} animate={{ y: 0, transition: { delay: 0.1 } }} direction={"row"} alignItems={"center"} spacing={1}>
                                                            <MotionBox sx={{ color: getColor(totalQuizableParticipant >= 3 ? "success" : "error")[300] }}>
                                                                {totalQuestions >= 5 ? <CheckBox /> : <DisabledByDefault />}
                                                            </MotionBox>
                                                            <Typography>
                                                                Setidaknya ada 5 soal dalam quiz
                                                            </Typography>
                                                        </MotionStack>

                                                    </Stack>
                                                </MotionBox>
                                            </>
                                        )}

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
                )}
            </Container>

            <AnimatePresence mode={"popLayout"}>
                {isInQuiz && (
                    <MotionBox key={"in-quiz"} initial={{ y: -100 }} animate={{ y: 0 }}>
                        <QuizHost room={room} isInLobby={isInPlay} />
                    </MotionBox>
                )}
            </AnimatePresence>


        </Box>
    );
}