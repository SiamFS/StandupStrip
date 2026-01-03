"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            setError("");
            try {
                await api.post(`/api/auth/forgot-password?email=${values.email}`, {});
                setIsSubmitted(true);
            } catch (err: any) {
                setError(err.response?.data || "Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />

            <Card className="max-w-md w-full border-none shadow-2xl bg-card/80 backdrop-blur-md relative z-10 transition-all duration-300">
                <CardHeader className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-fit -ml-2 mb-2 text-muted-foreground hover:text-primary transition-colors" asChild>
                        <Link href="/login">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </Button>
                    <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
                    <CardDescription>
                        No worries, it happens. Enter your email and we'll send you a reset link.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10 h-11 border-muted focus-visible:ring-primary/20 transition-all"
                                        {...formik.getFieldProps("email")}
                                    />
                                </div>
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                                        {formik.errors.email}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium animate-in zoom-in-95">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Check your email</h3>
                            <p className="text-muted-foreground">
                                we've sent a password reset link to <span className="text-foreground font-semibold">{formik.values.email}</span>.
                            </p>
                            <p className="text-sm text-muted-foreground mt-6 italic">
                                Didn't receive the email? Check your spam folder or try again in a few minutes.
                            </p>
                        </div>
                    )}
                </CardContent>

                {!isSubmitted && (
                    <CardFooter>
                        <p className="text-xs text-center w-full text-muted-foreground">
                            Remember your password?{" "}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
