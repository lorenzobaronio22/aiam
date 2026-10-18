import { beforeEach, expect, test, vi } from "vite-plus/test";
import type { CreateMemberInput } from "api-contract/schemas";
import {
  ApiError,
  createMember,
  deleteMember,
  errorMessage,
  listMembers,
  updateMember,
} from "./members.ts";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("./api.ts", () => ({
  apiBaseUrl: "",
  api: {
    api: {
      v1: {
        members: {
          $get: api.get,
          $post: api.post,
          ":id": { $patch: api.patch, $delete: api.remove },
        },
      },
    },
  },
}));

/** The subset of `Response` the client actually reads. */
function response(status: number, body: unknown): Response {
  return { status, json: async () => body } as unknown as Response;
}

const validInput: CreateMemberInput = {
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
  dateOfBirth: "1906-12-09",
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("listMembers returns the payload and forwards the query", async () => {
  const payload = { items: [], page: 1, limit: 20, total: 0 };
  api.get.mockResolvedValue(response(200, payload));

  await expect(listMembers({ page: 1, limit: 20, search: "ada" })).resolves.toEqual(payload);
  expect(api.get).toHaveBeenCalledWith({
    query: { page: "1", limit: "20", search: "ada" },
  });
});

test("listMembers omits an empty search from the query", async () => {
  api.get.mockResolvedValue(response(200, { items: [], page: 1, limit: 20, total: 0 }));

  await listMembers({ page: 2, limit: 20 });

  expect(api.get).toHaveBeenCalledWith({ query: { page: "2", limit: "20" } });
});

test("a failed request becomes an ApiError carrying the API error code", async () => {
  api.get.mockResolvedValue(
    response(409, {
      error: { code: "CONFLICT", message: "Email already used", requestId: "req-1" },
    }),
  );

  const failure = await listMembers({ page: 1, limit: 20 }).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(ApiError);
  expect(failure).toMatchObject({ code: "CONFLICT", message: "Email already used" });
});

test("an unreadable error body falls back to a status-based ApiError", async () => {
  api.get.mockResolvedValue({
    status: 500,
    json: async () => {
      throw new Error("invalid json");
    },
  } as unknown as Response);

  await expect(listMembers({ page: 1, limit: 20 })).rejects.toMatchObject({
    code: "INTERNAL_ERROR",
    message: "Request failed with status 500",
  });
});

test("createMember returns the created member", async () => {
  const member = { id: "1", ...validInput };
  api.post.mockResolvedValue(response(201, { member }));

  await expect(createMember(validInput)).resolves.toEqual(member);
  expect(api.post).toHaveBeenCalledWith({ json: validInput });
});

test("createMember surfaces a conflict as an ApiError", async () => {
  api.post.mockResolvedValue(
    response(409, {
      error: { code: "CONFLICT", message: "Email already used", requestId: "req-3" },
    }),
  );

  await expect(createMember(validInput)).rejects.toMatchObject({ code: "CONFLICT" });
});

test("updateMember returns the updated member", async () => {
  const member = { id: "1", ...validInput, lastName: "King" };
  api.patch.mockResolvedValue(response(200, { member }));

  await expect(updateMember("1", { lastName: "King" })).resolves.toEqual(member);
  expect(api.patch).toHaveBeenCalledWith({ param: { id: "1" }, json: { lastName: "King" } });
});

test("updateMember surfaces a failure as an ApiError", async () => {
  api.patch.mockResolvedValue(
    response(404, {
      error: { code: "NOT_FOUND", message: "Member not found", requestId: "req-4" },
    }),
  );

  await expect(updateMember("1", { lastName: "King" })).rejects.toMatchObject({
    code: "NOT_FOUND",
  });
});

test("deleteMember resolves on 204 and throws otherwise", async () => {
  api.remove.mockResolvedValueOnce(response(204, undefined));
  await expect(deleteMember("1")).resolves.toBeUndefined();

  api.remove.mockResolvedValueOnce(
    response(404, { error: { code: "NOT_FOUND", message: "gone", requestId: "req-2" } }),
  );
  await expect(deleteMember("1")).rejects.toMatchObject({ code: "NOT_FOUND" });
});

test("errorMessage surfaces Error messages and hides anything else", () => {
  expect(errorMessage(new Error("boom"))).toBe("boom");
  expect(errorMessage("a string")).toBe("Something went wrong. Please try again.");
  expect(errorMessage(undefined)).toBe("Something went wrong. Please try again.");
});
