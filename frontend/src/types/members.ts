export interface MemberIdentifier {
  type: "tax_id";
  country: "IT";
  value: string;
}

export interface MemberAttribute {
  id: string;
  key: string;
  label: string;
  value: string;
}

export interface MemberAttributeInput {
  key: string;
  label: string;
  value: string;
}

export interface MemberAttributeUpdateInput {
  label?: string;
  value?: string;
}

export interface MemberAttributeApiPayload {
  id: string;
  key: string;
  label: string;
  value: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  identifiers: readonly MemberIdentifier[];
  attributes: readonly MemberAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberInput {
  name: string;
  email: string;
  identifiers: MemberIdentifier[];
}

export interface MemberApiPayload {
  id: string;
  name: string;
  email: string;
  identifiers: MemberIdentifier[];
  attributes: MemberAttributeApiPayload[];
  created_at: string;
  updated_at: string;
}

export interface ProblemResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}