"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, ArrowRight, Shield, User, Search, Filter, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";

interface Team {
    id: number;
    name: string;
    description?: string;
    ownerUserId: number;
    createdAt: string;
}

interface TeamMember {
    userId: number;
    name: string;
    email: string;
}

interface TeamWithMetadata extends Team {
    memberCount: number;
}

export default function TeamsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [teams, setTeams] = useState<TeamWithMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchTeams = async () => {
        try {
            const data = await ApiClient.get<Team[]>(ENDPOINTS.TEAMS.LIST);

            // Fetch member counts for each team to display richer info in the list
            const enrichedTeams = await Promise.all(
                data.map(async (team) => {
                    const members = await ApiClient.get<TeamMember[]>(ENDPOINTS.TEAMS.GET_MEMBERS(team.id));
                    return { ...team, memberCount: members.length };
                })
            );

            setTeams(enrichedTeams);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load teams";
            toast.error(message);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    if (!authLoading && !user) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return null;
    }

    if (authLoading || (user && loading)) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                    </div>
                </div>
            </Layout>
        );
    }

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ownedTeams = filteredTeams.filter(t => t.ownerUserId === user?.id);
    const joinedTeams = filteredTeams.filter(t => t.ownerUserId !== user?.id);

    const TeamListSection = ({ title, teamsList, icon: Icon }: { title: string, teamsList: TeamWithMetadata[], icon: React.ElementType }) => (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
                <Badge variant="secondary" className="ml-2 font-mono">{teamsList.length}</Badge>
            </h2>
            <div className="space-y-3">
                {teamsList.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 border border-dashed rounded-xl text-muted-foreground text-sm">
                        No teams found in this section.
                    </div>
                ) : (
                    teamsList.map((team) => (
                        <Link key={team.id} href={`/teams/${team.id}`} className="block group">
                            <Card className="hover:border-primary transition-all duration-200 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                        {team.name}
                                                    </h3>
                                                    {team.ownerUserId === user?.id && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-1.5 py-0 text-[10px] h-4">
                                                            Owner
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {team.description || "No team description set."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-3 md:pt-0">
                                            <div className="flex gap-4 items-center">
                                                <div className="text-center md:text-right">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Members</p>
                                                    <p className="font-semibold">{team.memberCount}</p>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Joined</p>
                                                    <p className="font-semibold text-sm">
                                                        {new Date(team.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in-0 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team Library</h1>
                        <p className="text-muted-foreground mt-1">Manage and access all workspaces you belong to.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/join">
                            <Button variant="outline">Join with Code</Button>
                        </Link>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Team
                        </Button>
                    </div>
                </div>

                {/* Filters / Search */}
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or description..."
                                className="pl-9 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" className="sm:w-auto h-10 px-4 gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </CardContent>
                </Card>

                {/* Teams Sections */}
                <div className="space-y-12">
                    <TeamListSection
                        title="Teams I Lead"
                        teamsList={ownedTeams}
                        icon={Shield}
                    />

                    <TeamListSection
                        title="Collaborating In"
                        teamsList={joinedTeams}
                        icon={User}
                    />
                </div>

                {teams.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-20 text-center bg-card">
                        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                            <LayoutDashboard className="h-10 w-10 text-primary/40" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Find your space</h2>
                        <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                            You haven&apos;t joined any teams yet. Create your own space or join an existing one using an invite code.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/join">
                                <Button size="lg" variant="outline">Join Team</Button>
                            </Link>
                            <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Team
                            </Button>
                        </div>
                    </div>
                )}

                <CreateTeamModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchTeams}
                />
            </div>
        </Layout>
    );
}
