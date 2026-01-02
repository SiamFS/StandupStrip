"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // Initial load - only access localStorage after mount
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken) {
                setToken(storedToken);
            }
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user from local storage");
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (data: any) => {
        setIsLoading(true);
        try {
            const response: any = await ApiClient.post(ENDPOINTS.AUTH.LOGIN, data);
            const authToken = response.token;

            localStorage.setItem("token", authToken);
            setToken(authToken);

            // Backend returns { token, user: { id, email, name } }
            if (response.user) {
                const userObj = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name
                };
                localStorage.setItem("user", JSON.stringify(userObj));
                setUser(userObj);
            }

            router.push("/");
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            const response: any = await ApiClient.post(ENDPOINTS.AUTH.REGISTER, data);
            const authToken = response.token;

            localStorage.setItem("token", authToken);
            setToken(authToken);

            // Backend returns { token, user: { id, email, name } }
            if (response.user) {
                const userObj = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name
                };
                localStorage.setItem("user", JSON.stringify(userObj));
                setUser(userObj);
            }

            router.push("/");
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
