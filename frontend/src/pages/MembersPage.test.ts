import { DOMWrapper, mount, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembersPage from "./MembersPage.vue";
import { createTestRouter } from "../router";
import { buildMember, buildMemberList } from "../test/factories/members";

function bodyWrapper(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

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

  it("renders the empty state and the create action when the archive is empty", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);

    const { wrapper, router } = await factory();
    await flushPromises();

    expect(membersApiMocks.listMembers).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Nessun membro presente.");
    expect(wrapper.find(".member-card__summary").exists()).toBe(false);
    expect(wrapper.find(".members-page__fab").exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe("/member");
  });

  it("expands a member card, updates it, and collapses back to browsing", async () => {
    membersApiMocks.listMembers.mockResolvedValue(buildMemberList());
    membersApiMocks.getMember.mockResolvedValue(buildMember());
    membersApiMocks.updateMember.mockResolvedValue(
      buildMember({
        name: "Giulia Bianchi",
        updatedAt: "2026-08-02T09:00:00Z",
      }),
    );

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get(".member-card__summary").trigger("click");
    await flushPromises();

    expect(membersApiMocks.getMember).toHaveBeenCalledWith("member-1");
    expect(router.currentRoute.value.path).toBe("/member/member-1");
    expect(wrapper.find(".member-form__delete").exists()).toBe(true);

    await wrapper.get('input[name="name"]').setValue("Giulia Bianchi");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.updateMember).toHaveBeenCalledWith("member-1", {
      name: "Giulia Bianchi",
      email: "giulia@example.com",
    });
    expect(bodyWrapper().text()).toContain("Modifiche salvate con successo.");
    expect(router.currentRoute.value.path).toBe("/member");
    expect(wrapper.find(".member-form__delete").exists()).toBe(false);
  });

  it("toggles a member card closed when selecting it again", async () => {
    membersApiMocks.listMembers.mockResolvedValue(buildMemberList());
    membersApiMocks.getMember.mockResolvedValue(buildMember());

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get(".member-card__summary").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/member/member-1");

    await wrapper.get(".member-card__summary").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/member");
    expect(wrapper.find(".member-form__delete").exists()).toBe(false);
  });

  it("requires a second click on delete to confirm, then removes the member", async () => {
    membersApiMocks.listMembers.mockResolvedValue(buildMemberList());
    membersApiMocks.getMember.mockResolvedValue(buildMember());
    membersApiMocks.deleteMember.mockResolvedValue(undefined);

    const { wrapper, router } = await factory("/member/member-1");
    await flushPromises();

    await wrapper.get(".member-form__delete").trigger("click");
    expect(membersApiMocks.deleteMember).not.toHaveBeenCalled();
    expect(wrapper.get(".member-form__delete").text()).toContain("Conferma eliminazione");

    await wrapper.get(".member-form__delete").trigger("click");
    await flushPromises();

    expect(membersApiMocks.deleteMember).toHaveBeenCalledWith("member-1");
    expect(bodyWrapper().text()).toContain("Membro eliminato correttamente.");
    expect(router.currentRoute.value.path).toBe("/member");
  });

  it("creates a member from the floating action button and closes the sheet", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);
    membersApiMocks.createMember.mockResolvedValue(
      buildMember({
        id: "member-2",
        name: "Laura Neri",
        email: "laura@example.com",
      }),
    );

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get(".members-page__fab").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/member/new");
    expect(bodyWrapper().find(".members-page__sheet").exists()).toBe(true);

    await bodyWrapper().get('input[name="name"]').setValue("Laura Neri");
    await bodyWrapper().get('input[name="email"]').setValue("laura@example.com");
    await bodyWrapper().get(".members-page__sheet form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.createMember).toHaveBeenCalledWith({
      name: "Laura Neri",
      email: "laura@example.com",
    });
    expect(bodyWrapper().text()).toContain("Nuovo membro salvato correttamente.");
    expect(router.currentRoute.value.path).toBe("/member");
    expect(bodyWrapper().find(".members-page__sheet").exists()).toBe(false);
  });

  it("shows the duplicate email error and keeps the create sheet open", async () => {
    membersApiMocks.listMembers.mockResolvedValue([]);
    membersApiMocks.createMember.mockRejectedValue(
      new membersApiMocks.ApiError(409, "Conflict", "duplicate"),
    );

    const { wrapper, router } = await factory();
    await flushPromises();

    await wrapper.get(".members-page__fab").trigger("click");
    await flushPromises();

    await bodyWrapper().get('input[name="name"]').setValue("Laura Neri");
    await bodyWrapper().get('input[name="email"]').setValue("laura@example.com");
    await bodyWrapper().get(".members-page__sheet form").trigger("submit");
    await flushPromises();

    expect(bodyWrapper().text()).toContain("Esiste gia un membro con questa email.");
    expect(router.currentRoute.value.path).toBe("/member/new");
    expect(bodyWrapper().find(".members-page__sheet").exists()).toBe(true);
  });

  it("loads a member directly from a route param and shows it expanded", async () => {
    membersApiMocks.listMembers.mockResolvedValue(
      buildMemberList({
        id: "member-3",
        name: "Anna Verdi",
        email: "anna@example.com",
      }),
    );
    membersApiMocks.getMember.mockResolvedValue(
      buildMember({
        id: "member-3",
        name: "Anna Verdi",
        email: "anna@example.com",
      }),
    );

    const { router, wrapper } = await factory("/member/member-3");
    await flushPromises();

    expect(membersApiMocks.getMember).toHaveBeenCalledWith("member-3");
    expect((wrapper.get('input[name="name"]').element as HTMLInputElement).value).toBe("Anna Verdi");
    expect(router.currentRoute.value.path).toBe("/member/member-3");
  });
});