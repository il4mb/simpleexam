import { ReactNode, use } from 'react';
import RoomFinder from '@/contexts/RoomFinder';
import MusicProvider from '@/contexts/MusicProvider';

export interface LayoutProps {
    children?: ReactNode;
    params: Promise<{ roomId: string; }>;
}

export default function Layout({ children, params }: LayoutProps) {

    const { roomId } = use(params);

    return (
        <RoomFinder roomId={roomId}>
            <MusicProvider autoPlay={true}>
                {children}
            </MusicProvider>
        </RoomFinder>
    );
}