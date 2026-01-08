"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Zap, Eye, EyeOff } from "lucide-react";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

function LoginForm() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    // Show success toast if redirected from registration (only once)
    useEffect(() => {
        if (searchParams.get("registered") === "true" && !hasShownToast.current) {
            hasShownToast.current = true;
            toast.success("Account created! Check your email to verify your account, then login.");
        }
    }, [searchParams]);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setError(null);
            try {
                await login(values);
                toast.success("Welcome back!");

                // Check for redirect parameter
                const redirectPath = searchParams.get("redirect");
                if (redirectPath) {
                    window.location.href = redirectPath;
                }
                // Otherwise, login() will redirect to dashboard automatically
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to login";
                setError(message);
                toast.error(message);
            }
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-background md:bg-muted/40 p-0 md:p-4 relative overflow-hidden">
            {/* Background elements - only on desktop */}
            <div className="hidden md:block absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
            <div className="hidden md:block absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />


            <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md animate-in fade-in-0 zoom-in-95 duration-500 md:shadow-2xl border-none md:border rounded-none md:rounded-xl bg-background md:bg-card/80 md:backdrop-blur-md relative z-10 flex flex-col justify-center">
                <CardHeader className="space-y-4 text-center pt-12 md:pt-8">
                    {/* Logo Section */}
                    {/* Logo Section */}
                    <Link href="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">StandUpStrip</span>
                    </Link>

                    {/* Title */}
                    <div className="space-y-1 pt-2">
                        <CardTitle className="text-2xl font-bold">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base">
                            Enter your credentials to access your teams
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-11 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                                {...formik.getFieldProps("email")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1 px-1">
                                    {formik.errors.email}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary hover:underline font-semibold"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-11 pr-10 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                                    {...formik.getFieldProps("password")}
                                    disabled={formik.isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1 px-1">
                                    {formik.errors.password}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className={`p-3 rounded-lg text-xs font-semibold text-center animate-in fade-in-0 ${error.toLowerCase().includes("verify")
                                ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                                : "bg-destructive/10 border border-destructive/20 text-destructive"
                                }`}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </div>
                            ) : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline font-bold transition-colors">
                            Register now
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background md:bg-muted/40">
                <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md border-none md:border rounded-none md:rounded-xl">
                    <CardHeader className="space-y-4 text-center pt-12 md:pt-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">StandUpStrip</span>
                        </div>
                        <div className="space-y-1 pt-2">
                            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
