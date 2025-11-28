// components/leaderboard/PodiumLeaderboard.tsx
import { Card, CardContent, Typography, Box, Stack, Avatar } from '@mui/material';
import { MotionBox } from '@/components/motion';
import { Crown, Trophy, Star } from 'lucide-react';
import { LeaderboardPlayer } from './Leaderboard';
import AvatarCompact from '../avatars/AvatarCompact';

interface PodiumLeaderboardProps {
    players: LeaderboardPlayer[];
    title?: string;
    subtitle?: string;
}

export function PodiumLeaderboard({ players, title, subtitle }: PodiumLeaderboardProps) {
    const topThree = players.slice(0, 3);
    const others = players.slice(3);

    const getPodiumHeight = (position: number) => {
        switch (position) {
            case 1: return 180;
            case 2: return 140;
            case 3: return 120;
            default: return 100;
        }
    };

    const getPodiumColor = (position: number) => {
        switch (position) {
            case 1: return 'linear-gradient(135deg, #FFD700, #FFEC8B)';
            case 2: return 'linear-gradient(135deg, #C0C0C0, #E8E8E8)';
            case 3: return 'linear-gradient(135deg, #CD7F32, #E8B886)';
            default: return 'linear-gradient(135deg, #667eea, #764ba2)';
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack spacing={1} sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold" textAlign="center">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>

                    {/* Podium */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 2, mb: 4 }}>
                        {topThree.map((player, index) => (
                            <MotionBox
                                key={player.id}
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                                sx={{ textAlign: 'center' }}
                            >
                                {/* Podium Stand */}
                                <Box
                                    sx={{
                                        height: getPodiumHeight(player.position),
                                        width: 100,
                                        background: getPodiumColor(player.position),
                                        borderRadius: '12px 12px 0 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'end',
                                        pb: 2,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Position Icon */}
                                    <Box sx={{ position: 'absolute', top: 8 }}>
                                        {player.position === 1 && <Crown size={24} color="#8B7500" />}
                                        {player.position === 2 && <Trophy size={20} color="#696969" />}
                                        {player.position === 3 && <Star size={20} color="#8B4513" />}
                                    </Box>

                                    {/* Avatar */}
                                    <AvatarCompact
                                        seed={player.avatar}
                                        size={50}
                                        sx={{
                                            border: `3px solid white`,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                            mb: 1
                                        }}
                                    />

                                    {/* Score */}
                                    <Typography variant="h6" fontWeight="bold" color="white">
                                        {player.score}
                                    </Typography>
                                </Box>

                                {/* Player Name */}
                                <Typography 
                                    variant="subtitle2" 
                                    fontWeight="600" 
                                    sx={{ mt: 1, maxWidth: 100 }}
                                    noWrap
                                >
                                    {player.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    #{player.position}
                                </Typography>
                            </MotionBox>
                        ))}
                    </Box>

                    {/* Other Players */}
                    {others.length > 0 && (
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Pemain Lainnya
                            </Typography>
                            {others.map((player, index) => (
                                <MotionBox
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (index + 3) * 0.1 }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 1 }}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 24 }}>
                                            #{player.position}
                                        </Typography>
                                        <AvatarCompact seed={player.avatar} size={32} />
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            {player.name}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {player.score}
                                        </Typography>
                                    </Stack>
                                </MotionBox>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </MotionBox>
    );
}