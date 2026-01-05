"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found. Please check your email link again.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await api.get<string>(`/api/auth/verify?token=${token}`);
                setStatus("success");
                setMessage(response || "Email verified successfully!");
            } catch (error) {
                setStatus("error");
                const errorMessage = error instanceof Error ? error.message : "Failed to verify email. The link may be expired or invalid.";
                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background md:bg-muted/40 p-0 md:p-4">
            <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md border-none md:border rounded-none md:rounded-xl md:shadow-2xl bg-background md:bg-card/50 md:backdrop-blur-sm flex flex-col justify-center">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary/10">
                        <span className="text-primary text-2xl font-bold">S</span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
                    <CardDescription>
                        {status === "loading" && "Verification in progress..."}
                        {status === "success" && "Your account is now ready!"}
                        {status === "error" && "Something went wrong"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6 text-center">
                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-muted-foreground italic">Verifying your email address...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Verified Successfully!</h3>
                            <p className="text-muted-foreground">{message}</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-destructive" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Verification Failed</h3>
                            <p className="text-muted-foreground">{message}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    {status === "success" ? (
                        <Button className="w-full" asChild>
                            <Link href="/login">Login to StandUpStrip</Link>
                        </Button>
                    ) : status === "error" ? (
                        <Button className="w-full" asChild variant="outline">
                            <Link href="/register">Back to Registration</Link>
                        </Button>
                    ) : null}

                    <p className="text-xs text-center text-muted-foreground">
                        Need help? Contact support at support@standupstrip.com
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
