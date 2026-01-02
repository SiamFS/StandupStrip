"use client";

import { StandupResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface StandupListProps {
    standups: StandupResponse[];
    loading: boolean;
    currentUserId?: number;
    onDelete?: (standupId: number) => void;
}

export function StandupList({ standups, loading, currentUserId, onDelete }: StandupListProps) {
    if (loading) {
        return <div>Loading standups...</div>;
    }

    if (standups.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No standups for this date.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {standups.map((standup) => (
                <Card key={standup.id}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                                    {standup.userName ? standup.userName.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div>
                                    <CardTitle className="text-base">{standup.userName}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{new Date(standup.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            {currentUserId === standup.userId && onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => onDelete(standup.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <span className="font-semibold text-muted-foreground">Yesterday:</span>
                            <p className="mt-1">{standup.yesterdayText}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Today:</span>
                            <p className="mt-1">{standup.todayText}</p>
                        </div>
                        {standup.blockersText && (
                            <div>
                                <span className="font-semibold text-destructive">Blockers:</span>
                                <p className="mt-1">{standup.blockersText}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
