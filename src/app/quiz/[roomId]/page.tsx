'use client'
import { useRoomManager } from '@/contexts/RoomManager';
import ClientRoom from '@/components/rooms/ClientRoom';
import HostRoom from '@/components/rooms/HostRoom';

export default function QuizPage() {
    const { isHost, room } = useRoomManager();

    if (isHost) {
        return (<HostRoom room={room} />);
    }

    return (<ClientRoom room={room} />);
}