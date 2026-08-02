import { describe, expect, it } from "vitest";

import { createTestRouter } from "./router";

describe("router", () => {
  it("resolves the member workspace route", async () => {
    const router = createTestRouter("/");
    await router.isReady();

    await router.push("/member");

    expect(router.currentRoute.value.name).toBe("member");
    expect(router.currentRoute.value.path).toBe("/member");
  });

  it("resolves a selected member path", async () => {
    const router = createTestRouter("/");
    await router.isReady();

    await router.push("/member/4ed7f2a8-57ff-4f09-85a7-d2eca249fb48");

    expect(router.currentRoute.value.name).toBe("member");
    expect(router.currentRoute.value.path).toBe("/member/4ed7f2a8-57ff-4f09-85a7-d2eca249fb48");
  });

  it("redirects unknown routes back to home", async () => {
    const router = createTestRouter("/percorso-sconosciuto");
    await router.isReady();

    expect(router.currentRoute.value.path).toBe("/");
  });
});