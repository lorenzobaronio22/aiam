import { expect, test } from "vite-plus/test";
import { CreateUserSchema, HealthSchema, ListUsersQuerySchema, UserSchema } from "../src/index.ts";

const validUser = {
  id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  email: "ada@example.com",
  name: "Ada Lovelace",
  createdAt: "2026-01-01T00:00:00.000Z",
};

test("UserSchema accepts a well-formed user", () => {
  expect(UserSchema.parse(validUser)).toEqual(validUser);
});

test("UserSchema rejects a non-uuid id and a malformed email", () => {
  expect(UserSchema.safeParse({ ...validUser, id: "1" }).success).toBe(false);
  expect(UserSchema.safeParse({ ...validUser, email: "nope" }).success).toBe(false);
});

test("UserSchema rejects a non-ISO createdAt", () => {
  expect(UserSchema.safeParse({ ...validUser, createdAt: "yesterday" }).success).toBe(false);
});

test("CreateUserSchema omits server-owned fields", () => {
  const parsed = CreateUserSchema.parse({ email: validUser.email, name: validUser.name });
  expect(parsed).toEqual({ email: validUser.email, name: validUser.name });
});

test("ListUsersQuerySchema coerces strings and applies defaults", () => {
  expect(ListUsersQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  expect(ListUsersQuerySchema.parse({ page: "3", limit: "50" })).toEqual({ page: 3, limit: 50 });
});

test("ListUsersQuerySchema enforces bounds", () => {
  expect(ListUsersQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  expect(ListUsersQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
});

test("HealthSchema is a literal status payload", () => {
  expect(HealthSchema.safeParse({ status: "ok", uptimeMs: 12 }).success).toBe(true);
  expect(HealthSchema.safeParse({ status: "down", uptimeMs: 12 }).success).toBe(false);
});
