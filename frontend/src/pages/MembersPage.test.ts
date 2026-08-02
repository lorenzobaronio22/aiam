import { mount, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembersPage from "./MembersPage.vue";

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

function factory() {
  return mount(MembersPage);
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

    const wrapper = factory();
    await flushPromises();

    expect(membersApiMocks.listMembers).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("L'archivio e vuoto");
    expect(wrapper.text()).toContain("Crea membro");
    expect(wrapper.findAll('button[type="button"]')).toHaveLength(0);
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

    const wrapper = factory();
    await flushPromises();

    await wrapper.get(".member-list__item").trigger("click");
    await flushPromises();

    expect(membersApiMocks.getMember).toHaveBeenCalledWith("member-1");

    await wrapper.get('input[name="name"]').setValue("Giulia Bianchi");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.updateMember).toHaveBeenCalledWith("member-1", {
      name: "Giulia Bianchi",
      email: "giulia@example.com",
    });
    expect(wrapper.text()).toContain("Modifiche salvate con successo.");
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
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const wrapper = factory();
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

    await wrapper.get(".button-danger").trigger("click");
    await flushPromises();

    expect(membersApiMocks.deleteMember).toHaveBeenCalledWith("member-2");
    expect(wrapper.text()).toContain("Membro eliminato correttamente.");
  });

  it("shows the duplicate email error returned by the API", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);
    membersApiMocks.createMember.mockRejectedValue(
      new membersApiMocks.ApiError(409, "Conflict", "duplicate"),
    );

    const wrapper = factory();
    await flushPromises();

    await wrapper.get('input[name="name"]').setValue("Laura Neri");
    await wrapper.get('input[name="email"]').setValue("laura@example.com");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Esiste gia un membro con questa email.");
  });
});