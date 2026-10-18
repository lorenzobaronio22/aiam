import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CreateMemberInput, Member } from "api-contract/schemas";
import { CreateMemberSchema } from "api-contract/schemas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createMember, errorMessage, updateMember } from "@/lib/members.ts";

const EMPTY_MEMBER: CreateMemberInput = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  phoneNumber: "",
  address: "",
  notes: "",
};

function toFormValues(member: Member): CreateMemberInput {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    dateOfBirth: member.dateOfBirth,
    phoneNumber: member.phoneNumber ?? "",
    address: member.address ?? "",
    notes: member.notes ?? "",
  };
}

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The member being edited, or `null` to create a new one. */
  member: Member | null;
  onSaved: () => void;
}

/**
 * Create/edit form. It reuses the contract's `CreateMemberSchema` for
 * validation, so the rules shown here are the same ones the API enforces.
 */
export function MemberFormDialog({ open, onOpenChange, member, onSaved }: MemberFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(CreateMemberSchema),
    defaultValues: EMPTY_MEMBER,
  });

  // Reset to the right values each time the dialog opens (create vs. edit).
  useEffect(() => {
    if (!open) return;
    reset(member ? toFormValues(member) : EMPTY_MEMBER);
  }, [open, member, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (member) {
        await updateMember(member.id, values);
        toast.success("Member updated");
      } else {
        await createMember(values);
        toast.success("Member created");
      }
      onOpenChange(false);
      onSaved();
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle>
          <DialogDescription>
            {member
              ? "Update this member's details and save your changes."
              : "Add a person to the member directory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.firstName)}>
                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  {...register("firstName")}
                />
                <FieldError errors={[errors.firstName]} />
              </Field>
              <Field data-invalid={Boolean(errors.lastName)}>
                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  {...register("lastName")}
                />
                <FieldError errors={[errors.lastName]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.dateOfBirth)}>
                <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  {...register("dateOfBirth")}
                />
                <FieldError errors={[errors.dateOfBirth]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  {...register("phoneNumber")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                autoComplete="street-address"
                placeholder="Optional"
                {...register("address")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" rows={3} placeholder="Optional" {...register("notes")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              {member ? "Save changes" : "Create member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
