import { RoomData } from '@/types';
import { Box, Container } from '@mui/material';
import RoomHeader from './RoomHeader';
import CameraProvider from '@/contexts/CameraProvider';
import { MotionStack } from '../motion';
import QuizClient from '../quiz/QuizClient';

export interface ClientRoomProps {
    room: RoomData;
}
export default function ClientRoom({ room }: ClientRoomProps) {

    const isInPlay = ["paused", "playing"].includes(room.status);
    const isPrepared = room.status == "prepared";
    const isInQuiz = isInPlay || isPrepared;

    return (
        <CameraProvider enabled={isInQuiz}>
            {isInQuiz ? (<QuizClient isInLobby={isInPlay} />) : (
                <Container>
                    <MotionStack>
                        <Box py={0.5} />
                        <RoomHeader />
                        <Box py={1} />
                    </MotionStack>
                </Container>
            )}
        </CameraProvider>
    );
}