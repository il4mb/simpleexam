import { useQuestions } from '@/contexts/QuestionsProvider';
import { useQuiz, useQuizQuestion } from '@/hooks/useQuiz';
import { Question } from '@/types';
import {
    Button,
    Stack,
    Typography,
    Paper,
    Box,
    Chip,
    Card,
    CardContent,
    LinearProgress,
    Divider,
    Container,
    Grid
} from '@mui/material';
import {
    NavigateBefore,
    NavigateNext,
    Stop,
    Timer,
    EmojiEvents,
    LibraryAddCheck,
    CheckBox,
    SquareOutlined,
    SquareRounded,
    CheckBoxOutlineBlank,
    CheckBoxOutlined
} from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionBox, MotionIconButton, MotionStack } from '../motion';
import { getColor } from '@/theme/colors';
import Checkbox from '../Checkbox';
import QuizLeaderboards from './QuizLeaderboards';

export default function QuizHostLobby() {

    const { timeLeft, autoPlay, setAutoPlay, } = useQuiz();
    const { questions } = useQuestions();
    const { question, questionIndex, } = useQuizQuestion();


    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(!autoPlay);
    }, [autoPlay]);

    return (
        <Container>

            <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 6 }}>

                    <Typography fontWeight={900} fontSize={25}>
                        Quiz Lobby
                    </Typography>

                    <Checkbox
                        checked={autoPlay}
                        onChange={toggleAutoPlay}
                        label={'Mode Otomatis'} />

                    <Stack my={2}>
                        <Paper>
                            <Stack p={2} justifyContent={"start"} alignItems={"start"} position={"relative"}>
                                <Typography variant={'caption'} color={'text.secondary'}>
                                    Soal sedang berjalan
                                </Typography>

                                <Typography component={"span"} fontWeight={600} fontSize={18}>
                                    <Typography component={"span"} fontWeight={900} fontSize={18}>
                                        {questionIndex + 1}{". "}
                                    </Typography>
                                    {question?.text}
                                </Typography>

                                <Stack direction={"row"} gap={1} alignItems={"end"} justifyContent={"start"} mt={2}>
                                    {question?.multiple && (
                                        <Stack
                                            direction={"row"}
                                            gap={1}
                                            sx={{
                                                display: "inline-flex",
                                                border: "2px solid",
                                                borderColor: "primary.main",
                                                color: "primary.main",
                                                borderRadius: '8px',
                                                px: 0.75,
                                                py: 0.1,
                                                overflow: "hidden",
                                                ml: -1,
                                            }}
                                            justifyContent={"start"}
                                            alignItems={"center"}>
                                            <LibraryAddCheck sx={{ fontSize: '10px' }} />
                                            <Typography component={"span"} variant={"caption"} fontSize={'10px'}>
                                                Pilihan Ganda
                                            </Typography>
                                        </Stack>
                                    )}
                                    <Typography>
                                        Sisa Waktu: {timeLeft}s
                                    </Typography>
                                </Stack>

                            </Stack>
                        </Paper>
                    </Stack>

                    <Stack>
                        <Stack mb={2}>
                            <Typography fontSize={22} fontWeight={900}>
                                Daftar Soal
                                <Typography component={"span"} fontWeight={400} ml={1} fontSize={18}>
                                    ({questions.length})
                                </Typography>
                            </Typography>
                        </Stack>

                        <Stack direction={"row"} gap={2}>
                            {questions.map((_, index) => (
                                <MotionStack
                                    justifyContent={"center"}
                                    alignItems={"center"}
                                    sx={{
                                        width: 35,
                                        height: 35,
                                        outline: "4px solid",
                                        outlineColor: getColor(questionIndex == index ? "primary" : "secondary")[400],
                                        background: getColor(questionIndex == index ? "primary" : "secondary")[600],
                                        borderRadius: '10px'
                                    }}>
                                    <Typography fontWeight={900} fontSize={22}>
                                        {index + 1}
                                    </Typography>
                                </MotionStack>
                            ))}
                        </Stack>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack>
                        <Typography fontSize={18} fontWeight={900}>
                            Leaderboard's
                        </Typography>

                        <QuizLeaderboards />
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
}