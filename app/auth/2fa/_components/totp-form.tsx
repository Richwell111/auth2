"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const totpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type TotpFormType = z.infer<typeof totpSchema>;

export function TotpForm() {
  const router = useRouter();

  const form = useForm<TotpFormType>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "" },
  });

  const { register, handleSubmit, formState } = form;
  const { isSubmitting, errors } = formState;

  async function handleTotpVerification(data: TotpFormType) {
    await authClient.twoFactor.verifyTotp(data, {
      onError: (error) => {
        toast.error(error.error.message || "Failed to verify code");
      },
      onSuccess: () => {
        router.push("/");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(handleTotpVerification)} className="space-y-6">
      <FieldSet>
        <FieldLabel className="text-lg font-semibold">
          Verify 2FA Code
        </FieldLabel>
        <FieldDescription>
          Enter the 6-digit verification code from your authenticator app.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>Code</FieldLabel>
            <Input
              type="text"
              maxLength={6}
              placeholder="123456"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </Field>

          <Button type="submit" disabled={isSubmitting} className="w-fit mt-2">
            <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
