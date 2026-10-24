import { z } from "zod";
import { PaginationQuerySchema, listSchema } from "./common.ts";

export const MemberIdSchema = z.uuid();
export type MemberId = z.infer<typeof MemberIdSchema>;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or fewer`);
const emailField = z
  .email("Enter a valid email address")
  .max(254, "Email must be 254 characters or fewer");

/**
 * Optional free-text attribute: trims surrounding whitespace and caps the
 * length. A blank string is allowed by the schema (forms default to `""`) and
 * normalized to "absent" by the service before it is stored.
 */
const optionalText = (max: number) => z.string().trim().max(max).optional();

/**
 * The stored shape of a person. Server-owned fields (`id`, timestamps) are
 * added by the service, never accepted from a client.
 */
export const MemberSchema = z.object({
  id: MemberIdSchema,
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: emailField,
  /** Calendar date, no time component (`YYYY-MM-DD`). */
  dateOfBirth: z.iso.date("Enter a valid date of birth"),
  phoneNumber: optionalText(30),
  address: optionalText(300),
  notes: optionalText(2000),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Member = z.infer<typeof MemberSchema>;

/** Fields a client supplies when creating a member. */
export const CreateMemberSchema = MemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

/** Every create field is optional on `PATCH`; omitted fields stay unchanged. */
export const UpdateMemberSchema = CreateMemberSchema.partial();

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

export const ListMembersQuerySchema = PaginationQuerySchema.extend({
  /** Case-insensitive match against name or email. */
  search: z.string().trim().min(1).max(100).optional(),
});

export type ListMembersQuery = z.infer<typeof ListMembersQuerySchema>;

export const ListMembersResultSchema = listSchema(MemberSchema);

export type ListMembersResult = z.infer<typeof ListMembersResultSchema>;

/** Body of every route that returns a single member. */
export const MemberResponseSchema = z.object({ member: MemberSchema });

export type MemberResponse = z.infer<typeof MemberResponseSchema>;
