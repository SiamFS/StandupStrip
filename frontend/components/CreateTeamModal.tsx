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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import ApiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";
import { toast } from "sonner";

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
                toast.success("Team created successfully!");
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to create team";
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                        Start a new team to track standups
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Engineering"
                            className="transition-all duration-200"
                            {...formik.getFieldProps("name")}
                            disabled={formik.isSubmitting}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                {formik.errors.name}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What is this team about?"
                            className="min-h-[80px] transition-all duration-200"
                            {...formik.getFieldProps("description")}
                            disabled={formik.isSubmitting}
                        />
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
                            {formik.isSubmitting ? "Creating..." : "Create Team"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
