"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    User,
    LogOut,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Teams", href: "/teams", icon: Users },
        { name: "Profile", href: "/profile", icon: User },
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* User Info */}
            {user && (
                <div className="mb-6 px-2">
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Welcome,</p>
                            <p className="font-medium truncate max-w-[140px]">{user.name}</p>
                        </div>
                    </div>
                </div>
            )}

            <Separator className="mb-4" />

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href === "/dashboard" && pathname === "/");

                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        <span className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="lg:hidden">
                                    {item.name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* Sign Out */}
            <div className="pt-4">
                <Separator className="mb-4" />
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-card border-r">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-xl font-bold">
                        StandUpStrip
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <SidebarContent />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen lg:pl-64 min-w-0 overflow-x-hidden">
                {/* Mobile Header */}
                <header className="h-16 border-b flex items-center px-4 lg:hidden bg-card sticky top-0 z-40">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetHeader className="h-16 flex items-center justify-start px-6 border-b">
                                <SheetTitle className="text-xl font-bold">
                                    StandUpStrip
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-4 h-[calc(100%-4rem)]">
                                <SidebarContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold">StandUpStrip</span>
                </header>

                <div className="flex-1 p-4 md:p-6 lg:p-10 w-full min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
