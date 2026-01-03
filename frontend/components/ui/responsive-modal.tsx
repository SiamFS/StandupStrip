"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

interface ResponsiveModalHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface ResponsiveModalTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface ResponsiveModalDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

interface ResponsiveModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

const ResponsiveModalContext = React.createContext<{ isMobile: boolean }>({
    isMobile: false,
});

export function ResponsiveModal({
    open,
    onOpenChange,
    children,
    className,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <ResponsiveModalContext.Provider value={{ isMobile: true }}>
                <Sheet open={open} onOpenChange={onOpenChange}>
                    <SheetContent
                        side="bottom"
                        className={`w-full max-h-[90dvh] overflow-y-auto rounded-t-xl px-4 pb-8 ${className || ""}`}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        {children}
                    </SheetContent>
                </Sheet>
            </ResponsiveModalContext.Provider>
        );
    }

    return (
        <ResponsiveModalContext.Provider value={{ isMobile: false }}>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={`sm:max-w-lg ${className || ""}`}>
                    {children}
                </DialogContent>
            </Dialog>
        </ResponsiveModalContext.Provider>
    );
}

export function ResponsiveModalHeader({ children, className }: ResponsiveModalHeaderProps) {
    const { isMobile } = React.useContext(ResponsiveModalContext);

    if (isMobile) {
        return <SheetHeader className={className}>{children}</SheetHeader>;
    }

    return <DialogHeader className={className}>{children}</DialogHeader>;
}

export function ResponsiveModalTitle({ children, className }: ResponsiveModalTitleProps) {
    const { isMobile } = React.useContext(ResponsiveModalContext);

    if (isMobile) {
        return <SheetTitle className={className}>{children}</SheetTitle>;
    }

    return <DialogTitle className={className}>{children}</DialogTitle>;
}

export function ResponsiveModalDescription({ children, className }: ResponsiveModalDescriptionProps) {
    const { isMobile } = React.useContext(ResponsiveModalContext);

    if (isMobile) {
        return <SheetDescription className={className}>{children}</SheetDescription>;
    }

    return <DialogDescription className={className}>{children}</DialogDescription>;
}

export function ResponsiveModalFooter({ children, className }: ResponsiveModalFooterProps) {
    const { isMobile } = React.useContext(ResponsiveModalContext);

    if (isMobile) {
        return <SheetFooter className={className}>{children}</SheetFooter>;
    }

    return <DialogFooter className={className}>{children}</DialogFooter>;
}
