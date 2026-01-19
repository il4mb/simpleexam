import KickedOut from '@/components/rooms/ui/KickedOut';
import PerndingJoint from '@/components/rooms/ui/PerndingJoint';
import { Participant, ParticipantsContext } from '@/hooks/useParticipants';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomManager } from './RoomManager';
import * as Y from "yjs";
import { useCurrentUser } from './SessionProvider';
import { getYType } from '@/hooks/useY';
import { enqueueSnackbar } from 'notistack';

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

    const [participantsMap, setParticipantsMap] = useState<Record<string, Participant>>({});
    
    // Subscribe to Y.Map changes
    useEffect(() => {
        const updateMap = () => {
            setParticipantsMap(yParticipants.toJSON() as Record<string, Participant>);
        };
        
        updateMap(); // Initial update
        yParticipants.observe(updateMap);
        
        return () => {
            yParticipants.unobserve(updateMap);
        };
    }, [yParticipants]);

    const participants = useMemo<Participant[]>(() => Object.values(participantsMap), [participantsMap]);
    const isTabActiveRef = useRef<boolean>(true);
    const wasLeftRef = useRef<boolean>(false); // Track if user was previously left
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
                    // Set flag when user leaves
                    if (userId === user?.id) {
                        wasLeftRef.current = true;
                    }
                }
            }
        });
    }, [yParticipants, user?.id]);

    const rejoinUser = useCallback((userId: string) => {
        yRoom.doc?.transact(() => {
            if (yParticipants.has(userId)) {
                const participant = yParticipants.get(userId);
                if (participant?.status == "left") {
                    yParticipants.set(userId, { 
                        ...participant, 
                        status: "active",
                        lastSeen: Date.now()
                    });
                    wasLeftRef.current = false;
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
                if (participant) {
                    const now = Date.now();
                    // Only update lastSeen if it changed sufficiently to reduce YDoc writes
                    if (now - (participant.lastSeen || 0) < 10000) return;
                    yParticipants.set(userId, { 
                        ...participant, 
                        lastSeen: now,
                        // If user was left and now active, rejoin them
                        status: participant.status === "left" ? "active" : participant.status
                    });
                }
            }
        });
    }, [yParticipants]);

    const checkInactiveUsers = useCallback(() => {
        const now = Date.now();
        const sixtySecondsAgo = now - 60000;

        yRoom.doc?.transact(() => {
            const participants = Array.from(yParticipants.values());
            for (const participant of participants) {
                if (participant.status === 'active' && 
                    participant.lastSeen < sixtySecondsAgo) {
                    yParticipants.set(participant.id, {
                        ...participant,
                        status: "left"
                    });
                }
            }
        });
    }, [yParticipants]);

    // Handle rejoin when tab becomes active again
    const handleTabActive = useCallback(() => {
        if (!user?.id) return;
        
        // Update last seen immediately
        updateLastSeen(user.id);
        
        // Check if user was marked as left and rejoin them
        const currentParticipant = yParticipants.get(user.id);
        if (currentParticipant?.status === 'left') {
            rejoinUser(user.id);
        }
    }, [user?.id, updateLastSeen, rejoinUser, yParticipants]);

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
                // Check inactive users every 60 seconds (reduced frequency)
                inactivityCheckIntervalId = setInterval(checkInactiveIfTabActive, 60000);

                // Initial update
                updateLastSeen(user.id);
            }
        };

        // Setup intervals initially
        setupIntervals();

        const handleVisibilityChange = () => {
            const wasActive = isTabActiveRef.current;
            isTabActiveRef.current = !document.hidden;

            if (!document.hidden) {
                // Tab became active - handle rejoin
                handleTabActive();
            } else if (wasActive) {
                // Tab became inactive - mark as left after a delay
                setTimeout(() => {
                    if (!isTabActiveRef.current && user?.id) {
                        leftUser(user.id);
                    }
                }, 30000); // Mark as left after 30 seconds of inactivity
            }

            setupIntervals(); // Restart intervals based on new visibility state
        };

        const handleUserInteraction = () => {
            if (isTabActiveRef.current && user?.id) {
                updateLastSeen(user.id);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        const events = ['click', 'keydown', 'mousemove', 'touchstart'];
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
    }, [user?.id, updateLastSeen, checkInactiveUsers, handleTabActive, leftUser]);


    useEffect(() => {
        if (!user) return;

        const addUserToParticipants = () => {
            yRoom.doc?.transact(() => {
                const existing = yParticipants.get(user.id);
                
                if (isHost) {
                    // Host is always active
                    yParticipants.set(user.id, { 
                        ...user, 
                        status: "active", 
                        lastSeen: Date.now() 
                    } as Participant);
                } else {
                    if (existing?.id) {
                        // User exists - check status
                        if (existing.status === "left") {
                            // User was left, rejoin them
                            yParticipants.set(user.id, { 
                                ...user, 
                                status: "active", 
                                lastSeen: Date.now() 
                            } as Participant);
                            wasLeftRef.current = false;
                        } else if (existing.status === "pending") {
                            // Keep as pending
                            yParticipants.set(user.id, { 
                                ...user, 
                                status: "pending", 
                                lastSeen: Date.now() 
                            } as Participant);
                        } else {
                            // Already active
                            yParticipants.set(user.id, { 
                                ...user, 
                                status: "active", 
                                lastSeen: Date.now() 
                            } as Participant);
                        }
                    } else {
                        // New user - add as pending
                        yParticipants.set(user.id, { 
                            ...user, 
                            status: "pending", 
                            lastSeen: Date.now() 
                        } as Participant);
                    }
                }
            });
        };

        addUserToParticipants();
        setMounted(true);

        const handleBeforeUnload = () => {
            if (user.id) {
                leftUser(user.id);
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            handleBeforeUnload();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, yParticipants, isHost, yRoom, leftUser]);

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
        rejoinUser,
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
        rejoinUser,
        approveUser,
        rejectUser,
        autoApproveAll,
    ]);

    if (!mounted) return false;

    // Updated logic for handling user status
    if (!currentUserParticipant) {
        return <KickedOut room={room} />;
    } else if (user && !isHost && isUserPending &&
        // Only show pending joint if user was never active before and was never left
        !participants.some(p => p.id === user.id && (p.status === 'active' || p.status === 'left'))) {
        return <PerndingJoint room={room} pendingCount={pendingParticipants.length} />;
    }

    return (
        <ParticipantsContext.Provider value={values}>
            {children}
        </ParticipantsContext.Provider>
    );
}