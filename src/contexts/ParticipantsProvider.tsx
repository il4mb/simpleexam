import KickedOut from '@/components/rooms/ui/KickedOut';
import PerndingJoint from '@/components/rooms/ui/PerndingJoint';
import { Participant, ParticipantsContext } from '@/hooks/useParticipants';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomManager } from './RoomManager';
import * as Y from "yjs";
import { useCurrentUser } from './SessionProvider';
import { getYType, useYArray, useYMap } from '@/hooks/useY';
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
        let partsMap = yRoom.get("participants");
        if (getYType(partsMap) != "YMap") {
            partsMap = new Y.Map<Record<string, Participant>>();
            yRoom.set("participants", partsMap);
        }
        return partsMap as Y.Map<Participant>;
    }, [yRoom]);

    const participantsMap = useYMap<Record<string, Participant>>(yParticipants as any);
    const participants = useMemo<Participant[]>(() => Object.values(participantsMap), [participantsMap]);
    const isTabActiveRef = useRef<boolean>(true);
    const pendingParticipants = useMemo(() => participants.filter(p => p.status === 'pending'), [participants]);
    const activeParticipants = useMemo(() => participants.filter(p => p.status === 'active'), [participants]);
    const leftParticipants = useMemo(() => participants.filter(p => p.status === 'left'), [participants]);
    const currentUserParticipant = useMemo(() => user ? participantsMap[user.id] : undefined, [user, participantsMap]);
    const isUserPending = currentUserParticipant?.status === 'pending';
    const [mounted, setMounted] = useState(false);

    const getParticipant = useCallback((userId: string): Participant | undefined => participantsMap[userId], [participantsMap]);

    const removeUser = useCallback((userId: string) => {
        if (!isHost) {
            console.warn('Non-host user attempted to remove user');
            enqueueSnackbar('Only hosts can remove users', { variant: "error" });
            return;
        }

        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                yParticipants.delete(userId);
            }
        });
    }, [yParticipants, isHost]);

    const leftUser = useCallback((userId: string) => {
        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                const participant = yParticipants.get(userId);
                if (participant?.status == "active") {
                    yParticipants.set(userId, { ...participant, status: "left" })
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

        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                const participant = yParticipants.get(userId);
                if (participant?.status == "pending") {
                    yParticipants.set(userId, { ...participant, status: "active" });
                }
            }
        });
    }, [yParticipants, isHost]);

    const rejectUser = useCallback((userId: string) => {
        if (!isHost) {
            console.warn('Non-host user attempted to reject user');
            enqueueSnackbar('Only hosts can reject users', { variant: "error" });
            return;
        }

        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                yParticipants.delete(userId);
            }
        });
    }, [yParticipants, isHost]);

    const autoApproveAll = useCallback(() => {
        if (!isHost) {
            enqueueSnackbar('Only hosts can approve users', { variant: "error" });
            return;
        }

        yRoom.doc?.transact(() => {
            const users = Array.from(yParticipants.values());
            let approvedCount = 0;
            for (let user of users) {
                if (user.status === 'pending') {
                    yParticipants.set(user.id, { ...user, status: "active" });
                    approvedCount++;
                }
            }

            if (approvedCount > 0) {
                console.log(`${approvedCount} pending users auto-approved by host`);
                enqueueSnackbar(`${approvedCount} users auto-approved`, { variant: "success" });
            }
        });
    }, [yParticipants, isHost, yRoom]);

    const updateLastSeen = useCallback((userId: string) => {
        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                const participant = yParticipants.get(userId);
                if (participant && participant.status != "pending") {
                    yParticipants.set(userId, { ...participant, lastSeen: Date.now() })
                }
            }
        });
    }, [yParticipants]);

    const checkInactiveUsers = useCallback(() => {
        const now = Date.now();
        const thirtySecondsAgo = now - 30000;

        yRoom.doc?.transact(() => {
            const participants = Object.values(yParticipants.toJSON()) as Participant[];
            for (const user of participants) {
                if (user.status === 'active' && user.lastSeen < thirtySecondsAgo) {
                    yParticipants.set(user.id, {
                        ...user,
                        status: "left"
                    });
                }
            }
        });
    }, [yParticipants]);

    // Consolidated version
    useEffect(() => {
        if (!user?.id) return;

        let lastSeenIntervalId: NodeJS.Timeout;
        let inactivityCheckIntervalId: NodeJS.Timeout;

        const updateIfTabActive = () => {
            if (isTabActiveRef.current) {
                updateLastSeen(user.id);
            }
        };

        const checkInactiveIfTabActive = () => {
            if (isTabActiveRef.current) {
                checkInactiveUsers();
            }
        };

        const setupIntervals = () => {
            // Clear existing intervals
            if (lastSeenIntervalId) clearInterval(lastSeenIntervalId);
            if (inactivityCheckIntervalId) clearInterval(inactivityCheckIntervalId);

            if (isTabActiveRef.current) {
                // Update lastSeen every 15 seconds
                lastSeenIntervalId = setInterval(updateIfTabActive, 15000);
                // Check inactive users every 30 seconds
                inactivityCheckIntervalId = setInterval(checkInactiveIfTabActive, 30000);

                // Initial update
                updateLastSeen(user.id);
            }
        };

        // Setup intervals initially
        setupIntervals();

        const handleVisibilityChange = () => {
            isTabActiveRef.current = !document.hidden;

            if (!document.hidden) {
                // Tab became active - update immediately
                updateLastSeen(user.id);
            }

            setupIntervals(); // Restart intervals based on new visibility state
        };

        const handleUserInteraction = () => {
            if (isTabActiveRef.current) {
                updateLastSeen(user.id);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        const events = ['click', 'keydown', 'mousemove'];
        events.forEach(event => {
            window.addEventListener(event, handleUserInteraction, { passive: true });
        });

        return () => {
            // Cleanup
            if (lastSeenIntervalId) clearInterval(lastSeenIntervalId);
            if (inactivityCheckIntervalId) clearInterval(inactivityCheckIntervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            events.forEach(event => {
                window.removeEventListener(event, handleUserInteraction);
            });
        };
    }, [user?.id, updateLastSeen, checkInactiveUsers]);


    useEffect(() => {
        if (!user) return;

        const addUserToParticipants = () => {
            yRoom.doc?.transact(() => {

                const existing = yParticipants.get(user.id);
                if (isHost) {
                    yParticipants.set(user.id, { ...user, status: "active", lastSeen: Date.now() } as Participant);
                } else {
                    if (existing?.id && existing.status != "pending") {
                        yParticipants.set(user.id, { ...user, status: "active", lastSeen: Date.now() } as Participant);
                    } else {
                        yParticipants.set(user.id, { ...user, status: "pending", lastSeen: Date.now() } as Participant);
                    }
                }
            });
        };


        addUserToParticipants();
        setMounted(true);

        const handleBeforeUnload = () => leftUser(user.id);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            handleBeforeUnload();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, yParticipants, isHost, yRoom]);

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
        isUserActive: (userId: string) => participants.some(p => p.id === userId && p.status === 'active'),
        isUserPending: (userId: string) => participants.some(p => p.id === userId && p.status === 'pending'),
        isUserLeft: (userId: string) => participants.some(p => p.id === userId && p.status === 'left'),
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