export interface MemberIdentifier {
  type: "tax_id";
  country: "IT";
  value: string;
}

export interface MemberAttributeValue {
  definitionId: string;
  key: string;
  label: string;
  value: string;
}

export interface MemberAttributeValueApiPayload {
  definition_id: string;
  key: string;
  label: string;
  value: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  identifiers: readonly MemberIdentifier[];
  attributes: readonly MemberAttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberInput {
  name: string;
  email: string;
  identifiers: MemberIdentifier[];
  attributes: Record<string, string>;
}

export interface MemberApiPayload {
  id: string;
  name: string;
  email: string;
  identifiers: MemberIdentifier[];
  attributes: MemberAttributeValueApiPayload[];
  created_at: string;
  updated_at: string;
}

export interface ProblemResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}