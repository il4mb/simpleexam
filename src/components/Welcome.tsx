import { useState, useCallback } from 'react';
import { Container, Paper, Stack, TextField, Typography, Button } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { ArrowForward } from '@mui/icons-material';
import AvatarEditorCompact from './avatars/AvatarEditorCompact';
import { mainPersistence } from '@/libs/yjs';
import { enqueueSnackbar } from 'notistack';
import { nanoid } from 'nanoid';
import { MotionPaper } from './motion';

export default function Welcome({ onComplete }: { onComplete?: () => void }) {

    const [avatar, setAvatar] = useState<string>();
    const [name, setName] = useState<string>('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Nama tidak boleh kosong');
            return false;
        }
        if (name.trim().length < 2) {
            setError('Nama minimal 2 karakter');
            return false;
        }
        if (name.trim().length > 20) {
            setError('Nama maksimal 20 karakter');
            return false;
        }

        setIsSubmitting(true);
        try {
            if (!avatar?.trim()) {
                throw new Error("Avatar seed is required!");
            }
            await mainPersistence.set("user", {
                id: nanoid(18),
                name: name.trim(),
                avatar: avatar.trim()
            } as any);
            setError('');
            onComplete?.();

        } catch (err: any) {
            console.warn('Failed to save name to localStorage:', err);
            enqueueSnackbar(err.message || "Caught an Error", { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    }, [avatar, name, onComplete]);


    return (
        <AnimatePresence>
            <Stack
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: "100%",
                    backdropFilter: "blur(10px)",
                    zIndex: 9999,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                <Container maxWidth="sm">
                    <MotionPaper
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 4,
                            background: 'rgba(51, 51, 51, .75)',
                            backdropFilter: 'blur(25px)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                            position: 'relative'
                        }}>

                        <Stack spacing={4}>
                            {/* Header */}
                            <Stack spacing={1} textAlign="center" alignItems="center">
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    fontWeight="bold"
                                    sx={{
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent'
                                    }}>
                                    Selamat Datang! 🎉
                                </Typography>

                                <Typography variant="h6" color="text.secondary" textAlign="center" fontSize={16}>
                                    Selamat datang di Squizy.id! Sepertinya kamu anak baru nih!
                                </Typography>
                                <Typography variant="body1" textAlign="center" color="text.primary">
                                    Untuk lanjut, buat nama kamu dulu ya!
                                </Typography>
                            </Stack>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <AvatarEditorCompact
                                        seed={avatar}
                                        onChange={setAvatar} />
                                    <TextField
                                        label="Nama Kamu"
                                        value={name || ''}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Masukkan nama panggilan kamu..."
                                        error={!!error}
                                        helperText={error}
                                        fullWidth
                                        autoFocus
                                        aria-required="true"
                                        aria-describedby={error ? "name-error" : undefined}
                                        disabled={isSubmitting}
                                    />

                                    {/* Action Button */}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForward />}
                                        disabled={!name.trim()}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #44A08D, #4ECDC4)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}>
                                        Mulai Petualangan!
                                    </Button>
                                </Stack>
                            </form>

                            {/* Fun Facts */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(102, 126, 234, 0.05)'
                                }}>
                                <Typography variant="caption" color="text.secondary" textAlign="center">
                                    💡 <strong>Fun Fact:</strong> Kamu bisa ganti nama kapan saja melalui pengaturan!
                                </Typography>
                            </Paper>
                        </Stack>
                    </MotionPaper>
                </Container>
            </Stack>
        </AnimatePresence>
    );
}