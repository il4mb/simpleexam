import { Settings } from '@mui/icons-material';
import { alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import Checkbox from '../Checkbox';
import { useRoomManager } from '@/contexts/RoomManager';
import { ChangeEvent, useState } from 'react';
import Tooltip from '../Tooltip';

export default function RoomSettingButton() {


    const theme = useTheme();
    const { room, updateRoom } = useRoomManager();
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen(prev => !prev);

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        if (newName.length > 24) return;
        updateRoom("name", newName);
    }




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

            <Dialog maxWidth={"sm"} fullWidth open={open} onClose={toggleOpen}>
                <DialogTitle>
                    Pengaturan Room
                </DialogTitle>
                <DialogContent>
                    <Stack gap={1} mt={1}>
                        <Box>
                            <TextField
                                onChange={handleChangeName}
                                label={"Nama Room"}
                                value={room.name}
                                fullWidth />
                            <Typography fontSize={10} color='text.secondary'>
                                {room.name.length} / 24
                            </Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography fontWeight={600}>
                                Papan Peringkat
                            </Typography>
                            <Checkbox
                                checked={room.enableLeaderboard}
                                onChange={(checked) => updateRoom("enableLeaderboard", checked)}
                                label={(room.enableLeaderboard ? "Sembunyikan" : "Tampilkan") + ' papan peringkat pada peserta'} />
                        </Box>
                        <Divider />
                        <Box>
                            <Typography fontWeight={600}>
                                Ekspresi AI
                            </Typography>
                            <Checkbox
                                checked={room.enableAiExpression}
                                onChange={(checked) => updateRoom("enableAiExpression", checked)}
                                label={(room.enableAiExpression ? "Matikan" : "Aktifkan") + ' fitur Ai pendeteksi ekpresi'} />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleOpen}>
                        Selesai
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}