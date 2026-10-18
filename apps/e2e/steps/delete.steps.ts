import { expect, type Page } from "@playwright/test";
import { Then, When, type World } from "../fixtures.ts";

async function openDeleteDialog(page: Page, world: World) {
  const member = world.member;
  if (!member) throw new Error("No member was created for this scenario.");
  await page
    .getByRole("button", { name: `Actions for ${member.firstName} ${member.lastName}` })
    .click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("alertdialog", { name: "Delete member?" })).toBeVisible();
}

When("I delete the listed member", async ({ page, world }) => {
  await openDeleteDialog(page, world);
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
});

When("I cancel deleting the listed member", async ({ page, world }) => {
  await openDeleteDialog(page, world);
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();
});

Then("the listed member is still shown", async ({ page, world }) => {
  const member = world.member;
  if (!member) throw new Error("No member was created for this scenario.");
  await expect(
    page.getByRole("cell", { name: `${member.firstName} ${member.lastName}`, exact: true }),
  ).toBeVisible();
});
