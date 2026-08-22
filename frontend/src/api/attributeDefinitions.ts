import type {
  AttributeDefinition,
  AttributeDefinitionInput,
  AttributeDefinitionUpdateInput,
} from "../types/attributeDefinitions";
import { ApiError } from "./members";

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`Invalid attribute definition payload: missing ${field}.`);
}

function toProblemDetail(payload: unknown): string {
  if (!isRecord(payload)) {
    return "";
  }

  return typeof payload.detail === "string" ? payload.detail : "";
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("problem+json")) {
    return new ApiError(
      response.status,
      "Richiesta non riuscita",
      toProblemDetail(await response.json()) || "Non e stato possibile completare l'operazione.",
    );
  }

  return new ApiError(response.status, "Richiesta non riuscita", await response.text());
}

function toAttributeDefinition(value: unknown): AttributeDefinition {
  if (!isRecord(value)) {
    throw new Error("Invalid attribute definition payload: expected object.");
  }

  const status = value.status === "deleted" ? "deleted" : "active";

  return {
    id: readRequiredString(value.id, "id"),
    key: readRequiredString(value.key, "key"),
    label: readRequiredString(value.label, "label"),
    status,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

export async function listAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const payload = await request<unknown>("/attribute-definitions", {
    headers: { Accept: jsonHeaders.Accept },
  });

  if (!Array.isArray(payload)) {
    throw new Error("Invalid attribute definitions payload: expected array.");
  }

  return payload.map(toAttributeDefinition);
}

export async function createAttributeDefinition(
  input: AttributeDefinitionInput,
): Promise<AttributeDefinition> {
  return toAttributeDefinition(
    await request<unknown>("/attribute-definitions", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    }),
  );
}

export async function updateAttributeDefinitionLabel(
  definitionId: string,
  input: AttributeDefinitionUpdateInput,
): Promise<AttributeDefinition> {
  return toAttributeDefinition(
    await request<unknown>(`/attribute-definitions/${definitionId}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    }),
  );
}

export async function deleteAttributeDefinition(
  definitionId: string,
): Promise<AttributeDefinition> {
  return toAttributeDefinition(
    await request<unknown>(`/attribute-definitions/${definitionId}`, {
      method: "DELETE",
      headers: { Accept: jsonHeaders.Accept },
    }),
  );
}

export async function restoreAttributeDefinition(
  definitionId: string,
): Promise<AttributeDefinition> {
  return toAttributeDefinition(
    await request<unknown>(`/attribute-definitions/${definitionId}/restore`, {
      method: "POST",
      headers: { Accept: jsonHeaders.Accept },
    }),
  );
}
