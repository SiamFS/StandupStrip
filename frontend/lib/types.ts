export interface UserResponse {
    id: number;
    name: string;
    email: string;
}

export interface Team {
    id: number;
    name: string;
    description?: string;
    ownerUserId: number;
    createdAt: string;
}

export interface StandupResponse {
    id: number;
    teamId: number;
    userId: number;
    userName: string;
    date: string;
    yesterdayText: string;
    todayText: string;
    blockersText: string;
    createdAt: string;
}

export interface StandupSummaryResponse {
    id: number;
    teamId: number;
    date: string;
    summaryText: string;
    generatedByAi: boolean;
    createdAt: string;
}
