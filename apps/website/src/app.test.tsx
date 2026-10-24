import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { App } from "./app.tsx";

const membersLib = vi.hoisted(() => ({
  listMembers: vi.fn(),
  errorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : "failed")),
}));

vi.mock("@/lib/members.ts", () => membersLib);
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  membersLib.listMembers.mockResolvedValue({ items: [], page: 1, limit: 10, total: 0 });
});

test("renders the app shell and the members directory", async () => {
  render(<App />);

  expect(screen.getAllByText("Members").length).toBeGreaterThan(0);
  expect(await screen.findByText("Directory")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Change theme" })).toBeInTheDocument();
});
