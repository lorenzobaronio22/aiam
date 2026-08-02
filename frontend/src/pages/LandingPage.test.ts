import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { RouterLinkStub } from "@vue/test-utils";

import LandingPage from "./LandingPage.vue";

describe("LandingPage", () => {
  it("renders the brand thesis and links to the members workspace", () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    expect(wrapper.text()).toContain("Gestisci iscrizioni e anagrafiche membri in modo semplice.");
    expect(wrapper.text()).toContain("Apri area membri");
    expect(wrapper.getComponent(RouterLinkStub).props("to")).toBe("/members");
  });
});