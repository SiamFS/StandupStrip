"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { CreateTeamModal } from "@/components/CreateTeamModal";

interface Team {
    id: number;
    name: string;
    description?: string;
    members: any[];
}

export default function TeamsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchTeams = async () => {
        setError(null);
        try {
            const data = await ApiClient.get<Team[]>(ENDPOINTS.TEAMS.LIST);
            setTeams(data);
        } catch (err: any) {
            setError(err.message || "Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTeams();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    // Auth redirect logic
    if (!authLoading && !user) {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    // Show loading spinner during auth check
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
                    <p className="text-muted-foreground mt-1">View and manage all your teams</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Team
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={fetchTeams}>
                        Try Again
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading teams...</p>
                    </div>
                </div>
            ) : teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center border rounded-lg border-dashed p-12 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">No teams yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                        Get started by creating your first team to track daily standups and improve collaboration.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Team
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <Link key={team.id} href={`/teams/${team.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="line-clamp-2 mb-4">
                                        {team.description || "No description provided"}
                                    </CardDescription>
                                    <div className="flex items-center text-sm text-primary font-medium">
                                        View Team <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <CreateTeamModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTeams}
            />
        </Layout>
    );
}
