import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAttributeTypes } from "./useAttributeTypes";

const attributeTypesApiMocks = vi.hoisted(() => ({
  listAttributeTypes: vi.fn(),
}));

vi.mock("../api/attributeTypes", () => ({
  listAttributeTypes: attributeTypesApiMocks.listAttributeTypes,
}));

describe("useAttributeTypes", () => {
  beforeEach(() => {
    attributeTypesApiMocks.listAttributeTypes.mockReset();
  });

  it("loads and exposes the attribute type catalog", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([
      { key: "free_text_note", name: "Free Text Note", description: "A note." },
    ]);

    const { attributeTypes, hasError, isLoading, loadAttributeTypes } = useAttributeTypes();
    const pending = loadAttributeTypes();
    expect(isLoading.value).toBe(true);
    await pending;

    expect(isLoading.value).toBe(false);
    expect(hasError.value).toBe(false);
    expect(attributeTypes.value).toEqual([
      { key: "free_text_note", name: "Free Text Note", description: "A note." },
    ]);
  });

  it("exposes a clear error message when loading fails", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockRejectedValue(new Error("network down"));

    const { attributeTypes, errorMessage, hasError, loadAttributeTypes } = useAttributeTypes();
    await loadAttributeTypes();

    expect(hasError.value).toBe(true);
    expect(errorMessage.value).not.toHaveLength(0);
    expect(attributeTypes.value).toEqual([]);
  });

  it("exposes an empty list when the registry has zero types", async () => {
    attributeTypesApiMocks.listAttributeTypes.mockResolvedValue([]);

    const { attributeTypes, hasError, loadAttributeTypes } = useAttributeTypes();
    await loadAttributeTypes();

    expect(hasError.value).toBe(false);
    expect(attributeTypes.value).toEqual([]);
  });
});
