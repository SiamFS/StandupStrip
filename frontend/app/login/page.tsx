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
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

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
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to login";
                setError(message);
                toast.error(message);
            }
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />

            <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-none bg-card/80 backdrop-blur-md relative z-10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <span className="text-primary text-2xl font-bold">S</span>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Enter your credentials to access your standups
                    </CardDescription>
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
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                                {...formik.getFieldProps("password")}
                                disabled={formik.isSubmitting}
                            />
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
