import { randomUUID } from "node:crypto";
import { expect, test } from "vite-plus/test";
import { ConflictError, NotFoundError, type Member } from "api-contract";
import { createInMemoryMembersService } from "../src/services/members.ts";

const TIMESTAMP = "2026-01-01T00:00:00.000Z";

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: randomUUID(),
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    dateOfBirth: "1815-12-10",
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    ...overrides,
  };
}

test("list paginates and reports the unpaginated total", async () => {
  const service = createInMemoryMembersService([
    member({ email: "a@example.com" }),
    member({ email: "b@example.com" }),
    member({ email: "c@example.com" }),
  ]);

  const first = await service.list({ page: 1, limit: 2 });
  expect(first).toMatchObject({ page: 1, limit: 2, total: 3 });
  expect(first.items.map((item) => item.email)).toEqual(["a@example.com", "b@example.com"]);

  const second = await service.list({ page: 2, limit: 2 });
  expect(second.items.map((item) => item.email)).toEqual(["c@example.com"]);
});

test("list searches name and email case-insensitively", async () => {
  const service = createInMemoryMembersService([
    member({ firstName: "Grace", lastName: "Hopper", email: "grace@example.com" }),
    member({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }),
  ]);

  await expect(service.list({ page: 1, limit: 20, search: "hopper" })).resolves.toMatchObject({
    total: 1,
    items: [{ email: "grace@example.com" }],
  });
  await expect(service.list({ page: 1, limit: 20, search: "ADA@" })).resolves.toMatchObject({
    total: 1,
  });
  await expect(service.list({ page: 1, limit: 20, search: "nobody" })).resolves.toMatchObject({
    total: 0,
    items: [],
  });
});

test("get returns a member and throws NotFoundError for an unknown id", async () => {
  const seeded = member();
  const service = createInMemoryMembersService([seeded]);

  await expect(service.get(seeded.id)).resolves.toMatchObject({ id: seeded.id });
  await expect(service.get(randomUUID())).rejects.toBeInstanceOf(NotFoundError);
});

test("create assigns server fields, lowercases the email, and drops blank optionals", async () => {
  const service = createInMemoryMembersService();

  const created = await service.create({
    firstName: "Grace",
    lastName: "Hopper",
    email: "Grace@Example.com",
    dateOfBirth: "1906-12-09",
    phoneNumber: "",
    address: "  ",
    notes: "Compiler pioneer",
  });

  expect(created.id).toEqual(expect.any(String));
  expect(created.email).toBe("grace@example.com");
  expect(created.createdAt).toEqual(expect.any(String));
  expect(created.updatedAt).toBe(created.createdAt);
  expect(created.phoneNumber).toBeUndefined();
  expect(created.address).toBeUndefined();
  expect(created.notes).toBe("Compiler pioneer");
});

test("create rejects a duplicate email regardless of case", async () => {
  const service = createInMemoryMembersService([member({ email: "ada@example.com" })]);

  await expect(
    service.create({
      firstName: "Ada",
      lastName: "Again",
      email: "ADA@example.com",
      dateOfBirth: "1815-12-10",
    }),
  ).rejects.toBeInstanceOf(ConflictError);
});

test("update patches partially and clears an optional field with a blank string", async () => {
  const seeded = member({ phoneNumber: "+1 555 0100", notes: "keep me" });
  const service = createInMemoryMembersService([seeded]);

  const updated = await service.update(seeded.id, { lastName: "King", phoneNumber: "" });

  expect(updated.lastName).toBe("King");
  expect(updated.firstName).toBe("Ada");
  expect(updated.notes).toBe("keep me");
  expect(updated.phoneNumber).toBeUndefined();
  expect(updated.updatedAt).not.toBe(seeded.updatedAt);
});

test("update allows keeping the same email but rejects another member's", async () => {
  const first = member({ email: "ada@example.com" });
  const second = member({ email: "grace@example.com" });
  const service = createInMemoryMembersService([first, second]);

  await expect(service.update(first.id, { email: "ada@example.com" })).resolves.toMatchObject({
    email: "ada@example.com",
  });
  await expect(service.update(first.id, { email: "grace@example.com" })).rejects.toBeInstanceOf(
    ConflictError,
  );
  await expect(service.update(randomUUID(), { lastName: "X" })).rejects.toBeInstanceOf(
    NotFoundError,
  );
});

test("delete removes a member and reports a missing one", async () => {
  const seeded = member();
  const service = createInMemoryMembersService([seeded]);

  await service.delete(seeded.id);
  await expect(service.get(seeded.id)).rejects.toBeInstanceOf(NotFoundError);
  await expect(service.delete(seeded.id)).rejects.toBeInstanceOf(NotFoundError);
});
