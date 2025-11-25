"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";

const twoFactorAuthSchema = z.object({
  password: z.string().min(1),
});

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>;
type TwoFactorData = { totpURI: string; backupCodes: string[] };

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null
  );
  const router = useRouter();

  const form = useForm<TwoFactorAuthForm>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: { password: "" },
  });

  const { isSubmitting } = form.formState;

  async function handleDisableTwoFactorAuth(data: TwoFactorAuthForm) {
    await authClient.twoFactor.disable(
      { password: data.password },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to disable 2FA");
        },
        onSuccess: () => {
          form.reset();
          router.refresh();
        },
      }
    );
  }

  async function handleEnableTwoFactorAuth(data: TwoFactorAuthForm) {
    const result = await authClient.twoFactor.enable({
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message || "Failed to enable 2FA");
    } else {
      setTwoFactorData(result.data);
      form.reset();
    }
  }

  if (twoFactorData != null) {
    return (
      <QRCodeVerify {...twoFactorData} onDone={() => setTwoFactorData(null)} />
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(
        isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth
      )}
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Password</FieldLabel>

            <Controller
              name="password"
              control={form.control}
              render={({ field }) => <PasswordInput {...field} />}
            />

            <FieldDescription>
              {form.formState.errors.password?.message}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        variant={isEnabled ? "destructive" : "default"}
      >
        <LoadingSwap isLoading={isSubmitting}>
          {isEnabled ? "Disable 2FA" : "Enable 2FA"}
        </LoadingSwap>
      </Button>
    </form>
  );
}

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const [successfullyEnabled, setSuccessfullyEnabled] = useState(false);
  const router = useRouter();

  const form = useForm<QrForm>({
    resolver: zodResolver(qrSchema),
    defaultValues: { token: "" },
  });

  const { isSubmitting } = form.formState;

  async function handleQrCode(data: QrForm) {
    await authClient.twoFactor.verifyTotp(
      { code: data.token },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to verify code");
        },
        onSuccess: () => {
          setSuccessfullyEnabled(true);
          router.refresh();
        },
      }
    );
  }

  if (successfullyEnabled) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          Save these backup codes safely.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((c, i) => (
            <div key={i} className="font-mono text-sm">
              {c}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Scan the QR code and enter the 6-digit code:
      </p>

      <form className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Code</FieldLabel>

              <Controller
                name="token"
                control={form.control}
                render={({ field }) => <Input {...field} />}
              />

              <FieldDescription>
                {form.formState.errors.token?.message}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>Submit Code</LoadingSwap>
        </Button>
      </form>

      <div className="p-4 bg-white w-fit rounded">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  );
}
