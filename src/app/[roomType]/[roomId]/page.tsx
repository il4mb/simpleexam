'use client'

import { MotionPaper, MotionBox } from '@/components/motion';
import Participants from '@/components/rooms/Participants';
import QuizRoom from '@/components/rooms/QuizRoom';
import { useRoomManager } from '@/contexts/RoomManager';
import { useRoom } from '@/contexts/RoomProvider';
import { People, RocketLaunch, ContentCopy, Share } from '@mui/icons-material';
import { Box, Button, Chip, Container, Grid, Stack, Typography, IconButton, alpha } from '@mui/material';
import { Timer, Crown } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import QuizPlay from '@/components/rooms/QuizPlay';

export default function ModernQuizRoom() {

    const theme = useTheme();
    const { room, isHost } = useRoom();
    const { participantCount } = useRoomManager();

    const copyRoomCode = () => {
        navigator.clipboard.writeText(room.id);
        enqueueSnackbar("Kode room berhasil dicopy", { variant: "success" });
    };

    const shareRoom = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${room.name}`,
                    text: `Come play ${room.name} with me!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            copyRoomCode();
        }
    };

    return (
        <Container maxWidth="xl">
            <MotionPaper
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                    {/* Room Info */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            {isHost && (
                                <Crown
                                    size={20}
                                    color={theme.palette.warning.main}
                                    style={{ marginRight: 8 }}
                                />
                            )}
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                gutterBottom
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                {room.name}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                            <Chip
                                icon={<People sx={{ fontSize: 18 }} />}
                                label={`${participantCount} / ${room.maxPlayers} players`}
                                color="primary"
                                variant="filled"
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                            <Chip
                                icon={<Timer size={16} />}
                                label={room.status.toUpperCase()}
                                color={
                                    room.status === 'waiting' ? 'warning' :
                                        room.status === 'playing' ? 'success' : 'error'
                                }
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    ROOM CODE:
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary">
                                    {room.id}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={copyRoomCode}
                                    sx={{
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        }
                                    }}
                                >
                                    <ContentCopy fontSize="small" />
                                </IconButton>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Host Actions */}
                    {isHost && (
                        <MotionBox
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <IconButton
                                    onClick={shareRoom}
                                    sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                        },
                                        borderRadius: 3,
                                        p: 1.5,
                                    }}>
                                    <Share
                                        // @ts-ignore
                                        color={theme.palette.primary.main} />
                                </IconButton>

                                {room.status === 'waiting' && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<RocketLaunch />}
                                        sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                                            '&:hover': {
                                                boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        Launch Quiz
                                    </Button>
                                )}
                            </Stack>
                        </MotionBox>
                    )}
                </Stack>
            </MotionPaper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <MotionBox
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}>
                        {room.type === "quiz" && <QuizRoom />}
                    </MotionBox>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <MotionBox
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        sx={{
                            position: 'sticky',
                            top: 24,
                        }}>
                        <Participants />
                    </MotionBox>
                </Grid>
            </Grid>
        </Container>
    );
}