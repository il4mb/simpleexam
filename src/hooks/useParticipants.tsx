import { createContext, useContext } from "react";
import { User } from "@/types";

export interface Participant extends User {
    status: 'active' | 'pending' | 'left';
    joinedAt?: number;
    lastSeen: number;
}

export type ParticipantsState = {
    participants: Participant[];
    activeParticipants: Participant[];
    pendingParticipants: Participant[];
    getParticipant: (userId: string) => Participant | undefined;
    removeUser: (userId: string) => void;
    approveUser: (userId: string) => void;
    rejectUser: (userId: string) => void;
    autoApproveAll: () => void;
    hasPendingUsers: boolean;
    participantCount: number;
    pendingCount: number;
}
export const ParticipantsContext = createContext<ParticipantsState | undefined>(undefined);



export const useParticipants = () => {
    const ctx = useContext(ParticipantsContext);
    if (!ctx) throw new Error("useParticipants should call inside <ParticipantsProvider/>");
    return ctx;
}