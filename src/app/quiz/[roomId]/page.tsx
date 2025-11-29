'use client'
import { useRoomManager } from '@/contexts/RoomManager';
import { usePathname } from 'next/navigation';
import ClientRoom from '@/components/rooms/ClientRoom';
import HostRoom from '@/components/rooms/HostRoom';

export default function QuizPage() {

    const pathname = usePathname();
    const { isHost, room } = useRoomManager();

    const navItems = [
        {
            href: `/quiz/${room?.id}/`,
            label: 'Quiz Editor',
            match: (path: string) => path === `/quiz/${room?.id}/` || path === `/quiz/${room?.id}`
        },
        {
            href: `/quiz/${room?.id}/results`,
            label: 'Final Results',
            match: (path: string) => path === `/quiz/${room?.id}/results`
        },
    ];

    const isActive = (href: string, matchFn?: (path: string) => boolean) => {
        if (matchFn) {
            return matchFn(pathname);
        }
        return pathname === href;
    };


    if (isHost) {
        return (<HostRoom room={room} />);
    }

    return (<ClientRoom room={room} />);
}