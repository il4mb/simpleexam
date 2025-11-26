export type User = {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
    lastSeen?: number;
    color?: string;
}

export type RoomType = "drawing" | "quiz";

export interface RoomData {
    id: string;
    name: string;
    type: RoomType;
    status: 'waiting' | 'playing' | 'ended' | 'closed';
    createdAt: Date;
    createdBy: string;
    maxPlayers: number;
    currentPlayers: number;
    enableLeaderboard?: boolean;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    duration: number;
    correctAnswer?: number;
}