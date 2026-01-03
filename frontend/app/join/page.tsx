"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { Team } from "@/lib/types";
import { Users, Check, LogIn, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function JoinTeamContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();

    const [code, setCode] = useState(searchParams.get("code") || "");
    const [teamPreview, setTeamPreview] = useState<Team | null>(null);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleLookup = async () => {
        if (!code.trim()) {
            setError("Please enter an invite code");
            toast.error("Please enter an invite code");
            return;
        }
        setError(null);
        setTeamPreview(null);
        setLoading(true);
        try {
            const team = await ApiClient.get<Team>(ENDPOINTS.TEAMS.GET_BY_INVITE_CODE(code.trim().toUpperCase()));
            setTeamPreview(team);
            toast.success(`Found team: ${team.name}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Invalid invite code";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!teamPreview) return;
        setJoining(true);
        setError(null);
        try {
            await ApiClient.post(ENDPOINTS.TEAMS.JOIN_BY_CODE(code.trim().toUpperCase()), {});
            setSuccess(`Successfully joined ${teamPreview.name}!`);
            toast.success(`Successfully joined ${teamPreview.name}!`);
            setTimeout(() => {
                router.push(`/teams/${teamPreview.id}`);
            }, 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to join team";
            setError(message);
            toast.error(message);
        } finally {
            setJoining(false);
        }
    };

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
                    <CardHeader className="text-center">
                        <CardTitle>Login Required</CardTitle>
                        <CardDescription>You need to be logged in to join a team</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Link href={`/login?redirect=/join?code=${code}`}>
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
                    <CardTitle>Join a Team</CardTitle>
                    <CardDescription>Enter the invite code to join an existing team</CardDescription>
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
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="code">Invite Code</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        id="code"
                                        placeholder="e.g. ABC12345"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        className="font-mono tracking-wider transition-all duration-200"
                                        maxLength={8}
                                    />
                                    <Button onClick={handleLookup} disabled={loading || !code.trim()} className="w-full sm:w-auto">
                                        <Search className="mr-2 h-4 w-4" />
                                        {loading ? "Looking..." : "Lookup"}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md animate-in fade-in-0 slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            {teamPreview && (
                                <div className={cn(
                                    "border rounded-lg p-4 bg-muted/30 space-y-3",
                                    "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                                )}>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Team Name</p>
                                        <p className="font-medium text-lg">{teamPreview.name}</p>
                                    </div>
                                    <Button className="w-full" onClick={handleJoin} disabled={joining}>
                                        {joining ? "Joining..." : "Join Team"}
                                    </Button>
                                </div>
                            )}

                            <div className="text-center pt-4 border-t">
                                <Link href="/teams" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    ← Back to Teams
                                </Link>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function JoinTeamPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <JoinTeamContent />
        </Suspense>
    );
}
