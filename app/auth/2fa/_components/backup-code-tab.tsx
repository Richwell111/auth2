"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      {/* --- PASSWORD SETTINGS --- */}
      <FieldSet>
        <FieldLabel className="text-lg font-semibold">Password</FieldLabel>
        <FieldDescription>
          Update your account password. Make sure it is strong.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>Current Password</FieldLabel>
            <Input type="password" placeholder="••••••••" />
          </Field>

          <Field>
            <FieldLabel>New Password</FieldLabel>
            <Input type="password" placeholder="Enter new password" />
          </Field>

          <Field>
            <FieldLabel>Confirm New Password</FieldLabel>
            <Input type="password" placeholder="Re-enter new password" />
          </Field>

          <Button className="w-fit mt-2">Update Password</Button>
        </FieldGroup>
      </FieldSet>

      {/* --- 2FA SETTINGS --- */}
      <FieldSet>
        <FieldLabel className="text-lg font-semibold">
          Two-Factor Authentication
        </FieldLabel>
        <FieldDescription>
          Add an extra layer of security to your account.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>2FA Status</FieldLabel>
            <p className="text-sm text-muted-foreground">Disabled</p>
          </Field>

          <Button className="w-fit mt-2">Enable 2FA</Button>
        </FieldGroup>
      </FieldSet>

      {/* --- LOGIN ACTIVITY --- */}
      <FieldSet>
        <FieldLabel className="text-lg font-semibold">
          Login Activity
        </FieldLabel>
        <FieldDescription>
          Recent devices and sessions associated with your account.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>Last Login</FieldLabel>
            <p className="text-sm text-muted-foreground">
              Today, 2:41 PM — Chrome on Windows
            </p>
          </Field>

          <Button variant="outline" className="w-fit mt-2">
            View All Sessions
          </Button>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
