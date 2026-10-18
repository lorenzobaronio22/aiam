import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import type { Member } from "api-contract/schemas";
import { MemberFormDialog } from "./member-form-dialog.tsx";

const membersLib = vi.hoisted(() => ({
  createMember: vi.fn(),
  updateMember: vi.fn(),
  errorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : "failed")),
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/lib/members.ts", () => membersLib);
vi.mock("sonner", () => ({ toast }));

const existing: Member = {
  id: "member-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  dateOfBirth: "1815-12-10",
  phoneNumber: "+44 20 7946 0101",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("validates required fields before calling the API", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();

  render(<MemberFormDialog open onOpenChange={onOpenChange} member={null} onSaved={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Create member" }));

  expect(await screen.findByText("First name is required")).toBeInTheDocument();
  expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  expect(membersLib.createMember).not.toHaveBeenCalled();
});

test("creates a member, notifies, closes, and refreshes", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const onSaved = vi.fn();
  membersLib.createMember.mockResolvedValue(existing);

  render(<MemberFormDialog open onOpenChange={onOpenChange} member={null} onSaved={onSaved} />);

  await user.type(screen.getByLabelText("First name"), "Grace");
  await user.type(screen.getByLabelText("Last name"), "Hopper");
  await user.type(screen.getByLabelText("Email"), "grace@example.com");
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "1906-12-09" } });
  await user.click(screen.getByRole("button", { name: "Create member" }));

  await waitFor(() => expect(membersLib.createMember).toHaveBeenCalledTimes(1));
  expect(membersLib.createMember).toHaveBeenCalledWith(
    expect.objectContaining({
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      dateOfBirth: "1906-12-09",
    }),
  );
  expect(toast.success).toHaveBeenCalledWith("Member created");
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(onSaved).toHaveBeenCalled();
});

test("prefills and updates an existing member", async () => {
  const user = userEvent.setup();
  membersLib.updateMember.mockResolvedValue(existing);

  render(<MemberFormDialog open onOpenChange={vi.fn()} member={existing} onSaved={vi.fn()} />);

  expect(screen.getByLabelText("First name")).toHaveValue("Ada");

  await user.clear(screen.getByLabelText("Last name"));
  await user.type(screen.getByLabelText("Last name"), "King");
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  await waitFor(() =>
    expect(membersLib.updateMember).toHaveBeenCalledWith(
      "member-1",
      expect.objectContaining({ lastName: "King" }),
    ),
  );
  expect(toast.success).toHaveBeenCalledWith("Member updated");
});

test("keeps the dialog open and reports a server error", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  membersLib.createMember.mockRejectedValue(new Error("Email already used"));

  render(<MemberFormDialog open onOpenChange={onOpenChange} member={null} onSaved={vi.fn()} />);

  await user.type(screen.getByLabelText("First name"), "Ada");
  await user.type(screen.getByLabelText("Last name"), "Again");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "1815-12-10" } });
  await user.click(screen.getByRole("button", { name: "Create member" }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Email already used"));
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
});

test("cancelling closes the dialog without saving", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();

  render(<MemberFormDialog open onOpenChange={onOpenChange} member={null} onSaved={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(membersLib.createMember).not.toHaveBeenCalled();
});
