import { useQuiz } from '@/hooks/useQuiz';
import { useParticipants } from '@/hooks/useParticipants';
import { useQuestions } from '@/contexts/QuestionsProvider';
import {
    Stack,
    Typography,
    Paper,
    Box,
    Card,
    CardContent,
    Chip,
    Avatar,
    LinearProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    EmojiEvents,
    Timer,
    Star,
    LocalFireDepartment,
    Psychology,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

interface LeaderboardProps {
    maxItems?: number;
    showTabs?: boolean;
}

interface PlayerStats {
    uid: string;
    name: string;
    avatar: string;
    correctAnswers: number;
    totalAnswers: number;
    totalTimeSpent: number;
    averageTime: number;
    accuracy: number;
    streak: number;
    currentStreak: number;
    points: number;
    rank: number;
}

export default function QuizLeaderboards({ maxItems = 10, showTabs = true }: LeaderboardProps) {

    const { answers, quizStats, getUserStats } = useQuiz();
    const { activeParticipants } = useParticipants();
    const { questions } = useQuestions();
    const [activeTab, setActiveTab] = useState(0);

    // Calculate player statistics
    const playerStats = useMemo((): PlayerStats[] => {
        return activeParticipants
            .map(participant => {
                const userAnswers = answers.filter(a => a.uid === participant.id);
                const userStats = getUserStats(participant.id);

                const correctAnswers = userAnswers.filter(answer => {
                    const question = questions.find(q => q.id === answer.questionId);
                    if (!question) return false;

                    if (question.multiple) {
                        const correctOptionIds = question.options
                            .filter(opt => opt.correct)
                            .map(opt => opt.id);
                        return correctOptionIds.every(id => answer.optionsId.includes(id));
                    } else {
                        const correctOption = question.options.find(opt => opt.correct);
                        return correctOption && answer.optionsId.includes(correctOption.id);
                    }
                });

                const totalCorrectAnswer = correctAnswers.length;
                const totalAnswered = userAnswers.length;
                const accuracy = totalAnswered > 0 ? (totalCorrectAnswer / totalAnswered) * 100 : 0;
                let streak = 0;
                let currentStreak = 0;
                let maxStreak = 0;

                userAnswers
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .forEach(answer => {
                        const question = questions.find(q => q.id === answer.questionId);
                        if (question) {
                            const isCorrect = question.multiple
                                ? question.options.filter(opt => opt.correct).map(opt => opt.id).every(id => answer.optionsId.includes(id))
                                : answer.optionsId.includes(question.options.find(opt => opt.correct)?.id || '');

                            if (isCorrect) {
                                currentStreak++;
                                maxStreak = Math.max(maxStreak, currentStreak);
                            } else {
                                currentStreak = 0;
                            }
                        }
                    });

                streak = maxStreak;

                const timeBonus = Math.max(0, userStats.totalTimeSpent > 0
                    ? 2 - Math.floor(userStats.totalTimeSpent / 1000)
                    : 0
                );

                const points = correctAnswers.reduce((acc, cur) => {
                    const questionScore = questions.find(q => q.id == cur.questionId)?.options
                        .filter(opt => cur.optionsId.includes(opt.id))
                        .reduce((acc2, cur2) => acc2 + (cur2.score || 0), 0) || 0;

                    return acc + questionScore;
                }, 0) + timeBonus;

                return {
                    uid: participant.id,
                    name: participant.name,
                    avatar: participant.avatar,
                    correctAnswers: totalCorrectAnswer,
                    totalAnswers: quizStats.totalAnswers,
                    totalTimeSpent: userStats.totalTimeSpent,
                    averageTime: userStats.averageTime,
                    accuracy,
                    streak,
                    currentStreak,
                    points,
                    rank: 0,
                };
            })
            .sort((a, b) => b.points - a.points || b.correctAnswers - a.correctAnswers)
            .map((player, index) => ({
                ...player,
                rank: index + 1,
            }))
            .slice(0, maxItems);
    }, [activeParticipants, answers, questions, getUserStats, maxItems]);

    const topPlayers = playerStats.slice(0, 3);
    const otherPlayers = playerStats.slice(3);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Gold
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Bronze
            default: return 'primary.main';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const renderPodiumView = () => (
        <Stack spacing={3} alignItems="center">
            {/* Top 3 Podium */}
            <Stack direction="row" justifyContent="center" alignItems="flex-end" spacing={2} sx={{ width: '100%' }}>
                {topPlayers.map((player, index) => (
                    <motion.div
                        key={player.uid}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            order: index === 0 ? 2 : index === 1 ? 1 : 3, // Reorder for podium effect
                        }}>
                        {/* Podium Stand */}
                        <Paper
                            sx={{
                                width: 120,
                                height: index === 0 ? 120 : index === 1 ? 80 : 60,
                                backgroundColor: getRankColor(player.rank),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2,
                                mb: 1,
                            }}>
                            <Typography variant="h3" fontWeight="bold" color="white">
                                {getRankIcon(player.rank)}
                            </Typography>
                        </Paper>

                        {/* Player Card */}
                        <Card sx={{ width: 140, textAlign: 'center' }}>
                            <CardContent>
                                <Avatar
                                    src={player.avatar}
                                    sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
                                />
                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                    {player.name}
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {player.points}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {player.correctAnswers} correct
                                </Typography>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </Stack>

            {/* Other Players List */}
            {otherPlayers.length > 0 && (
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Other Participants
                    </Typography>
                    {otherPlayers.map((player, index) => (
                        <motion.div
                            key={player.uid}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: (index + 3) * 0.1 }}
                        >
                            <Card variant="outlined">
                                <CardContent sx={{ py: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ width: 40, textAlign: 'center' }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={getRankColor(player.rank)}
                                            >
                                                {player.rank}
                                            </Typography>
                                        </Box>

                                        <Avatar src={player.avatar} sx={{ width: 40, height: 40 }} />

                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {player.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    {player.correctAnswers}/{player.totalAnswers} correct
                                                </Typography>
                                                <Chip
                                                    label={`${Math.round(player.accuracy)}%`}
                                                    size="small"
                                                    color={player.accuracy >= 80 ? 'success' : player.accuracy >= 60 ? 'warning' : 'error'}
                                                />
                                            </Stack>
                                        </Box>

                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                {player.points}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                points
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </Stack>
            )}
        </Stack>
    );

    const renderTableView = () => (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Participant</TableCell>
                        <TableCell align="center">Correct</TableCell>
                        <TableCell align="center">Accuracy</TableCell>
                        <TableCell align="center">Avg Time</TableCell>
                        <TableCell align="center">Streak</TableCell>
                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {playerStats.map((player, index) => (
                        <motion.tr
                            key={player.uid}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color={getRankColor(player.rank)}
                                    >
                                        {player.rank}
                                    </Typography>
                                    {player.rank <= 3 && (
                                        <EmojiEvents sx={{ color: getRankColor(player.rank) }} />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={player.avatar} />
                                    <Typography variant="body1" fontWeight="medium">
                                        {player.name}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body1" fontWeight="bold">
                                    {player.correctAnswers}/{player.totalAnswers}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={player.accuracy}
                                        sx={{ width: 60, height: 8 }}
                                        color={
                                            player.accuracy >= 80 ? 'success' :
                                                player.accuracy >= 60 ? 'warning' : 'error'
                                        }
                                    />
                                    <Typography variant="body2" fontWeight="bold">
                                        {Math.round(player.accuracy)}%
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <Timer fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {Math.round(player.averageTime / 1000)}s
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <LocalFireDepartment
                                        fontSize="small"
                                        color={player.streak > 0 ? 'error' : 'disabled'}
                                    />
                                    <Typography variant="body2" fontWeight="bold">
                                        {player.streak}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {player.points}
                                </Typography>
                            </TableCell>
                        </motion.tr>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderStatsView = () => (
        <Stack spacing={3}>
            {/* Overall Quiz Stats */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Quiz Statistics
                </Typography>
                <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Box textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            {quizStats.totalParticipants}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Participants
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                            {Math.round(quizStats.completionRate)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Completion Rate
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                            {quizStats.totalAnswers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Answers
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                            {Math.round(quizStats.averageAnswersPerQuestion)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Avg Answers/Q
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Player Performance Highlights */}
            <Stack spacing={2}>
                {[
                    { title: 'Highest Accuracy', key: 'accuracy' as keyof PlayerStats },
                    { title: 'Fastest Responder', key: 'averageTime' as keyof PlayerStats },
                    { title: 'Longest Streak', key: 'streak' as keyof PlayerStats },
                ].map((category, index) => {
                    const topPlayer = [...playerStats].sort((a, b) => {
                        if (category.key === 'averageTime') {
                            return a.averageTime - b.averageTime; // Lower time is better
                        }
                        return (b[category.key] as number) - (a[category.key] as number);
                    })[0];

                    if (!topPlayer) return null;

                    return (
                        <motion.div
                            key={category.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {category.key === 'accuracy' && <Star />}
                                            {category.key === 'averageTime' && <Timer />}
                                            {category.key === 'streak' && <LocalFireDepartment />}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {category.title}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold">
                                                {topPlayer.name}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                                {category.key === 'accuracy' && `${Math.round(topPlayer.accuracy)}% Accuracy`}
                                                {category.key === 'averageTime' && `${Math.round(topPlayer.averageTime / 1000)}s Average`}
                                                {category.key === 'streak' && `${topPlayer.streak} Consecutive Correct`}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`Rank #${topPlayer.rank}`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </Stack>
        </Stack>
    );

    const tabs = [
        { label: 'Podium', value: 0 },
        { label: 'Table', value: 1 },
        { label: 'Statistics', value: 2 },
    ];

    return (
        <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    <EmojiEvents sx={{ fontSize: 40, color: 'gold', mr: 1, verticalAlign: 'middle' }} />
                    Leaderboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Real-time ranking based on performance
                </Typography>
            </Box>

            {/* Tabs */}
            {showTabs && (
                <Paper sx={{ px: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        centered>
                        {tabs.map(tab => (
                            <Tab key={tab.value} label={tab.label} />
                        ))}
                    </Tabs>
                </Paper>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}>
                    {activeTab === 0 && renderPodiumView()}
                    {activeTab === 1 && renderTableView()}
                    {activeTab === 2 && renderStatsView()}
                </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {playerStats.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Data Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Participant data will appear here once the quiz begins
                    </Typography>
                </Paper>
            )}
        </Stack>
    );
}