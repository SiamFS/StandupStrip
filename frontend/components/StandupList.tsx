"use client";

import { StandupResponse, UserResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Trash2, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandupListProps {
    standups: StandupResponse[];
    members?: UserResponse[];
    loading: boolean;
    currentUserId?: number;
    onDelete?: (standupId: number) => void;
    onEdit?: (standup: StandupResponse) => void;
    todayDate?: string;
}

function StandupSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );
}

export function StandupList({ standups, members, loading, currentUserId, onDelete, onEdit, todayDate }: StandupListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <StandupSkeleton />
                <StandupSkeleton />
            </div>
        );
    }

    if (standups.length === 0 && (!members || members.length === 0)) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg animate-in fade-in-0 duration-300">
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
            {standups.map((standup, index) => {
                const isOwner = currentUserId === standup.userId;
                const canEdit = isOwner && isToday;

                return (
                    <Card
                        key={standup.id}
                        className={cn(
                            "hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2",
                            "transition-all duration-200"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                            {standup.userName ? standup.userName.charAt(0).toUpperCase() : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{standup.userName}</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(standup.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {canEdit && onEdit && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
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
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                            onClick={() => onDelete(standup.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="space-y-1">
                                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Yesterday</span>
                                <p className="leading-relaxed">{standup.yesterdayText}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Today</span>
                                <p className="leading-relaxed">{standup.todayText}</p>
                            </div>
                            {standup.blockersText && (
                                <>
                                    <Separator />
                                    <div className="space-y-1">
                                        <span className="font-semibold text-destructive text-xs uppercase tracking-wide">Blockers</span>
                                        <p className="leading-relaxed">{standup.blockersText}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Pending Members */}
            {isToday && pendingMembers.length > 0 && (
                <>
                    <div className="flex items-center gap-2 pt-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                            Waiting for updates
                        </span>
                    </div>
                    {pendingMembers.map((member, index) => (
                        <Card
                            key={member.id}
                            className={cn(
                                "opacity-60 bg-muted/30 border-dashed",
                                "animate-in fade-in-0 slide-in-from-bottom-2"
                            )}
                            style={{ animationDelay: `${(standups.length + index) * 50}ms` }}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                            {member.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base text-muted-foreground">
                                            {member.name}
                                        </CardTitle>
                                        <Badge variant="secondary" className="text-xs">
                                            Pending
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </>
            )}
        </div>
    );
}
