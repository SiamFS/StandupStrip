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

import { getLocalDateFormat } from "@/lib/date";

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
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl animate-in fade-in-0 duration-300 bg-muted/20">
                {/* Empty state illustration */}
                <svg
                    className="w-32 h-32 mb-6"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Clipboard base */}
                    <rect x="25" y="20" width="70" height="85" rx="6" className="fill-muted stroke-muted-foreground/30" strokeWidth="2" />
                    <rect x="40" y="12" width="40" height="16" rx="4" className="fill-background stroke-primary/50" strokeWidth="2" />
                    <circle cx="60" cy="20" r="4" className="fill-primary/30" />

                    {/* Empty lines */}
                    <rect x="35" y="42" width="50" height="6" rx="3" className="fill-muted-foreground/20" />
                    <rect x="35" y="56" width="40" height="6" rx="3" className="fill-muted-foreground/15" />
                    <rect x="35" y="70" width="45" height="6" rx="3" className="fill-muted-foreground/10" />

                    {/* Question mark */}
                    <circle cx="90" cy="85" r="18" className="fill-primary/10 stroke-primary/30" strokeWidth="2" />
                    <text x="90" y="92" textAnchor="middle" className="fill-primary text-lg font-bold">?</text>
                </svg>
                <h3 className="text-lg font-semibold mb-2">No standups for this date</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Check back later or select a different date to view team updates.
                </p>
            </div>
        )
    }

    const isToday = todayDate === getLocalDateFormat();

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
