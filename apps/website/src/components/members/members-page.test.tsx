import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import type { Member } from "api-contract/schemas";
import { MembersPage } from "./members-page.tsx";

const membersLib = vi.hoisted(() => ({
  listMembers: vi.fn(),
  errorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : "failed")),
}));

vi.mock("@/lib/members.ts", () => membersLib);

// The dialogs have their own tests; here they are stubs that expose their props.
vi.mock("./member-form-dialog.tsx", () => ({
  MemberFormDialog: ({ open, member }: { open: boolean; member: Member | null }) => (
    <div data-testid="form-dialog">
      {open ? (member ? `editing:${member.id}` : "creating") : "closed"}
    </div>
  ),
}));

vi.mock("./delete-member-dialog.tsx", () => ({
  DeleteMemberDialog: ({
    member,
    onOpenChange,
  }: {
    member: Member | null;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="delete-dialog">
      {member ? member.id : "closed"}
      <button onClick={() => onOpenChange(false)}>dismiss-delete</button>
    </div>
  ),
}));

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: "id-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    dateOfBirth: "1815-12-10",
    phoneNumber: "+44 20 7946 0101",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function pageResult(members: Member[], total = members.length) {
  return { items: members, page: 1, limit: 10, total };
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("shows a loading skeleton before the first response arrives", () => {
  membersLib.listMembers.mockReturnValue(new Promise(() => {}));

  render(<MembersPage />);

  expect(screen.getByLabelText("Loading members")).toBeInTheDocument();
});

test("renders the member rows and the total", async () => {
  membersLib.listMembers.mockResolvedValue(pageResult([member()]));

  render(<MembersPage />);

  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  expect(screen.getByText("+44 20 7946 0101")).toBeInTheDocument();
  expect(screen.getByText("1 member")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
});

test("renders a stacked card list on mobile screens", async () => {
  membersLib.listMembers.mockResolvedValue(pageResult([member()]));
  const originalWidth = window.innerWidth;
  window.innerWidth = 375;

  try {
    render(<MembersPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    // The actions sit on the card, so they are reachable without horizontal scrolling.
    expect(screen.getByRole("button", { name: "Actions for Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Date of birth")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  } finally {
    window.innerWidth = originalWidth;
  }
});

test("shows the empty state when there are no members", async () => {
  membersLib.listMembers.mockResolvedValue(pageResult([]));

  render(<MembersPage />);

  expect(await screen.findByText("No members yet")).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Add member" }).length).toBeGreaterThan(0);
});

test("shows the error state and retries on demand", async () => {
  const user = userEvent.setup();
  membersLib.listMembers.mockRejectedValueOnce(new Error("network down"));

  render(<MembersPage />);

  expect(await screen.findByText("Could not load members")).toBeInTheDocument();
  expect(screen.getByText("network down")).toBeInTheDocument();

  membersLib.listMembers.mockResolvedValue(pageResult([member()]));
  await user.click(screen.getByRole("button", { name: "Try again" }));

  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
});

test("searching re-fetches and resets to the first page", async () => {
  const user = userEvent.setup();
  membersLib.listMembers.mockResolvedValue(pageResult([member()]));

  render(<MembersPage />);
  await screen.findByText("Ada Lovelace");

  membersLib.listMembers.mockResolvedValue(pageResult([]));
  await user.type(screen.getByLabelText("Search members"), "grace");

  await waitFor(() =>
    expect(membersLib.listMembers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      search: "grace",
    }),
  );
  expect(await screen.findByText("No matching members")).toBeInTheDocument();
});

test("pagination advances the page", async () => {
  const user = userEvent.setup();
  membersLib.listMembers.mockResolvedValue(pageResult([member()], 25));

  render(<MembersPage />);
  await screen.findByText("Ada Lovelace");
  expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Next" }));

  await waitFor(() =>
    expect(membersLib.listMembers).toHaveBeenLastCalledWith({
      page: 2,
      limit: 10,
      search: undefined,
    }),
  );

  await waitFor(() => expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled());
  await user.click(screen.getByRole("button", { name: "Previous" }));

  await waitFor(() =>
    expect(membersLib.listMembers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      search: undefined,
    }),
  );
});

test("the Add member button opens the create dialog", async () => {
  const user = userEvent.setup();
  membersLib.listMembers.mockResolvedValue(pageResult([]));

  render(<MembersPage />);
  await screen.findByText("No members yet");

  await user.click(screen.getAllByRole("button", { name: "Add member" })[0]!);

  expect(screen.getByTestId("form-dialog")).toHaveTextContent("creating");
});

test("the row actions menu opens the edit and delete dialogs", async () => {
  const user = userEvent.setup();
  membersLib.listMembers.mockResolvedValue(pageResult([member()]));

  render(<MembersPage />);
  await screen.findByText("Ada Lovelace");

  await user.click(screen.getByLabelText("Actions for Ada Lovelace"));
  await user.click(await screen.findByRole("menuitem", { name: /edit/i }));
  expect(screen.getByTestId("form-dialog")).toHaveTextContent("editing:id-1");

  await user.click(screen.getByLabelText("Actions for Ada Lovelace"));
  await user.click(await screen.findByRole("menuitem", { name: /delete/i }));
  expect(screen.getByTestId("delete-dialog")).toHaveTextContent("id-1");

  // Dismissing the delete dialog clears the selection.
  await user.click(screen.getByRole("button", { name: "dismiss-delete" }));
  expect(screen.getByTestId("delete-dialog")).toHaveTextContent("closed");
});
