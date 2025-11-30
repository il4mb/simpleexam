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
    LinearProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
} from '@mui/material';
import {
    EmojiEvents,
    Timer,
    Star,
    LocalFireDepartment,
    Psychology,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import AvatarCompact from '../avatars/AvatarCompact';
import { MotionBox, MotionPaper } from '../motion';
import { useRoomManager } from '@/contexts/RoomManager';
import { Answer, Question } from '@/types';
import { formatNumber } from '@/libs/string';
import { useAnswers } from '@/hooks/useAnswers';
import QuestionStatsByExpression from '../stats/QuestionStatsByExpression';

interface LeaderboardProps {
    maxItems?: number;
    showTabs?: boolean;
}

interface PlayerStats {
    timeBonus: number;
    basePoints: number;
    fullyCorrectAnswers: number;
    efficiency: number;
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

    const { room } = useRoomManager();
    const { answers, getUserStats } = useAnswers();
    const { participants } = useParticipants();
    const { questions } = useQuestions();
    const [activeTab, setActiveTab] = useState(0);
    const activeParticipants = useMemo(() => participants.filter(p => ["active", "left"].includes(p.status)), [participants]);

    // Precompute question data for faster lookups
    const questionMap = useMemo(() => {
        return questions.reduce((map, question) => {
            const correctOptions = question.options.filter(opt => opt.correct);
            map[question.id] = {
                ...question,
                correctOptionIds: correctOptions.map(opt => opt.id),
                incorrectOptionIds: question.options.filter(opt => !opt.correct).map(opt => opt.id),
                optionMap: question.options.reduce((optMap, option) => {
                    optMap[option.id] = option;
                    return optMap;
                }, {} as Record<string, any>),
                totalPossibleScore: correctOptions.reduce((sum, opt) => sum + (opt.score || 0), 0),
                isMultipleChoice: question.multiple || false
            };
            return map;
        }, {} as Record<string, any>);
    }, [questions]);

    // Group answers by user for faster processing
    const answersByUser = useMemo(() => {
        return answers.reduce((groups, answer) => {
            if (!groups[answer.uid]) {
                groups[answer.uid] = [];
            }
            groups[answer.uid].push(answer);
            return groups;
        }, {} as Record<string, Answer[]>);
    }, [answers]);

    // Calculate correct options count and points for an answer
    const calculateAnswerScore = useCallback((answer: Answer, question: Question) => {
        const questionData = questionMap[question.id];
        if (!questionData) return { correctOptions: 0, earnedPoints: 0, isFullyCorrect: false };

        let correctOptions = 0;
        let earnedPoints = 0;

        // Count correct selected options and calculate points
        answer.optionsId.forEach(optionId => {
            const option = questionData.optionMap[optionId];
            if (option && option.correct) {
                correctOptions++;
                earnedPoints += option.score || 0;
            }
        });

        // Check if answer is fully correct (all correct options selected and no incorrect ones)
        const hasIncorrectSelection = answer.optionsId.some(optionId => {
            const option = questionData.optionMap[optionId];
            return option && !option.correct;
        });

        const allCorrectSelected = questionData.correctOptionIds.every((correctId: string) =>
            answer.optionsId.includes(correctId)
        );

        const isFullyCorrect = allCorrectSelected && !hasIncorrectSelection;

        return { correctOptions, earnedPoints, isFullyCorrect };
    }, [questionMap]);

    // Calculate streaks for a user (based on fully correct answers)
    const calculateStreaks = useCallback((userAnswers: Answer[]) => {
        let currentStreak = 0;
        let maxStreak = 0;

        // Sort answers by timestamp to process in chronological order
        const sortedAnswers = [...userAnswers].sort((a, b) => a.timestamp - b.timestamp);

        sortedAnswers.forEach(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            if (question) {
                const { isFullyCorrect } = calculateAnswerScore(answer, question);

                if (isFullyCorrect) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }
        });

        return { currentStreak, maxStreak };
    }, [questions, calculateAnswerScore]);

    // Calculate total points for a user's answers
    const calculateTotalPoints = useCallback((userAnswers: Answer[]) => {
        return userAnswers.reduce((totalPoints, answer) => {
            const question = questionMap[answer.questionId];
            if (!question) return totalPoints;

            const { earnedPoints } = calculateAnswerScore(answer, question);
            return totalPoints + earnedPoints;
        }, 0);
    }, [questionMap, calculateAnswerScore]);

    // Calculate time bonus based on performance
    const calculateTimeBonus = useCallback((totalTimeSpent: number, totalEarnedPoints: number, totalPossiblePoints: number) => {
        if (totalEarnedPoints === 0 || totalTimeSpent === 0) return 0;

        // Calculate efficiency ratio (points earned vs possible points)
        const efficiencyRatio = totalPossiblePoints > 0 ? totalEarnedPoints / totalPossiblePoints : 0;

        // Base bonus that rewards both speed and accuracy
        const averageTimePerPoint = totalTimeSpent / totalEarnedPoints;
        const baseBonus = Math.max(0, 10000 - averageTimePerPoint) / 1000; // Convert to points

        // Scale bonus by efficiency (accuracy) and cap it reasonably
        return Math.round(baseBonus * efficiencyRatio * 0.5);
    }, []);

    // Calculate accuracy based on points earned vs possible points
    const calculateAccuracy = useCallback((userAnswers: Answer[]) => {
        if (userAnswers.length === 0) return 0;

        let totalEarnedPoints = 0;
        let totalPossiblePoints = 0;

        userAnswers.forEach(answer => {
            const question = questionMap[answer.questionId];
            if (question) {
                const { earnedPoints } = calculateAnswerScore(answer, question);
                totalEarnedPoints += earnedPoints;
                totalPossiblePoints += question.totalPossibleScore;
            }
        });

        return totalPossiblePoints > 0 ? (totalEarnedPoints / totalPossiblePoints) * 100 : 0;
    }, [questionMap, calculateAnswerScore]);

    // Main player stats calculation
    const playerStats = useMemo((): PlayerStats[] => {
        // Filter out host and inactive participants
        const eligibleParticipants = activeParticipants.filter(p =>
            p.id !== room.createdBy && ["active", "left"].includes(p.status)
        );

        return eligibleParticipants
            .map(participant => {
                const userAnswers = answersByUser[participant.id] || [];
                const userStats = getUserStats(participant.id);

                // Calculate answer statistics
                let totalCorrectOptions = 0;
                let totalFullyCorrectAnswers = 0;

                userAnswers.forEach(answer => {
                    const question = questionMap[answer.questionId];
                    if (question) {
                        const { correctOptions, isFullyCorrect } = calculateAnswerScore(answer, question);
                        totalCorrectOptions += correctOptions;
                        if (isFullyCorrect) {
                            totalFullyCorrectAnswers++;
                        }
                    }
                });

                // Calculate points and accuracy
                const basePoints = calculateTotalPoints(userAnswers);
                const accuracy = calculateAccuracy(userAnswers);

                // Calculate streaks (based on fully correct answers)
                const { currentStreak, maxStreak } = calculateStreaks(userAnswers);

                // Calculate time bonus
                const totalPossiblePoints = userAnswers.reduce((sum, answer) => {
                    const question = questionMap[answer.questionId];
                    return sum + (question?.totalPossibleScore || 0);
                }, 0);

                const timeBonus = calculateTimeBonus(userStats.totalTimeSpent, basePoints, totalPossiblePoints);
                const totalPoints = basePoints + timeBonus;

                return {
                    uid: participant.id,
                    name: participant.name,
                    avatar: participant.avatar,
                    correctAnswers: totalCorrectOptions, // Now counts correct OPTIONS, not questions
                    fullyCorrectAnswers: totalFullyCorrectAnswers, // Count of fully correct questions
                    totalAnswers: userAnswers.length,
                    totalTimeSpent: userStats.totalTimeSpent,
                    averageTime: userStats.averageTime,
                    accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
                    streak: maxStreak,
                    currentStreak,
                    points: totalPoints,
                    basePoints,
                    timeBonus,
                    efficiency: totalPossiblePoints > 0 ? (basePoints / totalPossiblePoints) * 100 : 0,
                    rank: 0,
                };
            })
            .sort((a, b) => {
                // Primary sort by points (descending)
                if (b.points !== a.points) return b.points - a.points;

                // Secondary sort by correct options (descending)
                if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;

                // Tertiary sort by efficiency (descending)
                if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;

                // Quaternary sort by average time (ascending - faster is better)
                return a.averageTime - b.averageTime;
            })
            .map((player, index) => ({
                ...player,
                rank: index + 1,
            }))
            .slice(0, maxItems);
    }, [
        activeParticipants,
        room.createdBy,
        answersByUser,
        questionMap,
        getUserStats,
        calculateAnswerScore,
        calculateTotalPoints,
        calculateAccuracy,
        calculateStreaks,
        calculateTimeBonus,
        maxItems
    ]);

    // Additional helper stats for the entire quiz
    const quizStatistics = useMemo(() => {
        const stats = {
            totalParticipants: playerStats.length,
            averageAccuracy: 0,
            averagePoints: 0,
            highestStreak: 0,
            totalCorrectOptions: 0,
            averageEfficiency: 0,
        };

        if (playerStats.length > 0) {
            stats.averageAccuracy = playerStats.reduce((sum, player) =>
                sum + player.accuracy, 0) / playerStats.length;
            stats.averagePoints = playerStats.reduce((sum, player) =>
                sum + player.points, 0) / playerStats.length;
            stats.highestStreak = Math.max(...playerStats.map(p => p.streak));
            stats.totalCorrectOptions = playerStats.reduce((sum, player) =>
                sum + player.correctAnswers, 0);
            stats.averageEfficiency = playerStats.reduce((sum, player) =>
                sum + player.efficiency, 0) / playerStats.length;
        }

        return stats;
    }, [playerStats]);


    const topPlayers = playerStats.slice(0, 3);
    const otherPlayers = playerStats.slice(3);

    const podiumOrder = useMemo(() => {
        if (topPlayers.length !== 3) return topPlayers;
        return [topPlayers[1], topPlayers[0], topPlayers[2]];
    }, [topPlayers]);


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
        <Stack gap={3} alignItems="center" sx={{ py: 3 }}>
            <Stack direction="row" justifyContent="center" alignItems="flex-end" spacing={2} sx={{ width: '100%', userSelect: "none" }} mb={2}>
                {podiumOrder.map((player, index) => (
                    <MotionPaper
                        initial={{
                            y: 100
                        }}
                        animate={{
                            y: index == 1 ? 0 : index == 0 ? 20 : 30,
                            transition: {
                                delay: index * 0.1
                            }
                        }}
                        whileHover={{
                            y: (index === 1 ? 0 : index == 0 ? 20 : 30) - 10,
                        }}
                        whileTap={{
                            y: (index === 1 ? 0 : index == 0 ? 20 : 30) - 10,
                        }}
                        sx={{
                            width: '100px',
                            backgroundColor: alpha(getRankColor(player.rank), 0.5),
                            border: '3px solid',
                            borderColor: getRankColor(player.rank),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            mb: 1,
                            overflow: "hidden"
                        }}>
                        <Stack justifyContent={"center"} alignItems={"center"} p={2}>

                            <MotionBox sx={{ position: 'relative', mb: 2 }}>
                                <AvatarCompact
                                    seed={player.avatar}
                                    borderColor={getRankColor(player.rank)}
                                    sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }} />
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    color="white"
                                    fontSize={24}
                                    sx={{
                                        position: "absolute",
                                        bottom: -16,
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}>
                                    {getRankIcon(player.rank)}
                                </Typography>
                            </MotionBox>
                            <Typography variant="subtitle1" fontSize={12} fontWeight="bold" textOverflow={"ellipsis"} overflow={"hidden"} maxWidth={95} noWrap>
                                {player.name}
                            </Typography>
                            <Typography variant="h6" color="white" fontWeight="bold" fontSize={14} component={"span"}>
                                {formatNumber(player.points)} pts
                            </Typography>
                        </Stack>

                    </MotionPaper>
                ))}
            </Stack>
            {otherPlayers.length > 0 && (
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Peserta Lainya
                    </Typography>
                    {otherPlayers.map((player, index) => (
                        <motion.div
                            key={player.uid}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: (index + 3) * 0.1 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ width: 40, textAlign: 'center' }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={getRankColor(player.rank)}>
                                                {player.rank}
                                            </Typography>
                                        </Box>

                                        <AvatarCompact
                                            seed={player.avatar}
                                            size={40}
                                            borderColor={"text.secondary"} />

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
                                                {formatNumber(player.points)}
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
        <TableContainer component={Paper} variant="outlined" sx={{ px: 1 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Perserta</TableCell>
                        <TableCell align="center">Correct</TableCell>
                        <TableCell align="center">Accuracy</TableCell>
                        <TableCell align="center">Avg Time</TableCell>
                        <TableCell align="center">Streak</TableCell>
                        <TableCell align="center">Efficiency</TableCell>
                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {playerStats.map((player, index) => (
                        <motion.tr
                            key={player.uid}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color={getRankColor(player.rank)}>
                                        {player.rank}
                                    </Typography>
                                    {player.rank <= 3 && (
                                        <EmojiEvents sx={{ color: getRankColor(player.rank) }} />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AvatarCompact seed={player.avatar} size={40} />
                                    <Typography variant="body1" fontWeight="medium" textOverflow={"ellipsis"} overflow={"hidden"} noWrap>
                                        {player.name}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body1" fontWeight="bold">
                                    {formatNumber(player.correctAnswers)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    options
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
                                        {formatNumber(player.streak)}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                    <Psychology fontSize="small" color="action" />
                                    <Typography variant="body2" fontWeight="bold">
                                        {Math.round(player.efficiency)}%
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {formatNumber(player.points)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {formatNumber(player.basePoints)} + {formatNumber(player.timeBonus)}
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
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <Box textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            {quizStatistics.totalParticipants}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Participants
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                            {Math.round(quizStatistics.averageAccuracy)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average Accuracy
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                            {quizStatistics.totalCorrectOptions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Correct Options
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                            {Math.round(quizStatistics.averageEfficiency)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average Efficiency
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Player Performance Highlights */}
            <Stack spacing={2}>
                {[
                    {
                        title: 'Highest Accuracy',
                        key: 'accuracy' as keyof PlayerStats,
                        icon: <Star />,
                        formatter: (value: number) => `${Math.round(value)}% Accuracy`
                    },
                    {
                        title: 'Fastest Responder',
                        key: 'averageTime' as keyof PlayerStats,
                        icon: <Timer />,
                        formatter: (value: number) => `${Math.round(value / 1000)}s Average`
                    },
                    {
                        title: 'Longest Streak',
                        key: 'streak' as keyof PlayerStats,
                        icon: <LocalFireDepartment />,
                        formatter: (value: number) => `${value} Consecutive Perfect`
                    },
                    {
                        title: 'Most Efficient',
                        key: 'efficiency' as keyof PlayerStats,
                        icon: <Psychology />,
                        formatter: (value: number) => `${Math.round(value)}% Efficiency`
                    },
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
                                            {category.icon}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {category.title}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold">
                                                {topPlayer.name}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                                {category.formatter(topPlayer[category.key] as number)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {topPlayer.correctAnswers} correct options • {topPlayer.fullyCorrectAnswers} perfect
                                            </Typography>
                                        </Box>
                                        <Stack alignItems="flex-end" spacing={0.5}>
                                            <Chip
                                                label={`Rank #${topPlayer.rank}`}
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                {topPlayer.points} pts
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </Stack>

            {/* Points Distribution */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Points Distribution
                </Typography>
                <Stack spacing={2}>
                    {playerStats.slice(0, 5).map((player, index) => (
                        <Box key={player.uid}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" fontWeight="medium">
                                    {player.name}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {player.points} points
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={(player.points / Math.max(...playerStats.map(p => p.points))) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                                color={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'primary'}
                            />
                            <Stack direction="row" justifyContent="space-between" mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                    Base: {player.basePoints}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Bonus: {player.timeBonus}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Stack>
    );

    const tabs = [
        { label: 'Podium', value: 0 },
        { label: 'Table', value: 1 },
        { label: 'Statistics', value: 2 },
    ];

    return (
        <Stack gap={3}>
            {showTabs && (
                <Box sx={{ px: 2, mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        centered>
                        {tabs.map(tab => (
                            <Tab key={tab.value} label={tab.label} />
                        ))}
                    </Tabs>
                </Box>
            )}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}>
                    {activeTab === 0 && renderPodiumView()}
                    {activeTab === 1 && renderTableView()}
                    {activeTab === 2 && <QuestionStatsByExpression />}
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