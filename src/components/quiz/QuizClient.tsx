import QuizClientLobby from './QuizClientLobby';
import QuizClientPrepared from './QuizClientPrepared';

export interface QuizClientProps {
    isInLobby: boolean;
}
export default function QuizClient({ isInLobby }: QuizClientProps) {

    if (!isInLobby) {
        return (<QuizClientPrepared />);
    }
    return (
        <QuizClientLobby />
    );
}