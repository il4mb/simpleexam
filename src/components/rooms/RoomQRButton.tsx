import { QrCode } from '@mui/icons-material';
import {
    alpha,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    CircularProgress,
    useTheme
} from '@mui/material';

import { useRoomManager } from '@/contexts/RoomManager';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Tooltip from '../Tooltip';
import { nanoid } from 'nanoid';

type RoomQR = {
    tokenQR: string;
};

export default function RoomQRButton() {

    const theme = useTheme();
    const { room, updateRoom } = useRoomManager<RoomQR>();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const tokenQR = room.tokenQR;

    const value = useMemo(() => {
        if (!tokenQR) return "";
        return `${window.location.protocol}//${window.location.host}/quiz/${room.id}?token=${tokenQR}`;
    }, [tokenQR, room.id]);

    const regenerateToken = useCallback(async () => {
        setLoading(true);

        // Simulate async (in case you later update from server)
        await new Promise(res => setTimeout(res, 300));

        const newToken = nanoid(12);
        updateRoom("tokenQR", newToken);

        setLoading(false);
    }, [updateRoom]);

    const toggleOpen = useCallback(() => {
        setOpen(prev => {
            const newOpen = !prev;

            // Only regenerate when OPENING
            if (!prev) regenerateToken();

            return newOpen;
        });
    }, [regenerateToken]);

    // Ensure at least 1 initial token exists
    useEffect(() => {
        if (!tokenQR) regenerateToken();
    }, [tokenQR, regenerateToken]);

    return (
        <>
            <Tooltip title={"Tampilkan Kode QR"}>
                <IconButton
                    onClick={toggleOpen}
                    sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                        borderRadius: 2,
                    }}>
                    <QrCode fontSize="small" />
                </IconButton>
            </Tooltip>

            <Dialog maxWidth={"xs"} fullWidth open={open} onClose={toggleOpen}>
                <DialogTitle>QR Code untuk Bergabung</DialogTitle>

                <DialogContent
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 280
                    }}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <div style={{ width: "100%", maxWidth: 300 }}>
                            <QRCodeSVG
                                value={value}
                                width="100%"
                                height="100%"
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: 12
                                }}
                                marginSize={2}
                            />
                        </div>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={toggleOpen}>Selesai</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
