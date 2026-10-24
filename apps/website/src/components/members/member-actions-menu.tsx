import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Member } from "api-contract/schemas";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemberActionsMenuProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  /** Extra classes for the trigger, e.g. a larger tap target on touch screens. */
  className?: string;
}

/**
 * The edit/delete menu shared by the desktop table row and the mobile card so
 * both present the same actions with the same accessible name.
 */
export function MemberActionsMenu({ member, onEdit, onDelete, className }: MemberActionsMenuProps) {
  const name = `${member.firstName} ${member.lastName}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(className)}
          aria-label={`Actions for ${name}`}
        >
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(member)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(member)}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
