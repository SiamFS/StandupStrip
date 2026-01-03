"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, Calendar, Plus, Trash2, Settings, FileText, Copy, Check, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { AddMemberModal } from "@/components/AddMemberModal";
import { CreateStandupModal } from "@/components/CreateStandupModal";
import { EditStandupModal } from "@/components/EditStandupModal";
import { StandupList } from "@/components/StandupList";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Team, UserResponse, StandupResponse, StandupSummaryResponse } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatsCards } from "@/components/StatsCards";
import ParticipationHeatmap from "@/components/ParticipationHeatmap";
import { getLocalDateFormat } from "@/lib/date";

export default function TeamDetailsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const params = useParams();
    const teamId = Number(params.id);

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<UserResponse[]>([]);
    const [standups, setStandups] = useState<StandupResponse[]>([]);
    const [date, setDate] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setDate(getLocalDateFormat());
    }, []);

    const [loading, setLoading] = useState(true);
    const [standupsLoading, setStandupsLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isCreateStandupOpen, setIsCreateStandupOpen] = useState(false);

    const [summary, setSummary] = useState<StandupSummaryResponse | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);
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
            toast.error("Failed to load team data");
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
        setSummaryError(null);
        try {
            const data = await ApiClient.post<StandupSummaryResponse>(ENDPOINTS.SUMMARIES.GENERATE(teamId, date), {});
            setSummary(data);
            setSummaryError(null);
            setIsSummaryOpen(true);
            toast.success("Summary generated successfully!");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to generate summary";
            setSummaryError(message);
            setIsSummaryOpen(true);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleViewSummary = () => {
        setIsSummaryOpen(true);
    };

    const handleCopyInviteCode = async () => {
        if (team?.inviteCode) {
            await navigator.clipboard.writeText(team.inviteCode);
            setCopied(true);
            toast.success("Invite code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
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
            toast.success("Member removed successfully");
            fetchTeamData();
        } catch (e) {
            toast.error("Failed to remove member");
        }
    };

    const handleRemoveStandup = async (standupId: number) => {
        if (!confirm("Are you sure you want to delete this standup?")) {
            return;
        }
        try {
            await ApiClient.delete(ENDPOINTS.STANDUPS.DELETE(standupId));
            toast.success("Standup deleted successfully");
            fetchStandups();
        } catch (e) {
            toast.error("Failed to delete standup");
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
                <div className="flex h-[60vh] flex-col items-center justify-center animate-in fade-in-0 duration-300">
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
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
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
                                    className="h-7 px-2 transition-all duration-200"
                                    onClick={handleCopyInviteCode}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1 text-green-500" /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-1" /> Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {(() => {
                            const hasSubmittedToday = standups.some(s => s.userId === user?.id);
                            const isToday = date === getLocalDateFormat();
                            return (
                                <Button
                                    onClick={() => setIsCreateStandupOpen(true)}
                                    disabled={hasSubmittedToday && isToday}
                                >
                                    {hasSubmittedToday && isToday ? (
                                        <><Check className="mr-2 h-4 w-4" /> Standup Submitted</>
                                    ) : (
                                        <><Plus className="mr-2 h-4 w-4" /> Submit Standup</>
                                    )}
                                </Button>
                            );
                        })()}
                        {isOwner && (
                            <Link href={`/teams/${teamId}/settings`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Analytics Stats Cards */}
                <StatsCards
                    totalMembers={members.length}
                    submittedCount={standups.length}
                    pendingCount={members.length - standups.length}
                    hasBlockers={standups.some(s => s.blockersText && s.blockersText.trim().length > 0)}
                    date={date}
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Members Card */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1 h-fit hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {members.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={cn(
                                            "flex items-center justify-between animate-in fade-in-0 slide-in-from-left-2",
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/20 text-primary font-medium text-sm">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.id === team.ownerUserId && (
                                                <Badge variant="secondary">Owner</Badge>
                                            )}
                                            {isOwner && member.id !== user?.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
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
                    <Card className="col-span-1 md:col-span-2 lg:col-span-2 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Daily Standups</CardTitle>
                                <CardDescription>Updates from the team</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-auto transition-all duration-200"
                                />
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDate(getLocalDateFormat())}
                                        className={cn(
                                            "transition-all duration-200",
                                            date === getLocalDateFormat() && 'bg-primary/10'
                                        )}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            setDate(getLocalDateFormat(yesterday));
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

                <ParticipationHeatmap teamId={teamId} />
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

            <Dialog open={isSummaryOpen} onOpenChange={(open) => { setIsSummaryOpen(open); if (!open) setSummaryError(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {summaryError ? "Summary Generation Failed" : `Summary for ${new Date(date).toLocaleDateString()}`}
                        </DialogTitle>
                        <DialogDescription>
                            {summaryError ? "An error occurred while generating the AI summary" : (summary?.generatedByAi ? "AI Generated Summary" : "Team Summary")}
                        </DialogDescription>
                    </DialogHeader>
                    {summaryError ? (
                        <div className="flex flex-col items-center gap-4 p-6">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-destructive font-medium">Error</p>
                                <p className="text-sm text-muted-foreground">{summaryError}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {summary ? (
                                <article className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {summary.summaryText}
                                    </ReactMarkdown>
                                </article>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4">No summary available.</p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        {summaryError && (
                            <Button variant="outline" onClick={() => { setSummaryError(null); handleGenerateSummary(); }}>
                                Retry
                            </Button>
                        )}
                        <Button onClick={() => setIsSummaryOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </Layout>
    );
}
