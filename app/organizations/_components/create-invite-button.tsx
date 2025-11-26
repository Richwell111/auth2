"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"; // Import z

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";

const createInviteSchema = z.object({
  email: z.string().email().trim(),
  role: z.enum(["member", "admin"]),
});

type CreateInviteForm = z.infer<typeof createInviteSchema>;

export function CreateInviteButton() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateInviteForm>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  async function handleCreateInvite(data: CreateInviteForm) {
    await authClient.organization.inviteMember(data, {
      onError: (error) => {
        toast.error(error.error.message || "Failed to invite user");
      },
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("User invited!"); // Added toast for success feedback
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite User</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Invite a user to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateInvite)}>
          <FieldSet>
            <FieldLegend>User Details</FieldLegend>

            <FieldGroup>
              {/* EMAIL FIELD */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </Field>

              {/* ROLE SELECT */}
              <Field>
                <FieldLabel>Role</FieldLabel>

                <Select
                  value={watch("role")}
                  // THE FIX IS HERE:
                  onValueChange={(v) =>
                    setValue("role", v as CreateInviteForm["role"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Choose what permission level the user should have.
                </FieldDescription>

                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </Field>
            </FieldGroup>

            <FieldSeparator />
          </FieldSet>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <LoadingSwap isLoading={isSubmitting}>Invite</LoadingSwap>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
