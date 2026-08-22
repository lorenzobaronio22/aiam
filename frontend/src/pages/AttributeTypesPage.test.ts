import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AttributeTypesPage from "./AttributeTypesPage.vue";

const attributeTypesApiMocks = vi.hoisted(() => ({
  listAttributeTypes: vi.fn(),
}));

vi.mock("../api/attributeTypes", () => ({
  listAttributeTypes: attributeTypesApiMocks.listAttributeTypes,
}));

describe("AttributeTypesPage", () => {
  beforeEach(() => {
    attributeTypesApiMocks.listAttributeTypes.mockReset();
  });

  it("shows every registered attribute type with its name and description", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([
      { key: "free_text_note", name: "Free Text Note", description: "A note up to 1000 characters." },
      { key: "phone_number", name: "Phone Number", description: "A contact phone number." },
    ]);

    const wrapper = mount(AttributeTypesPage);
    await flushPromises();

    const cards = wrapper.findAll(".attribute-type-card");
    expect(cards).toHaveLength(2);
    expect(wrapper.text()).toContain("Free Text Note");
    expect(wrapper.text()).toContain("A note up to 1000 characters.");
    expect(wrapper.text()).toContain("Phone Number");
    expect(wrapper.text()).toContain("A contact phone number.");
  });

  it("shows exactly the Free Text Note entry for the current registry", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([
      {
        key: "free_text_note",
        name: "Free Text Note",
        description:
          "A short freeform note you can attach to a member for general remarks or context. " +
          "Accepts any text up to 1000 characters, and can be left blank.",
      },
    ]);

    const wrapper = mount(AttributeTypesPage);
    await flushPromises();

    const cards = wrapper.findAll(".attribute-type-card");
    expect(cards).toHaveLength(1);
    expect(cards[0].text()).toContain("Free Text Note");
    expect(cards[0].text()).toContain("up to 1000 characters");
    expect(cards[0].text()).toContain("left blank");
  });

  it("renders the catalog returned by the backend as-is without hardcoding it", async () => {
    const backendRegistry = [
      { key: "custom_type", name: "Custom Type", description: "Defined only by the backend." },
    ];
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue(backendRegistry);

    const wrapper = mount(AttributeTypesPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Custom Type");
    expect(wrapper.text()).toContain("Defined only by the backend.");
  });

  it("shows a clear error message when the catalog fails to load", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockRejectedValue(new Error("boom"));

    const wrapper = mount(AttributeTypesPage);
    await flushPromises();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text().length).toBeGreaterThan(0);
    expect(wrapper.text()).not.toContain("boom");
    expect(wrapper.findAll(".attribute-type-card")).toHaveLength(0);
  });

  it("shows a clear empty state when the registry has zero attribute types", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([]);

    const wrapper = mount(AttributeTypesPage);
    await flushPromises();

    expect(wrapper.find(".attribute-types-page__empty").exists()).toBe(true);
    expect(wrapper.findAll(".attribute-type-card")).toHaveLength(0);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});
