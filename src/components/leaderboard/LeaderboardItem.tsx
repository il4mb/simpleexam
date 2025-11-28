// components/leaderboard/LeaderboardItem.tsx
import { Box, Stack, Typography, Avatar, Chip, LinearProgress } from '@mui/material';
import { MotionBox } from '@/components/motion';
import { Crown, Star, Zap, TrendingUp, Trophy } from 'lucide-react';
import { LeaderboardPlayer } from './Leaderboard';
import AvatarCompact from '../avatars/AvatarCompact';

interface LeaderboardItemProps {
    player: LeaderboardPlayer;
    index: number;
    showProgress?: boolean;
}

export function LeaderboardItem({ player, index, showProgress }: LeaderboardItemProps) {
    const getPositionColor = (position: number) => {
        switch (position) {
            case 1: return { bg: 'linear-gradient(135deg, #FFD700, #FFEC8B)', color: '#8B7500' };
            case 2: return { bg: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)', color: '#696969' };
            case 3: return { bg: 'linear-gradient(135deg, #CD7F32, #E8B886)', color: '#8B4513' };
            default: return { bg: 'rgba(0,0,0,0.04)', color: 'text.secondary' };
        }
    };

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown size={16} />;
            case 2: return <Trophy size={14} />;
            case 3: return <Star size={14} />;
            default: return position;
        }
    };

    const positionStyle = getPositionColor(player.position);

    return (
        <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    background: player.isCurrentUser 
                        ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))'
                        : positionStyle.bg,
                    border: player.isCurrentUser 
                        ? '2px solid #2196F3'
                        : '1px solid rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background pattern for top 3 */}
                {player.position <= 3 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '60%',
                            background: `radial-gradient(circle at top right, ${player.position === 1 ? 'rgba(255,215,0,0.1)' : player.position === 2 ? 'rgba(192,192,192,0.1)' : 'rgba(205,127,50,0.1)'}, transparent 70%)`,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                <Stack direction="row" alignItems="center" spacing={2}>
                    {/* Position Badge */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: positionStyle.bg,
                            color: positionStyle.color,
                            fontWeight: 'bold',
                            fontSize: player.position <= 3 ? '1rem' : '0.9rem',
                            flexShrink: 0
                        }}
                    >
                        {getPositionIcon(player.position)}
                    </Box>

                    {/* Avatar */}
                    <Box sx={{ position: 'relative' }}>
                        <AvatarCompact 
                            seed={player.avatar} 
                            size={45}
                            sx={{
                                border: player.isCurrentUser ? '2px solid #2196F3' : '2px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        />
                        
                        {/* Streak indicator */}
                        {player.streak && player.streak > 1 && (
                            <Chip
                                icon={<Zap size={12} />}
                                label={player.streak}
                                size="small"
                                color="warning"
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    height: 20,
                                    fontSize: '0.7rem',
                                    '& .MuiChip-icon': { fontSize: '0.7rem' }
                                }}
                            />
                        )}
                    </Box>

                    {/* Player Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                                variant="subtitle1" 
                                fontWeight="600"
                                noWrap
                                sx={{ 
                                    color: player.isCurrentUser ? 'primary.main' : 'text.primary',
                                    textShadow: player.isCurrentUser ? '0 1px 2px rgba(33,150,243,0.2)' : 'none'
                                }}
                            >
                                {player.name}
                                {player.isCurrentUser && " (Anda)"}
                            </Typography>
                            
                            {/* Progress indicator */}
                            {player.progress !== undefined && player.progress > 0 && (
                                <Chip
                                    icon={<TrendingUp size={12} />}
                                    label={`+${player.progress}%`}
                                    size="small"
                                    color="success"
                                    sx={{ 
                                        height: 20,
                                        fontSize: '0.7rem',
                                        '& .MuiChip-icon': { fontSize: '0.7rem' }
                                    }}
                                />
                            )}
                        </Stack>

                        {/* Progress Bar */}
                        {showProgress && player.progress !== undefined && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={player.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            background: 'linear-gradient(90deg, #4CAF50, #8BC34A)'
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Score */}
                    <Box textAlign="right">
                        <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{
                                background: player.position <= 3 
                                    ? 'linear-gradient(135deg, #FF6B6B, #4ECDC4)'
                                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {player.score}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Poin
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </MotionBox>
    );
}