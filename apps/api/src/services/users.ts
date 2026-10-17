import { randomUUID } from "node:crypto";
import type {
  CreateUserInput,
  ListUsersQuery,
  ListUsersResult,
  User,
  UsersService,
} from "api-contract";

/**
 * In-memory implementation of the contract's `UsersService`. Swap this for a
 * real repository without touching routes, schemas, or the frontend.
 */
export function createInMemoryUsersService(seed: User[] = []): UsersService {
  const users: User[] = [...seed];

  return {
    async list({ page, limit }: ListUsersQuery): Promise<ListUsersResult> {
      const start = (page - 1) * limit;
      return {
        items: users.slice(start, start + limit),
        page,
        limit,
        total: users.length,
      };
    },

    async get(id) {
      return users.find((user) => user.id === id) ?? null;
    },

    async create(input: CreateUserInput) {
      const user: User = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      return user;
    },

    async update(id, input) {
      const index = users.findIndex((user) => user.id === id);
      const current = users[index];
      if (index === -1 || current === undefined) return null;

      const updated: User = { ...current, ...input };
      users[index] = updated;
      return updated;
    },
  };
}
