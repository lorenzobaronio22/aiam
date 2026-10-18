import { expect } from "@playwright/test";
import { Then, When } from "../fixtures.ts";

When("I choose the {string} theme", async ({ page }, theme: string) => {
  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("menuitem", { name: theme, exact: true }).click();
});

Then("the page uses the dark theme", async ({ page }) => {
  await expect(page.locator("html")).toHaveClass(/dark/);
});

Then("the page uses the light theme", async ({ page }) => {
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
