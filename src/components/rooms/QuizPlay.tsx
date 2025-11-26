'use client'

import { useState, useEffect } from 'react';
import {
    Stack,
    Typography,
    Card,
    CardContent,
    Box,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    PlayArrow,
    SkipNext,
    Timer,
    Flag,
    CheckCircle,
} from '@mui/icons-material';
import { MotionBox, MotionStack } from '@/components/motion';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { useRoom } from '@/contexts/RoomProvider';

export interface QuizPlayProps {
}

interface QuizState {
    currentQuestionIndex: number;
    selectedAnswer: number | null;
    timeLeft: number;
    isPlaying: boolean;
    answers: Map<number, number>; // question index -> selected answer
    showResults: boolean;
}

export default function QuizPlay({ }: QuizPlayProps) {
    const { questions } = useQuestions();
    const { room } = useRoom();
    const [quizState, setQuizState] = useState<QuizState>({
        currentQuestionIndex: 0,
        selectedAnswer: null,
        timeLeft: 0,
        isPlaying: false,
        answers: new Map(),
        showResults: false,
    });

    const currentQuestion = questions[quizState.currentQuestionIndex];

    // Initialize quiz
    const startQuiz = () => {
        if (questions.length === 0) return;
        
        setQuizState(prev => ({
            ...prev,
            currentQuestionIndex: 0,
            selectedAnswer: null,
            timeLeft: questions[0].duration,
            isPlaying: true,
            showResults: false,
            answers: new Map(),
        }));
    };

    // Handle answer selection
    const handleAnswerSelect = (optionIndex: number) => {
        setQuizState(prev => ({
            ...prev,
            selectedAnswer: optionIndex,
            answers: new Map(prev.answers).set(prev.currentQuestionIndex, optionIndex),
        }));
    };

    // Move to next question or finish quiz
    const nextQuestion = () => {
        if (quizState.currentQuestionIndex < questions.length - 1) {
            setQuizState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                selectedAnswer: prev.answers.get(prev.currentQuestionIndex + 1) || null,
                timeLeft: questions[prev.currentQuestionIndex + 1].duration,
            }));
        } else {
            // End of quiz
            setQuizState(prev => ({
                ...prev,
                isPlaying: false,
                showResults: true,
            }));
        }
    };

    // Timer effect
    useEffect(() => {
        if (!quizState.isPlaying || quizState.timeLeft <= 0) return;

        const timer = setInterval(() => {
            setQuizState(prev => {
                if (prev.timeLeft <= 1) {
                    clearInterval(timer);
                    nextQuestion();
                    return { ...prev, timeLeft: 0 };
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizState.isPlaying, quizState.timeLeft]);

    // Calculate progress
    const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
    const score = Array.from(quizState.answers.entries()).reduce((acc, [index, answer]) => {
        return acc + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);

    // If quiz hasn't started
    if (!quizState.isPlaying && !quizState.showResults) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 4, textAlign: 'center' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                            🎯 Kuis Siap Dimulai
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {questions.length} soal menanti Anda
                        </Typography>
                        
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Chip 
                                label={`${questions.length} Soal`} 
                                color="primary" 
                                variant="outlined" 
                            />
                            <Chip 
                                label={`${Math.round(questions.reduce((acc, q) => acc + q.duration, 0) / 60)} Menit`} 
                                color="secondary" 
                                variant="outlined" 
                            />
                        </Stack>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PlayArrow />}
                            onClick={startQuiz}
                            sx={{
                                mt: 4,
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                borderRadius: 3,
                                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                            }}
                        >
                            Mulai Kuis
                        </Button>
                    </CardContent>
                </Card>
            </MotionBox>
        );
    }

    // If showing results
    if (quizState.showResults) {
        return (
            <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 4, textAlign: 'center' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            🎉 Kuis Selesai!
                        </Typography>
                        
                        <Box sx={{ my: 4 }}>
                            <Typography variant="h1" fontWeight="bold" color="primary">
                                {score}/{questions.length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Nilai Akhir
                            </Typography>
                        </Box>

                        <LinearProgress 
                            variant="determinate" 
                            value={(score / questions.length) * 100} 
                            sx={{ height: 8, borderRadius: 4, mb: 2 }}
                            color={score / questions.length >= 0.7 ? "success" : score / questions.length >= 0.5 ? "warning" : "error"}
                        />

                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Chip 
                                label={`${Math.round((score / questions.length) * 100)}%`} 
                                color={score / questions.length >= 0.7 ? "success" : score / questions.length >= 0.5 ? "warning" : "error"}
                                variant="filled"
                            />
                            <Chip 
                                label={`Jawaban Benar: ${score}`} 
                                color="success" 
                                variant="outlined" 
                            />
                            <Chip 
                                label={`Jawaban Salah: ${questions.length - score}`} 
                                color="error" 
                                variant="outlined" 
                            />
                        </Stack>

                        <Button
                            variant="outlined"
                            onClick={startQuiz}
                            sx={{ borderRadius: 3 }}
                        >
                            Coba Lagi
                        </Button>
                    </CardContent>
                </Card>
            </MotionBox>
        );
    }

    // Main quiz interface
    return (
        <MotionStack spacing={3} sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            {/* Quiz Header */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Stack>
                            <Typography variant="h6" fontWeight="bold">
                                Soal {quizState.currentQuestionIndex + 1} dari {questions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {currentQuestion?.text}
                            </Typography>
                        </Stack>
                        
                        <Stack alignItems="flex-end" spacing={1}>
                            <Chip
                                icon={<Timer />}
                                label={`${quizState.timeLeft}s`}
                                color={quizState.timeLeft < 10 ? "error" : "primary"}
                                variant="filled"
                            />
                            <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{ width: 100, height: 6, borderRadius: 3 }}
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Question Content */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.4 }}>
                        {currentQuestion?.text}
                    </Typography>

                    <RadioGroup
                        value={quizState.selectedAnswer}
                        onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                        sx={{ mt: 2 }}
                    >
                        <Stack spacing={1}>
                            {currentQuestion?.options.map((option, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card 
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            border: quizState.selectedAnswer === index ? '2px solid' : '1px solid',
                                            borderColor: quizState.selectedAnswer === index ? 'primary.main' : 'divider',
                                            bgcolor: quizState.selectedAnswer === index ? 'primary.light' : 'background.paper',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                            <FormControlLabel
                                                value={index}
                                                control={<Radio />}
                                                label={
                                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                                        {option}
                                                    </Typography>
                                                }
                                                sx={{ width: '100%', m: 0 }}
                                            />
                                        </CardContent>
                                    </Card>
                                </MotionBox>
                            ))}
                        </Stack>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Navigation */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                    variant="outlined"
                    startIcon={<Flag />}
                    disabled={quizState.currentQuestionIndex === 0}
                >
                    Tandai
                </Button>
                
                <Button
                    variant="contained"
                    endIcon={quizState.currentQuestionIndex === questions.length - 1 ? <CheckCircle /> : <SkipNext />}
                    onClick={nextQuestion}
                    disabled={quizState.selectedAnswer === null}
                    sx={{ px: 4, borderRadius: 3 }}
                >
                    {quizState.currentQuestionIndex === questions.length - 1 ? 'Selesaikan' : 'Lanjut'}
                </Button>
            </Stack>
        </MotionStack>
    );
}