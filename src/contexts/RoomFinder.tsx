'use client'
import { firestore } from '@/libs/firebase';
import { doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { RoomData } from '@/types';
import { useCurrentUser } from './SessionProvider';
import RoomManager from './RoomManager';

export interface LayoutProps {
    children?: ReactNode;
    roomId: string;
}

export default function RoomFinder({ children, roomId }: LayoutProps) {

    const user = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const isHost = useMemo(() => {
        if (!room || !user?.id) return false;
        return room.createdBy == user.id;
    }, [room, user?.id]);

    useEffect(() => {
        if (!roomId) {
            setError('Room ID is required');
            setLoading(false);
            return;
        }

        let unsubscribe: (() => void) | undefined;

        const subscribeToRoom = async () => {
            try {
                setLoading(true);
                setError('');
                const roomRef = doc(firestore, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);
                if (!roomSnap.exists()) {
                    setError('Room not found');
                    setRoom(null);
                    setLoading(false);
                    return;
                }
                // Then set up real-time listener
                unsubscribe = onSnapshot(roomRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        const roomData = {
                            id: snapshot.id,
                            ...data,
                            createdAt: (data.createdAt as Timestamp).toDate()
                        } as RoomData;
                        setRoom(roomData);
                        setError('');

                        // Check if room is closed/ended
                        if (roomData.status === 'ended') {
                            setError('Room has been closed');
                        }
                    } else {
                        // Room was deleted
                        setRoom(null);
                        setError('Room has been closed or deleted');
                    }
                    setLoading(false);
                }, (err) => {
                    console.error('Error listening to room:', err);
                    setError('Failed to load room');
                    setRoom(null);
                    setLoading(false);
                });

            } catch (err: any) {
                console.error('Error checking room:', err);
                setError('Failed to load room');
                setRoom(null);
                setLoading(false);
            }
        };

        subscribeToRoom();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [roomId]);

    if (error && (error.includes('closed') || error.includes('deleted'))) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                flexDirection="column"
                gap={3}
                p={2}>
                <Typography variant="h4" color="warning.main" textAlign="center">
                    Ruang Telah Ditutup
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                    Ruang "{room?.name || roomId}" sudah tidak tersedia atau telah berakhir.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push('/')}
                    size="large">
                    Kembali Ke Beranda
                </Button>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                flexDirection="column"
                gap={2}>
                <CircularProgress />
                <Typography variant="h6" color="text.secondary">
                    Memuat Ruang...
                </Typography>
            </Box>
        );
    }

    if (error && !room) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                flexDirection="column"
                gap={3}
                p={2}>
                <Typography variant="h4" color="error" textAlign="center">
                    {error}
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                    Ruang dengan ID "{roomId}" tidak ditemukan atau Anda tidak memiliki akses.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push('/')}
                    size="large">
                    Kembali Ke Beranda
                </Button>
            </Box>
        );
    }

    if (!room) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                flexDirection="column"
                gap={3}>
                <Typography variant="h4" color="text.primary">
                    Ruang Tidak Ditemukan!
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push('/')}>
                    Kembali Ke Beranda
                </Button>
            </Box>
        );
    }

    return (
        <RoomManager roomData={room} isHost={isHost}>
            {children}
        </RoomManager>
    );
}