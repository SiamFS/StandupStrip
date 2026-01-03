"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";
import { toast } from "sonner";

const CreateStandupSchema = Yup.object().shape({
    yesterdayText: Yup.string().max(2000, "Max 2000 characters").required("Required"),
    todayText: Yup.string().max(2000, "Max 2000 characters").required("Required"),
    blockersText: Yup.string().max(1000, "Max 1000 characters"),
});

interface CreateStandupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teamId: number;
}

export function CreateStandupModal({ isOpen, onClose, onSuccess, teamId }: CreateStandupModalProps) {
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            yesterdayText: "",
            todayText: "",
            blockersText: "",
        },
        validationSchema: CreateStandupSchema,
        onSubmit: async (values, { resetForm }) => {
            setError(null);
            try {
                await ApiClient.post(ENDPOINTS.STANDUPS.CREATE(teamId), values);
                resetForm();
                toast.success("Standup submitted successfully!");
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to submit standup";
                setError(message);
                toast.error(message);
            }
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            formik.resetForm();
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Submit Daily Standup</DialogTitle>
                    <DialogDescription>
                        Share your progress and blockers with the team
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
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

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
