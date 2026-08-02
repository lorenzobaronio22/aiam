import type { Member } from "../../types/members";

type MemberOverrides = Partial<Member>;

const DEFAULT_MEMBER: Member = {
  id: "member-1",
  name: "Giulia Rossi",
  email: "giulia@example.com",
  createdAt: "2026-08-02T08:00:00Z",
  updatedAt: "2026-08-02T08:00:00Z",
};

export function buildMember(overrides: MemberOverrides = {}): Member {
  return {
    ...DEFAULT_MEMBER,
    ...overrides,
  };
}

export function buildMemberList(...overrides: MemberOverrides[]): Member[] {
  if (overrides.length === 0) {
    return [buildMember()];
  }

  return overrides.map((entry) => buildMember(entry));
}
