'use client'
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip, Grid } from '@mui/material';
import { MotionBox } from '@/components/motion';
// import { useQuizLobby } from '@/contexts/QuizLobbyProvider';
import { useQuestions } from '@/contexts/QuestionsProvider';

export default function QuestionAnalytics() {
    // const { questionStats, getQuestionDifficulty } = useQuizLobby();
    const { questions } = useQuestions();

    const getDifficultyColor = (difficulty: number) => {
        if (difficulty < 0.3) return 'success';
        if (difficulty < 0.7) return 'warning';
        return 'error';
    };

    const getDifficultyText = (difficulty: number) => {
        if (difficulty < 0.3) return 'Mudah';
        if (difficulty < 0.7) return 'Sedang';
        return 'Sulit';
    };

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                📝 Analisis Soal
            </Typography>

            {/* <Grid container spacing={2}>
                {questions.map((question, index) => {
                    const stats = questionStats.find(q => q.questionId === question.id);
                    const difficulty = getQuestionDifficulty(question.id);
                    const accuracy = stats ? (stats.correctAnswers / stats.totalAnswers) * 100 : 0;

                    return (
                        <Grid size={{ xs: 12, md: 6}} key={question.id}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}>
                                <Card sx={{ borderRadius: 3, height: '100%' }}>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                                                <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                                                    Soal {index + 1}
                                                </Typography>
                                                <Chip 
                                                    label={getDifficultyText(difficulty)}
                                                    color={getDifficultyColor(difficulty)}
                                                    size="small"
                                                />
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {question.text}
                                            </Typography>

                                            {stats && (
                                                <Stack spacing={1}>
                                                    <Box>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="caption" fontWeight="600">
                                                                Akurasi
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight="600">
                                                                {accuracy.toFixed(1)}%
                                                            </Typography>
                                                        </Stack>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={accuracy}
                                                            color={accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error'}
                                                            sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                                        />
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" fontWeight="600" gutterBottom>
                                                            Distribusi Jawaban
                                                        </Typography>
                                                        <Stack spacing={0.5}>
                                                            {question.options.map((option, optIndex) => {
                                                                const optionCount = stats.optionStats[optIndex] || 0;
                                                                const percentage = stats.totalAnswers > 0 
                                                                    ? (optionCount / stats.totalAnswers) * 100 
                                                                    : 0;
                                                                const isCorrect = optIndex === question.correctAnswer;

                                                                return (
                                                                    <Stack key={optIndex} direction="row" alignItems="center" spacing={1}>
                                                                        <Typography variant="caption" sx={{ minWidth: 20 }}>
                                                                            {String.fromCharCode(65 + optIndex)}
                                                                        </Typography>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={percentage}
                                                                            color={isCorrect ? 'success' : 'primary'}
                                                                            sx={{ 
                                                                                flex: 1, 
                                                                                height: 4, 
                                                                                borderRadius: 2,
                                                                                bgcolor: isCorrect ? 'success.light' : 'primary.light'
                                                                            }}
                                                                        />
                                                                        <Typography variant="caption" sx={{ minWidth: 35 }}>
                                                                            {percentage.toFixed(0)}%
                                                                        </Typography>
                                                                        {isCorrect && (
                                                                            <Box sx={{ 
                                                                                width: 6, 
                                                                                height: 6, 
                                                                                borderRadius: '50%', 
                                                                                bgcolor: 'success.main' 
                                                                            }} />
                                                                        )}
                                                                    </Stack>
                                                                );
                                                            })}
                                                        </Stack>
                                                    </Box>

                                                    <Stack direction="row" spacing={2}>
                                                        <Chip
                                                            label={`${stats.totalAnswers} jawaban`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={`${stats.averageTime.toFixed(1)}s rata-rata`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                </Stack>
                                            )}

                                            {!stats && (
                                                <Typography variant="caption" color="text.secondary" textAlign="center" py={2}>
                                                    Belum ada data untuk soal ini
                                                </Typography>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </MotionBox>
                        </Grid>
                    );
                })}
            </Grid> */}
        </MotionBox>
    );
}