import type { Page } from "@playwright/test";

/**
 * Types into the directory search box and waits for the debounced list request
 * to resolve, so following assertions run against the filtered result instead of
 * the previous one.
 *
 * The search box debounces (300ms) before it refetches and resets to page 1.
 * Without this wait, a search whose result happens to show the same page count
 * as the unfiltered list can satisfy an assertion early and then be reset by the
 * debounce mid-scenario.
 */
export async function searchMembers(page: Page, term: string): Promise<void> {
  const response = page.waitForResponse((res) => {
    const url = new URL(res.url());
    return url.pathname.endsWith("/api/v1/members") && url.searchParams.get("search") === term;
  });
  await page.getByLabel("Search members").fill(term);
  await response;
}
