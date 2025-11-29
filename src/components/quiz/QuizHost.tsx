import { RoomData } from '@/types';
import QuizHostPrepared from './QuizHostPrepared';
import QuizHostLobby from './QuizHostLobby';

export interface QuizHostProps {
    room: RoomData;
    isInLobby: boolean;
}
export default function QuizHost({ room, isInLobby }: QuizHostProps) {

    if (!isInLobby) {
        return (
            <QuizHostPrepared />
        )
    }

    return (<QuizHostLobby />);
}