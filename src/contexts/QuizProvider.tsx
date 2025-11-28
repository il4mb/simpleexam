import { QuizContext, QuizState } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoomManager } from './RoomManager';
import * as Y from "yjs";
import { ydoc } from '@/libs/yjs';
import { useCurrentUser } from './SessionProvider';
import { useYArray } from '@/hooks/useY';

type Answer = {
    uid: string;
    questionId: string;
    choices: string[];
}

type TQuizRoom = {
    startTime?: number;
    endTime?: number;
    questionIndex?: number;
    answers?: Answer[];
    readyUidList?: string[];
}

export interface QuizProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<any>;
}

export default function QuizProvider({ children, yRoom }: QuizProviderProps) {

    const currentUser = useCurrentUser();
    const { room, isHost } = useRoomManager<TQuizRoom>();
    const [roomStatus, setRoomStatus] = useState(room.status);
   
    const yReadyUidList = useMemo(() => {
        let arr = yRoom.get('readyUids');
        if (!arr) {
            arr = new Y.Array<string>();
            yRoom.set('readyUids', arr);
        }
        return arr as Y.Array<string>;
    }, [yRoom]);

    const readyUids = useYArray(yReadyUidList);

    const imReady = useCallback(() => {
        const uid = currentUser?.id;
        if (!uid) return;

        if (!readyUids.includes(uid)) {
            ydoc.transact(() => {
                yReadyUidList.push([uid]);
            });
        }
    }, [currentUser?.id, readyUids, yReadyUidList]);


    /**
     * HOST: watch room.status changes to trigger quiz lifecycle
     */
    useEffect(() => {
        if (!isHost) return;
        if (roomStatus === room.status) return;

        if (room.status === "playing") {
            if (roomStatus === "paused") {
                console.log("Continue");
            } else {
                console.log("Initial");

                ydoc.transact(() => {
                    yRoom.set("questionIndex", 0);
                    yRoom.set("answers", new Y.Array());
                    yRoom.set("startTime", Date.now());

                    // clear ready list
                    yReadyUidList.delete(0, yReadyUidList.length);
                });
            }
        }

        else if (room.status === "paused") {
            console.log("Paused");
        }

        else if (room.status === "ended") {
            console.log("Ended");

            ydoc.transact(() => {
                yRoom.set("endTime", Date.now());
                yReadyUidList.delete(0, yReadyUidList.length);
            });
        }

        setRoomStatus(room.status);

    }, [room.status, roomStatus, isHost, yRoom, yReadyUidList]);


    useEffect(() => {
        const uid = currentUser?.id;
        if (!uid) return;

        const removeReady = () => {
            const arr = yReadyUidList.toArray();
            const index = arr.indexOf(uid);
            if (index !== -1) {
                ydoc.transact(() => {
                    yReadyUidList.delete(index, 1);
                });
            }
        };

        window.addEventListener("beforeunload", removeReady);
        window.addEventListener("pagehide", removeReady);

        return () => {
            window.removeEventListener("beforeunload", removeReady);
            window.removeEventListener("pagehide", removeReady);
        };
    }, [currentUser?.id, yReadyUidList]);

    const valueContext = useMemo<QuizState>(() => ({
        imReady,
        readyUids
    }), [imReady, readyUids]);

    return (
        <QuizContext.Provider value={valueContext}>
            {children}
        </QuizContext.Provider>
    );
}
