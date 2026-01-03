"use client";

import { useState, useEffect } from "react";
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teamId: number;
    teamName: string;
}

export function DeleteTeamModal({ isOpen, onClose, onSuccess, teamId, teamName }: DeleteTeamModalProps) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password) {
            setError("Please enter your password to confirm.");
            return;
        }

        setLoading(true);

        try {
            // 1. Verify Password
            await ApiClient.post(ENDPOINTS.AUTH.VERIFY_PASSWORD, { password });

            // 2. Delete Team
            await ApiClient.delete(ENDPOINTS.TEAMS.DELETE(teamId));

            // 3. Success
            toast.success("Team deleted successfully");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Delete failed", err);
            // Attempt to read error message/status safely
            // Assuming ApiClient throws an object with status or message
            if (err?.status === 401 || err?.status === 403 || err?.message?.toLowerCase().includes("password")) {
                setError("Incorrect password. Please try again.");
            } else {
                setError(err?.message || "Failed to delete team. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Team
                </ResponsiveModalTitle>
                <ResponsiveModalDescription>
                    Are you sure you want to delete <span className="font-semibold text-foreground">{teamName}</span>?
                    This action is permanent and cannot be undone. All data will be lost.
                </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Enter your password to confirm</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={error ? "border-destructive ring-destructive" : ""}
                        autoFocus
                    />
                    {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                </div>

                <ResponsiveModalFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="destructive" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete Team
                    </Button>
                </ResponsiveModalFooter>
            </form>
        </ResponsiveModal>
    );
}
