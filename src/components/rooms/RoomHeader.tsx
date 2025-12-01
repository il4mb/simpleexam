'use client'

import { MotionPaper, MotionBox, MotionChip } from '@/components/motion';
import { useRoomManager } from '@/contexts/RoomManager';
import { RocketLaunch, Pause, PlayArrow, Stop, ContentCopy, LeaderboardRounded, VideoCameraFront } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography, IconButton, alpha, Container, CircularProgress } from '@mui/material';
import { Crown } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useCallback } from 'react';
import { enqueueSnackbar } from 'notistack';
import RoomSettingButton from './RoomSettingButton';
import Tooltip from '../Tooltip';
import RoomQRButton from './RoomQRButton';
import { AnimatePresence } from 'framer-motion';
import { useParticipants } from '@/hooks/useParticipants';

export interface QuizHeaderProps {

}
export default function RoomHeader({ }: QuizHeaderProps) {

    const theme = useTheme();
    const { activeParticipants } = useParticipants();
    const { room, isHost, updateRoom } = useRoomManager();
    const totalActiveParticipants = activeParticipants.length;

    const copyRoomCode = () => {
        navigator.clipboard.writeText(room.id);
        enqueueSnackbar("Kode room berhasil disalin", { variant: "success" });
    };

    const shareRoom = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Gabung ${room.name}`,
                    text: `Ayo main ${room.name} bersama saya!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            copyRoomCode();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting': return 'warning';
            case 'playing': return 'success';
            case 'paused': return 'secondary';
            case 'ended': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'waiting': return 'MENUNGGU';
            case 'playing': return 'BERLANGSUNG';
            case 'paused': return 'DIJEDA';
            case 'ended': return 'SELESAI';
            default: return status?.toUpperCase();
        }
    };

    const handleStartQuiz = useCallback(() => {
        updateRoom("status", "prepared");
        enqueueSnackbar("Memulai kuis...!", { variant: "success" });
    }, [room.status]);

    const handlePauseQuiz = useCallback(() => {
        if (room.status == "prepared") {
            enqueueSnackbar("Tidak dapat menjeda quiz.", { variant: "warning" });
            return;
        }
        updateRoom("status", "paused");
        enqueueSnackbar("Kuis dijeda", { variant: "info" });
    }, [room.status]);

    const handleResumeQuiz = useCallback(() => {
        if (room.status == "prepared") {
            enqueueSnackbar("Tidak dapat menjeda quiz.", { variant: "warning" });
            return;
        }
        updateRoom("status", "playing");
        enqueueSnackbar("Kuis dilanjutkan", { variant: "success" });
    }, [room.status]);

    const handleEndQuiz = useCallback(() => {
        updateRoom("status", "ended");
        enqueueSnackbar("Kuis diakhiri", { variant: "info" });
    }, [room.status]);

    const getMainActionButton = () => {
        switch (room.status) {
            case 'waiting':
                return (
                    <Tooltip title={totalActiveParticipants >= 4 ? "Mulai Quiz" : "Untuk memulai setidaknya ada 4 peserta"}>
                        <Button
                            onClick={handleStartQuiz}
                            variant="contained"
                            size="large"
                            startIcon={<RocketLaunch />}
                            disabled={totalActiveParticipants < 4}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 25px rgba(76, 175, 80, 0.5)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}>
                            {totalActiveParticipants < 4 ? "Kurang " + (4 - totalActiveParticipants) + " peserta lagi" : "Mulai Ulang Kuis"}
                        </Button>
                    </Tooltip>
                );

            case 'playing':
                return (
                    <Button
                        onClick={handlePauseQuiz}
                        variant="contained"
                        size="large"
                        startIcon={<Pause />}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 25px rgba(255, 152, 0, 0.5)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}>
                        Jeda Kuis
                    </Button>
                );

            case 'paused':
                return (
                    <Button
                        onClick={handleResumeQuiz}
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 25px rgba(76, 175, 80, 0.5)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}>
                        Lanjutkan Kuis
                    </Button>
                );

            case 'ended':
                return (
                    <Tooltip title={totalActiveParticipants >= 4 ? "Mulai Quiz" : "Untuk memulai setidaknya ada 4 peserta"}>
                        <Button
                            onClick={handleStartQuiz}
                            variant="contained"
                            size="large"
                            startIcon={<RocketLaunch />}
                            disabled={totalActiveParticipants < 4}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 25px rgba(33, 150, 243, 0.5)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}>
                            {totalActiveParticipants < 4 ? "Kurang " + (4 - totalActiveParticipants) + " peserta lagi" : "Mulai Ulang Kuis"}
                        </Button>
                    </Tooltip>
                );
            case "prepared":
                return (
                    <Button
                        variant="outlined"
                        color='secondary'
                        size="large"
                        disabled
                        startIcon={<CircularProgress size={20} />}>
                        Mempersiapkan...
                    </Button>
                );

            default:
                return null;
        }
    };

    const getSecondaryActionButton = () => {
        if (room.status === 'playing' || room.status === 'paused' || room.status === 'prepared') {
            return (
                <Button
                    onClick={handleEndQuiz}
                    variant="outlined"
                    size="large"
                    startIcon={<Stop />}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            borderColor: theme.palette.error.dark,
                        },
                    }}>
                    Akhiri Kuis
                </Button>
            );
        }
        return null;
    };

    return (
        <Box sx={{ position: "sticky", top: 1, zIndex: 180 }}>
            <MotionPaper
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}>
                <Container maxWidth={"lg"}>
                    <Stack spacing={3} p={3}>
                        {/* Main Header Row */}
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                            <Stack spacing={2} flex={1}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ position: "relative" }}>
                                    {isHost && (
                                        <Chip
                                            icon={<Crown size={16} />}
                                            label="Host"
                                            color="warning"
                                            variant="filled"
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                bottom: "90%"
                                            }}
                                        />
                                    )}
                                    <Stack justifyContent={"start"} alignItems={"start"} gap={0.5}>
                                        <Typography variant="h4" fontWeight="bold">
                                            {room.name}
                                        </Typography>
                                        {["playing", "paused", "prepared"].includes(room.status) && (
                                            <Chip
                                                label={getStatusText(room.status)}
                                                color={getStatusColor(room.status)}
                                                variant="filled"
                                                sx={{ fontWeight: 600, minWidth: 120, position: "absolute", top: 0, right: 0 }}
                                            />
                                        )}

                                        <Stack direction={"row"} gap={1}>
                                            <AnimatePresence mode={"sync"}>
                                                {room.enableLeaderboard && (
                                                    <MotionChip
                                                        key={"leaderboard-feture"}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        label={
                                                            <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                                                <LeaderboardRounded />
                                                                <Typography
                                                                    component={"span"}
                                                                    sx={{
                                                                        verticalAlign: 'baseline',
                                                                        fontSize: 10,
                                                                        display: {
                                                                            xs: 'none',
                                                                            sm: 'inline-block'
                                                                        }
                                                                    }}>
                                                                    Leaderboard
                                                                </Typography>
                                                            </Stack>
                                                        } />
                                                )}
                                                {room.enableAiExpression && (
                                                    <MotionChip
                                                        key={"video-feture"}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        label={
                                                            <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                                                                <VideoCameraFront />
                                                                <Typography
                                                                    component={"span"}
                                                                    sx={{
                                                                        verticalAlign: 'baseline',
                                                                        fontSize: 10,
                                                                        display: {
                                                                            xs: 'none',
                                                                            sm: 'inline-block'
                                                                        }
                                                                    }}>
                                                                    Facecam
                                                                </Typography>
                                                            </Stack>
                                                        } />
                                                )}
                                            </AnimatePresence>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>

                            {/* Host Actions */}
                            {isHost && (
                                <MotionBox
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        <RoomQRButton />
                                        <Tooltip title={"Salin Kode Ruangan"}>
                                            <IconButton
                                                onClick={shareRoom}
                                                sx={{
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                                                    borderRadius: 2,
                                                }}>
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <RoomSettingButton />

                                        <Stack direction="row" spacing={1}>
                                            {getSecondaryActionButton()}
                                            {getMainActionButton()}
                                        </Stack>
                                    </Stack>
                                </MotionBox>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </MotionPaper>
        </Box>
    );
}   