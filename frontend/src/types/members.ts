export interface MemberIdentifier {
  type: "tax_id";
  country: "IT";
  value: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  identifiers: readonly MemberIdentifier[];
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
  created_at: string;
  updated_at: string;
}

export interface ProblemResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}