import { expect } from "@playwright/test";
import { Given, Then, When } from "../fixtures.ts";
import { searchMembers } from "../support/search.ts";

Given("the member directory is open", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Members", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Search members")).toBeVisible();
});

Given("a member exists for the scenario", async ({ world }) => {
  await world.createMember();
});

When("I search for {string}", async ({ page }, term: string) => {
  await searchMembers(page, term);
});

When("I search for the scenario token", async ({ page, world }) => {
  await searchMembers(page, world.token);
});

When("I click the {string} button", async ({ page }, name: string) => {
  await page.getByRole("button", { name, exact: true }).click();
});

Then("the directory lists the member {string}", async ({ page }, name: string) => {
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
});

Then("the directory reports at least {int} members", async ({ page }, minimum: number) => {
  const summary = page.getByText(/^\d+ members?$/).first();
  await expect(summary).toBeVisible();
  const total = Number.parseInt((await summary.textContent()) ?? "0", 10);
  expect(total).toBeGreaterThanOrEqual(minimum);
});

Then("the directory shows the empty state {string}", async ({ page }, title: string) => {
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

Then("the page indicator reads {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible();
});

Then("the {string} button is enabled", async ({ page }, name: string) => {
  await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
});

Then("the {string} button is disabled", async ({ page }, name: string) => {
  await expect(page.getByRole("button", { name, exact: true })).toBeDisabled();
});

Then("a success toast {string} is shown", async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

Then("an error toast containing {string} is shown", async ({ page }, message: string) => {
  await expect(page.getByText(new RegExp(message, "i"))).toBeVisible();
});
