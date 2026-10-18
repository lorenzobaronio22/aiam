import type {
  CreateMemberInput,
  ListMembersQuery,
  ListMembersResult,
  Member,
  UpdateMemberInput,
} from "./schemas/members.ts";

/**
 * Business operations for members, implemented by the server (`apps/api`) and
 * consumed by the routes here.
 *
 * Declaring the shape as an interface keeps this shared package free of Node
 * and database imports, so the frontend's type graph stays small and portable.
 * Mutating operations throw `NotFoundError` / `ConflictError` on failure.
 */
export interface MembersService {
  list(query: ListMembersQuery): Promise<ListMembersResult>;
  get(id: string): Promise<Member>;
  create(input: CreateMemberInput): Promise<Member>;
  update(id: string, input: UpdateMemberInput): Promise<Member>;
  delete(id: string): Promise<void>;
}

export interface ApiServices {
  members: MembersService;
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
