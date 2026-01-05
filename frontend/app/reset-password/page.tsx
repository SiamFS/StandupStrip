"use client";

import { useState, Suspense } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            password: Yup.string().min(8, "Minimum 8 characters").required("Required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("Required"),
        }),
        onSubmit: async (values) => {
            if (!token) {
                setError("Missing reset token. Please request a new link.");
                return;
            }
            setIsLoading(true);
            setError("");
            try {
                await api.post(`/api/auth/reset-password?token=${token}&password=${values.password}`, {});
                setIsSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } catch (err: any) {
                setError(err.response?.data || "Failed to reset password. The link may be expired.");
            } finally {
                setIsLoading(false);
            }
        },
    });

    if (!token && !isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background md:bg-muted/40 p-0 md:p-4">
                <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md border-destructive/20 bg-destructive/5 md:bg-card border-none md:border rounded-none md:rounded-xl flex flex-col justify-center">
                    <CardHeader className="text-center">
                        <CardTitle className="text-destructive">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or missing.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" asChild variant="outline">
                            <Link href="/forgot-password">Request New Link</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background md:bg-muted/40 p-0 md:p-4 relative overflow-hidden">
            <div className="hidden md:block absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
            <div className="hidden md:block absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />

            <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md border-none md:border rounded-none md:rounded-xl md:shadow-2xl bg-background md:bg-card/80 md:backdrop-blur-md relative z-10 flex flex-col justify-center">
                <CardHeader className="space-y-1 pt-12 md:pt-6">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Please enter your new password below. Make it secure!
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSuccess ? (
                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10 h-11"
                                        {...formik.getFieldProps("password")}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {formik.touched.password && formik.errors.password && (
                                    <p className="text-xs text-destructive font-medium">{formik.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 h-11"
                                        {...formik.getFieldProps("confirmPassword")}
                                    />
                                </div>
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="text-xs text-destructive font-medium">{formik.errors.confirmPassword}</p>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Password Updated!</h3>
                            <p className="text-muted-foreground">
                                Your password has been reset successfully. Redirecting you to login...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
