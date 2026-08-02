import type {
  Member,
  MemberApiPayload,
  MemberInput,
  ProblemResponse,
} from "../types/members";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, title: string, detail: string) {
    super(title);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function toMember(payload: MemberApiPayload): Member {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("problem+json")) {
    const payload = (await response.json()) as ProblemResponse;
    return new ApiError(
      response.status,
      payload.title ?? "Richiesta non riuscita",
      payload.detail ?? "Non e stato possibile completare l'operazione.",
    );
  }

  return new ApiError(
    response.status,
    "Richiesta non riuscita",
    await response.text(),
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listMembers(): Promise<Member[]> {
  const payload = await request<MemberApiPayload[]>("/members", {
    headers: { Accept: jsonHeaders.Accept },
  });

  return payload.map(toMember);
}

export async function getMember(memberId: string): Promise<Member> {
  const payload = await request<MemberApiPayload>(`/members/${memberId}`, {
    headers: { Accept: jsonHeaders.Accept },
  });

  return toMember(payload);
}

export async function createMember(input: MemberInput): Promise<Member> {
  const payload = await request<MemberApiPayload>("/members", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });

  return toMember(payload);
}

export async function updateMember(memberId: string, input: MemberInput): Promise<Member> {
  const payload = await request<MemberApiPayload>(`/members/${memberId}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });

  return toMember(payload);
}

export async function deleteMember(memberId: string): Promise<void> {
  await request<void>(`/members/${memberId}`, {
    method: "DELETE",
    headers: { Accept: jsonHeaders.Accept },
  });
}