"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  revokeOtherSessions: z.boolean(),
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
  });

  const { control, handleSubmit, formState, reset } = form;
  const { errors, isSubmitting } = formState;

  async function handlePasswordChange(data: ChangePasswordForm) {
    await authClient.changePassword(data, {
      onError: (error) => {
        toast.error(error.error.message || "Failed to change password");
      },
      onSuccess: () => {
        toast.success("Password changed successfully");
        reset();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
      <FieldSet>
        {/* CURRENT PASSWORD */}
        <FieldGroup>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <PasswordInput {...field} />
                {errors.currentPassword && (
                  <FieldDescription className="text-red-500">
                    {errors.currentPassword.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* NEW PASSWORD */}
        <FieldGroup>
          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <PasswordInput {...field} />
                {errors.newPassword && (
                  <FieldDescription className="text-red-500">
                    {errors.newPassword.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* CHECKBOX */}
        <FieldGroup>
          <Controller
            control={control}
            name="revokeOtherSessions"
            render={({ field }) => (
              <Field className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel>Log out other sessions</FieldLabel>
                {errors.revokeOtherSessions && (
                  <FieldDescription className="text-red-500">
                    {errors.revokeOtherSessions.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LoadingSwap isLoading={isSubmitting}>Change Password</LoadingSwap>
      </Button>
    </form>
  );
}
