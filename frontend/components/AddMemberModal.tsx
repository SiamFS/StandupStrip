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

const AddMemberSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
});

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teamId: number;
}

export function AddMemberModal({ isOpen, onClose, onSuccess, teamId }: AddMemberModalProps) {
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: AddMemberSchema,
        onSubmit: async (values, { resetForm }) => {
            setError(null);
            try {
                await ApiClient.post(ENDPOINTS.TEAMS.ADD_MEMBER(teamId), {
                    email: values.email,
                    role: "MEMBER"
                });
                resetForm();
                onSuccess();
                onClose();
            } catch (err: any) {
                setError(err.message || "Failed to add member");
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Team Member"
            description="Invite a user to this team by email"
        >
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                        id="email"
                        placeholder="colleague@example.com"
                        {...formik.getFieldProps("email")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="text-sm text-destructive">
                            {formik.errors.email}
                        </div>
                    )}
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
                        {formik.isSubmitting ? "Add Member" : "Add Member"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
