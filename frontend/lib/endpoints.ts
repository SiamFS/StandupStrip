export const API_BASE_URL = "";

export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        VERIFY_PASSWORD: "/api/auth/verify-password",
        RESEND_VERIFICATION: "/api/auth/resend-verification",
    },
    USERS: {
        GET_BY_ID: (id: number) => `/api/users/${id}`,
        UPDATE: (id: number) => `/api/users/${id}`,
    },
    TEAMS: {
        LIST: "/api/teams",
        CREATE: "/api/teams",
        GET_BY_ID: (id: number) => `/api/teams/${id}`,
        UPDATE: (id: number) => `/api/teams/${id}`,
        DELETE: (id: number) => `/api/teams/${id}`,
        ADD_MEMBER: (teamId: number) => `/api/teams/${teamId}/members`,
        GET_MEMBERS: (teamId: number) => `/api/teams/${teamId}/members`,
        REMOVE_MEMBER: (teamId: number, userId: number) => `/api/teams/${teamId}/members/${userId}`,
        GET_BY_INVITE_CODE: (code: string) => `/api/teams/join/${code}`,
        JOIN_BY_CODE: (code: string) => `/api/teams/join/${code}`,
    },
    STANDUPS: {
        CREATE: (teamId: number) => `/api/standups/teams/${teamId}`,
        UPDATE: (standupId: number) => `/api/standups/${standupId}`,
        DELETE: (standupId: number) => `/api/standups/${standupId}`,
        GET_BY_DATE: (teamId: number, date: string) => `/api/standups/teams/${teamId}?date=${date}`,
        GET_BY_RANGE: (teamId: number, startDate: string, endDate: string) =>
            `/api/standups/teams/${teamId}/range?startDate=${startDate}&endDate=${endDate}`,
    },
    SUMMARIES: {
        GENERATE: (teamId: number, date: string) => `/api/summaries/teams/${teamId}/generate?date=${date}`,
        GET_BY_DATE: (teamId: number, date: string) => `/api/summaries/teams/${teamId}?date=${date}`,
        GET_BY_RANGE: (teamId: number, startDate: string, endDate: string) =>
            `/api/summaries/teams/${teamId}/range?startDate=${startDate}&endDate=${endDate}`,
    },
    STATS: {
        HEATMAP: (teamId: number) => `/api/stats/teams/${teamId}/heatmap`,
    },
    WEEKLY_SUMMARIES: {
        GENERATE: (teamId: number) => `/api/weekly-summaries/teams/${teamId}/generate`,
        GET_ALL: (teamId: number) => `/api/weekly-summaries/teams/${teamId}`,
        GET_LATEST: (teamId: number) => `/api/weekly-summaries/teams/${teamId}/latest`,
    },
    REMINDERS: {
        SEND_TO_MEMBER: (teamId: number, userId: number) =>
            `/api/reminders/teams/${teamId}/members/${userId}`,
        SEND_TO_ALL_PENDING: (teamId: number) =>
            `/api/reminders/teams/${teamId}/all-pending`,
    },
};
