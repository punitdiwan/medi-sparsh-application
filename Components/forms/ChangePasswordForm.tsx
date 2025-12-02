import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Eye, EyeOff } from "lucide-react";

// Zod schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordForm = z.infer<typeof passwordSchema>;

export default function ChangePasswordForm({
  open,
  onClose,
  onSubmit,
  loading: externalLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: PasswordForm) => Promise<void> | void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  const submitting = isSubmitting || externalLoading;

  async function submit(values: PasswordForm) {
    try {
      if (onSubmit) await onSubmit(values);
      reset();
      onClose();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="relative p-5 rounded-lg shadow-xl 
      bg-custom-gradient">

      <h2 className="text-lg font-semibold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit(submit)} className="space-y-4">

        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <div className="relative mt-1">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1
              text-indigo-500 dark:text-indigo-300"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative mt-1">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              {...register("newPassword")}
              placeholder="At least 8 chars, uppercase, symbol..."
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1
              text-indigo-500 dark:text-indigo-300"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1
              text-indigo-500 dark:text-indigo-300"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Saving..." : "Change Password"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => reset()}
            className="ml-2"
            disabled={!isDirty || submitting}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
