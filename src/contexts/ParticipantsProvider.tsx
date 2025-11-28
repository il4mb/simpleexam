import KickedOut from '@/components/rooms/ui/KickedOut';
import PerndingJoint from '@/components/rooms/ui/PerndingJoint';
import { Participant, ParticipantsContext } from '@/hooks/useParticipants';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomManager } from './RoomManager';
import * as Y from "yjs";
import { useCurrentUser } from './SessionProvider';
import { useYArray } from '@/hooks/useY';
import { enqueueSnackbar } from 'notistack';
import { ydoc } from '@/libs/yjs';

export interface ParticipantsProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<unknown>;
}

export default function ParticipantsProvider({ children, yRoom }: ParticipantsProviderProps) {

    const user = useCurrentUser();
    const { room, isHost } = useRoomManager();

    const yParticipants = useMemo(() => {
        let arr = yRoom.get("participants");
        if (!arr) {
            arr = new Y.Array<Participant>();
            yRoom.set("participants", arr);
        }
        return arr as Y.Array<Participant>;
    }, [yRoom]);

    const participants = useYArray(yParticipants);
    const currentUserParticipant = useMemo(() => user ? participants.find(u => u.id === user.id) : undefined, [user, participants]);
    const isUserPending = currentUserParticipant?.status === 'pending';
    const pendingParticipants = useMemo(() => participants.filter(p => p.status === 'pending'), [participants]);
    const activeParticipants = useMemo(() => participants.filter(p => p.status === 'active'), [participants]);
    const leftParticipants = useMemo(() => participants.filter(p => p.status === 'left'), [participants]);
    const [mounted, setMounted] = useState(false);

    const getParticipant = useCallback((userId: string): Participant | undefined =>
        participants.find(participant => participant.id === userId),
        [participants]
    );

    const removeUser = useCallback((userId: string) => {
        if (!isHost) {
            console.warn('Non-host user attempted to remove user');
            enqueueSnackbar('Only hosts can remove users', { variant: "error" });
            return;
        }

        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                yParticipants.delete(userIndex, 1);
                console.log(`User ${userId} removed by host`);
                enqueueSnackbar(`User removed from room`, { variant: "success" });
            }
        });
    }, [yParticipants, isHost]);

    const leftUser = useCallback((userId: string) => {
        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const userData = users[userIndex];
                // Update status to left without removing
                yParticipants.delete(userIndex, 1);
                if (userData.status == "active") {
                    yParticipants.insert(userIndex, [{
                        ...userData,
                        status: 'left',
                    }]);
                }
            }
        });
    }, [yParticipants]);

    const approveUser = useCallback((userId: string) => {
        if (!isHost) {
            console.warn('Non-host user attempted to approve user');
            enqueueSnackbar('Only hosts can approve users', { variant: "error" });
            return;
        }

        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === userId && u.status === 'pending');
            if (userIndex !== -1) {
                const userData = users[userIndex];
                yParticipants.delete(userIndex, 1);
                yParticipants.insert(userIndex, [{
                    ...userData,
                    status: 'active',
                    joinedAt: Date.now(),
                }]);
                console.log(`User ${userId} approved by host`);
                enqueueSnackbar(`User approved`, { variant: "success" });
            }
        });
    }, [yParticipants, isHost, user?.id]);

    const rejectUser = useCallback((userId: string) => {
        if (!isHost) {
            console.warn('Non-host user attempted to reject user');
            enqueueSnackbar('Only hosts can reject users', { variant: "error" });
            return;
        }

        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === userId && u.status === 'pending');
            if (userIndex !== -1) {
                yParticipants.delete(userIndex, 1);
                console.log(`User ${userId} rejected by host`);
                enqueueSnackbar(`User rejected`, { variant: "info" });
            }
        });
    }, [yParticipants, isHost]);

    const autoApproveAll = useCallback(() => {
        if (!isHost) {
            enqueueSnackbar('Only hosts can approve users', { variant: "error" });
            return;
        }

        ydoc.transact(() => {
            const users = yParticipants.toArray();
            let approvedCount = 0;

            // Process in reverse to maintain correct indices
            for (let i = users.length - 1; i >= 0; i--) {
                const userData = users[i];
                if (userData.status === 'pending') {
                    yParticipants.delete(i, 1);
                    yParticipants.insert(i, [{
                        ...userData,
                        status: 'active',
                        joinedAt: Date.now(),
                    }]);
                    approvedCount++;
                }
            }

            if (approvedCount > 0) {
                console.log(`${approvedCount} pending users auto-approved by host`);
                enqueueSnackbar(`${approvedCount} users auto-approved`, { variant: "success" });
            }
        });
    }, [yParticipants, isHost, user?.id]);


    // Clean up duplicate entries in Yjs array
    const cleanupDuplicates = useCallback(() => {
        const uniqueMap = new Map<string, Participant>();
        const users = yParticipants.toArray();

        // Keep the most recent entry for each user
        users.forEach(userData => {
            const existing = uniqueMap.get(userData.id);
            if (!existing || (userData.joinedAt || 0) > (existing.joinedAt || 0)) {
                uniqueMap.set(userData.id, userData);
            }
        });

        // Replace the entire array with unique entries
        const uniqueUsers = Array.from(uniqueMap.values());
        if (uniqueUsers.length !== users.length) {
            ydoc.transact(() => {
                yParticipants.delete(0, yParticipants.length);
                yParticipants.insert(0, uniqueUsers);
            });
            console.log(`Cleaned up ${users.length - uniqueUsers.length} duplicate entries`);
        }
    }, [yParticipants]);


    const participantsRef = useRef(participants);
    useEffect(() => {
        console.log(participants);
        participantsRef.current = participants;
    }, [participants]);

    // Add user to participants with automatic reactivation for returning users
    useEffect(() => {
        if (!user) return;

        const addUserToParticipants = () => {

            // Check if user was previously in the room (any status)
            const existingIndex = participants.findIndex(u => u.id === user.id);
            const existing = participants[existingIndex];

            if (isHost) {
                if (existing?.id) {
                    ydoc.transact(() => {
                        yParticipants.delete(existingIndex, 1);
                        yParticipants.insert(existingIndex, [{ ...user, status: "active" } as Participant]);
                    });
                } else {
                    ydoc.transact(() => {
                        yParticipants.push([{ ...user, status: "active" } as Participant]);
                    });
                }
            } else {
                if (existing?.id) {
                    ydoc.transact(() => {
                        yParticipants.delete(existingIndex, 1);
                        yParticipants.insert(existingIndex, [{ ...user, status: "active" } as Participant]);
                    });
                } else {
                    ydoc.transact(() => {
                        yParticipants.push([{
                            ...user,
                            status: "pending"
                        } as Participant]);
                    });
                }
            }

            cleanupDuplicates();
        };


        addUserToParticipants();
        setMounted(true);

        const handleBeforeUnload = () => leftUser(user.id);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            handleBeforeUnload();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user?.id]);

    const values = useMemo(() => ({
        // All unique participants
        participants: participants,
        // Filtered lists
        activeParticipants,
        pendingParticipants,
        leftParticipants,
        // Participant utilities
        getParticipant,
        removeUser,
        leftUser,
        // Host-only actions
        approveUser,
        rejectUser,
        autoApproveAll,
        // Status info
        hasPendingUsers: pendingParticipants.length > 0,
        participantCount: activeParticipants.length,
        pendingCount: pendingParticipants.length,
        leftCount: leftParticipants.length,
        // Helper functions
        isUserActive: (userId: string) =>
            participants.some(p => p.id === userId && p.status === 'active'),
        isUserPending: (userId: string) =>
            participants.some(p => p.id === userId && p.status === 'pending'),
        isUserLeft: (userId: string) =>
            participants.some(p => p.id === userId && p.status === 'left'),

    }), [
        participants,
        activeParticipants,
        pendingParticipants,
        leftParticipants,
        getParticipant,
        removeUser,
        leftUser,
        approveUser,
        rejectUser,
        autoApproveAll,
    ]);


    if (!mounted) return false;

    // Updated logic: Users who left and return should not be pending
    if (!currentUserParticipant) {
        return <KickedOut room={room} />;
    } else if (user && !isHost && isUserPending &&
        // Only show pending joint if user was never active before
        !participants.some(p => p.id === user.id && (p.status === 'active' || p.status === 'left'))) {
        return <PerndingJoint room={room} pendingCount={pendingParticipants.length} />;
    }

    return (
        <ParticipantsContext.Provider value={values}>
            {children}
        </ParticipantsContext.Provider>
    );
}