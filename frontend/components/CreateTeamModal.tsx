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

const CreateTeamSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    description: Yup.string(),
});

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
        },
        validationSchema: CreateTeamSchema,
        onSubmit: async (values, { resetForm }) => {
            setError(null);
            try {
                await ApiClient.post(ENDPOINTS.TEAMS.CREATE, values);
                resetForm();
                onSuccess();
                onClose();
            } catch (err: any) {
                setError(err.message || "Failed to create team");
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Team"
            description="Start a new team to track standups"
        >
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="className">Team Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Engineering"
                        {...formik.getFieldProps("name")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <div className="text-sm text-destructive">
                            {formik.errors.name}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                        id="description"
                        placeholder="What is this team about?"
                        {...formik.getFieldProps("description")}
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
                        {formik.isSubmitting ? "Creating..." : "Create Team"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
