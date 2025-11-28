import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { MotionBox } from '@/components/motion';
import { PodiumLeaderboard } from './PodiumLeaderboard';
import { CompactLeaderboard } from './CompactLeaderboard';
import { LeaderboardItem } from './LeaderboardItem';

export interface LeaderboardPlayer {
    id: string;
    name: string;
    avatar: string;
    score: number;
    position: number;
    isCurrentUser?: boolean;
    progress?: number;
    streak?: number;
}

export interface LeaderboardProps {
    players: LeaderboardPlayer[];
    title?: string;
    subtitle?: string;
    maxPlayers?: number;
    showProgress?: boolean;
    variant?: 'default' | 'compact' | 'podium';
}

export default function Leaderboard({
    players,
    title = "Leaderboard",
    subtitle,
    maxPlayers = 10,
    showProgress = false,
    variant = 'default'
}: LeaderboardProps) {
    const sortedPlayers = [...players]
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPlayers)
        .map((player, index) => ({
            ...player,
            position: index + 1
        }));

    if (variant === 'podium') {
        return <PodiumLeaderboard players={sortedPlayers} title={title} subtitle={subtitle} />;
    }

    if (variant === 'compact') {
        return <CompactLeaderboard players={sortedPlayers} title={title} subtitle={subtitle} />;
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold" textAlign="center">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>

                    {/* Leaderboard List */}
                    <Stack spacing={2}>
                        {sortedPlayers.map((player, index) => (
                            <LeaderboardItem
                                key={player.id}
                                player={player}
                                index={index}
                                showProgress={showProgress}
                            />
                        ))}
                    </Stack>

                    {sortedPlayers.length === 0 && (
                        <Box textAlign="center" py={4}>
                            <Typography variant="body1" color="text.secondary">
                                Belum ada data leaderboard
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </MotionBox>
    );
}