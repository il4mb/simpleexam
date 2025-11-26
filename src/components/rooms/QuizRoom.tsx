import { useRoom } from '@/contexts/RoomProvider';
import { Stack } from '@mui/material';
import QuestionEditor from './quiz/QuestionEditor';
import QuestionsProvider from '@/contexts/QuestionsProvider';
import QuestionsPreview from '@/components/rooms/quiz/QuestionsPreview';
import QuizPlay from './QuizPlay';

export interface QuizRoomProps {

}
export default function QuizRoom({ }: QuizRoomProps) {

    const { isHost, room } = useRoom();

    return (
        <QuestionsProvider>
            {room.status == "playing" || 1
                ? <QuizPlay />
                : (
                    <Stack flex={1}>
                        {isHost ? <QuestionEditor /> : <QuestionsPreview />}
                    </Stack>
                )}
        </QuestionsProvider>
    );
}