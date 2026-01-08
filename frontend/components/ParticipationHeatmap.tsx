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
        const currentYear = new Date().getFullYear();
        return [
            {
                date: `${currentYear}-01-01`,
                count: 0,
                level: 0
            },
            {
                date: `${currentYear}-12-31`,
                count: 0,
                level: 0
            }
        ];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiClient.get<HeatmapData[]>(ENDPOINTS.STATS.HEATMAP(teamId));

                const currentYear = new Date().getFullYear();
                const startDateStr = `${currentYear}-01-01`;
                const endDateStr = `${currentYear}-12-31`;

                // Filter data for current year
                let filteredData = response.filter(d => d.date.startsWith(String(currentYear)));

                // Start with empty boundaries if no data
                if (filteredData.length === 0) {
                    filteredData = generateEmptyData();
                } else {
                    // Ensure start date exists to force full range rendering
                    if (!filteredData.some(d => d.date === startDateStr)) {
                        filteredData.unshift({ date: startDateStr, count: 0, level: 0 });
                    }
                    // Ensure end date exists
                    if (!filteredData.some(d => d.date === endDateStr)) {
                        filteredData.push({ date: endDateStr, count: 0, level: 0 });
                    }
                    // Sort by date
                    filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                }

                setData(filteredData);
            } catch (error) {
                console.error("Failed to fetch heatmap data", error);
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
                    <h3 className="font-semibold text-lg">Team Participation ({new Date().getFullYear()})</h3>
                    <div className="text-xs text-muted-foreground flex gap-2 items-center">
                        <span>Less</span>
                        <div className="flex gap-0.5">
                            <div className="w-2.5 h-2.5 bg-[#e0e0e0] dark:bg-[#2d333b] rounded-[2px]" title="0"></div>
                            <div className="w-2.5 h-2.5 bg-[#9be9a8] dark:bg-[#0e4429] rounded-[2px]" title="1-2"></div>
                            <div className="w-2.5 h-2.5 bg-[#40c463] dark:bg-[#006d32] rounded-[2px]" title="3-5"></div>
                            <div className="w-2.5 h-2.5 bg-[#30a14e] dark:bg-[#26a641] rounded-[2px]" title="6-8"></div>
                            <div className="w-2.5 h-2.5 bg-[#216e39] dark:bg-[#39d353] rounded-[2px]" title="9+"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
                <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 flex justify-center">
                    <ActivityCalendar
                        data={data}
                        labels={{
                            totalCount: "{{count}} contributions in " + new Date().getFullYear(),
                        }}
                        colorScheme={theme === 'dark' ? 'dark' : 'light'}
                        theme={{
                            light: ['#e0e0e0', '#9be9a8', '#40c463', '#30a14e', '#216e39'], // Darker gray for empty cells
                            dark: ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'], // Lighter dark gray for empty cells
                        }}
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
