import { Button, Stack, Typography, Box, Paper, Alert, Chip, Container } from '@mui/material';
import { PlayArrow, Warning, CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/hooks/useQuiz';
import { useParticipants } from '@/hooks/useParticipants';
import ReadyParticipants from './ReadyParticipants';
import { useState, useEffect } from 'react';
import { useRoomManager } from '@/contexts/RoomManager';

export default function QuizHostPrepared() {

    const { room } = useRoomManager();
    const { readyUids, startQuiz } = useQuiz();
    const { activeParticipants } = useParticipants();
    const [showContinueWarning, setShowContinueWarning] = useState(false);

    const participantParticipants = activeParticipants.filter(p => p.id != room.createdBy);
    const totalParticipants = participantParticipants.length;
    const readyCount = readyUids.length;
    const notReadyCount = totalParticipants - readyCount;
    const hasReadyParticipants = readyCount > 0;
    const allParticipantsReady = readyCount === totalParticipants && totalParticipants > 0;

    useEffect(() => {
        if (showContinueWarning) {
            const timer = setTimeout(() => {
                setShowContinueWarning(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showContinueWarning]);

    const handleContinue = () => {
        if (notReadyCount > 0) {
            setShowContinueWarning(true);
        }
        startQuiz();
    };

    const handleContinueAnyway = () => {
        startQuiz();
    };

    return (
        <Stack>
            <Stack py={5}>
                <ReadyParticipants />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <motion.div
                        whileHover={{ scale: hasReadyParticipants ? 1.05 : 1 }}
                        whileTap={{ scale: hasReadyParticipants ? 0.95 : 1 }}>
                        <Stack spacing={2} alignItems="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleContinue}
                                disabled={!hasReadyParticipants}
                                startIcon={<PlayArrow />}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    minWidth: 200,
                                    boxShadow: hasReadyParticipants ? 4 : 1,
                                    opacity: hasReadyParticipants ? 1 : 0.6,
                                    transition: 'all 0.3s ease'
                                }}>
                                {allParticipantsReady ? 'Mulai Kuis' : 'Lanjutkan'}
                            </Button>

                            {/* Button Status Text */}
                            <AnimatePresence>
                                {!hasReadyParticipants && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Tunggu setidaknya 1 peserta siap
                                        </Typography>
                                    </motion.div>
                                )}

                                {hasReadyParticipants && notReadyCount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}>
                                        <Chip
                                            icon={<Warning />}
                                            label={`${notReadyCount} peserta belum siap`}
                                            color="warning"
                                            variant="outlined"
                                        />
                                    </motion.div>
                                )}

                                {allParticipantsReady && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}>
                                        <Chip
                                            icon={<CheckCircle />}
                                            label="Semua peserta siap!"
                                            color="success"
                                            variant="filled"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Stack>
                    </motion.div>
                </Box>
                <AnimatePresence>
                    {showContinueWarning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}>
                            <Alert
                                severity="warning"
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleContinueAnyway}
                                        endIcon={<PlayArrow />}>
                                        Lanjutkan
                                    </Button>
                                }
                                sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight="bold">
                                    {notReadyCount} peserta belum siap
                                </Typography>
                                <Typography variant="body2">
                                    Anda dapat melanjutkan tanpa menunggu semua peserta,
                                    atau tunggu hingga mereka siap.
                                </Typography>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Stack>
            <Container>
                <Paper sx={{ p: 3, mt: 2, }}>
                    <Typography variant="h6" gutterBottom color="text.primary">
                        Instruksi Host:
                    </Typography>
                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            • Pastikan semua peserta telah bergabung ke ruang
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Peserta harus menekan tombol "Siap" sebelum kuis dimulai
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Anda dapat melanjutkan kuis meskipun tidak semua peserta siap
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Peserta yang belum siap dapat bergabung nanti
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Stack>
    );
}