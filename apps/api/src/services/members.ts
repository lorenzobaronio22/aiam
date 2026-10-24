import { randomUUID } from "node:crypto";
import type {
  CreateMemberInput,
  ListMembersQuery,
  ListMembersResult,
  Member,
  MembersService,
  UpdateMemberInput,
} from "api-contract";
import { ConflictError, NotFoundError } from "api-contract";

const SEARCHABLE_FIELDS = (member: Member) =>
  `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase();

/** A blank form field arrives as `""` (or whitespace); store it as truly absent. */
const blankToUndefined = (value: string | undefined) => (value && value.trim() ? value : undefined);

/**
 * In-memory implementation of the contract's `MembersService`.
 *
 * State lives in a closure so each call to the factory is isolated — tests get
 * their own store, and swapping in a database later means replacing this file
 * without touching routes, schemas, or the frontend.
 */
export function createInMemoryMembersService(seed: Member[] = []): MembersService {
  const members: Member[] = [...seed];

  const findByEmail = (email: string) =>
    members.find((member) => member.email.toLowerCase() === email.toLowerCase());

  return {
    async list({ page, limit, search }: ListMembersQuery): Promise<ListMembersResult> {
      const term = search?.toLowerCase();
      const filtered = term
        ? members.filter((member) => SEARCHABLE_FIELDS(member).includes(term))
        : members;
      const start = (page - 1) * limit;
      return {
        items: filtered.slice(start, start + limit),
        page,
        limit,
        total: filtered.length,
      };
    },

    async get(id) {
      const member = members.find((candidate) => candidate.id === id);
      if (!member) throw new NotFoundError("Member not found");
      return member;
    },

    async create(input: CreateMemberInput) {
      const email = input.email.toLowerCase();
      if (findByEmail(email)) {
        throw new ConflictError(`A member with the email "${email}" already exists`);
      }

      const now = new Date().toISOString();
      const member: Member = {
        ...input,
        phoneNumber: blankToUndefined(input.phoneNumber),
        address: blankToUndefined(input.address),
        notes: blankToUndefined(input.notes),
        email,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      members.push(member);
      return member;
    },

    async update(id, input: UpdateMemberInput) {
      const index = members.findIndex((candidate) => candidate.id === id);
      const current = members[index];
      if (index === -1 || !current) throw new NotFoundError("Member not found");

      if (input.email && findByEmail(input.email)?.id !== id) {
        throw new ConflictError(`A member with the email "${input.email}" already exists`);
      }

      const updated: Member = {
        ...current,
        ...input,
        email: input.email?.toLowerCase() ?? current.email,
        updatedAt: new Date().toISOString(),
      };
      // Only touch optional fields the patch actually mentions, so `PATCH`
      // stays partial and a blank string still clears the value.
      if (input.phoneNumber !== undefined)
        updated.phoneNumber = blankToUndefined(input.phoneNumber);
      if (input.address !== undefined) updated.address = blankToUndefined(input.address);
      if (input.notes !== undefined) updated.notes = blankToUndefined(input.notes);
      members[index] = updated;
      return updated;
    },

    async delete(id) {
      const index = members.findIndex((candidate) => candidate.id === id);
      if (index === -1) throw new NotFoundError("Member not found");
      members.splice(index, 1);
    },
  };
}
