export type User = {
    id: string;
    name: string;
    avatar: string;
    color?: string;
}

export type RoomType = "drawing" | "quiz";

export interface RoomData {
    id: string;
    name: string;
    type: RoomType;
    status: 'waiting' | 'prepared' | 'playing' | 'ended' | 'paused';
    createdAt: Date;
    createdBy: string;
    maxPlayers: number;
    currentPlayers: number;
    enableLeaderboard?: boolean;
    enableAiExpression?: boolean;
}

export interface QuestionOption {
    id: string;
    text: string;
    score?: number;
    correct: boolean;
}
export interface Question {
    id: string;
    text: string;
    multiple: boolean;
    options: QuestionOption[];
    duration: number;
}

export type Answer = {
    uid: string;
    questionId: string;
    optionsId: string[];
    timestamp: number;
    timeSpent: number;
}


export type ExpressionName = "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised" | "neutral";
export type ExpressionData = {
    [key in ExpressionName]: number;
}