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

const RegisterSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
});

export default function RegisterPage() {
    const { register } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            setError(null);
            try {
                const { confirmPassword, ...data } = values;
                await register(data);
                toast.success("Account created successfully!");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to register";
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
                        Create an Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Join StandUpStrip to collaborate with your team
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="transition-all duration-200"
                                {...formik.getFieldProps("name")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                    {formik.errors.name}
                                </div>
                            )}
                        </div>

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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="transition-all duration-200"
                                {...formik.getFieldProps("confirmPassword")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                    {formik.errors.confirmPassword}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-sm text-destructive font-medium text-center animate-in fade-in-0">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
