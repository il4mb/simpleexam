import { ReactNode, use } from 'react';
import RoomProvider from '@/contexts/RoomProvider';

export interface LayoutProps {
    children?: ReactNode;
    params: Promise<{ roomId: string; roomType: string; }>;
}

export default function Layout({ children, params }: LayoutProps) {

    const { roomId, roomType } = use(params);

    return (
        <RoomProvider roomId={roomId}>
            {children}
        </RoomProvider>
    )
}