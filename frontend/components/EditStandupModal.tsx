"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";
import { StandupResponse } from "@/lib/types";

const EditStandupSchema = Yup.object().shape({
    yesterdayText: Yup.string().required("Required"),
    todayText: Yup.string().required("Required"),
    blockersText: Yup.string(),
});

interface EditStandupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    standup: StandupResponse;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        />
    )
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
                onSuccess();
                onClose();
            } catch (err: any) {
                setError(err.message || "Failed to update standup");
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Standup"
            description="Update your standup submission"
        >
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="yesterdayText">What did you do yesterday?</Label>
                    <Textarea
                        id="yesterdayText"
                        placeholder="Worked on..."
                        {...formik.getFieldProps("yesterdayText")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.yesterdayText && formik.errors.yesterdayText && (
                        <div className="text-sm text-destructive">
                            {formik.errors.yesterdayText}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="todayText">What will you do today?</Label>
                    <Textarea
                        id="todayText"
                        placeholder="Will work on..."
                        {...formik.getFieldProps("todayText")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.todayText && formik.errors.todayText && (
                        <div className="text-sm text-destructive">
                            {formik.errors.todayText}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blockersText">Any blockers?</Label>
                    <Textarea
                        id="blockersText"
                        placeholder="None"
                        {...formik.getFieldProps("blockersText")}
                        disabled={formik.isSubmitting}
                    />
                </div>

                {error && (
                    <div className="text-sm text-destructive font-medium">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
