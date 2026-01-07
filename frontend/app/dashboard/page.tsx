"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    Users,
    ArrowRight,
    CheckCircle2,
    Clock,
    TrendingUp,
    Sparkles,
    Calendar
} from "lucide-react";
import Link from "next/link";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { getLocalDateFormat } from "@/lib/date";

interface TeamMember {
    userId: number;
    name: string;
    email: string;
}

interface StandupSubmission {
    id: number;
    userId: number;
    teamId: number;
    standupDate: string;
}

interface Team {
    id: number;
    name: string;
    description?: string;
    ownerUserId: number;
}

interface TeamStatus {
    team: Team;
    hasSubmittedToday: boolean;
    standupCount: number;
    memberCount: number;
}

export default function Dashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const [teamsStatus, setTeamsStatus] = useState<TeamStatus[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [teams, invitations] = await Promise.all([
                ApiClient.get<Team[]>(ENDPOINTS.TEAMS.LIST),
                ApiClient.get<Team[]>(ENDPOINTS.TEAMS.MY_PENDING_INVITATIONS)
            ]);
            const today = getLocalDateFormat();

            setPendingInvitations(invitations);

            const statusPromises = teams.map(async (team) => {
                const [standups, members] = await Promise.all([
                    ApiClient.get<StandupSubmission[]>(ENDPOINTS.STANDUPS.GET_BY_DATE(team.id, today)),
                    ApiClient.get<TeamMember[]>(ENDPOINTS.TEAMS.GET_MEMBERS(team.id))
                ]);

                return {
                    team,
                    hasSubmittedToday: standups.some(s => s.userId === user?.id),
                    standupCount: standups.length,
                    memberCount: members.length
                };
            });

            const results = await Promise.all(statusPromises);
            setTeamsStatus(results);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvitation = async (teamId: number) => {
        try {
            await ApiClient.post(ENDPOINTS.TEAMS.ACCEPT_INVITATION(teamId), {});
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error("Failed to accept invitation", error);
        }
    };

    const handleRejectInvitation = async (teamId: number) => {
        try {
            await ApiClient.post(ENDPOINTS.TEAMS.REJECT_INVITATION(teamId), {});
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error("Failed to reject invitation", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        } else if (!authLoading) {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    if (authLoading || (user && loading)) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </Layout>
        );
    }

    if (!user) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return null;
    }

    const submittedCount = teamsStatus.filter(t => t.hasSubmittedToday).length;
    const pendingTeams = teamsStatus.filter(t => !t.hasSubmittedToday);
    const totalParticipation = teamsStatus.length > 0
        ? Math.round((teamsStatus.reduce((acc, curr) => acc + curr.standupCount, 0) /
            teamsStatus.reduce((acc, curr) => acc + curr.memberCount, 0)) * 100) || 0
        : 0;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Good day, {user.name} 👋</h1>
                        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening across your teams today.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Team
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submittedCount} / {teamsStatus.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Teams updated today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Spirit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalParticipation}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Average participation rate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingTeams.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Teams needing your update</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Needed Section */}
                {pendingTeams.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Action Needed
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingTeams.map((status) => (
                                <Link key={status.team.id} href={`/teams/${status.team.id}`}>
                                    <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-200 group">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{status.team.name}</h3>
                                                <div className="p-1 px-2 rounded bg-amber-500/20 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                                                    Pending
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">You haven&apos;t shared your update for today yet.</p>
                                            <div className="flex items-center text-sm font-medium text-amber-600 group-hover:translate-x-1 transition-transform">
                                                Go to standup <ArrowRight className="ml-1 h-3 w-3" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Pending Invitations Section */}
                {pendingInvitations.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Pending Invitations
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingInvitations.map((team) => (
                                <Card key={team.id} className="border-blue-500/30 bg-blue-500/5">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{team.name}</h3>
                                            <div className="p-1 px-2 rounded bg-blue-500/20 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                                Invitation
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">You've been invited to join this team.</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAcceptInvitation(team.id)} className="flex-1">
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleRejectInvitation(team.id)} className="flex-1">
                                                Decline
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent / Active Teams */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">My Active Teams</h2>
                        <Link href="/teams" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {teamsStatus.length === 0 ? (
                            <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center bg-muted/30">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">Join a team to get started</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    Collaborate with your teammates, share updates, and get AI-powered standup summaries.
                                </p>
                                <div className="flex gap-3">
                                    <Link href="/join">
                                        <Button variant="outline">Join Team</Button>
                                    </Link>
                                    <Button onClick={() => setIsCreateModalOpen(true)}>Create Team</Button>
                                </div>
                            </Card>
                        ) : (
                            // Show first 6 teams as active/recent
                            teamsStatus.slice(0, 6).map((status) => (
                                <Link key={status.team.id} href={`/teams/${status.team.id}`}>
                                    <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group h-full">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl underline-offset-4 group-hover:underline">{status.team.name}</CardTitle>
                                                {status.hasSubmittedToday ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <CardDescription className="line-clamp-1">{status.team.description || "No description provided"}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {status.memberCount} members
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {status.standupCount} updates today
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                <CreateTeamModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchDashboardData}
                />
            </div>
        </Layout>
    );
}
