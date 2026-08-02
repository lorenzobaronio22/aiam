import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import App from "./App.vue";
import { createTestRouter } from "./router";

describe("App", () => {
  it("toggles mobile navigation menu", async () => {
    const router = createTestRouter("/");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
        },
      },
    });

    expect(wrapper.find(".app-shell__nav").classes()).not.toContain("app-shell__nav--open");

    await wrapper.get(".app-shell__menu-toggle").trigger("click");

    expect(wrapper.find(".app-shell__nav").classes()).toContain("app-shell__nav--open");
  });
});
