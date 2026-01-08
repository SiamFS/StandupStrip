"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { Team } from "@/lib/types";
import { Users, Check, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function JoinTeamByCodePage() {
    const router = useRouter();
    const params = useParams();
    const { user, isLoading: authLoading } = useAuth();
    const code = (params.code as string)?.toUpperCase();

    const [teamPreview, setTeamPreview] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPendingInvitation, setIsPendingInvitation] = useState(false);

    // Auto-lookup team on page load
    useEffect(() => {
        if (!code || authLoading) return;

        const lookupTeam = async () => {
            try {
                const team = await ApiClient.get<Team>(ENDPOINTS.TEAMS.GET_BY_INVITE_CODE(code));
                setTeamPreview(team);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Invalid invite code";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            lookupTeam();
        } else {
            setLoading(false);
        }
    }, [code, user, authLoading]);

    const handleJoin = async () => {
        if (!teamPreview) return;
        setJoining(true);
        setError(null);
        setIsPendingInvitation(false);
        try {
            await ApiClient.post(ENDPOINTS.TEAMS.JOIN_BY_CODE(code), {});
            setSuccess(`Successfully joined ${teamPreview.name}!`);
            toast.success(`Successfully joined ${teamPreview.name}!`);
            setTimeout(() => {
                router.push(`/teams/${teamPreview.id}`);
            }, 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to join team";
            // Check if this is a pending invitation error
            if (message.toLowerCase().includes("pending invitation")) {
                setIsPendingInvitation(true);
            }
            setError(message);
            toast.error(message);
        } finally {
            setJoining(false);
        }
    };

    const handleAcceptInvitation = async () => {
        if (!teamPreview) return;
        setAccepting(true);
        setError(null);
        try {
            await ApiClient.post(ENDPOINTS.TEAMS.ACCEPT_INVITATION(teamPreview.id), {});
            setSuccess(`Successfully joined ${teamPreview.name}!`);
            toast.success(`Invitation accepted! Welcome to ${teamPreview.name}!`);
            setTimeout(() => {
                router.push(`/teams/${teamPreview.id}`);
            }, 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to accept invitation";
            setError(message);
            toast.error(message);
        } finally {
            setAccepting(false);
        }
    };

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Login Required</CardTitle>
                        <CardDescription>You need to be logged in to join a team</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Link href={`/login?redirect=/join/${code}`}>
                            <Button className="w-full">
                                <LogIn className="mr-2 h-4 w-4" /> Login to Continue
                            </Button>
                        </Link>
                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Register
                            </Link>
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                            Invite code: <code className="bg-muted px-2 py-1 rounded font-mono">{code}</code>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Looking up team...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Join Team</CardTitle>
                    <CardDescription>
                        Invite code: <code className="bg-muted px-2 py-1 rounded font-mono">{code}</code>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {success ? (
                        <div className="text-center space-y-4 animate-in fade-in-0 zoom-in-95 duration-300">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-green-600 font-medium">{success}</p>
                            <p className="text-sm text-muted-foreground">Redirecting...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center space-y-4 animate-in fade-in-0 duration-300">
                            <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                                {isPendingInvitation
                                    ? "You have a pending invitation to this team."
                                    : error}
                            </div>
                            {isPendingInvitation && teamPreview ? (
                                <Button
                                    className="w-full"
                                    onClick={handleAcceptInvitation}
                                    disabled={accepting}
                                >
                                    {accepting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Accept Invitation
                                        </>
                                    )}
                                </Button>
                            ) : null}
                            <Link href="/join">
                                <Button variant="outline" className="w-full">
                                    Try a Different Code
                                </Button>
                            </Link>
                        </div>
                    ) : teamPreview ? (
                        <div className={cn(
                            "border rounded-lg p-4 bg-muted/30 space-y-3",
                            "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                        )}>
                            <div>
                                <p className="text-sm text-muted-foreground">Team Name</p>
                                <p className="font-medium text-lg">{teamPreview.name}</p>
                            </div>
                            <Button className="w-full" onClick={handleJoin} disabled={joining}>
                                {joining ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "Join Team"
                                )}
                            </Button>
                        </div>
                    ) : null}

                    <div className="text-center pt-4 border-t">
                        <Link href="/teams" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            ← Back to Teams
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
