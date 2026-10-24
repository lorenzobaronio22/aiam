import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  type ApiEnv,
  type ApiServices,
  CreateMemberSchema,
  DomainError,
  ListMembersQuerySchema,
  MemberIdSchema,
  UpdateMemberSchema,
} from "api-contract";
import { Hono } from "hono";
import { z } from "zod";
import { env } from "./env.ts";

/** Arguments for the tools that act on a single member. */
const MemberIdArgsSchema = z.object({ id: MemberIdSchema });

/** Update arguments: the same patch fields as `PATCH`, plus the target id. */
const UpdateMemberArgsSchema = UpdateMemberSchema.extend({ id: MemberIdSchema });

/**
 * Runs a tool body and normalizes the outcome to an MCP `CallToolResult`.
 *
 * Expected domain failures (404/409) become actionable, bounded tool errors so
 * a client never receives a raw stack trace; anything else is an unexpected bug
 * and is left to propagate to the transport's error handling.
 */
async function toolResult(run: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    const result = await run();
    return {
      content: [
        {
          type: "text",
          text: result === undefined ? "Done." : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof DomainError) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
    throw error;
  }
}

/**
 * The member tools. Each handler delegates to the same `MembersService` the
 * REST routes use — no rules or data access are duplicated here — and the
 * shared zod schemas validate every input (list sizes are capped by the schema).
 */
export function createMcpServer(services: ApiServices): McpServer {
  const server = new McpServer({ name: "aiam-members", version: "1.0.0" });

  server.registerTool(
    "list_members",
    {
      title: "List members",
      description: "List members with optional case-insensitive search and pagination.",
      inputSchema: ListMembersQuerySchema,
    },
    (args) => toolResult(() => services.members.list(args)),
  );

  server.registerTool(
    "get_member",
    {
      title: "Get member",
      description: "Fetch a single member by id.",
      inputSchema: MemberIdArgsSchema,
    },
    ({ id }) => toolResult(() => services.members.get(id)),
  );

  server.registerTool(
    "create_member",
    {
      title: "Create member",
      description: "Create a member. Fails if the email is already in use.",
      inputSchema: CreateMemberSchema,
    },
    (input) => toolResult(() => services.members.create(input)),
  );

  server.registerTool(
    "update_member",
    {
      title: "Update member",
      description: "Update a member's attributes. Omitted fields are left unchanged.",
      inputSchema: UpdateMemberArgsSchema,
    },
    ({ id, ...input }) => toolResult(() => services.members.update(id, input)),
  );

  server.registerTool(
    "delete_member",
    {
      title: "Delete member",
      description: "Delete a member by id.",
      inputSchema: MemberIdArgsSchema,
    },
    ({ id }) => toolResult(() => services.members.delete(id)),
  );

  return server;
}

/** Strips an optional port from a `Host` header, preserving IPv6 brackets. */
function hostnameOf(hostHeader: string): string {
  const ipv6 = /^\[[^\]]+\]/.exec(hostHeader);
  if (ipv6) return ipv6[0];
  const separator = hostHeader.lastIndexOf(":");
  return separator === -1 ? hostHeader : hostHeader.slice(0, separator);
}

/**
 * The MCP Streamable HTTP endpoint.
 *
 * A fresh server and transport are created per request (stateless), mirroring
 * the official SDK's Hono example; `enableJsonResponse` answers with plain JSON
 * instead of server-sent events. The `Host` header is validated against
 * `MCP_ALLOWED_HOSTS` to blunt DNS-rebinding attacks, as the SDK recommends;
 * in-process callers (tests) have no `Host` header, so the request URL's
 * authority — which is derived from `Host` on the wire — stands in.
 */
export const mcpRoutes = new Hono<ApiEnv>()
  .use("*", async (c, next) => {
    const host = c.req.header("host") ?? new URL(c.req.url).hostname;
    if (!env.MCP_ALLOWED_HOSTS.includes(hostnameOf(host))) {
      return c.json({ error: "forbidden_host", message: "Host header is not allowed." }, 403);
    }
    await next();
  })
  .all("/", async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
    const server = createMcpServer(c.var.services);
    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });
