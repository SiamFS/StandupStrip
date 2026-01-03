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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";
import { toast } from "sonner";

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
                toast.success("Member added successfully!");
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to add member";
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
        <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
            <ResponsiveModalHeader>
                <ResponsiveModalTitle>Add Team Member</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                    Invite a user to this team by email
                </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                        id="email"
                        placeholder="colleague@example.com"
                        className="transition-all duration-200"
                        {...formik.getFieldProps("email")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                            {formik.errors.email}
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
                        {formik.isSubmitting ? "Adding..." : "Add Member"}
                    </Button>
                </ResponsiveModalFooter>
            </form>
        </ResponsiveModal>
    );
}
