import { useQuestions } from '@/contexts/QuestionsProvider';
import { useQuiz, useQuizQuestion } from '@/hooks/useQuiz';
import { Stack, Typography, Paper, Box, Chip, LinearProgress, Container, alpha } from '@mui/material';
import { Timer, LibraryAddCheck, EmojiEvents } from '@mui/icons-material';
import { useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MotionBox, MotionStack, MotionTypography } from '../motion';
import { ClockAlert } from 'lucide-react';
import { getColor } from '@/theme/colors';
import QuizLeaderboards from './QuizLeaderboards';
import { enqueueSnackbar } from 'notistack';
import { useRoomManager } from '@/contexts/RoomManager';
import { useAnswers } from '@/hooks/useAnswers';

export default function QuizClientLobby() {

    const { room } = useRoomManager();
    const { transition, timeLeft, isLastQuestion } = useQuiz();
    const { getUserAnswer, submitAnswer } = useAnswers();
    const { question, questionIndex } = useQuizQuestion();
    const options = useMemo(() => question?.options || [], [question]);

    const answer = useMemo(() => question?.id ? getUserAnswer(question.id) : undefined, [question, questionIndex, getUserAnswer]);
    const answerOptions = answer?.optionsId || [];

    const { questions } = useQuestions();

    const totalQuestions = questions.length;
    const progress = ((questionIndex + 1) / totalQuestions) * 100;

    const getOptionLetter = (index: number) => {
        return String.fromCharCode(65 + index);
    };

    const handleSelectOption = useCallback((optId: string) => () => {
        const questionId = question?.id;
        if (!questionId || !question) return;
        if (timeLeft <= 0) {
            return enqueueSnackbar("Waktu habis!", { variant: "warning" });
        }
        if (!question.multiple) {
            submitAnswer(questionId, [optId]);
        } else if (answerOptions.includes(optId)) {
            submitAnswer(questionId, answerOptions.filter(id => id != optId));
        } else {
            submitAnswer(questionId, [...answerOptions, optId]);
        }
    }, [question, timeLeft, answerOptions, submitAnswer]);

    return (
        <Stack gap={3} sx={{ minHeight: '100dvh', userSelect: "none" }}>
            <Container sx={{ mt: 1 }}>
                <Paper>
                    <Box sx={{ px: 3, py: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                    Soal {questionIndex + 1} dari {totalQuestions}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        icon={<Timer />}
                                        label={`${questionIndex + 1}/${totalQuestions}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" color="text.secondary">
                                    Progress
                                </Typography>
                                <Typography variant="h4" color="primary.main" fontWeight="bold">
                                    {Math.round(progress)}%
                                </Typography>
                            </Box>
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'grey.200'
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Container>
            <Stack sx={{ position: 'relative', overflow: 'hidden' }} flex={1}>
                {Boolean(transition && room.enableLeaderboard) ? (
                    <Container>
                        <Box py={3} />
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                <EmojiEvents sx={{ fontSize: 40, color: 'gold', mr: 1, verticalAlign: 'middle' }} />
                                Peringkat {isLastQuestion ? "Final" : "Sementara"}
                            </Typography>
                        </Box>
                        <QuizLeaderboards showTabs={false} />
                    </Container>
                ) : (
                    <>
                        <Container>
                            <Stack flex={1} mt={2} gap={2}>
                                <MotionTypography>
                                    Sisa Waktu: {timeLeft}s
                                </MotionTypography>
                                <Stack>
                                    <MotionBox
                                        key={questionIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        sx={{ px: 3 }}>
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
                                                    px: 1,
                                                    py: 0.25,
                                                    overflow: "hidden",
                                                    ml: -1,
                                                    mb: 1
                                                }}
                                                justifyContent={"start"}
                                                alignItems={"center"}>
                                                <LibraryAddCheck sx={{ fontSize: '14px' }} />
                                                <Typography component={"span"} variant={"caption"}>
                                                    Pilihan Ganda
                                                </Typography>
                                            </Stack>
                                        )}
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                fontWeight: 'bold',
                                                lineHeight: 1.6,
                                            }}>
                                            <Typography component={"span"} fontSize={25} fontWeight={900} sx={{ opacity: 0.6, ml: -1.5 }}>
                                                {questionIndex + 1}{". "}
                                            </Typography>
                                            {question?.text || "Memuat soal..."}
                                        </Typography>
                                    </MotionBox>

                                    <MotionStack initial={{ y: 100 }} animate={{ y: 0 }} mt={5}>
                                        <Paper>
                                            <Stack spacing={2} p={3}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    Pilihan Jawaban:
                                                </Typography>
                                                <AnimatePresence mode='sync'>
                                                    {options.map((option, index) => (
                                                        <MotionBox
                                                            key={option.id}
                                                            onClick={handleSelectOption(option.id)}
                                                            initial={{ opacity: 0, x: -20, scale: 1 }}
                                                            animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
                                                            whileTap={{ scale: 1.01 }}
                                                            sx={{ cursor: "pointer" }}>
                                                            <Stack
                                                                direction="row"
                                                                gap={2}
                                                                alignItems={"flex-start"}
                                                                sx={answerOptions.includes(option.id) ? {
                                                                    borderRadius: question?.multiple ? "10px" : '16px',
                                                                    color: answerOptions.includes(option.id) ? 'white' : 'text.primary',
                                                                    outline: "3px dashed",
                                                                    outlineColor: getColor(answerOptions.includes(option.id) ? "success" : "secondary")[400],
                                                                } : {}}>
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: question?.multiple ? "10px" : '16px',
                                                                        backgroundColor: alpha(getColor(answerOptions.includes(option.id) ? "success" : "secondary")[400], 0.4),
                                                                        color: answerOptions.includes(option.id) ? 'white' : 'text.primary',
                                                                        outline: "3px solid",
                                                                        outlineColor: getColor(answerOptions.includes(option.id) ? "success" : "secondary")[400],
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '0.875rem',
                                                                        flexShrink: 0
                                                                    }}>
                                                                    {getOptionLetter(index)}
                                                                </Box>
                                                                <Typography variant="body1" sx={{ flex: 1, my: 0.7 }}>
                                                                    {option.text}
                                                                </Typography>
                                                            </Stack>
                                                        </MotionBox>
                                                    ))}
                                                </AnimatePresence>
                                            </Stack>
                                        </Paper>
                                    </MotionStack>
                                </Stack>
                            </Stack>
                        </Container>
                        {Boolean(timeLeft == 0) && (
                            <Stack
                                justifyContent={"center"}
                                alignItems={"center"}
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: '#fff5',
                                    pointerEvents: 'all',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                <Stack justifyContent={"center"} alignItems={"center"} mb={1} spacing={2} color={"warning.main"}>
                                    <ClockAlert size={45} strokeWidth={3} />
                                    <MotionTypography fontWeight={800} fontSize={18}>
                                        Waktu Habis
                                    </MotionTypography>
                                </Stack>
                                <Typography variant='caption' color='text.secondary'>
                                    {isLastQuestion ? "Quiz telah berakhir, mohon menunggu kamu akan segera dialihkan." : "Mohon menunggu soal berikutnya akan segera mucul."}
                                </Typography>
                            </Stack>
                        )}
                    </>
                )}

            </Stack>
        </Stack>
    );
}