import { Given } from "../fixtures.ts";

/**
 * Arranges a set of members that share the scenario token, so a follow-up
 * search can isolate exactly this scenario's data for pagination checks.
 */
Given("{int} members match the scenario token", async ({ world }, count: number) => {
  await world.createMembers(count);
});
