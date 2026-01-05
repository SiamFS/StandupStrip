"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Trash2, ArrowLeft, Copy, Save, AlertTriangle, Calendar, Mail, FileText, Loader2, Eye } from "lucide-react";
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Team, UserResponse, WeeklySummaryResponse } from "@/lib/types";
import { toast } from "sonner";
import { DeleteTeamModal } from "@/components/DeleteTeamModal";

export default function TeamSettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const teamId = Number(params.id);

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamName, setTeamName] = useState("");
    const [saving, setSaving] = useState(false);

    // Weekly Summary state
    const [weeklySummaryLoading, setWeeklySummaryLoading] = useState(false);
    const [latestWeeklySummary, setLatestWeeklySummary] = useState<WeeklySummaryResponse | null>(null);
    const [isWeeklySummaryDialogOpen, setIsWeeklySummaryDialogOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchTeamData = async () => {
        try {
            const [teamData, membersData] = await Promise.all([
                ApiClient.get<Team>(ENDPOINTS.TEAMS.GET_BY_ID(teamId)),
                ApiClient.get<UserResponse[]>(ENDPOINTS.TEAMS.GET_MEMBERS(teamId))
            ]);

            // Verify ownership
            if (user && teamData.ownerUserId !== user.id) {
                router.push(`/teams/${teamId}`);
                return;
            }

            setTeam(teamData);
            setTeamName(teamData.name);
            setMembers(membersData);
        } catch (error) {
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchTeamData();
        } else if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, teamId]);

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim()) return;

        setSaving(true);
        try {
            const updatedTeam = await ApiClient.put<Team>(ENDPOINTS.TEAMS.UPDATE(teamId), { name: teamName });
            setTeam(updatedTeam);
            alert("Team updated successfully");
        } catch (error) {
            alert("Failed to update team");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTeam = () => {
        setShowDeleteModal(true);
    };

    const handleRemoveMember = async (userId: number) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await ApiClient.delete(ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, userId));
            setMembers(prev => prev.filter(m => m.id !== userId));
        } catch (e) {
            alert("Failed to remove member");
        }
    };

    const copyInviteCode = () => {
        if (team?.inviteCode) {
            navigator.clipboard.writeText(team.inviteCode);
            toast.success("Invite code copied!");
        }
    };

    const fetchLatestWeeklySummary = async () => {
        try {
            const summary = await ApiClient.get<WeeklySummaryResponse>(
                ENDPOINTS.WEEKLY_SUMMARIES.GET_LATEST(teamId)
            );
            setLatestWeeklySummary(summary);
        } catch (error) {
            // No summary found, that's OK
            setLatestWeeklySummary(null);
        }
    };

    const handleGenerateWeeklySummary = async () => {
        setWeeklySummaryLoading(true);
        try {
            const summary = await ApiClient.post<WeeklySummaryResponse>(
                ENDPOINTS.WEEKLY_SUMMARIES.GENERATE(teamId),
                {}
            );
            setLatestWeeklySummary(summary);
            toast.success("Weekly summary generated and sent to your email!");
            setIsWeeklySummaryDialogOpen(true);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to generate weekly summary";
            toast.error(message);
        } finally {
            setWeeklySummaryLoading(false);
        }
    };

    useEffect(() => {
        if (team) {
            fetchLatestWeeklySummary();
        }
    }, [team]);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-[60vh] items-center justify-center">
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </Layout>
        );
    }

    if (!team) return null;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push(`/teams/${teamId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Team
                    </Button>
                    <h1 className="text-2xl font-bold">Team Settings</h1>
                </div>

                <div className="grid gap-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Manage your team's basic information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateTeam} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="teamName">Team Name</Label>
                                    <Input
                                        id="teamName"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter team name"
                                    />
                                </div>
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Invite Code */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite Code</CardTitle>
                            <CardDescription>Share this code to invite members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 max-w-sm">
                                <div className="bg-muted px-4 py-2 rounded-md font-mono text-lg flex-1 text-center select-all">
                                    {team.inviteCode}
                                </div>
                                <Button variant="outline" onClick={copyInviteCode}>
                                    <Copy className="h-4 w-4 mr-2" /> Copy
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Member Management</CardTitle>
                            <CardDescription>Manage current team members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 gap-2">
                                        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs flex-shrink-0">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 truncate">
                                                <p className="font-medium truncate">{member.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                            </div>
                                        </div>
                                        {member.id !== user?.id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex-shrink-0"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                                            </Button>
                                        )}
                                        {member.id === user?.id && (
                                            <span className="text-xs text-muted-foreground italic flex-shrink-0">You (Owner)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Summary */}
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Weekly Summary
                            </CardTitle>
                            <CardDescription>
                                Generate an AI-powered summary of this week's standups and send it to your email
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {latestWeeklySummary && (
                                <div className="bg-background rounded-lg p-4 border">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium">Last Generated</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(latestWeeklySummary.weekStartDate).toLocaleDateString()} - {new Date(latestWeeklySummary.weekEndDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {latestWeeklySummary.sentToOwner && (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                    <Mail className="h-3 w-3" /> Sent
                                                </span>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 sm:flex-none"
                                                onClick={() => setIsWeeklySummaryDialogOpen(true)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Button
                                onClick={handleGenerateWeeklySummary}
                                disabled={weeklySummaryLoading}
                                className="w-full"
                            >
                                {weeklySummaryLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate & Send Weekly Summary
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Summarizes standups from the last 7 days and emails the summary to you.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Deleting this team will permanently remove all standups, summaries, and member associations. This action cannot be undone.
                            </p>
                            <Button variant="destructive" onClick={handleDeleteTeam}>
                                Delete Team
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Weekly Summary Dialog */}
            <ResponsiveModal open={isWeeklySummaryDialogOpen} onOpenChange={setIsWeeklySummaryDialogOpen}>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Weekly Summary
                    </ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        {latestWeeklySummary && (
                            <>
                                {new Date(latestWeeklySummary.weekStartDate).toLocaleDateString()} - {new Date(latestWeeklySummary.weekEndDate).toLocaleDateString()}
                            </>
                        )}
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none px-4 pb-6 overflow-y-auto max-h-[60vh] sm:max-h-96">
                    {latestWeeklySummary ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {latestWeeklySummary.summaryText}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground">No summary available.</p>
                    )}
                </div>
                <ResponsiveModalFooter>
                    <Button onClick={() => setIsWeeklySummaryDialogOpen(false)}>Close</Button>
                </ResponsiveModalFooter>
            </ResponsiveModal>

            {team && (
                <DeleteTeamModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={() => router.push("/")}
                    teamId={teamId}
                    teamName={team.name}
                />
            )}
        </Layout>
    );
}
