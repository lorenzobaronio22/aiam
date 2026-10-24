import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import type { Member } from "api-contract/schemas";
import { DeleteMemberDialog } from "./delete-member-dialog.tsx";

const membersLib = vi.hoisted(() => ({
  deleteMember: vi.fn(),
  errorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : "failed")),
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/lib/members.ts", () => membersLib);
vi.mock("sonner", () => ({ toast }));

const member: Member = {
  id: "member-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  dateOfBirth: "1815-12-10",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("deletes, notifies, closes, and refreshes", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const onDeleted = vi.fn();
  membersLib.deleteMember.mockResolvedValue(undefined);

  render(<DeleteMemberDialog member={member} onOpenChange={onOpenChange} onDeleted={onDeleted} />);

  expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete" }));

  await waitFor(() => expect(membersLib.deleteMember).toHaveBeenCalledWith("member-1"));
  expect(toast.success).toHaveBeenCalledWith("Member deleted");
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(onDeleted).toHaveBeenCalled();
});

test("reports a failed delete and stays open", async () => {
  const user = userEvent.setup();
  const onDeleted = vi.fn();
  membersLib.deleteMember.mockRejectedValue(new Error("Member not found"));

  render(<DeleteMemberDialog member={member} onOpenChange={vi.fn()} onDeleted={onDeleted} />);

  await user.click(screen.getByRole("button", { name: "Delete" }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Member not found"));
  expect(onDeleted).not.toHaveBeenCalled();
});

test("cancelling closes without calling the API", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();

  render(<DeleteMemberDialog member={member} onOpenChange={onOpenChange} onDeleted={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(membersLib.deleteMember).not.toHaveBeenCalled();
});
