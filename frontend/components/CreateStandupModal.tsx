"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";

const CreateStandupSchema = Yup.object().shape({
    yesterdayText: Yup.string().required("Required"),
    todayText: Yup.string().required("Required"),
    blockersText: Yup.string(),
});

interface CreateStandupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teamId: number;
}

// Custom Textarea component
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        />
    )
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
                onSuccess();
                onClose();
            } catch (err: any) {
                setError(err.message || "Failed to submit standup");
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Daily Standup"
            description="Share your progress and blockers with the team"
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
                        {formik.isSubmitting ? "Submit" : "Submit"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
