import { ErrorBodySchema } from "api-contract/schemas";
import type {
  CreateMemberInput,
  ListMembersResult,
  Member,
  UpdateMemberInput,
} from "api-contract/schemas";
import { api } from "./api.ts";

/** A failed request carrying the API's stable error code. */
export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/** Renders any thrown value as a message that is safe to show to a user. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Reads the shared error envelope from a failed response. Parsing with the
 * contract schema (instead of casting) keeps the client honest about the shape.
 */
async function toApiError(response: Response): Promise<ApiError> {
  try {
    const parsed = ErrorBodySchema.safeParse(await response.json());
    if (parsed.success) return new ApiError(parsed.data.error.code, parsed.data.error.message);
  } catch {
    // Unreadable body — fall through to the generic message.
  }
  return new ApiError("INTERNAL_ERROR", `Request failed with status ${response.status}`);
}

export interface ListMembersOptions {
  page: number;
  limit: number;
  search?: string;
}

export async function listMembers({
  page,
  limit,
  search,
}: ListMembersOptions): Promise<ListMembersResult> {
  const res = await api.api.v1.members.$get({
    query: { page: String(page), limit: String(limit), ...(search ? { search } : {}) },
  });
  if (res.status === 200) return res.json();
  throw await toApiError(res);
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
  const res = await api.api.v1.members.$post({ json: input });
  if (res.status === 201) return (await res.json()).member;
  throw await toApiError(res);
}

export async function updateMember(id: string, input: UpdateMemberInput): Promise<Member> {
  const res = await api.api.v1.members[":id"].$patch({ param: { id }, json: input });
  if (res.status === 200) return (await res.json()).member;
  throw await toApiError(res);
}

export async function deleteMember(id: string): Promise<void> {
  const res = await api.api.v1.members[":id"].$delete({ param: { id } });
  if (res.status === 204) return;
  throw await toApiError(res);
}
