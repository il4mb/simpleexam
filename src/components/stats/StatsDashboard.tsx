"use client"
import { Card, CardContent, Typography, Box, Stack, Grid, Chip, LinearProgress } from '@mui/material';
import { MotionBox } from '@/components/motion';
import { Schedule, TrendingUp } from '@mui/icons-material';
// import { useQuizLobby } from '@/contexts/QuizLobbyProvider';
import { Medal } from 'lucide-react';

export default function StatsDashboard() {

    // const { playerStats, getAverageQuizTime, getPlayerRankings } = useQuizLobby();

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Grid container spacing={3} mt={3}>
                {/* Detailed Stats */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MotionBox
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}>
                        {/* <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography component={Stack} alignItems={"center"} gap={1} direction={"row"} variant="h6" fontWeight="bold" gutterBottom>
                                    <Medal /> Top Performers
                                </Typography>
                                <Stack spacing={2}>
                                    {getPlayerRankings().slice(0, 5).map((player, index) => (
                                        <MotionBox
                                            key={player.playerId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}>
                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {index + 1}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body1" fontWeight="600">
                                                        Player {player.playerId.slice(-4)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {player.correctAnswers}/{player.totalAnswers} correct
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={player.points}
                                                    color="primary"
                                                    variant="filled"
                                                    size="small"
                                                />
                                            </Stack>
                                        </MotionBox>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card> */}
                    </MotionBox>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    {/* <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    📈 Performance Metrics
                                </Typography>
                                <Stack spacing={3}>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" fontWeight="600">
                                                Waktu Rata-rata
                                            </Typography>
                                            <Chip
                                                label={`${getAverageQuizTime().toFixed(1)}s`}
                                                size="small"
                                                icon={<Schedule />}
                                            />
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(getAverageQuizTime() * 10, 100)}
                                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" fontWeight="600">
                                                Streak Tertinggi
                                            </Typography>
                                            <Chip
                                                label={Math.max(...playerStats.map(p => p.streak)) || 0}
                                                size="small"
                                                color="warning"
                                                icon={<TrendingUp />}
                                            />
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" fontWeight="600" gutterBottom>
                                            Distribusi Akurasi
                                        </Typography>
                                        <Stack spacing={1}>
                                            {['90-100%', '80-89%', '70-79%', '<70%'].map((range, index) => (
                                                <Stack key={range} direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="caption" sx={{ minWidth: 60 }}>
                                                        {range}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={25} // You'd calculate actual distribution
                                                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                                                        color={index === 0 ? 'success' : index === 1 ? 'primary' : index === 2 ? 'warning' : 'error'}
                                                    />
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </MotionBox> */}
                </Grid>
            </Grid>
        </MotionBox>
    );
}