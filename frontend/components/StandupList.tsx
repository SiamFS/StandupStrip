"use client";

import { StandupResponse, UserResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Trash2, Pencil, Clock, Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandupListProps {
    standups: StandupResponse[];
    members?: UserResponse[];
    loading: boolean;
    currentUserId?: number;
    isOwner?: boolean;
    onDelete?: (standupId: number) => void;
    onEdit?: (standup: StandupResponse) => void;
    onSendReminder?: (userId: number) => void;
    onSendAllReminders?: () => void;
    sendingReminders?: Set<number>;
    sendingAllReminders?: boolean;
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

export function StandupList({
    standups,
    members,
    loading,
    currentUserId,
    isOwner,
    onDelete,
    onEdit,
    onSendReminder,
    onSendAllReminders,
    sendingReminders = new Set(),
    sendingAllReminders = false,
    todayDate
}: StandupListProps) {
    const isToday = todayDate === getLocalDateFormat();

    // Identify pending members (only relevant for today)
    const pendingMembers = members && isToday ? members.filter(member =>
        !standups.some(s => s.userId === member.id)
    ) : [];

    if (loading) {
        return (
            <div className="space-y-4">
                <StandupSkeleton />
                <StandupSkeleton />
            </div>
        );
    }

    // Show empty state when no standups AND (no pending members to show OR it's not today)
    const showEmptyState = standups.length === 0 && pendingMembers.length === 0;

    if (showEmptyState) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-muted-foreground/20 rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                </div>

                {/* Empty state illustration */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-75" />
                    <svg
                        className="w-28 h-28 relative z-10"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Clipboard base with shadow */}
                        <rect x="28" y="25" width="64" height="78" rx="8" className="fill-muted-foreground/10" />
                        <rect x="25" y="22" width="64" height="78" rx="8" className="fill-background stroke-muted-foreground/20" strokeWidth="1.5" />

                        {/* Clipboard clip */}
                        <rect x="42" y="14" width="30" height="16" rx="4" className="fill-background stroke-primary/40" strokeWidth="1.5" />
                        <circle cx="57" cy="22" r="3" className="fill-primary/40" />

                        {/* Empty lines with animation-like pattern */}
                        <rect x="35" y="42" width="44" height="5" rx="2.5" className="fill-muted-foreground/15" />
                        <rect x="35" y="54" width="36" height="5" rx="2.5" className="fill-muted-foreground/12" />
                        <rect x="35" y="66" width="40" height="5" rx="2.5" className="fill-muted-foreground/10" />
                        <rect x="35" y="78" width="28" height="5" rx="2.5" className="fill-muted-foreground/8" />

                        {/* Calendar/clock icon overlay */}
                        <circle cx="78" cy="80" r="16" className="fill-background stroke-primary/30" strokeWidth="1.5" />
                        <path d="M78 72v8l5 3" className="stroke-primary/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="relative z-10 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        {isToday ? "No standups submitted yet" : "No standups for this date"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm px-4 leading-relaxed">
                        {isToday
                            ? "Team members haven't submitted their updates yet. Check back soon!"
                            : "There were no team updates recorded for this day. Try selecting a different date."
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {standups.map((standup, index) => {
                const isOwner = currentUserId === standup.userId;
                const canEdit = isOwner && isToday;

                return (
                    <Card
                        key={standup.id}
                        className={cn(
                            "hover:shadow-md animate-in fade-in-0",
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
                                <p className="leading-relaxed break-words whitespace-pre-wrap">{standup.yesterdayText}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Today</span>
                                <p className="leading-relaxed break-words whitespace-pre-wrap">{standup.todayText}</p>
                            </div>
                            {standup.blockersText && (
                                <>
                                    <Separator />
                                    <div className="space-y-1">
                                        <span className="font-semibold text-destructive text-xs uppercase tracking-wide">Blockers</span>
                                        <p className="leading-relaxed break-words whitespace-pre-wrap">{standup.blockersText}</p>
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
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                                Waiting for updates ({pendingMembers.length})
                            </span>
                        </div>
                        {isOwner && onSendAllReminders && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 w-full sm:w-auto"
                                onClick={onSendAllReminders}
                                disabled={sendingAllReminders}
                            >
                                <Send className={cn("h-4 w-4", sendingAllReminders && "animate-pulse")} />
                                {sendingAllReminders ? "Sending..." : "Remind All"}
                            </Button>
                        )}
                    </div>
                    {pendingMembers.map((member, index) => (
                        <Card
                            key={member.id}
                            className={cn(
                                "opacity-60 bg-muted/30 border-dashed",
                                "animate-in fade-in-0"
                            )}
                            style={{ animationDelay: `${(standups.length + index) * 50}ms` }}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                                {member.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                            <CardTitle className="text-base text-muted-foreground truncate">
                                                {member.name}
                                            </CardTitle>
                                            <Badge variant="secondary" className="text-xs w-fit">
                                                Pending
                                            </Badge>
                                        </div>
                                    </div>
                                    {isOwner && onSendReminder && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                            onClick={() => onSendReminder(member.id)}
                                            disabled={sendingReminders.has(member.id)}
                                            title="Send reminder email"
                                        >
                                            <Mail className={cn("h-4 w-4", sendingReminders.has(member.id) && "animate-pulse")} />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3">
                                <p className="text-sm text-muted-foreground/70 italic">
                                    Standup not yet submitted
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}
        </div>
    );
}
