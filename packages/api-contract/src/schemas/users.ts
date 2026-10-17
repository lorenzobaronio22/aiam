import { z } from "zod";
import { PaginationQuerySchema, listSchema } from "./common.ts";

export const UserIdSchema = z.uuid();

export const UserSchema = z.object({
  id: UserIdSchema,
  email: z.email(),
  name: z.string().min(1).max(100),
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ListUsersQuerySchema = PaginationQuerySchema;

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

export const ListUsersResultSchema = listSchema(UserSchema);

export type ListUsersResult = z.infer<typeof ListUsersResultSchema>;

/** Shape used by every route that returns a single user. */
export const UserResponseSchema = z.object({ user: UserSchema });

export type UserResponse = z.infer<typeof UserResponseSchema>;
