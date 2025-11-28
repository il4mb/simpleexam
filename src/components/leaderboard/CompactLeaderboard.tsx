// components/leaderboard/CompactLeaderboard.tsx
import { Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { MotionBox } from '@/components/motion';
import { LeaderboardPlayer } from './Leaderboard';
import AvatarCompact from '../avatars/AvatarCompact';

interface CompactLeaderboardProps {
    players: LeaderboardPlayer[];
    title?: string;
    subtitle?: string;
}

export function CompactLeaderboard({ players, title, subtitle }: CompactLeaderboardProps) {
    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 2 }}>
                    {/* Header */}
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>

                    {/* Compact List */}
                    <Stack spacing={1}>
                        {players.map((player, index) => (
                            <MotionBox
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Stack 
                                    direction="row" 
                                    alignItems="center" 
                                    spacing={1.5}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: player.isCurrentUser ? 'primary.light' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                >
                                    {/* Position */}
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            bgcolor: player.position <= 3 
                                                ? (player.position === 1 ? 'gold' : player.position === 2 ? 'silver' : '#CD7F32')
                                                : 'rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            color: player.position <= 3 ? 'white' : 'text.secondary',
                                            flexShrink: 0
                                        }}
                                    >
                                        {player.position}
                                    </Box>

                                    {/* Avatar */}
                                    <AvatarCompact seed={player.avatar} size={28} />

                                    {/* Name */}
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            flex: 1,
                                            fontWeight: player.isCurrentUser ? '600' : '400',
                                            color: player.isCurrentUser ? 'primary.main' : 'text.primary'
                                        }}
                                        noWrap
                                    >
                                        {player.name}
                                    </Typography>

                                    {/* Score */}
                                    <Typography variant="body2" fontWeight="bold">
                                        {player.score}
                                    </Typography>
                                </Stack>
                            </MotionBox>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </MotionBox>
    );
}