import { ReactNode, use } from 'react';
import RoomFinder from '@/contexts/RoomFinder';
import MusicProvider from '@/contexts/MusicProvider';
import { Container } from '@mui/material';

export interface LayoutProps {
    children?: ReactNode;
    params: Promise<{ roomId: string; }>;
}

export default function Layout({ children, params }: LayoutProps) {

    const { roomId } = use(params);

    return (
        <RoomFinder roomId={roomId}>
            <MusicProvider autoPlay={false}>
                <Container maxWidth={"lg"}>
                    {children}
                </Container>
            </MusicProvider>
        </RoomFinder>
    );
}