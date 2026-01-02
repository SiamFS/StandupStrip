import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
    className?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = "md",
    message,
    className,
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    const spinner = (
        <div className={cn("text-center", className)}>
            <div
                className={cn(
                    "animate-spin rounded-full border-b-2 border-primary mx-auto",
                    sizeClasses[size],
                    message && "mb-4"
                )}
            />
            {message && (
                <p className="text-muted-foreground text-sm">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                {spinner}
            </div>
        );
    }

    return spinner;
}
