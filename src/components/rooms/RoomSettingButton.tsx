import { Settings } from '@mui/icons-material';
import {
    alpha,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import Checkbox from '../Checkbox';
import { useRoomManager } from '@/contexts/RoomManager';
import { ChangeEvent, useState } from 'react';
import Tooltip from '../Tooltip';
import { MotionBox, MotionButton } from '../motion';
import { Settings2, Trash2, AlertTriangle } from 'lucide-react';
import { useAnswers } from '@/hooks/useAnswers';
import { deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '@/libs/firebase';
import { getColor } from '@/theme/colors';

type ConfirmDialog = {
    open: boolean;
    type: 'clean' | 'close' | null;
    title: string;
    message: string;
    action: () => void;
}

export default function RoomSettingButton() {

    const theme = useTheme();
    const { room, updateRoom } = useRoomManager();
    const { clearAnswers, answers } = useAnswers();
    const [open, setOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
        open: false,
        type: null,
        title: '',
        message: '',
        action: () => { }
    });

    const toggleOpen = () => setOpen(prev => !prev);

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        if (newName.length > 24) return;
        updateRoom("name", newName);
    };

    // Open confirmation dialog for cleaning results
    const openCleanResultsDialog = () => {
        setConfirmDialog({
            open: true,
            type: 'clean',
            title: 'Bersihkan Hasil Quiz',
            message: 'Apakah Anda yakin ingin menghapus semua jawaban peserta? Tindakan ini tidak dapat dibatalkan dan semua data hasil quiz akan dihapus permanen.',
            action: () => {
                clearAnswers();
                setConfirmDialog(prev => ({ ...prev, open: false }));
                toggleOpen(); // Close settings dialog
            }
        });
    };

    // Open confirmation dialog for closing room
    const openCloseRoomDialog = () => {
        setConfirmDialog({
            open: true,
            type: 'close',
            title: 'Tutup Ruangan Quiz',
            message: 'Apakah Anda yakin ingin menutup ruangan ini? Semua peserta akan dikeluarkan dan ruangan tidak dapat diakses lagi. Tindakan ini tidak dapat dibatalkan.',
            action: () => {
                deleteDoc(doc(firestore, `/rooms/${room.id}`));
                setConfirmDialog(prev => ({ ...prev, open: false }));
                toggleOpen(); // Close settings dialog
            }
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            type: null,
            title: '',
            message: '',
            action: () => { }
        });
    };

    return (
        <>
            <Tooltip title={"Pengaturan Ruangan"}>
                <IconButton
                    sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                        borderRadius: 2,
                    }}
                    onClick={toggleOpen}>
                    <Settings fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* Main Settings Dialog */}
            <Dialog maxWidth={"sm"} fullWidth open={open} onClose={toggleOpen}>
                <DialogTitle component={"div"}>
                    <Stack direction={'row'} alignItems={"center"} spacing={2}>
                        <Settings2 />
                        <Typography fontWeight={800} fontSize={20}>
                            PENGATURAN
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack gap={1} mt={1}>
                        <MotionBox>
                            <TextField
                                onChange={handleChangeName}
                                label={"Nama Ruang"}
                                value={room.name}
                                fullWidth />
                            <Typography fontSize={10} color='text.secondary'>
                                {room.name.length} / 24
                            </Typography>
                        </MotionBox>
                        <Divider />
                        <MotionBox>
                            <Typography fontWeight={600}>
                                Papan Peringkat
                            </Typography>
                            <Checkbox
                                checked={room.enableLeaderboard}
                                onChange={(checked) => updateRoom("enableLeaderboard", checked)}
                                label={(room.enableLeaderboard ? "Sembunyikan" : "Tampilkan") + ' papan peringkat pada peserta'} />
                        </MotionBox>
                        <Divider />
                        <MotionBox>
                            <Typography fontWeight={600}>
                                Ekspresi AI
                            </Typography>
                            <Checkbox
                                checked={room.enableAiExpression}
                                onChange={(checked) => updateRoom("enableAiExpression", checked)}
                                label={(room.enableAiExpression ? "Matikan" : "Aktifkan") + ' fitur Ai pendeteksi ekpresi'} />
                        </MotionBox>
                        <Divider />

                        <MotionBox>
                            <Typography fontWeight={600} mb={2}>
                                Pengaturan Lanjutan
                            </Typography>
                            <Stack spacing={1}>
                                <Stack sx={{
                                    bgcolor: "action.hover",
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: getColor("warning")[400],
                                }}
                                    direction={"row"}
                                    alignItems={"center"}
                                    justifyContent={"space-between"}>
                                    <Box>
                                        <Typography fontWeight={500}>
                                            Bersihkan Hasil Quiz
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Hapus semua jawaban peserta
                                        </Typography>
                                    </Box>
                                    <MotionButton
                                        variant={"contained"}
                                        color={'warning'}
                                        startIcon={<Trash2 size={16} />}
                                        onClick={openCleanResultsDialog}
                                        disabled={answers.length <= 0}
                                        sx={{ borderRadius: 2 }}>
                                        Bersihkan
                                    </MotionButton>
                                </Stack>
                                <Stack sx={{
                                    bgcolor: alpha(getColor("error")[400], 0.1),
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: getColor("error")[400],
                                    color: 'error.contrastText'
                                }}
                                    direction={"row"}
                                    alignItems={"center"}
                                    justifyContent={"space-between"}>
                                    <Box>
                                        <Typography fontWeight={500}>
                                            Hapus atau Tutup Ruang
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Hapus ruangan permanen
                                        </Typography>
                                    </Box>
                                    <MotionButton
                                        variant={"contained"}
                                        color={'error'}
                                        startIcon={<AlertTriangle size={16} />}
                                        onClick={openCloseRoomDialog}
                                        sx={{
                                            borderRadius: 2,
                                            bgcolor: 'error.main',
                                            '&:hover': { bgcolor: 'error.dark' }
                                        }}>
                                        Akhiri Ruang
                                    </MotionButton>
                                </Stack>
                            </Stack>
                        </MotionBox>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleOpen}>
                        Selesai
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                maxWidth="xs"
                fullWidth>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: confirmDialog.type === 'close' ? 'error.light' : 'warning.light',
                            color: confirmDialog.type === 'close' ? 'error.main' : 'warning.main'
                        }}>
                            {confirmDialog.type === 'close' ?
                                <AlertTriangle size={24} /> :
                                <Trash2 size={24} />
                            }
                        </Box>
                        <Typography fontWeight={600} fontSize={18}>
                            {confirmDialog.title}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.message}
                    </Typography>

                    {confirmDialog.type === 'clean' && (
                        <Box mt={2} p={2} sx={{
                            bgcolor: 'warning.50',
                            borderRadius: 1,
                            borderLeft: '4px solid',
                            borderColor: 'warning.main'
                        }}>
                            <Typography variant="body2" fontWeight={500} color="warning.dark">
                                ⚠️ PERINGATAN
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Semua data jawaban akan hilang permanen
                                <br />
                                • Statistik peserta akan direset
                                <br />
                                • Tidak dapat dikembalikan
                            </Typography>
                        </Box>
                    )}

                    {confirmDialog.type === 'close' && (
                        <Box mt={2} p={2} sx={{
                            bgcolor: 'error.50',
                            borderRadius: 1,
                            borderLeft: '4px solid',
                            borderColor: 'error.main'
                        }}>
                            <Typography variant="body2" fontWeight={500} color="error.dark">
                                ⚠️ TINDAKAN KRITIS
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Semua peserta akan dikeluarkan
                                <br />
                                • Ruangan akan dihapus dari database
                                <br />
                                • Semua data akan hilang permanen
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={2} width="100%">
                        <Button
                            onClick={closeConfirmDialog}
                            variant="outlined"
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                py: 1
                            }}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => {
                                confirmDialog.action();
                            }}
                            variant="contained"
                            color={confirmDialog.type === 'close' ? 'error' : 'warning'}
                            fullWidth
                            startIcon={confirmDialog.type === 'close' ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                '&:hover': {
                                    bgcolor: confirmDialog.type === 'close' ? 'error.dark' : 'warning.dark'
                                }
                            }}>
                            {confirmDialog.type === 'close' ? 'Ya, Hapus Ruangan' : 'Ya, Bersihkan Hasil'}
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
}