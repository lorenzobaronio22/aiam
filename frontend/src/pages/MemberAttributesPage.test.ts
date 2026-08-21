import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MemberAttributesPage from "./MemberAttributesPage.vue";
import { createTestRouter } from "../router";
import { installFakeEventSource } from "../test/factories/eventSource";
import { buildMember } from "../test/factories/members";

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
    getMember: vi.fn(),
    addMemberAttribute: vi.fn(),
    updateMemberAttribute: vi.fn(),
    deleteMemberAttribute: vi.fn(),
  };
});

const attributeTypesApiMocks = vi.hoisted(() => ({
  listAttributeTypes: vi.fn(),
}));

vi.mock("../api/members", async () => {
  const actual = await vi.importActual<typeof import("../api/members")>("../api/members");

  return {
    ApiError: membersApiMocks.ApiError,
    listMembers: vi.fn().mockResolvedValue([]),
    getMember: membersApiMocks.getMember,
    createMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
    addMemberAttribute: membersApiMocks.addMemberAttribute,
    updateMemberAttribute: membersApiMocks.updateMemberAttribute,
    deleteMemberAttribute: membersApiMocks.deleteMemberAttribute,
    toMember: actual.toMember,
    toMemberPayload: actual.toMemberPayload,
  };
});

vi.mock("../api/attributeTypes", () => ({
  listAttributeTypes: attributeTypesApiMocks.listAttributeTypes,
}));

async function factory(memberId = "member-1") {
  const router = createTestRouter(`/member/${memberId}/attributes`);
  await router.isReady();

  const wrapper = mount(MemberAttributesPage, {
    global: {
      plugins: [router],
    },
  });

  return { router, wrapper };
}

describe("MemberAttributesPage", () => {
  beforeEach(() => {
    installFakeEventSource();
    membersApiMocks.getMember.mockReset();
    membersApiMocks.addMemberAttribute.mockReset();
    membersApiMocks.updateMemberAttribute.mockReset();
    membersApiMocks.deleteMemberAttribute.mockReset();
    attributeTypesApiMocks.listAttributeTypes.mockReset();
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([
      { key: "free_text_note", name: "Free Text Note", description: "A short note." },
    ]);
  });

  it("adds a new attribute to the member", async () => {
    membersApiMocks.getMember.mockResolvedValue(buildMember({ attributes: [] }));
    membersApiMocks.addMemberAttribute.mockResolvedValue(
      buildMember({
        attributes: [{ id: "attr-1", key: "free_text_note", label: "Allergies", value: "Peanuts" }],
      }),
    );

    const { wrapper } = await factory();
    await flushPromises();

    await wrapper.get("select").setValue("free_text_note");
    await wrapper.get('input[type="text"]').setValue("Allergies");
    await wrapper.get("textarea").setValue("Peanuts");
    await wrapper.get(".member-attributes-page__new-form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.addMemberAttribute).toHaveBeenCalledWith("member-1", {
      key: "free_text_note",
      label: "Allergies",
      value: "Peanuts",
    });
    expect(wrapper.text()).toContain("Allergies");
    expect(wrapper.text()).toContain("Peanuts");
  });

  it("edits an existing attribute's label and value", async () => {
    membersApiMocks.getMember.mockResolvedValue(
      buildMember({
        attributes: [{ id: "attr-1", key: "free_text_note", label: "Allergies", value: "Peanuts" }],
      }),
    );
    membersApiMocks.updateMemberAttribute.mockResolvedValue(
      buildMember({
        attributes: [
          { id: "attr-1", key: "free_text_note", label: "Food allergies", value: "Peanuts, shellfish" },
        ],
      }),
    );

    const { wrapper } = await factory();
    await flushPromises();

    await wrapper.get(".member-attribute-card__actions button").trigger("click");
    await wrapper.get('.member-attribute-card__form input[type="text"]').setValue("Food allergies");
    await wrapper.get(".member-attribute-card__form textarea").setValue("Peanuts, shellfish");
    await wrapper.get(".member-attribute-card__form").trigger("submit");
    await flushPromises();

    expect(membersApiMocks.updateMemberAttribute).toHaveBeenCalledWith("member-1", "attr-1", {
      label: "Food allergies",
      value: "Peanuts, shellfish",
    });
    expect(wrapper.text()).toContain("Food allergies");
  });

  it("removes an attribute immediately without a confirmation step", async () => {
    membersApiMocks.getMember.mockResolvedValue(
      buildMember({
        attributes: [{ id: "attr-1", key: "free_text_note", label: "Allergies", value: "Peanuts" }],
      }),
    );
    membersApiMocks.deleteMemberAttribute.mockResolvedValue(buildMember({ attributes: [] }));

    const { wrapper } = await factory();
    await flushPromises();

    const deleteButton = wrapper.findAll(".member-attribute-card__actions button")[1];
    await deleteButton.trigger("click");
    await flushPromises();

    expect(membersApiMocks.deleteMemberAttribute).toHaveBeenCalledWith("member-1", "attr-1");
    expect(wrapper.text()).toContain("Nessun attributo presente per questo membro.");
  });

  it("shows a clear validation error when the backend rejects the attribute", async () => {
    membersApiMocks.getMember.mockResolvedValue(buildMember({ attributes: [] }));
    membersApiMocks.addMemberAttribute.mockRejectedValue(
      new membersApiMocks.ApiError(409, "Conflict", "An attribute with label 'Allergies' already exists on this member."),
    );

    const { wrapper } = await factory();
    await flushPromises();

    await wrapper.get("select").setValue("free_text_note");
    await wrapper.get('input[type="text"]').setValue("Allergies");
    await wrapper.get(".member-attributes-page__new-form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("An attribute with label 'Allergies' already exists on this member.");
  });
});
