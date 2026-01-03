"use client";

import { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ApiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useTheme } from 'next-themes';

interface HeatmapData {
    date: string;
    count: number;
    level: number;
}

export default function ParticipationHeatmap({ teamId }: { teamId: number }) {
    const [data, setData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Generate minimum required data for ActivityCalendar when no data is available
    const generateEmptyData = (): HeatmapData[] => {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        // ActivityCalendar requires at least start and end dates
        return [
            {
                date: sixMonthsAgo.toISOString().split('T')[0],
                count: 0,
                level: 0
            },
            {
                date: today.toISOString().split('T')[0],
                count: 0,
                level: 0
            }
        ];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiClient.get<HeatmapData[]>(ENDPOINTS.STATS.HEATMAP(teamId));
                // Filter to show only last 6 months for cleaner UI
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Current month + 5 previous

                const filteredData = response.filter(d => new Date(d.date) >= sixMonthsAgo);
                setData(filteredData.length > 0 ? filteredData : generateEmptyData());
            } catch (error) {
                console.error("Failed to fetch heatmap data", error);
                // Fallback to empty data with required minimum structure
                setData(generateEmptyData());
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [teamId]);

    if (loading) return <div className="h-40 animate-pulse bg-muted rounded-md w-full"></div>;

    return (
        <TooltipProvider delayDuration={0}>
            <div className="p-4 sm:p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h3 className="font-semibold text-lg">Team Participation</h3>
                    <div className="text-xs text-muted-foreground flex gap-2 items-center">
                        <span>Less</span>
                        <div className="flex gap-0.5">
                            <div className="w-2.5 h-2.5 bg-[#ebedf0] dark:bg-[#161b22] rounded-[2px]" title="0"></div>
                            <div className="w-2.5 h-2.5 bg-[#9be9a8] dark:bg-[#0e4429] rounded-[2px]" title="1-2"></div>
                            <div className="w-2.5 h-2.5 bg-[#40c463] dark:bg-[#006d32] rounded-[2px]" title="3-5"></div>
                            <div className="w-2.5 h-2.5 bg-[#30a14e] dark:bg-[#26a641] rounded-[2px]" title="6-8"></div>
                            <div className="w-2.5 h-2.5 bg-[#216e39] dark:bg-[#39d353] rounded-[2px]" title="9+"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
                <div className="w-full overflow-x-auto pb-2 -mx-2 px-2">
                    <ActivityCalendar
                        data={data}
                        labels={{
                            totalCount: "{{count}} contributions in the last 6 months",
                        }}
                        colorScheme={theme === 'dark' ? 'dark' : 'light'}
                        theme={{
                            light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        }}
                        hideColorLegend // Hiding default legend to use our custom one
                        renderBlock={(block, activity) => (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {/* react-activity-calendar returns an SVG rect, so we treat it directly */}
                                    {block}
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs p-2">
                                    <p className="font-bold">{activity.count} standups</p>
                                    <p className="text-muted-foreground">{activity.date}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        showWeekdayLabels
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}
