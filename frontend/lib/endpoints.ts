export const API_BASE_URL = "";

export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
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
};
