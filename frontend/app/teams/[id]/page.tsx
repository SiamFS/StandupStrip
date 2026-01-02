"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Users, Calendar, Plus, Trash2, Settings, FileText, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { AddMemberModal } from "@/components/AddMemberModal";
import { CreateStandupModal } from "@/components/CreateStandupModal";
import { EditStandupModal } from "@/components/EditStandupModal";
import { StandupList } from "@/components/StandupList";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Team, UserResponse, StandupResponse, StandupSummaryResponse } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function TeamDetailsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const params = useParams();
    const teamId = Number(params.id);

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<UserResponse[]>([]);
    const [standups, setStandups] = useState<StandupResponse[]>([]);
    const [date, setDate] = useState<string>("");

    useEffect(() => {
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    const [loading, setLoading] = useState(true);
    const [standupsLoading, setStandupsLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isCreateStandupOpen, setIsCreateStandupOpen] = useState(false);

    const [summary, setSummary] = useState<StandupSummaryResponse | null>(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const [editingStandup, setEditingStandup] = useState<StandupResponse | null>(null);

    const fetchTeamData = async () => {
        try {
            const [teamData, membersData] = await Promise.all([
                ApiClient.get<Team>(ENDPOINTS.TEAMS.GET_BY_ID(teamId)),
                ApiClient.get<UserResponse[]>(ENDPOINTS.TEAMS.GET_MEMBERS(teamId))
            ]);
            setTeam(teamData);
            setMembers(membersData);
        } catch (error) {
            // Error fetching team data
        } finally {
            setLoading(false);
        }
    };

    const fetchStandups = async () => {
        setStandupsLoading(true);
        try {
            const data = await ApiClient.get<StandupResponse[]>(ENDPOINTS.STANDUPS.GET_BY_DATE(teamId, date));
            setStandups(data);
        } catch (error) {
            setStandups([]);
        } finally {
            setStandupsLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const data = await ApiClient.get<StandupSummaryResponse>(ENDPOINTS.SUMMARIES.GET_BY_DATE(teamId, date));
            if (data && data.summaryText) {
                setSummary(data);
            } else {
                setSummary(null);
            }
        } catch (error) {
            setSummary(null);
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        try {
            const data = await ApiClient.post<StandupSummaryResponse>(ENDPOINTS.SUMMARIES.GENERATE(teamId, date), {});
            setSummary(data);
            setIsSummaryOpen(true);
        } catch (error: any) {
            alert("Failed to generate summary: " + error.message);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleViewSummary = () => {
        setIsSummaryOpen(true);
    };

    useEffect(() => {
        if (user && teamId) {
            fetchTeamData();
        }
    }, [user, teamId]);

    useEffect(() => {
        if (user && teamId) {
            fetchStandups();
            fetchSummary();
        }
    }, [user, teamId, date]);

    const handleRemoveMember = async (userId: number) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await ApiClient.delete(ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, userId));
            fetchTeamData();
        } catch (e) {
            alert("Failed to remove member");
        }
    };

    const handleRemoveStandup = async (standupId: number) => {
        console.log('Delete clicked for standup ID:', standupId);
        if (!confirm("Are you sure you want to delete this standup?")) {
            console.log('Delete cancelled by user');
            return;
        }
        console.log('Proceeding with delete...');
        try {
            await ApiClient.delete(ENDPOINTS.STANDUPS.DELETE(standupId));
            console.log('Delete successful');
            fetchStandups();
        } catch (e) {
            console.error('Delete failed:', e);
            alert("Failed to delete standup");
        }
    };

    // Redirect to login if not authenticated
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

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading team...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!team) {
        return (
            <Layout>
                <div className="flex h-[60vh] flex-col items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Team not found</h2>
                        <p className="text-muted-foreground mb-4">The team you're looking for doesn't exist or you don't have access.</p>
                        <Button onClick={() => window.location.href = "/"}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const isOwner = user?.id === team.ownerUserId;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        <p className="text-muted-foreground">
                            Created on {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                        {isOwner && team.inviteCode && (
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-muted-foreground mr-2">Invite Code:</span>
                                <code className="bg-muted px-2 py-1 rounded text-sm font-mono mr-2">{team.inviteCode}</code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => {
                                        navigator.clipboard.writeText(team.inviteCode || "");
                                        // Ideally show a toast here, but simple alert or changing button text is fine for MVP
                                    }}
                                >
                                    <Copy className="h-3 w-3 mr-1" /> Copy
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsCreateStandupOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Submit Standup
                        </Button>
                        {isOwner && (
                            <Link href={`/teams/${teamId}/settings`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Members Card */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1 h-fit">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        {isOwner && member.id !== user?.id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {member.id === team.ownerUserId && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Owner</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        {isOwner && (
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => setIsAddMemberOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Member
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    {/* Standups Overview */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Daily Standups</CardTitle>
                                <CardDescription>Updates from the team</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-auto"
                                />
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDate(new Date().toISOString().split('T')[0])}
                                        className={date === new Date().toISOString().split('T')[0] ? 'bg-primary/10' : ''}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            setDate(yesterday.toISOString().split('T')[0]);
                                        }}
                                    >
                                        Yesterday
                                    </Button>
                                </div>
                                {summary ? (
                                    <Button variant="outline" size="sm" onClick={handleViewSummary}>
                                        <FileText className="mr-2 h-4 w-4" /> View Summary
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={handleGenerateSummary} disabled={summaryLoading || standups.length === 0}>
                                        <FileText className="mr-2 h-4 w-4" /> {summaryLoading ? "Generating..." : "Generate Summary"}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <StandupList
                                standups={standups}
                                members={members}
                                loading={standupsLoading}
                                currentUserId={user?.id}
                                onDelete={handleRemoveStandup}
                                onEdit={setEditingStandup}
                                todayDate={date}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                onSuccess={fetchTeamData}
                teamId={teamId}
            />

            <CreateStandupModal
                isOpen={isCreateStandupOpen}
                onClose={() => setIsCreateStandupOpen(false)}
                onSuccess={() => { fetchStandups(); fetchSummary(); }}
                teamId={teamId}
            />

            {editingStandup && (
                <EditStandupModal
                    isOpen={!!editingStandup}
                    onClose={() => setEditingStandup(null)}
                    onSuccess={() => { fetchStandups(); fetchSummary(); }}
                    standup={editingStandup}
                />
            )}

            <Modal
                isOpen={isSummaryOpen}
                onClose={() => setIsSummaryOpen(false)}
                title={`Summary for ${new Date(date).toLocaleDateString()}`}
                description={summary?.generatedByAi ? "AI Generated Summary" : "Team Summary"}
            >
                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted/50 rounded-md">
                    {summary ? summary.summaryText : "No summary available."}
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setIsSummaryOpen(false)}>Close</Button>
                </div>
            </Modal>

        </Layout>
    );
}
