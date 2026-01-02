"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Protected page layout

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Teams", href: "/teams", icon: Users },
        // { name: "Summaries", href: "/summaries", icon: FileText },
    ];

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        StandUpMeet
                    </span>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto lg:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {user && (
                        <div className="mb-6 px-2">
                            <p className="text-sm text-muted-foreground">Welcome,</p>
                            <p className="font-medium truncate">{user.name}</p>
                        </div>
                    )}

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link key={item.href} href={item.href}>
                                <span className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}>
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="absolute bottom-4 left-0 right-0 p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="h-16 border-b flex items-center px-4 lg:hidden bg-card">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className=""
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-semibold">StandUpMeet</span>
                </header>

                <div className="flex-1 p-6 lg:p-10 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
