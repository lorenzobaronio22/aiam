import { expect, type Page } from "@playwright/test";
import { Then, When, type World } from "../fixtures.ts";

async function openEditDialog(page: Page, world: World) {
  const member = world.member;
  if (!member) throw new Error("No member was created for this scenario.");
  await page
    .getByRole("button", { name: `Actions for ${member.firstName} ${member.lastName}` })
    .click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(page.getByRole("dialog", { name: "Edit member" })).toBeVisible();
}

When("I rename the listed member", async ({ page, world }) => {
  await openEditDialog(page, world);
  await page.getByLabel("Last name").fill(world.renamedLastName);
  await page.getByRole("button", { name: "Save changes" }).click();
});

Then("the renamed member is listed", async ({ page, world }) => {
  const member = world.member;
  if (!member) throw new Error("No member was created for this scenario.");
  await expect(
    page.getByRole("cell", {
      name: `${member.firstName} ${world.renamedLastName}`,
      exact: true,
    }),
  ).toBeVisible();
});
