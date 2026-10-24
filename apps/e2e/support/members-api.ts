import type { APIRequestContext } from "@playwright/test";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
}

/**
 * Thin client for arranging and cleaning up member data over the REST API.
 *
 * Scenarios use this to create predictable fixtures (and remove them again)
 * instead of driving the UI for setup — a common e2e pattern that keeps the
 * assertions focused on the behaviour under test.
 */
export class MembersApi {
  private readonly created = new Set<string>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async create(input: CreateMemberInput): Promise<Member> {
    const response = await this.request.post(`${this.baseUrl}/api/v1/members`, { data: input });
    if (response.status() !== 201) {
      throw new Error(
        `POST /api/v1/members failed (${response.status()}): ${await response.text()}`,
      );
    }
    const { member } = (await response.json()) as { member: Member };
    this.created.add(member.id);
    return member;
  }

  /** Creates `count` members that all contain `token`, so search can isolate them. */
  async createMany(count: number, token: string): Promise<Member[]> {
    const members: Member[] = [];
    for (let index = 0; index < count; index += 1) {
      members.push(
        await this.create({
          firstName: `${token} First${index}`,
          lastName: `${token} Last${index}`,
          email: `${token}.${index}@example.com`,
          dateOfBirth: "1990-01-01",
        }),
      );
    }
    return members;
  }

  /** Adopts a member created through the UI so the fixture can delete it afterwards. */
  async trackByEmail(email: string): Promise<Member | undefined> {
    const response = await this.request.get(`${this.baseUrl}/api/v1/members`, {
      params: { search: email, limit: "100" },
    });
    if (response.status() !== 200) return undefined;
    const { items } = (await response.json()) as { items: Member[] };
    const match = items.find((item) => item.email === email);
    if (match) this.created.add(match.id);
    return match;
  }

  /** Deletes everything this client created; safe to call when nothing was created. */
  async cleanup(): Promise<void> {
    await Promise.all(
      [...this.created].map((id) => this.request.delete(`${this.baseUrl}/api/v1/members/${id}`)),
    );
    this.created.clear();
  }
}
