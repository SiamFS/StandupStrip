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
import { Loader2 } from "lucide-react";

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
                toast.success("Invitation sent successfully! An email has been sent to the invitee.");
                onSuccess();
                onClose();
            } catch (err: unknown) {
                console.error("Failed to add member:", err);
                let message = "Failed to add member";

                if (err instanceof Error) {
                    message = err.message;
                    // Log additional details if available
                    if ('response' in err) {
                        console.error("Error response:", (err as any).response);
                    }
                }

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
            <ResponsiveModalHeader className="text-center sm:text-left">
                <ResponsiveModalTitle className="text-2xl font-bold">Invite Team Member</ResponsiveModalTitle>
                <ResponsiveModalDescription className="text-muted-foreground">
                    Send an invitation email to your colleague. They'll be added to the team immediately if they have an account, or invited to join StandUpStrip.
                </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <form onSubmit={formik.handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Co-worker's Email Address
                    </Label>
                    <Input
                        id="email"
                        placeholder="colleague@example.com"
                        className="h-11 transition-all duration-200 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                        {...formik.getFieldProps("email")}
                        disabled={formik.isSubmitting}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="text-xs text-destructive font-bold animate-in fade-in-0 slide-in-from-top-1 px-1">
                            {formik.errors.email}
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground italic px-1 pt-1">
                        We'll send them a nice invitation email with a link to join this team.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-bold text-center animate-in fade-in-0">
                        {error}
                    </div>
                )}

                <ResponsiveModalFooter className="gap-3 pt-4 sm:flex-row-reverse">
                    <Button
                        type="submit"
                        className="flex-1 h-11 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending Invitation...
                            </div>
                        ) : "Send Invitation"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-11 text-muted-foreground hover:bg-muted"
                    >
                        Cancel
                    </Button>
                </ResponsiveModalFooter>
            </form>
        </ResponsiveModal>
    );
}
