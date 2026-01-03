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
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-center">
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
                                placeholder="m@example.com"
                                className="transition-all duration-200"
                                {...formik.getFieldProps("email")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                    {formik.errors.email}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="transition-all duration-200"
                                {...formik.getFieldProps("password")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                    {formik.errors.password}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-sm text-destructive font-medium text-center animate-in fade-in-0">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium transition-colors">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
