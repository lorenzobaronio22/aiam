import type { AttributeType } from "../types/attributeTypes";
import { ApiError } from "./members";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`Invalid attribute type payload: missing ${field}.`);
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

function toAttributeType(value: unknown): AttributeType {
  if (!isRecord(value)) {
    throw new Error("Invalid attribute type payload: expected object.");
  }

  return {
    key: readRequiredString(value.key, "key"),
    name: readRequiredString(value.name, "name"),
    description: readRequiredString(value.description, "description"),
  };
}

export async function listAttributeTypes(): Promise<AttributeType[]> {
  const response = await fetch("/attribute-types", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Invalid attribute types payload: expected array.");
  }

  return payload.map(toAttributeType);
}
