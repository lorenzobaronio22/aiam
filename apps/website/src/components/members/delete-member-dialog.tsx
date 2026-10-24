import { useState } from "react";
import type { Member } from "api-contract/schemas";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteMember, errorMessage } from "@/lib/members.ts";

interface DeleteMemberDialogProps {
  /** The member to delete, or `null` to keep the dialog closed. */
  member: Member | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteMemberDialog({ member, onOpenChange, onDeleted }: DeleteMemberDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const name = member ? `${member.firstName} ${member.lastName}` : "this member";

  async function handleConfirm() {
    if (!member) return;
    setDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success("Member deleted");
      onOpenChange(false);
      onDeleted();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={member !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete member?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes {name} from the directory. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            // Keep the dialog open until the request settles so errors are visible.
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {deleting ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
