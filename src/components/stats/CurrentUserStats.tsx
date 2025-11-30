import { useCurrentUser } from '@/contexts/SessionProvider';
import { useQuestions } from '@/contexts/QuestionsProvider';
import {
    Stack,
    Typography,
    Paper,
    Box,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Divider,
} from '@mui/material';
import {
    EmojiEvents,
    Timer,
    Star,
    LocalFireDepartment,
    Psychology,
    CheckCircle,
    Speed,
    TrendingUp,
} from '@mui/icons-material';
import { ReactNode, useMemo } from 'react';
import AvatarCompact from '../avatars/AvatarCompact';
import { MotionStack, MotionPaper } from '../motion';
import { useAnswers } from '@/hooks/useAnswers';

export default function CurrentUserStats() {

    const currentUser = useCurrentUser();

    const { answers, getUserStats, quizStats } = useAnswers();
    const { questions: allQuestions } = useQuestions();

    // Calculate current user's detailed stats
    const userStats = useMemo(() => {
        if (!currentUser) return null;

        const basicStats = getUserStats(currentUser.id);
        const userAnswers = answers.filter(answer => answer.uid === currentUser.id);

        // Calculate correct options and points
        let totalCorrectOptions = 0;
        let totalFullyCorrectAnswers = 0;
        let totalPoints = 0;
        let totalPossiblePoints = 0;

        userAnswers.forEach(answer => {
            const question = allQuestions.find(q => q.id === answer.questionId);
            if (question) {
                const correctOptions = question.options.filter(opt => opt.correct);
                const selectedOptions = question.options.filter(opt =>
                    answer.optionsId.includes(opt.id)
                );

                // Count correct selected options
                const correctSelected = selectedOptions.filter(opt => opt.correct).length;
                totalCorrectOptions += correctSelected;

                // Check if fully correct
                const isFullyCorrect = correctOptions.length > 0 &&
                    correctOptions.every(opt => answer.optionsId.includes(opt.id)) &&
                    selectedOptions.every(opt => opt.correct);

                if (isFullyCorrect) {
                    totalFullyCorrectAnswers++;
                }

                // Calculate points
                const answerPoints = selectedOptions.reduce((sum, opt) => sum + (opt.score || 0), 0);
                totalPoints += answerPoints;
                totalPossiblePoints += correctOptions.reduce((sum, opt) => sum + (opt.score || 0), 0);
            }
        });

        // Calculate streaks
        let currentStreak = 0;
        let maxStreak = 0;
        const sortedAnswers = [...userAnswers].sort((a, b) => a.timestamp - b.timestamp);

        sortedAnswers.forEach(answer => {
            const question = allQuestions.find(q => q.id === answer.questionId);
            if (question) {
                const correctOptions = question.options.filter(opt => opt.correct);
                const isFullyCorrect = correctOptions.length > 0 &&
                    correctOptions.every(opt => answer.optionsId.includes(opt.id)) &&
                    answer.optionsId.every(optId =>
                        question.options.find(opt => opt.id === optId)?.correct
                    );

                if (isFullyCorrect) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }
        });

        const accuracy = userAnswers.length > 0 ? (totalCorrectOptions / userAnswers.reduce((sum, answer) =>
            sum + answer.optionsId.length, 0)) * 100 : 0;

        const efficiency = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;

        return {
            ...basicStats,
            totalCorrectOptions,
            totalFullyCorrectAnswers,
            totalPoints,
            accuracy: Math.round(accuracy * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100,
            currentStreak,
            maxStreak,
            totalAnswers: userAnswers.length,
            rank: 0, // This would need to be calculated against all players
        };
    }, [currentUser, answers, getUserStats, allQuestions]);

    if (!currentUser || !userStats) {
        return (
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ p: 3, textAlign: 'center' }}
            >
                <Typography variant="body1" color="text.secondary">
                    Start answering questions to see your stats!
                </Typography>
            </MotionPaper>
        );
    }

    const StatItem = ({
        icon,
        label,
        value,
        color = 'primary',
        subtitle
    }: {
        icon: ReactNode;
        label: string;
        value: string | number;
        color?: string;
        subtitle?: string;
    }) => (
        <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ color: `${color}.main`, mb: 1 }}>
                    {icon}
                </Box>
                <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const ProgressStat = ({
        label,
        value,
        max = 100,
        color = 'primary',
        format
    }: {
        label: string;
        value: number;
        max?: number;
        color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
        format?: (val: number) => string;
    }) => (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                    {format ? format(value) : value}
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={(value / max) * 100}
                color={color}
                sx={{ height: 8, borderRadius: 4 }}
            />
        </Box>
    );

    return (
        <MotionStack
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            spacing={3}
        >
            {/* Header with User Info */}
            <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <AvatarCompact
                        seed={currentUser.avatar}
                        size={60}
                        borderColor="primary.main"
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {currentUser.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your Quiz Performance
                        </Typography>
                    </Box>
                    <Chip
                        icon={<EmojiEvents />}
                        label={`${userStats.totalPoints} Points`}
                        color="primary"
                        variant="filled"
                    />
                </Stack>
            </Paper>

            {/* Key Stats Grid */}
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <StatItem
                    icon={<CheckCircle fontSize="large" />}
                    label="Correct Options"
                    value={userStats.totalCorrectOptions}
                    color="success"
                    subtitle={`${userStats.totalFullyCorrectAnswers} perfect`}
                />
                <StatItem
                    icon={<Star fontSize="large" />}
                    label="Accuracy"
                    value={`${Math.round(userStats.accuracy)}%`}
                    color="warning"
                />
                <StatItem
                    icon={<LocalFireDepartment fontSize="large" />}
                    label="Current Streak"
                    value={userStats.currentStreak}
                    color="error"
                    subtitle={`Max: ${userStats.maxStreak}`}
                />
                <StatItem
                    icon={<Psychology fontSize="large" />}
                    label="Efficiency"
                    value={`${Math.round(userStats.efficiency)}%`}
                    color="info"
                />
            </Stack>

            {/* Progress Stats */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Performance Metrics
                </Typography>

                <ProgressStat
                    label="Accuracy"
                    value={userStats.accuracy}
                    color={userStats.accuracy >= 80 ? 'success' : userStats.accuracy >= 60 ? 'warning' : 'error'}
                    format={(val) => `${Math.round(val)}%`}
                />

                <ProgressStat
                    label="Efficiency"
                    value={userStats.efficiency}
                    color={userStats.efficiency >= 80 ? 'success' : userStats.efficiency >= 60 ? 'warning' : 'error'}
                    format={(val) => `${Math.round(val)}%`}
                />

                <ProgressStat
                    label="Completion"
                    value={quizStats.totalQuestions > 0 ? (userStats.totalAnswers / quizStats.totalQuestions) * 100 : 0}
                    color="primary"
                    format={() => `${userStats.totalAnswers}/${quizStats.totalQuestions} questions`}
                />

                <Divider sx={{ my: 2 }} />

                {/* Time Statistics */}
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Timer color="action" />
                            <Typography variant="body2">Total Time Spent</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="bold">
                            {Math.round(userStats.totalTimeSpent / 1000)}s
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Speed color="action" />
                            <Typography variant="body2">Average Time</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="bold">
                            {Math.round(userStats.averageTime / 1000)}s
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TrendingUp color="action" />
                            <Typography variant="body2">Points per Question</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="bold">
                            {userStats.totalAnswers > 0 ? (userStats.totalPoints / userStats.totalAnswers).toFixed(1) : 0}
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            {/* Performance Tips */}
            <Paper sx={{ p: 3 }} elevation={3}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Tips to Improve
                </Typography>
                <Stack spacing={1}>
                    {userStats.accuracy < 70 && (
                        <Typography variant="body2">
                            💡 <strong>Focus on accuracy:</strong> Take your time to read questions carefully before answering.
                        </Typography>
                    )}
                    {userStats.efficiency < 70 && (
                        <Typography variant="body2">
                            ⚡ <strong>Improve efficiency:</strong> Aim for perfect answers to maximize your points per question.
                        </Typography>
                    )}
                    {userStats.currentStreak < 3 && (
                        <Typography variant="body2">
                            🔥 <strong>Build streaks:</strong> Consistent correct answers earn bonus points and improve your rank.
                        </Typography>
                    )}
                    {userStats.totalAnswers < quizStats.totalQuestions / 2 && (
                        <Typography variant="body2">
                            🎯 <strong>Complete more questions:</strong> Answer all questions to maximize your total score potential.
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </MotionStack>
    );
}