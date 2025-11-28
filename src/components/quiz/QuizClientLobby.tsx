import { Stack, Typography, Box, CircularProgress, Button, useTheme } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import FloatingCamera from '../FloatingCamera';
import { useQuiz } from '@/hooks/useQuiz';
import { useEffect, useMemo, useState } from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import AvatarCompact from '../avatars/AvatarCompact';
import { getColor } from '@/theme/colors';
import { useRoomManager } from '@/contexts/RoomManager';
import { MotionBox } from '../motion';
import ReadyParticipants from './ReadyParticipants';

export interface QuizLobbyProps {

}

export default function QuizClientLobby({ }: QuizLobbyProps) {

    const theme = useTheme();
    const { room } = useRoomManager();
    const { activeParticipants } = useParticipants();
    const { imReady, readyUids } = useQuiz();
    const filteredParticipants = useMemo(() => activeParticipants.filter(u => u.id != room.createdBy && readyUids.includes(u.id)), [room, readyUids, activeParticipants]);

    const [isLoading, setIsLoading] = useState(true);
    const [showReadyButton, setShowReadyButton] = useState(false);

    const handleReady = () => {
        setShowReadyButton(false);
        setTimeout(() => imReady(), 250);
    }

    // Simulate loading and show ready button after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            setShowReadyButton(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const pulseVariants: Variants = {
        pulse: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const floatingVariants: Variants = {
        float: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <Stack flex={1} justifyContent={"center"} alignItems={"center"} sx={{ minHeight: '100dvh', p: 3 }}>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.5 }}>
                            <Stack justifyContent={"center"} alignItems={"center"} spacing={3}>
                                <motion.div
                                    variants={pulseVariants}
                                    animate="pulse">
                                    <CircularProgress
                                        size={60}
                                        thickness={4}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            filter: `drop-shadow(0 0 8px ${theme.palette.primary.main}40)`
                                        }}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h5"
                                        align="center"
                                        sx={{
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                            fontWeight: 'bold'
                                        }}>
                                        Memulai Quiz...
                                    </Typography>
                                </motion.div>

                                <motion.div
                                    variants={floatingVariants}
                                    animate="float">
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        align="center">
                                        Mempersiapkan lingkungan kuis
                                    </Typography>
                                </motion.div>
                            </Stack>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, type: "spring" }}>
                            <Stack spacing={4} alignItems="center" sx={{ width: '100%', maxWidth: 600 }}>

                                {/* Header */}
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h3"
                                        align="center"
                                        gutterBottom>
                                        Siap Mulai?
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        align="center"
                                        color="text.secondary">
                                        Pastikan kamera sudah aktif untuk memulai kuis
                                    </Typography>
                                </motion.div>

                                <ReadyParticipants />

                                {/* Ready Button */}
                                <AnimatePresence>
                                    {showReadyButton && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            transition={{ delay: 0.5 }}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={handleReady}
                                                    startIcon={<CheckCircle />}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        fontSize: '1.1rem',
                                                        borderRadius: 3,

                                                    }}>
                                                    Saya Sudah Siap!
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Stack>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Camera */}
                <FloatingCamera onReady={handleReady} />
            </Stack>
        </motion.div>
    );
}