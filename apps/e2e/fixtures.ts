import { randomUUID } from "node:crypto";
import { createBdd, test as base } from "playwright-bdd";
import { MembersApi, type CreateMemberInput, type Member } from "./support/members-api.ts";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8787";

/**
 * Per-scenario state and helpers.
 *
 * `token` is unique to the scenario, so data created by one scenario never
 * collides with another one running against the same API instance. Members the
 * scenario creates are deleted when it finishes.
 */
export interface World {
  readonly token: string;
  /** The last name the edit scenario renames a member to. */
  readonly renamedLastName: string;
  /** The member created by the most recent `createMember` call. */
  member: Member | null;
  createMember(overrides?: Partial<CreateMemberInput>): Promise<Member>;
  createMembers(count: number): Promise<Member[]>;
  trackByEmail(email: string): Promise<Member | undefined>;
}

export const test = base.extend<{ world: World }>({
  world: async ({ request }, use) => {
    const token = `e2e${randomUUID().slice(0, 8)}`;
    const api = new MembersApi(request, API_URL);

    const world: World = {
      token,
      renamedLastName: `${token} Renamed`,
      member: null,
      async createMember(overrides = {}) {
        const member = await api.create({
          firstName: `${token} First`,
          lastName: `${token} Last`,
          email: `${token}.member@example.com`,
          dateOfBirth: "1990-01-01",
          ...overrides,
        });
        world.member = member;
        return member;
      },
      createMembers: (count) => api.createMany(count, token),
      trackByEmail: (email) => api.trackByEmail(email),
    };

    await use(world);
    await api.cleanup();
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);

export type { World as E2eWorld };
