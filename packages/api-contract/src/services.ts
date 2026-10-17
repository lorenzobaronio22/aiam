import type { CreateUserInput, ListUsersQuery, ListUsersResult, User } from "./schemas/users.ts";

/**
 * Implemented by the server (`apps/api`) and consumed by the routes here.
 *
 * Declaring these as interfaces keeps the shared package free of Node/DB
 * imports, so the frontend's type graph stays small and portable.
 */
export interface UsersService {
  list(query: ListUsersQuery): Promise<ListUsersResult>;
  get(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: Partial<CreateUserInput>): Promise<User | null>;
}

export interface ApiServices {
  users: UsersService;
}

/**
 * Hono environment for every route in the contract: the service container is
 * attached as a variable by `createApp`, never imported directly.
 */
export type ApiEnv = {
  Variables: {
    services: ApiServices;
  };
};
