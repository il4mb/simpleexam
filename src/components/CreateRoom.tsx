import { useState } from 'react';
import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Chip,
    Stepper,
    Step,
    StepLabel,
    Paper,
    IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Close,
    Groups,
    Quiz,
    PlayArrow,
    EmojiEvents
} from '@mui/icons-material';
import { MotionButton } from './motion';
import { nanoid } from 'nanoid';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/libs/firebase';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { RoomData } from '@/types';
import { MotionDialog } from './motion';
import { useCurrentUser } from '@/contexts/SessionProvider';
import { mainPersistence } from '@/libs/yjs';


type FormRoom = Omit<RoomData, 'id' | 'createdAt' | 'createdBy'>
const DEFAULT_FORM: FormRoom = {
    name: '',
    type: 'quiz',
    status: 'waiting',
    currentPlayers: 0,
    maxPlayers: 5,
    enableLeaderboard: true
}

const steps = ['Room Settings', 'Review'];

export default function CreateRoom() {

    const user = useCurrentUser();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [roomData, setRoomData] = useState<FormRoom>(DEFAULT_FORM);

    const handleOpen = () => {
        if (!user?.id) {
            return enqueueSnackbar("Sessi tidak ditemukan!", { variant: "error" });
        }
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
        setActiveStep(0);
        setRoomData(DEFAULT_FORM);
    };

    const handleNext = () => {
        if (activeStep === 0 && !roomData.name.trim()) return;
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleCreateRoom = async () => {
        if (!user?.id) {
            return enqueueSnackbar("Sessi tidak ditemukan!", { variant: "error" });
        }
        try {

            const finalRoomData: RoomData = {
                ...roomData,
                id: nanoid(6),
                createdBy: user.id,
                createdAt: new Date(),
                status: 'waiting' as const,
                currentPlayers: 0
            }

            const roomsCollection = collection(firestore, "rooms");
            await setDoc(doc(roomsCollection, finalRoomData.id), finalRoomData);
            mainPersistence.set("room", finalRoomData as any);

            enqueueSnackbar("Room created successfully!", { variant: "success" });

            router.push(`/quiz/${finalRoomData.id}`);
            handleClose();
        } catch (error: any) {
            console.error("Room creation error:", error);
            enqueueSnackbar(error.message || "Failed to create room", { variant: "error" });
        }
    };

    const updateRoomData = (field: string, value: any) => {
        setRoomData(prev => ({ ...prev, [field]: value }));
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" gutterBottom>
                            Buat Ruang Quiz
                        </Typography>

                        <TextField
                            label="Nama Ruang"
                            value={roomData.name}
                            onChange={(e) => updateRoomData('name', e.target.value)}
                            placeholder="Masukkan nama ruang quiz..."
                            fullWidth
                            helperText={`${roomData.name.length}/50 karakter`}
                        />

                        {/* <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Jumlah Peserta</InputLabel>
                                <Select
                                    value={roomData.maxPlayers}
                                    label="Jumlah Peserta"
                                    onChange={(e) => updateRoomData('maxPlayers', e.target.value)}>
                                    {[5, 10, 20, 30, 40, 50].map(num => (
                                        <MenuItem key={num} value={num}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Groups />
                                                <span>{num} Peserta</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack> */}

                        <Stack spacing={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={roomData.enableLeaderboard}
                                        onChange={(e) => updateRoomData('enableLeaderboard', e.target.checked)}
                                    />
                                }
                                label="Aktifkan Leaderboard"
                            />
                        </Stack>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" gutterBottom>
                            Review Pengaturan
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Jenis</Typography>
                                    <Chip
                                        icon={<Quiz />}
                                        label="Quiz Room"
                                        color="primary"
                                        size="small"
                                    />
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Nama Ruang</Typography>
                                    <Typography variant="body2" fontWeight="500">{roomData.name}</Typography>
                                </Stack>

                                {/* <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Maksimum Peserta</Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        <Groups sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                        {roomData.maxPlayers}
                                    </Typography>
                                </Stack> */}

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Leaderboard</Typography>
                                    {roomData.enableLeaderboard ? (
                                        <Chip
                                            icon={<EmojiEvents />}
                                            label="Aktif"
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Chip
                                            label="Nonaktif"
                                            color="default"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <MotionButton
                onClick={handleOpen}
                variant="contained"
                size="large"
                fullWidth
                sx={{
                    py: { xs: 2, md: 3 },
                    borderRadius: 3,
                    fontSize: { xs: '3.5vw', md: '1.3rem' },
                    fontWeight: 'bold',
                    textTransform: 'none',
                }}
                whileHover={{
                    scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}>
                <PlayArrow sx={{ mr: 2, fontSize: 30, display: { xs: 'none', sm: "block" } }} />
                Buat Ruang Quiz Baru 🚀
            </MotionButton>

            <MotionDialog
                open={open}
                onClose={handleClose}
                maxWidth={"sm"}
                fullWidth
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" fontWeight="bold">
                            Buat Ruang Quiz
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <Close />
                        </IconButton>
                    </Stack>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}>
                                {renderStepContent(activeStep)}
                            </motion.div>
                        </AnimatePresence>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0}>
                        Kembali
                    </Button>

                    <Box sx={{ flex: 1 }} />

                    <Button onClick={handleClose}>
                        Batal
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleCreateRoom}
                            disabled={!roomData.name.trim()}
                            sx={{
                                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)'
                            }}>
                            Buat Ruang
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!roomData.name.trim()}>
                            Berikutnya
                        </Button>
                    )}
                </DialogActions>
            </MotionDialog>
        </>
    );
}