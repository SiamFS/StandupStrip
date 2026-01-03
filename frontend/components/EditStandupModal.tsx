"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
    ResponsiveModal,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";
import { StandupResponse } from "@/lib/types";
import { toast } from "sonner";

const EditStandupSchema = Yup.object().shape({
    yesterdayText: Yup.string().max(2000, "Max 2000 characters").required("Required"),
    todayText: Yup.string().max(2000, "Max 2000 characters").required("Required"),
    blockersText: Yup.string().max(1000, "Max 1000 characters"),
});

interface EditStandupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    standup: StandupResponse;
}

export function EditStandupModal({ isOpen, onClose, onSuccess, standup }: EditStandupModalProps) {
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            yesterdayText: standup.yesterdayText,
            todayText: standup.todayText,
            blockersText: standup.blockersText || "",
        },
        validationSchema: EditStandupSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setError(null);
            try {
                await ApiClient.put(ENDPOINTS.STANDUPS.UPDATE(standup.id), values);
                toast.success("Standup updated successfully!");
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to update standup";
                setError(message);
                toast.error(message);
            }
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError(null);
            onClose();
        }
    };

    return (
        <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle>Edit Standup</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                    Update your standup submission
                </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label htmlFor="yesterdayText">What did you do yesterday?</Label>
                        <span className="text-xs text-muted-foreground">
                            {formik.values.yesterdayText.length}/2000
                        </span>
                    </div>
                    <Textarea
                        id="yesterdayText"
                        placeholder="Worked on..."
                        className="min-h-[80px] transition-all duration-200 focus:ring-2"
                        {...formik.getFieldProps("yesterdayText")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.yesterdayText && formik.errors.yesterdayText && (
                        <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                            {formik.errors.yesterdayText}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label htmlFor="todayText">What will you do today?</Label>
                        <span className="text-xs text-muted-foreground">
                            {formik.values.todayText.length}/2000
                        </span>
                    </div>
                    <Textarea
                        id="todayText"
                        placeholder="Will work on..."
                        className="min-h-[80px] transition-all duration-200 focus:ring-2"
                        {...formik.getFieldProps("todayText")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.todayText && formik.errors.todayText && (
                        <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                            {formik.errors.todayText}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label htmlFor="blockersText">Any blockers?</Label>
                        <span className="text-xs text-muted-foreground">
                            {formik.values.blockersText.length}/1000
                        </span>
                    </div>
                    <Textarea
                        id="blockersText"
                        placeholder="None"
                        className="min-h-[80px] transition-all duration-200 focus:ring-2"
                        {...formik.getFieldProps("blockersText")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.blockersText && formik.errors.blockersText && (
                        <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                            {formik.errors.blockersText}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-sm text-destructive font-medium animate-in fade-in-0">
                        {error}
                    </div>
                )}

                <ResponsiveModalFooter className="gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </ResponsiveModalFooter>
            </form>
        </ResponsiveModal>
    );
}
