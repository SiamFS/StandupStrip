"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    Calendar,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    totalMembers: number;
    submittedCount: number;
    pendingCount: number;
    hasBlockers: boolean;
    date: string;
}

export function StatsCards({
    totalMembers,
    submittedCount,
    pendingCount,
    hasBlockers,
    date
}: StatsCardsProps) {
    const participationRate = totalMembers > 0
        ? Math.round((submittedCount / totalMembers) * 100)
        : 0;

    const isToday = date === new Date().toISOString().split('T')[0];

    const stats = [
        {
            title: "Team Members",
            value: totalMembers,
            icon: Users,
            description: "Active members",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Submitted",
            value: submittedCount,
            icon: CheckCircle2,
            description: isToday ? "Today's updates" : "Updates for date",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Pending",
            value: pendingCount,
            icon: Clock,
            description: isToday ? "Waiting for updates" : "Not submitted",
            color: pendingCount > 0 ? "text-amber-500" : "text-green-500",
            bgColor: pendingCount > 0 ? "bg-amber-500/10" : "bg-green-500/10",
        },
        {
            title: "Participation",
            value: `${participationRate}%`,
            icon: TrendingUp,
            description: participationRate >= 80 ? "Great!" : participationRate >= 50 ? "Good" : "Needs attention",
            color: participationRate >= 80 ? "text-green-500" : participationRate >= 50 ? "text-amber-500" : "text-red-500",
            bgColor: participationRate >= 80 ? "bg-green-500/10" : participationRate >= 50 ? "bg-amber-500/10" : "bg-red-500/10",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.title}
                        className={cn(
                            "animate-in fade-in-0 transition-all duration-200 hover:shadow-md"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                                <Icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Blocker Alert Card - Only show if there are blockers */}
            {hasBlockers && (
                <Card className="md:col-span-2 lg:col-span-4 border-amber-500/30 bg-amber-500/5 animate-in fade-in-0">
                    <CardContent className="flex items-center gap-4 py-4">
                        <div className="p-3 rounded-full bg-amber-500/10">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                                Blockers Reported
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Some team members have reported blockers. Check the standups below for details.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
