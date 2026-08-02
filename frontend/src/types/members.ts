export interface Member {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberInput {
  name: string;
  email: string;
}

export interface MemberApiPayload {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}