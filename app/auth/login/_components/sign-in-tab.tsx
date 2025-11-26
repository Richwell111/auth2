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
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasskeyButton } from "./passkey-button";

const signInSchema = z.object({
  
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),

});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInTab({
  openEmailVerificationTab,
  openForgotPassword,
}: {
  openEmailVerificationTab: (email: string) => void;
  openForgotPassword: () => void;
}) {
  const router = useRouter();
  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { isSubmitting } = form.formState;
  async function handleSignIn(data: SignInForm) {
    authClient.signIn.email(
      { ...data, callbackURL: "/" },
      {
        onError: (error) => {
          if (error.error.code === "EMAIL_NOT_VERIFIED") {
            openEmailVerificationTab(data.email);
          }
          toast.error(error.error.message || "Failed to sign in");
        },
        onSuccess: () => {
          router.push("/");
          toast.success("Signed in successfully");
        },
      }
    );
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return (
    <div className="space-y-4">
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSignIn)}>
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
                autoComplete="email webauthn"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password */}
        {/* <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        /> */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <Button
                  onClick={openForgotPassword}
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-sm font-normal underline"
                >
                  Forgot password?
                </Button>
              </div>

              <PasswordInput
                {...field}
                id="password"
                autoComplete="current-password webauthn"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
      </Button>
    </form>
     <PasskeyButton />
  </div>
  );
}
