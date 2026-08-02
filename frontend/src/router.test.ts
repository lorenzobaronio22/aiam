import { describe, expect, it } from "vitest";

import { createTestRouter } from "./router";

describe("router", () => {
  it("resolves the members workspace route", async () => {
    const router = createTestRouter("/");
    await router.isReady();

    await router.push("/members");

    expect(router.currentRoute.value.name).toBe("members");
    expect(router.currentRoute.value.path).toBe("/members");
  });

  it("redirects unknown routes back to home", async () => {
    const router = createTestRouter("/percorso-sconosciuto");
    await router.isReady();

    expect(router.currentRoute.value.path).toBe("/");
  });
});