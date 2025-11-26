'use client'

import { ReactNode, useCallback, useEffect, useMemo, useState, createContext, useContext } from 'react';
import { useRoom } from './RoomProvider';
import { useCurrentUser } from './SessionProvider';
import { ydoc } from '@/libs/yjs';
import * as Y from 'yjs';
import { RoomData, User } from '@/types';
import { Box, Typography, Fade, Backdrop } from '@mui/material';

export interface RoomManagerState {
    yMap: Y.Map<unknown>;
    room: RoomData;
    participants: User[];
    isUserInRoom: boolean;
    participantCount: number;
    removeUser: (userId: string) => void;
    getParticipant: (userId: string) => User | undefined;
}

export interface RoomManagerProps {
    children?: ReactNode;
}

const RoomManagerContext = createContext<RoomManagerState | undefined>(undefined);
export function useRoomManager(): RoomManagerState {
    const context = useContext(RoomManagerContext);
    if (context === undefined) {
        throw new Error('useRoomManager must be used within a RoomManagerProvider');
    }
    return context;
}

export default function RoomManagerProvider({ children }: RoomManagerProps) {
    const user = useCurrentUser();
    const { room } = useRoom();

    const yMap = useMemo(() => {
        return ydoc.getMap(room.id);
    }, [room.id]);

    const [participants, setParticipants] = useState<User[]>([]);
    const yParticipants = useMemo(() => {
        let arr = yMap.get("participants");
        if (!arr) {
            arr = new Y.Array<User>();
            yMap.set("participants", arr);
        }
        return arr as Y.Array<User>;
    }, [yMap]);

    const removeUserFromParticipants = useCallback(() => {
        if (!user) return;

        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                yParticipants.delete(userIndex, 1);
                console.log(`User ${user.id} removed from participants (tab closed)`);
            }
        });
    }, [user, yParticipants]);

    const removeUser = useCallback((userId: string) => {
        ydoc.transact(() => {
            const users = yParticipants.toArray();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                yParticipants.delete(userIndex, 1);
                console.log(`User ${userId} removed by manager`);
            }
        });
    }, [yParticipants]);

    const getParticipant = useCallback((userId: string): User | undefined => {
        return participants.find(participant => participant.id === userId);
    }, [participants]);

    useEffect(() => {
        if (!user) return;

        const addUserToParticipants = () => {
            const existingUsers = yParticipants.toArray();
            const userExists = existingUsers.some(existingUser =>
                existingUser.id === user.id
            );

            if (!userExists) {
                ydoc.transact(() => {
                    yParticipants.push([user]);
                });
                console.log(`User ${user.id} added to participants`);
            }
        };

        // Add user immediately
        addUserToParticipants();

        // Handle tab/window close
        const handleBeforeUnload = () => {
            removeUserFromParticipants();
        };

        // Handle browser/tab close
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup on unmount
        return () => {
            removeUserFromParticipants();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, yParticipants, removeUserFromParticipants]);

    useEffect(() => {
        const updateParticipants = () => {
            try {
                const currentParticipants = yParticipants.toArray();
                console.log('Participants updated:', currentParticipants);
                setParticipants(currentParticipants);
            } catch (error) {
                console.error('Error updating participants:', error);
            }
        };

        // Initial load
        updateParticipants();

        // Observe changes
        yParticipants.observe(updateParticipants);

        // Cleanup observer
        return () => {
            yParticipants.unobserve(updateParticipants);
        };
    }, [yParticipants]);

    // State value untuk context
    const contextValue: RoomManagerState = useMemo(() => ({
        room,
        yMap,
        participants,
        isUserInRoom: user ? participants.some(p => p.id === user.id) : false,
        participantCount: participants.length,
        removeUser,
        getParticipant,
    }), [participants, room, user, yMap, removeUser, getParticipant]);

    return (
        <RoomManagerContext.Provider value={contextValue}>
            {children}
        </RoomManagerContext.Provider>
    );
}