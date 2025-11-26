'use client'
import { useRoomManager } from '@/contexts/RoomManager';
import { useRoom } from '@/contexts/RoomProvider';
import { Badge, Box, Chip, Stack, Typography } from '@mui/material';
import AvatarCompact from '../avatars/AvatarCompact';
import { MotionIconButton, MotionStack } from "@/components/motion"
import { useCurrentUser } from '@/contexts/SessionProvider';
import { Trash } from 'lucide-react';
import Tooltip from '../Tooltip';
import { RoomData, User } from '@/types';

export default function Participants() {

    const currentUser = useCurrentUser();
    const { isHost, room } = useRoom();
    const { participants, removeUser } = useRoomManager();

    const handleRemoveUser = (userId: string) => {
        if (isHost && userId !== currentUser?.id) {
            removeUser(userId);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={900}>
                    Peserta ({participants.length})
                </Typography>
            </Stack>

            <Stack spacing={1}>
                {participants.map((client, index) => (
                    <MotionStack
                        key={client.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}>

                        <ParticipantAvatar client={client} />
                        <Typography fontSize={16} fontWeight={600} flex={1}>
                            {client.name}
                            {client.id === currentUser?.id && " (You)"}
                        </Typography>

                        {isHost && client.id !== currentUser?.id && (
                            <Tooltip title={"Keluarkan " + client.name}>
                                <MotionIconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveUser(client.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}>
                                    <Trash />
                                </MotionIconButton>
                            </Tooltip>
                        )}
                    </MotionStack>
                ))}

                {participants.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                        No participants yet
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}

type ParticipantAvatar = {
    client: User;
}
const ParticipantAvatar = ({ client }: ParticipantAvatar) => {

    const currentUser = useCurrentUser();
    const { room } = useRoom();

    if (room.createdBy === client.id) {
        return (
            <Badge
                badgeContent={"Host"}
                color="primary"
                sx={{
                    '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: '16px',
                        minWidth: '30px',
                        top: -4,
                        right: -4,
                    }
                }}>
                <AvatarCompact
                    seed={client.avatar}
                    size={40}
                    borderColor={client.id === currentUser?.id ? "#5ca8ff" : undefined}
                />
            </Badge>
        );
    }
    return (
        <AvatarCompact
            seed={client.avatar}
            size={40}
            borderColor={client.id === currentUser?.id ? "#5ca8ff" : undefined}
        />
    );
}