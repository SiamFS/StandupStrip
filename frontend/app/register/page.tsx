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
import { Mail, Loader2, Zap } from "lucide-react";

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
    const [isSuccess, setIsSuccess] = useState(false);

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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { confirmPassword, ...data } = values;
                await register(data);
                setIsSuccess(true);
                toast.success("Account created! Please check your email.");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to register";
                setError(message);
                toast.error(message);
            }
        },
    });

    if (isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background md:bg-muted/40 p-0 md:p-4">
                <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md animate-in fade-in zoom-in duration-500 md:shadow-xl border-none md:border rounded-none md:rounded-xl bg-background md:bg-card/80 md:backdrop-blur-sm flex flex-col justify-center">
                    <CardHeader className="text-center space-y-2 pt-12 md:pt-6">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">Check your email</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            We've sent a verification link to <span className="text-foreground font-semibold">{formik.values.email}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                        <p className="text-muted-foreground">
                            Please click the link in the email to verify your account. You'll be able to login once your email is confirmed.
                        </p>
                        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-left">
                            <h4 className="font-semibold mb-1 flex items-center">
                                <span className="mr-2">💡</span> Next steps:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Check your inbox (and spam folder)</li>
                                <li>Click the verification link</li>
                                <li>Come back and login</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-11" asChild>
                            <Link href="/login">Return to Login</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Didn't get the email? <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline font-medium">Try again</button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background md:bg-muted/40 p-0 md:p-4 relative overflow-hidden">
            {/* Background decorations - only on desktop */}
            <div className="hidden md:block absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
            <div className="hidden md:block absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />

            <Card className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md animate-in fade-in-0 zoom-in-95 duration-500 md:shadow-2xl border-none md:border rounded-none md:rounded-xl bg-background md:bg-card/80 md:backdrop-blur-md relative z-10 flex flex-col justify-center">
                <CardHeader className="space-y-4 text-center pt-8 md:pt-6">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">StandUpStrip</span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1 pt-2">
                        <CardTitle className="text-2xl font-bold">
                            Create an Account
                        </CardTitle>
                        <CardDescription className="text-base">
                            Join StandUpStrip to collaborate with your team
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="h-11 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                                {...formik.getFieldProps("name")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1 px-1">
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
                            <Label htmlFor="password">Password</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                                {...formik.getFieldProps("confirmPassword")}
                                disabled={formik.isSubmitting}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <div className="text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1 px-1">
                                    {formik.errors.confirmPassword}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-semibold text-center animate-in fade-in-0">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Account...
                                </div>
                            ) : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-bold transition-colors">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
