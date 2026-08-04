import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import App from "./App.vue";
import { createTestRouter } from "./router";

describe("App", () => {
  it("renders always-visible navigation links", async () => {
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

    expect(wrapper.find(".app-shell__nav").exists()).toBe(true);
    expect(wrapper.text()).toContain("Home");
    expect(wrapper.text()).toContain("Membri");
    expect(wrapper.find(".app-shell__nav-link--active").text()).toContain("Home");

    await router.push("/member");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".app-shell__nav-link--active").text()).toContain("Membri");
  });
});
