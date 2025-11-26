"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

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
  FieldSeparator,
  FieldLegend,
} from "@/components/ui/field";

import { useState } from "react";

const createOrganizationSchema = z.object({
  name: z.string().min(1),
});

type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;

export function CreateOrganizationButton() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  async function handleCreateOrganization(data: CreateOrganizationForm) {
    const slug = data.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const res = await authClient.organization.create({
      name: data.name,
      slug,
    });

    if (res.error) {
      toast.error(res.error.message || "Failed to create organization");
    } else {
      reset();
      setOpen(false);
      await authClient.organization.setActive({
        organizationId: res.data.id,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Organization</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateOrganization)}>
          <FieldSet>
            <FieldLegend>Organization Details</FieldLegend>

            <FieldGroup>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input {...register("name")} />
                <FieldDescription>
                  Enter the name of your organization.
                </FieldDescription>

                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
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
              <LoadingSwap isLoading={isSubmitting}>Create</LoadingSwap>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
