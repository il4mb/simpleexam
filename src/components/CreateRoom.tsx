import { useState } from 'react';
import {
    Button,
    Dialog,
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
    Lock,
    Public,
    Timer,
    EmojiEvents,
    Palette,
    Quiz,
    PlayArrow
} from '@mui/icons-material';
import { MotionButton } from './motion';
import { nanoid } from 'nanoid';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/libs/firebase';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { RoomData, RoomType } from '@/types';
import { MotionPaper, MotionDialog } from './motion';
import { useCurrentUser } from '@/contexts/SessionProvider';
import { mainPersistence, ydoc } from '@/libs/yjs';


type FormRoom = Omit<RoomData, 'id' | 'createdAt' | 'createdBy'>
const DEFAULT_FORM: FormRoom = {
    name: '',
    type: 'quiz',
    status: 'waiting',
    currentPlayers: 0,
    maxPlayers: 5,
    enableLeaderboard: true
}

const roomTypes = [
    {
        type: "drawing" as RoomType,
        name: "Ruang Menggambar",
        icon: <Palette />,
        description: "Permainan menggambar dan menebak secara kolaboratif",
        color: "#FF6B6B"
    },
    {
        type: "quiz" as RoomType,
        name: "Ruang Kuis",
        icon: <Quiz />,
        description: "Tantangan trivia dan pengetahuan yang interaktif",
        color: "#4ECDC4"
    }
];


const steps = ['Room Type', 'Settings', 'Review'];

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
        if (activeStep === 0 && !roomData.type) return;
        if (activeStep === 1 && !roomData.name.trim()) return;

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

            // Fixed Firestore reference
            const roomsCollection = collection(firestore, "rooms");
            await setDoc(doc(roomsCollection, finalRoomData.id), finalRoomData);
            mainPersistence.set("room", finalRoomData as any);
            const docs = ydoc.get("room");
        

            enqueueSnackbar("Room created successfully!", { variant: "success" });

            // FIXED: Use the correct type field
            router.push(`/${finalRoomData.id}`);
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
                            Pilih Jenis Ruang
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            {roomTypes.map((roomType) => (
                                <MotionPaper
                                    key={roomType.type}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    sx={{
                                        flex: 1,
                                        p: 3,
                                        cursor: 'pointer',
                                        border: roomData.type === roomType.type ?
                                            `2px solid ${roomType.color}` :
                                            '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        textAlign: 'center',
                                        background: roomData.type === roomType.type ?
                                            `${roomType.color}10` : 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => updateRoomData('type', roomType.type)}>
                                    <Box sx={{ color: roomType.color, mb: 2 }}>
                                        {roomType.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {roomType.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {roomType.description}
                                    </Typography>
                                </MotionPaper>
                            ))}
                        </Stack>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" gutterBottom>
                            Pengaturan Ruang
                        </Typography>

                        <TextField
                            label="Nama Ruang"
                            value={roomData.name}
                            onChange={(e) => updateRoomData('name', e.target.value)}
                            placeholder="Enter a creative Nama Ruang..."
                            fullWidth
                        />

                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Max Players</InputLabel>
                                <Select
                                    value={roomData.maxPlayers}
                                    label="Max Players"
                                    onChange={(e) => updateRoomData('maxPlayers', e.target.value)}>
                                    {[5, 10, 20, 30, 40, 50].map(num => (
                                        <MenuItem key={num} value={num}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Groups />
                                                <span>{num} Players</span>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack spacing={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={roomData.enableLeaderboard}
                                        onChange={(e) => updateRoomData('enableLeaderboard', e.target.checked)}
                                    />
                                }
                                label="Enable Leaderboard"
                            />
                        </Stack>
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" gutterBottom>
                            Review Penganturan
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Room Type</Typography>
                                    <Chip
                                        label={roomData.type === 'drawing' ? 'Drawing Room' : 'Quiz Room'}
                                        color="primary"
                                        size="small"
                                    />
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Nama Ruang</Typography>
                                    <Typography variant="body2" fontWeight="500">{roomData.name}</Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Max Players</Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        <Groups sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                        {roomData.maxPlayers}
                                    </Typography>
                                </Stack>

                                {roomData.enableLeaderboard && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Leaderboard</Typography>
                                        <EmojiEvents sx={{ color: 'gold', fontSize: 20 }} />
                                    </Stack>
                                )}
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
                    py: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #FF6B6B, #FFD166)',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 10px 30px rgba(255,107,107,0.4)'
                }}
                whileHover={{
                    scale: 1.05,
                    boxShadow: '0 15px 40px rgba(255,107,107,0.6)',
                    background: 'linear-gradient(45deg, #FFD166, #FF6B6B)'
                }}
                whileTap={{ scale: 0.95 }}>
                <PlayArrow sx={{ mr: 2, fontSize: 30 }} />
                Luncurkan Quizy Baru 🚀
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
                            Buat Ruang
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
                            Create Room
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={
                                (activeStep === 0 && !roomData.type) ||
                                (activeStep === 1 && !roomData.name.trim())
                            }>
                            Berikutnya
                        </Button>
                    )}
                </DialogActions>
            </MotionDialog>
        </>
    );
}