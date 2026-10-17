import type { ApiServices } from "api-contract";
import { createInMemoryUsersService } from "./users.ts";

export function createServices(): ApiServices {
  return {
    users: createInMemoryUsersService(),
  };
}
