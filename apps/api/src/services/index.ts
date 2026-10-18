import type { ApiServices } from "api-contract";
import { createInMemoryMembersService } from "./members.ts";
import { sampleMembers } from "./seed.ts";

/**
 * Wires the concrete service implementations the contract expects. Swapping the
 * in-memory store for a database is a change to this file alone.
 */
export function createServices(): ApiServices {
  return {
    members: createInMemoryMembersService(sampleMembers),
  };
}
