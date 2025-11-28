import { Box, Typography } from '@mui/material';
import FloatingCamera from '../FloatingCamera';
import { useEffect, useState } from 'react';
import { useRoomManager } from '@/contexts/RoomManager';
import QuizClientLobby from '../quiz/QuizClientLobby';

export interface ClientLobbyProps {

}

export default function ClientLobby({ }: ClientLobbyProps) {

    const { room } = useRoomManager();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Box>
            <Typography>
                Client Lobby
            </Typography>
        </Box>
    );
}