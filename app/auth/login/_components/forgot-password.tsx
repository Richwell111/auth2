"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword({ openSignInTab }: { openSignInTab: () => void }) {
  
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
     
    },
  });
  const { isSubmitting } = form.formState;
   async function handleForgotPassword(data: ForgotPasswordForm) {
     await authClient.requestPasswordReset(
       {
         ...data,
         redirectTo: "/auth/reset-password",
       },
       {
         onError: (error) => {
           toast.error(
             error.error.message || "Failed to send password reset email"
           );
         },
         onSuccess: () => {
           toast.success("Password reset email sent");
         },
       }
     );
   }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(handleForgotPassword)}
    >
      <FieldGroup>
        {/* Email */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                {...field}
                id="email"
                aria-invalid={fieldState.invalid}
                placeholder="test@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={openSignInTab}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <LoadingSwap isLoading={isSubmitting}>Send Reset Email</LoadingSwap>
        </Button>
      </div>
    </form>
  );
}
