"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface ErrorDisplayProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export function ErrorDisplay({
    title = "Something went wrong",
    message,
    onRetry,
    showRetry = true
}: ErrorDisplayProps) {
    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-full bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                    <CardTitle className="text-lg text-destructive">{title}</CardTitle>
                    <CardDescription className="text-destructive/80">{message}</CardDescription>
                </div>
            </CardHeader>
            {showRetry && onRetry && (
                <CardContent className="pt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}

export function InlineError({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
