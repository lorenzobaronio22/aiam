import { expect, test } from "vite-plus/test";
import {
  CreateMemberSchema,
  HealthSchema,
  ListMembersQuerySchema,
  MemberSchema,
  UpdateMemberSchema,
} from "../src/index.ts";

const validMember = {
  id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  dateOfBirth: "1815-12-10",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("MemberSchema accepts a well-formed member", () => {
  expect(MemberSchema.parse(validMember)).toMatchObject(validMember);
});

test("MemberSchema rejects a non-uuid id, a malformed email, and a bad date", () => {
  expect(MemberSchema.safeParse({ ...validMember, id: "1" }).success).toBe(false);
  expect(MemberSchema.safeParse({ ...validMember, email: "nope" }).success).toBe(false);
  expect(MemberSchema.safeParse({ ...validMember, dateOfBirth: "10/12/1815" }).success).toBe(false);
});

test("MemberSchema rejects a non-ISO timestamp", () => {
  expect(MemberSchema.safeParse({ ...validMember, updatedAt: "yesterday" }).success).toBe(false);
});

test("MemberSchema rejects blank name fields", () => {
  expect(MemberSchema.safeParse({ ...validMember, firstName: "   " }).success).toBe(false);
});

test("CreateMemberSchema omits server-owned fields", () => {
  const parsed = CreateMemberSchema.parse({
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    dateOfBirth: "1906-12-09",
  });
  expect(parsed).toMatchObject({
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    dateOfBirth: "1906-12-09",
  });
  expect(parsed).not.toHaveProperty("id");
  expect(parsed).not.toHaveProperty("createdAt");
});

test("CreateMemberSchema trims optional fields", () => {
  const parsed = CreateMemberSchema.parse({
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    dateOfBirth: "1906-12-09",
    phoneNumber: "  +1 555 0100  ",
    address: "   ",
  });
  expect(parsed.phoneNumber).toBe("+1 555 0100");
  expect(parsed.address).toBe("");
});

test("UpdateMemberSchema accepts an empty patch and a partial patch", () => {
  expect(UpdateMemberSchema.safeParse({}).success).toBe(true);
  expect(UpdateMemberSchema.parse({ lastName: "King" })).toMatchObject({ lastName: "King" });
});

test("ListMembersQuerySchema coerces strings, applies defaults, and reads search", () => {
  expect(ListMembersQuerySchema.parse({})).toMatchObject({ page: 1, limit: 20 });
  expect(ListMembersQuerySchema.parse({ page: "3", limit: "50", search: "ada" })).toMatchObject({
    page: 3,
    limit: 50,
    search: "ada",
  });
});

test("ListMembersQuerySchema enforces bounds", () => {
  expect(ListMembersQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  expect(ListMembersQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
});

test("HealthSchema is a literal status payload", () => {
  expect(HealthSchema.safeParse({ status: "ok", uptimeMs: 12 }).success).toBe(true);
  expect(HealthSchema.safeParse({ status: "down", uptimeMs: 12 }).success).toBe(false);
});
