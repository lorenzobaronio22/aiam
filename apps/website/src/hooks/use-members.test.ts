import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { useMembers } from "./use-members.ts";

const membersLib = vi.hoisted(() => ({
  listMembers: vi.fn(),
  errorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : "failed")),
}));

vi.mock("@/lib/members.ts", () => membersLib);

const page = { items: [], page: 1, limit: 10, total: 0 };

beforeEach(() => {
  vi.clearAllMocks();
});

test("loads a page and reports ready", async () => {
  membersLib.listMembers.mockResolvedValue(page);

  const { result } = renderHook(() => useMembers({ page: 1, limit: 10, search: "" }));

  expect(result.current.status).toBe("loading");
  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(result.current.data).toEqual(page);
  expect(membersLib.listMembers).toHaveBeenCalledWith({ page: 1, limit: 10, search: undefined });
});

test("surfaces a request error through errorMessage", async () => {
  membersLib.listMembers.mockRejectedValue(new Error("network down"));

  const { result } = renderHook(() => useMembers({ page: 1, limit: 10, search: "" }));

  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.error).toBe("network down");
  expect(result.current.data).toBeNull();
});

test("refresh re-fetches the current page", async () => {
  membersLib.listMembers.mockResolvedValue(page);

  const { result } = renderHook(() => useMembers({ page: 1, limit: 10, search: "" }));
  await waitFor(() => expect(membersLib.listMembers).toHaveBeenCalledTimes(1));

  result.current.refresh();

  await waitFor(() => expect(membersLib.listMembers).toHaveBeenCalledTimes(2));
});

test("re-fetches when the query changes", async () => {
  membersLib.listMembers.mockResolvedValue(page);

  const { rerender } = renderHook(
    ({ search }: { search: string }) => useMembers({ page: 1, limit: 10, search }),
    { initialProps: { search: "" } },
  );
  await waitFor(() => expect(membersLib.listMembers).toHaveBeenCalledTimes(1));

  rerender({ search: "ada" });

  await waitFor(() =>
    expect(membersLib.listMembers).toHaveBeenLastCalledWith({ page: 1, limit: 10, search: "ada" }),
  );
});

test("ignores a response that arrives after unmount", async () => {
  let resolve: (value: typeof page) => void = () => {};
  membersLib.listMembers.mockReturnValue(
    new Promise((res) => {
      resolve = res;
    }),
  );

  const { unmount } = renderHook(() => useMembers({ page: 1, limit: 10, search: "" }));
  unmount();
  resolve(page);

  // No state update after unmount means no act() warning and no thrown error.
  await Promise.resolve();
});
