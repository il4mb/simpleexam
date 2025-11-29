import { Box, Container, Grid, Stack } from '@mui/material';
import RoomHeader from './RoomHeader';
import { RoomData } from '@/types';
import QuizHost from '../quiz/QuizHost';
import QuestionEditor from '../questions/QuestionEditor';
import Participants from './Participants';
import { MotionBox } from '../motion';
import { AnimatePresence } from 'framer-motion';

export interface HostRoomProps {
    room: RoomData;
}
export default function HostRoom({ room }: HostRoomProps) {

    const isInPlay = ["paused", "playing"].includes(room.status);
    const isPrepared = room.status == "prepared";
    const isInQuiz = isInPlay || isPrepared;

    return (
        <Stack>
            <Container>
                <Box py={1} />
                <RoomHeader />
                <Box py={1} />
            </Container>

            <AnimatePresence mode={"popLayout"}>
                {isInQuiz ? (
                    <MotionBox key={"in-quiz"} initial={{ y: -100 }} animate={{ y: 0 }}>
                        <QuizHost room={room} isInLobby={isInPlay} />
                    </MotionBox>
                ) : (
                    <Container key={"in-room"}>
                        <MotionBox initial={{ y: 100 }} animate={{ y: 0 }}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                                    <QuestionEditor />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                                    <Participants />
                                </Grid>
                            </Grid>
                        </MotionBox>
                    </Container>
                )}
            </AnimatePresence>


        </Stack>
    );
}