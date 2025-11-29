'use client'

import { ReactNode, useMemo, createContext, useContext, useCallback, useEffect } from 'react';
import { RoomData } from '@/types';
import { ydoc } from '@/libs/yjs';
import ParticipantsProvider from './ParticipantsProvider';
import QuestionsProvider from './QuestionsProvider';
import { useYMap } from '@/hooks/useY';

export interface RoomManagerState<T = any> {
    room: RoomData & T;
    isHost: boolean;
    updateRoom: <K extends keyof RoomData>(key: K, value: RoomData[K]) => void;
}

export interface RoomManagerProps {
    children?: ReactNode;
    roomData: RoomData;
    isHost: boolean;
}

const RoomManagerContext = createContext<RoomManagerState<any> | undefined>(undefined);
export function useRoomManager<T>(): RoomManagerState<T> {
    const context = useContext(RoomManagerContext);
    if (context === undefined) {
        throw new Error('useRoomManager must be used within a RoomManagerProvider');
    }
    return context;
}

export default function RoomManagerProvider({ children, roomData, isHost }: RoomManagerProps) {

    const yRoom = useMemo(() => {
        const map = ydoc.getMap(roomData.id);
        if (isHost) {
            ydoc.transact(() => {
                for (const [k, v] of Object.entries(roomData)) {
                    try {
                        const current = map.get(k);
                        if (current !== undefined) continue;
                        map.set(k, v);
                    } catch (error) {
                        console.log("Skipped", k, error);
                    }
                }
            });
        }

        return map;
    }, [roomData.id, isHost]);
    const room = useYMap<RoomData>(yRoom as any);

    const updateRoom = useCallback<RoomManagerState['updateRoom']>((key, value) => {
        if (!isHost) return;
        ydoc.transact(() => {
            yRoom.set(key, value);
        });
    }, [yRoom, isHost]);

    const contextValue = useMemo<RoomManagerState>(() => ({
        room: room,
        isHost,
        updateRoom,
    }), [room, isHost, updateRoom]);

    return (
        <RoomManagerContext.Provider value={contextValue}>
            <ParticipantsProvider yRoom={yRoom}>
                <QuestionsProvider yRoom={yRoom}>
                    {children}
                </QuestionsProvider>
            </ParticipantsProvider>
        </RoomManagerContext.Provider>
    );
}