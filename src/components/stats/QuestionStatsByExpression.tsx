import { useExpressionResults } from '@/hooks/useExpressionResults';
import {
    Stack,
    Typography,
    Paper,
    Box,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MotionStack, MotionPaper, MotionBox, MotionTypography } from '../motion';
import AvatarCompact from '../avatars/AvatarCompact';
import { EXPRESSION_MAP } from '../FloatingCamera';
import { useEffect, useState } from 'react';

export default function QuestionStatsByExpression() {

    const results = useExpressionResults();
    const theme = useTheme();
    const [mounted, setMounted] = useState(false);
    const [expanded, setExpanded] = useState<string>();


    // Expression color mapping
    const getExpressionColor = (expression: string) => {
        return EXPRESSION_MAP[expression]?.color || theme.palette.primary.main;
    };

    const getExpressionIcon = (expression: string) => {
        return EXPRESSION_MAP[expression]?.emoji;
    };

    // Calculate expression statistics for a question using raw counts
    const calculateExpressionStats = (expressions: any[]) => {
        if (expressions.length === 0) return null;

        const expressionTotals: Record<string, number> = {};
        let totalExpressionCount = 0;

        // Sum all expression counts
        expressions.forEach(expr => {
            Object.entries(expr.data).forEach(([emotion, count]) => {
                if (typeof count === 'number') {
                    expressionTotals[emotion] = (expressionTotals[emotion] || 0) + count;
                    totalExpressionCount += count;
                }
            });
        });

        // Calculate percentages for visualization
        const expressionPercentages: Record<string, number> = {};
        Object.keys(expressionTotals).forEach(emotion => {
            expressionPercentages[emotion] = totalExpressionCount > 0
                ? (expressionTotals[emotion] / totalExpressionCount) * 100
                : 0;
        });

        // Find dominant expression (highest count)
        const dominantExpression = Object.entries(expressionTotals).reduce(
            (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
            { emotion: '', count: 0 }
        );

        return {
            totals: expressionTotals,
            percentages: expressionPercentages,
            dominantExpression: dominantExpression.emotion,
            dominantCount: dominantExpression.count,
            totalExpressionCount,
            totalParticipants: expressions.length,
        };
    };

    const getUserTopExpressions = (data: Record<string, number>) => {
        return Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([emotion, count]) => ({ emotion, count }));
    };

    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const toggleExpanded = (id: string) => () => {
        setExpanded(prev => {
            if (prev == id) return undefined;
            return id;
        });
    }

    useEffect(() => {
        if (mounted) return;
        if (!expanded && results.length > 0) {
            setExpanded(results[0].question.id);
            setMounted(true);
        }
    }, [results, expanded, mounted]);

    if (results.length === 0) {
        return (
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ p: 4, textAlign: 'center' }}>
                <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Expression Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Expression data will appear here once participants start answering questions
                </Typography>
            </MotionPaper>
        );
    }

    return (
        <MotionStack spacing={3}>
            {results.map((result, questionIndex) => {
                const stats = calculateExpressionStats(result.expressions);
                const isExpanded = result.question.id == expanded;

                return (
                    <MotionPaper
                        key={result.question.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: questionIndex * 0.1 }}
                        onClick={toggleExpanded(result.question.id)}

                        sx={{ p: 3 }}>
                        <Stack spacing={2} direction={isExpanded ? "column" : "row"} justifyContent={isExpanded ? "start" : "space-between"}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Question {questionIndex + 1}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {result.question.text}
                                </Typography>
                            </Box>

                            {stats && (
                                <>
                                    {isExpanded ? (
                                        <MotionStack direction={"row"} justifyContent={"space-between"}>
                                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                                <MotionBox
                                                    layoutId={result.question.id}
                                                    initial={{ scale: 0.5 }}
                                                    animate={{ scale: 1 }}
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: '50%',
                                                        backgroundColor: alpha(getExpressionColor(stats.dominantExpression), 0.2),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: getExpressionColor(stats.dominantExpression),
                                                    }}>
                                                    <Typography sx={{ scale: 2 }}>
                                                        {getExpressionIcon(stats.dominantExpression)}
                                                    </Typography>
                                                </MotionBox>
                                                <Box sx={{ flex: 1 }}>
                                                    <MotionTypography initial={{ x: -20 }} animate={{ x: 0 }} variant="subtitle1" fontWeight="bold">
                                                        Dominant Expression
                                                    </MotionTypography>
                                                    <MotionTypography initial={{ x: -20 }} animate={{ x: 0 }} variant="h5" color={getExpressionColor(stats.dominantExpression)}>
                                                        {stats.dominantExpression.charAt(0).toUpperCase() + stats.dominantExpression.slice(1)}
                                                    </MotionTypography>
                                                    <MotionTypography initial={{ x: -20 }} animate={{ x: 0 }} variant="body2" color="text.secondary">
                                                        {formatNumber(stats.dominantCount)} detections
                                                    </MotionTypography>
                                                </Box>
                                            </Stack>
                                            <Divider sx={{ my: 1 }} />
                                            <Stack spacing={1}>
                                                <Stack gap={1} direction="row" justifyContent="space-between">
                                                    <Typography variant="body2">Total Expressions:</Typography>
                                                    <MotionTypography initial={{ x: 20 }} animate={{ x: 0 }} variant="body2" fontWeight="bold">
                                                        {formatNumber(stats.totalExpressionCount)}
                                                    </MotionTypography>
                                                </Stack>
                                                <Stack gap={1} direction="row" justifyContent="space-between">
                                                    <Typography variant="body2">Participants:</Typography>
                                                    <MotionTypography initial={{ x: 20 }} animate={{ x: 0 }} variant="body2" fontWeight="bold">
                                                        {stats.totalParticipants}
                                                    </MotionTypography>
                                                </Stack>
                                                <Stack gap={1} direction="row" justifyContent="space-between">
                                                    <Typography variant="body2">Avg per Participant:</Typography>
                                                    <MotionTypography initial={{ x: 20 }} animate={{ x: 0 }} variant="body2" fontWeight="bold">
                                                        {formatNumber(Math.round(stats.totalExpressionCount / stats.totalParticipants))}
                                                    </MotionTypography>
                                                </Stack>
                                            </Stack>
                                        </MotionStack>
                                    ) : (
                                        <MotionBox
                                            layoutId={result.question.id}
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                backgroundColor: alpha(getExpressionColor(stats.dominantExpression), 0.2),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: getExpressionColor(stats.dominantExpression),
                                            }}>
                                            <Typography sx={{ scale: 2 }}>
                                                {getExpressionIcon(stats.dominantExpression)}
                                            </Typography>
                                        </MotionBox>
                                    )}
                                </>
                            )}
                            {isExpanded && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Participant Breakdown ({result.expressions.length} participants)
                                    </Typography>

                                    <MotionBox initial={{ y: -20 }} animate={{ y: 0 }}>
                                        {result.expressions.length > 0 ? (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Participant</TableCell>
                                                            <TableCell align="center">Top Expressions</TableCell>
                                                            <TableCell align="center">Total Count</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {result.expressions.map((expr, index) => {
                                                            const topExpressions = getUserTopExpressions(expr.data);
                                                            const userTotal = Object.values(expr.data).reduce((sum: number, count) => sum + (count as number), 0);

                                                            return (
                                                                <motion.tr
                                                                    key={expr.user?.id || index}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: index * 0.05 }}>
                                                                    <TableCell>
                                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                                            <AvatarCompact
                                                                                seed={expr.user?.avatar}
                                                                                size={32}
                                                                                borderColor="text.secondary"
                                                                            />
                                                                            <Typography variant="body2">
                                                                                {expr.user?.name || 'Unknown User'}
                                                                            </Typography>
                                                                        </Stack>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                            {topExpressions.map((topExpr, i) => (
                                                                                <Chip
                                                                                    key={topExpr.emotion}
                                                                                    icon={<Typography sx={{ scale: 0.8 }}>{getExpressionIcon(topExpr.emotion)}</Typography>}
                                                                                    label={`${topExpr.emotion} (${formatNumber(topExpr.count)})`}
                                                                                    size="small"
                                                                                    variant={i === 0 ? "filled" : "outlined"}
                                                                                    sx={{
                                                                                        backgroundColor: i === 0 ?
                                                                                            alpha(getExpressionColor(topExpr.emotion), 0.2) : 'transparent',
                                                                                        color: getExpressionColor(topExpr.emotion),
                                                                                        borderColor: getExpressionColor(topExpr.emotion),
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </Stack>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography variant="body1" fontWeight="bold">
                                                                            {formatNumber(userTotal)}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            total detections
                                                                        </Typography>
                                                                    </TableCell>
                                                                </motion.tr>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No expression data recorded for this question
                                                </Typography>
                                            </Paper>
                                        )}
                                    </MotionBox>
                                </Box>
                            )}
                        </Stack>
                    </MotionPaper>
                );
            })}
        </MotionStack>
    );
}