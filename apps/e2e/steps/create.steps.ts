import { expect } from "@playwright/test";
import { Then, When } from "../fixtures.ts";
import { searchMembers } from "../support/search.ts";

const uiEmail = (token: string) => `${token}.ui@example.com`;

When("I open the add member dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Add member" }).first().click();
  await expect(page.getByRole("dialog", { name: "Add member" })).toBeVisible();
});

When("I add a member using the scenario token", async ({ page, world }) => {
  await page.getByRole("button", { name: "Add member" }).first().click();
  await expect(page.getByRole("dialog", { name: "Add member" })).toBeVisible();

  await page.getByLabel("First name").fill(`${world.token} New`);
  await page.getByLabel("Last name").fill(`${world.token} Person`);
  await page.getByLabel("Email").fill(uiEmail(world.token));
  await page.getByLabel("Date of birth").fill("1980-05-05");
  await page.getByRole("button", { name: "Create member" }).click();

  // The member was created through the UI, so register it for cleanup by email.
  await world.trackByEmail(uiEmail(world.token));
});

When(
  "I fill the member form with a unique name and the email {string}",
  async ({ page, world }, email: string) => {
    await page.getByLabel("First name").fill(`${world.token} Duplicate`);
    await page.getByLabel("Last name").fill(`${world.token} Person`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Date of birth").fill("1980-05-05");
  },
);

When("I submit the member form", async ({ page }) => {
  await page.getByRole("button", { name: "Create member" }).click();
});

Then("the form shows the validation error {string}", async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

Then("the add member dialog stays open", async ({ page }) => {
  await expect(page.getByRole("dialog", { name: "Add member" })).toBeVisible();
});

Then("searching for the scenario token lists the member", async ({ page, world }) => {
  await searchMembers(page, world.token);
  await expect(
    page.getByRole("cell", { name: `${world.token} New ${world.token} Person`, exact: true }),
  ).toBeVisible();
});
