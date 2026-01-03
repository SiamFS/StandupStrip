"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Save, BadgeCheck, AlertTriangle, Send } from "lucide-react";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, isLoading: authLoading, updateUser } = useAuth();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [resending, setResending] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            setName(user.name || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!user) return;

        setSaving(true);
        try {
            await ApiClient.put(ENDPOINTS.USERS.UPDATE(user.id), { name: name.trim() });
            updateUser({ name: name.trim() });
            toast.success("Profile updated successfully!");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to update profile";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleResendVerification = async () => {
        setResending(true);
        try {
            await ApiClient.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, {});
            toast.success("Verification email sent! Please check your inbox.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send verification email";
            toast.error(message);
        } finally {
            setResending(false);
        }
    };

    // Redirect if not authenticated
    if (!authLoading && !user) {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return null;
    }

    if (authLoading || !mounted) {
        return (
            <Layout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account information</p>
                </div>

                {/* Profile Info */}
                <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {user?.name}
                                    {user?.verified && (
                                        <BadgeCheck className="h-5 w-5 text-blue-500" />
                                    )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Mail className="h-3 w-3" />
                                    {user?.email}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    {!user?.verified && (
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Email not verified</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleResendVerification}
                                    disabled={resending}
                                    className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                                >
                                    <Send className="h-3 w-3 mr-1" />
                                    {resending ? "Sending..." : "Resend Email"}
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Edit Profile */}
                <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted transition-all duration-200"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="transition-all duration-200"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} disabled={saving || name === user?.name}>
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Account Info */}
                <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            <p>User ID: {user?.id}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
