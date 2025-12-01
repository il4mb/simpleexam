'use client'

import { useRoomManager } from '@/contexts/RoomManager';
import { Badge, Stack, Typography, Chip, Box } from '@mui/material';
import AvatarCompact from '../avatars/AvatarCompact';
import { MotionBox, MotionIconButton, MotionStack } from "@/components/motion"
import { useCurrentUser } from '@/contexts/SessionProvider';
import { Trash, Check, X, Crown, Clock } from 'lucide-react';
import Tooltip from '../Tooltip';
import { RoomData, User } from '@/types';
import { useParticipants } from '@/hooks/useParticipants';
import { Remove } from '@mui/icons-material';
import EditProfileDialog from '../EditProfileDialog';

export default function Participants() {

    const currentUser = useCurrentUser();
    const { room, isHost } = useRoomManager();
    const { participants, removeUser, approveUser, rejectUser, activeParticipants, pendingParticipants } = useParticipants();

    const handleRemoveUser = (userId: string) => {
        if (isHost && userId !== currentUser?.id) {
            removeUser(userId);
        }
    };

    const handleApproveUser = (userId: string) => {
        if (isHost) {
            approveUser(userId);
        }
    };

    const handleRejectUser = (userId: string) => {
        if (isHost) {
            rejectUser(userId);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={900}>
                    Peserta ({activeParticipants.length})
                    {pendingParticipants.length > 0 && (
                        <Typography component="span" variant="body2" color="warning.main" sx={{ ml: 1 }}>
                            +{pendingParticipants.length} menunggu
                        </Typography>
                    )}
                </Typography>
            </Stack>

            {/* Pending Participants Section (Host Only) */}
            {isHost && pendingParticipants.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="warning.main" fontWeight={600}>
                        ⏳ Menunggu Persetujuan ({pendingParticipants.length})
                    </Typography>

                    {pendingParticipants.map((client, index) => (
                        <MotionStack
                            key={client.id}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'warning.light',
                                border: '1px solid',
                                borderColor: 'warning.main'
                            }}>

                            <Badge
                                badgeContent={<Clock size={12} />}
                                color="warning"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        top: -2,
                                        right: -2,
                                    }
                                }}>
                                <AvatarCompact
                                    seed={client.avatar}
                                    size={36}
                                />
                            </Badge>

                            <Box flex={1}>
                                <Typography fontSize={14} fontWeight={600}>
                                    {client.name}
                                </Typography>
                                <Chip
                                    label="Menunggu"
                                    size="small"
                                    color="warning"
                                    variant="filled"
                                    sx={{ height: 18, fontSize: '0.55rem' }}
                                />
                            </Box>

                            <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Terima">
                                    <MotionIconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleApproveUser(client.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        sx={{
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'success.dark' }
                                        }}>
                                        <Check size={14} />
                                    </MotionIconButton>
                                </Tooltip>

                                <Tooltip title="Tolak">
                                    <MotionIconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRejectUser(client.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        sx={{
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'error.dark' }
                                        }}>
                                        <X size={14} />
                                    </MotionIconButton>
                                </Tooltip>
                            </Stack>
                        </MotionStack>
                    ))}
                </Stack>
            )}

            {/* Active Participants */}
            <Stack spacing={1}>
                {activeParticipants.map((client, index) => (
                    <MotionStack
                        key={client.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}>

                        {client.id === currentUser?.id ? (
                            <EditProfileDialog handler={
                                <Tooltip title={"Sunting profile kamu"}>
                                    <MotionBox initial={{ scale: 1 }} whileHover={{ scale: 1.25 }}>
                                        <ParticipantAvatar client={client} room={room} />
                                    </MotionBox>
                                </Tooltip>
                            } />
                        ) : (
                            <ParticipantAvatar client={client} room={room} />
                        )}

                        <Box flex={1}>
                            <Typography fontSize={16} fontWeight={600}>
                                {client.name}
                                {client.id === currentUser?.id && " (Anda)"}
                            </Typography>
                            {client.status === 'active' && (
                                <Chip
                                    label="Aktif"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.6rem' }}
                                />
                            )}
                        </Box>

                        {isHost && client.id !== currentUser?.id && (
                            <Tooltip title={`Keluarkan ${client.name}`}>
                                <MotionIconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveUser(client.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}>
                                    <Remove />
                                </MotionIconButton>
                            </Tooltip>
                        )}
                    </MotionStack>
                ))}

                {activeParticipants.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                        Belum ada peserta aktif
                    </Typography>
                )}
            </Stack>
            {currentUser && !isHost && participants.find(p => p.id === currentUser.id)?.status === 'pending' && (
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'info.light',
                        border: '1px solid',
                        borderColor: 'info.main',
                        textAlign: 'center'
                    }}>
                    <Typography variant="body2" fontWeight={600} color="info.dark">
                        ⏳ Menunggu persetujuan host untuk bergabung
                    </Typography>
                </Box>
            )}
        </Stack>
    );
}

type ParticipantAvatarProps = {
    client: User & { status?: string };
    room: RoomData;
}

const ParticipantAvatar = ({ client, room }: ParticipantAvatarProps) => {
    const currentUser = useCurrentUser();

    const isHostUser = room.createdBy === client.id;
    const isCurrentUser = client.id === currentUser?.id;

    return (
        <Badge
            badgeContent={isHostUser ? <Crown size={12} /> : undefined}
            color="warning"
            sx={{
                '& .MuiBadge-badge': {
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    top: -2,
                    right: -2,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }}>
            <AvatarCompact
                seed={client.avatar}
                size={40}
                borderColor={isCurrentUser ? "#5ca8ff" : isHostUser ? "#ffa726" : undefined}
                borderWidth={isCurrentUser || isHostUser ? 2 : 0}
            />
        </Badge>
    );
}