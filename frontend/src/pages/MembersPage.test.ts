import { mount, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembersPage from "./MembersPage.vue";
import { createTestRouter } from "../router";

const membersApiMocks = vi.hoisted(() => {
  class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, title: string, detail: string) {
      super(title);
      this.status = status;
      this.detail = detail;
    }
  }

  return {
    ApiError,
    listMembers: vi.fn(),
    getMember: vi.fn(),
    createMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  };
});

vi.mock("../api/members", () => ({
  ApiError: membersApiMocks.ApiError,
  listMembers: membersApiMocks.listMembers,
  getMember: membersApiMocks.getMember,
  createMember: membersApiMocks.createMember,
  updateMember: membersApiMocks.updateMember,
  deleteMember: membersApiMocks.deleteMember,
}));

async function factory(initialPath = "/member") {
  const router = createTestRouter(initialPath);
  await router.isReady();

  const wrapper = mount(MembersPage, {
    global: {
      plugins: [router],
    },
  });

  return { router, wrapper };
}

describe("MembersPage", () => {
  beforeEach(() => {
    membersApiMocks.listMembers.mockReset();
    membersApiMocks.getMember.mockReset();
    membersApiMocks.createMember.mockReset();
    membersApiMocks.updateMember.mockReset();
    membersApiMocks.deleteMember.mockReset();
  });

  it("renders the empty state after loading an empty archive", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);

    const { wrapper, router } = await factory();
    await flushPromises();

    expect(membersApiMocks.listMembers).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("L'archivio e vuoto");
    expect(wrapper.text()).toContain("Crea membro");
    expect(wrapper.findAll('button[type="button"]')).toHaveLength(0);
    expect(router.currentRoute.value.path).toBe("/member");
  });

  it("loads members, opens a selected profile, and updates it", async () => {
    membersApiMocks.listMembers.mockResolvedValue([
      {
        id: "member-1",
        name: "Giulia Rossi",
        email: "giulia@example.com",
        createdAt: "2026-08-02T08:00:00Z",
        updatedAt: "2026-08-02T08:00:00Z",
      },
    ]);
    membersApiMocks.getMember.mockResolvedValue({
      id: "member-1",
      name: "Giulia Rossi",
      email: "giulia@example.com",
      createdAt: "2026-08-02T08:00:00Z",
      updatedAt: "2026-08-02T08:00:00Z",
    });
    membersApiMocks.updateMember.mockResolvedValue({
      id: "member-1",
      name: "Giulia Bianchi",
      email: "giulia@example.com",
      createdAt: "2026-08-02T08:00:00Z",
      updatedAt: "2026-08-02T09:00:00Z",
    });

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get(".member-list__item").trigger("click");
    await flushPromises();

    expect(membersApiMocks.getMember).toHaveBeenCalledWith("member-1");
    expect(router.currentRoute.value.path).toBe("/member/member-1");

    await wrapper.get('input[name="name"]').setValue("Giulia Bianchi");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.updateMember).toHaveBeenCalledWith("member-1", {
      name: "Giulia Bianchi",
      email: "giulia@example.com",
    });
    expect(wrapper.text()).toContain("Modifiche salvate con successo.");

    await wrapper.get(".button-secondary").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.path).toBe("/member");
    expect(wrapper.get(".member-form__title").text()).toBe("Nuovo membro");
  });

  it("creates a member and supports deletion from the edit state", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);
    membersApiMocks.createMember.mockResolvedValue({
      id: "member-2",
      name: "Laura Neri",
      email: "laura@example.com",
      createdAt: "2026-08-02T08:00:00Z",
      updatedAt: "2026-08-02T08:00:00Z",
    });
    membersApiMocks.deleteMember.mockResolvedValue(undefined);

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get('input[name="name"]').setValue("Laura Neri");
    await wrapper.get('input[name="email"]').setValue("laura@example.com");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.createMember).toHaveBeenCalledWith({
      name: "Laura Neri",
      email: "laura@example.com",
    });
    expect(wrapper.text()).toContain("Nuovo membro salvato correttamente.");
    expect(router.currentRoute.value.path).toBe("/member/member-2");

    await wrapper.get(".button-danger").trigger("click");
    await flushPromises();

    expect(membersApiMocks.deleteMember).toHaveBeenCalledWith("member-2");
    expect(router.currentRoute.value.path).toBe("/member");
    expect(wrapper.get(".member-form__title").text()).toBe("Nuovo membro");
  });

  it("shows the duplicate email error returned by the API", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);
    membersApiMocks.createMember.mockRejectedValue(
      new membersApiMocks.ApiError(409, "Conflict", "duplicate"),
    );

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get('input[name="name"]').setValue("Laura Neri");
    await wrapper.get('input[name="email"]').setValue("laura@example.com");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Esiste gia un membro con questa email.");
    expect(router.currentRoute.value.path).toBe("/member");
  });

  it("loads a member directly from route param", async () => {
    membersApiMocks.listMembers.mockResolvedValue([
      {
        id: "member-3",
        name: "Anna Verdi",
        email: "anna@example.com",
        createdAt: "2026-08-02T08:00:00Z",
        updatedAt: "2026-08-02T08:00:00Z",
      },
    ]);
    membersApiMocks.getMember.mockResolvedValue({
      id: "member-3",
      name: "Anna Verdi",
      email: "anna@example.com",
      createdAt: "2026-08-02T08:00:00Z",
      updatedAt: "2026-08-02T08:00:00Z",
    });

    const { router, wrapper } = await factory("/member/member-3");
    await flushPromises();

    expect(membersApiMocks.getMember).toHaveBeenCalledWith("member-3");
    expect((wrapper.get('input[name="name"]').element as HTMLInputElement).value).toBe("Anna Verdi");
    expect(router.currentRoute.value.path).toBe("/member/member-3");
  });
});