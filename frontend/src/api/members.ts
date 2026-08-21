import type {
  Member,
  MemberApiPayload,
  MemberAttributeApiPayload,
  MemberAttributeInput,
  MemberAttributeUpdateInput,
  MemberIdentifier,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`Invalid member payload: missing ${field}.`);
}

function toProblemResponse(payload: unknown): ProblemResponse {
  if (!isRecord(payload)) {
    return {};
  }

  return {
    type: readString(payload.type),
    title: readString(payload.title),
    status: typeof payload.status === "number" ? payload.status : undefined,
    detail: readString(payload.detail),
  };
}

function toMemberIdentifier(value: unknown): MemberIdentifier {
  if (!isRecord(value)) {
    throw new Error("Invalid member payload: expected identifier object.");
  }

  return {
    type: readRequiredString(value.type, "identifier type") as MemberIdentifier["type"],
    country: readRequiredString(value.country, "identifier country") as MemberIdentifier["country"],
    value: readRequiredString(value.value, "identifier value"),
  };
}

function toMemberIdentifiers(payload: unknown): MemberIdentifier[] {
  if (payload === undefined || payload === null) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error("Invalid member payload: expected identifiers array.");
  }

  return payload.map(toMemberIdentifier);
}

function toMemberAttribute(value: unknown): MemberAttributeApiPayload {
  if (!isRecord(value)) {
    throw new Error("Invalid member payload: expected attribute object.");
  }

  return {
    id: readRequiredString(value.id, "attribute id"),
    key: readRequiredString(value.key, "attribute key"),
    label: readRequiredString(value.label, "attribute label"),
    value: readString(value.value),
  };
}

function toMemberAttributes(payload: unknown): MemberAttributeApiPayload[] {
  if (payload === undefined || payload === null) {
    return [];
  }

  if (!Array.isArray(payload)) {
    throw new Error("Invalid member payload: expected attributes array.");
  }

  return payload.map(toMemberAttribute);
}

export function toMemberPayload(payload: unknown): MemberApiPayload {
  if (!isRecord(payload)) {
    throw new Error("Invalid member payload: expected object.");
  }

  return {
    id: readRequiredString(payload.id, "id"),
    name: readRequiredString(payload.name, "name"),
    email: readRequiredString(payload.email, "email"),
    identifiers: toMemberIdentifiers(payload.identifiers),
    attributes: toMemberAttributes(payload.attributes),
    created_at: readRequiredString(payload.created_at, "created_at"),
    updated_at: readRequiredString(payload.updated_at, "updated_at"),
  };
}

function toMemberPayloadList(payload: unknown): MemberApiPayload[] {
  if (!Array.isArray(payload)) {
    throw new Error("Invalid members payload: expected array.");
  }

  return payload.map(toMemberPayload);
}

export function toMember(payload: MemberApiPayload): Member {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    identifiers: payload.identifiers,
    attributes: payload.attributes,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("problem+json")) {
    const payload = toProblemResponse(await response.json());
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
  const payload = toMemberPayloadList(await request<unknown>("/members", {
    headers: { Accept: jsonHeaders.Accept },
  }));

  return payload.map(toMember);
}

export async function getMember(memberId: string): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>(`/members/${memberId}`, {
    headers: { Accept: jsonHeaders.Accept },
  }));

  return toMember(payload);
}

export async function createMember(input: MemberInput): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>("/members", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  }));

  return toMember(payload);
}

export async function updateMember(memberId: string, input: MemberInput): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>(`/members/${memberId}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  }));

  return toMember(payload);
}

export async function deleteMember(memberId: string): Promise<void> {
  await request<void>(`/members/${memberId}`, {
    method: "DELETE",
    headers: { Accept: jsonHeaders.Accept },
  });
}

export async function addMemberAttribute(
  memberId: string,
  input: MemberAttributeInput,
): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>(`/members/${memberId}/attributes`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  }));

  return toMember(payload);
}

export async function updateMemberAttribute(
  memberId: string,
  attributeId: string,
  input: MemberAttributeUpdateInput,
): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>(
    `/members/${memberId}/attributes/${attributeId}`,
    {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    },
  ));

  return toMember(payload);
}

export async function deleteMemberAttribute(
  memberId: string,
  attributeId: string,
): Promise<Member> {
  const payload = toMemberPayload(await request<unknown>(
    `/members/${memberId}/attributes/${attributeId}`,
    {
      method: "DELETE",
      headers: { Accept: jsonHeaders.Accept },
    },
  ));

  return toMember(payload);
}