"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { useRouter, useSearchParams } from "next/navigation"; // Updated import to include useSearchParams
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth/auth-client";

/* -------------------------- Validation Schema -------------------------- */
const resetPasswordSchema = z.object({
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

/* -------------------------- Suspense Wrapper -------------------------- */
function ResetPasswordContent() {
  const router = useRouter();
  // FIXED: Replaced window.location.search with the Next.js useSearchParams hook
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const { isSubmitting } = form.formState;

  async function handleResetPassword(data: ResetPasswordForm) {
    if (!token) return;

    await authClient.resetPassword(
      { newPassword: data.password, token },
      {
        onError: (err) => {
          toast.error(err.error?.message || "Failed to reset password");
        },
        onSuccess: () => {
          toast.success("Password reset successful", {
            description: "Redirecting to login...",
          });
          setTimeout(() => router.push("/auth/login"), 1000);
        },
      }
    );
  }

  if (!token || error) {
    return (
      <div className="my-6 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleResetPassword)}
        >
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <PasswordInput autoFocus {...field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>Reset Password</LoadingSwap>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* -------------------------- Main Page with Loading Card -------------------------- */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="my-6 px-4">
          <Card className="w-full max-w-md mx-auto animate-pulse">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>
                Please wait while we prepare the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
