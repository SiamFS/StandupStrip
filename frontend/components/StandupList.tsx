"use client";

import { StandupResponse, UserResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2, Pencil } from "lucide-react";

interface StandupListProps {
    standups: StandupResponse[];
    members?: UserResponse[];
    loading: boolean;
    currentUserId?: number;
    onDelete?: (standupId: number) => void;
    onEdit?: (standup: StandupResponse) => void;
    todayDate?: string;
}

export function StandupList({ standups, members, loading, currentUserId, onDelete, onEdit, todayDate }: StandupListProps) {
    if (loading) {
        return <div>Loading standups...</div>;
    }

    if (standups.length === 0 && (!members || members.length === 0)) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No standups for this date.</p>
            </div>
        )
    }

    const isToday = todayDate === new Date().toISOString().split('T')[0];

    // Identify pending members
    const pendingMembers = members ? members.filter(member =>
        !standups.some(s => s.userId === member.id)
    ) : [];

    return (
        <div className="space-y-4">
            {standups.map((standup) => {
                const isOwner = currentUserId === standup.userId;
                const canEdit = isOwner && isToday;

                return (
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
                                <div className="flex gap-1">
                                    {canEdit && onEdit && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => onEdit(standup)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {isOwner && onDelete && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => onDelete(standup.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
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
                );
            })}

            {/* Pending Members */}
            {isToday && pendingMembers.map(member => (
                <Card key={member.id} className="opacity-60 bg-muted/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-xs">
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <CardTitle className="text-base text-muted-foreground">{member.name}</CardTitle>
                                <p className="text-xs text-muted-foreground italic">⏳ No standup submitted</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
