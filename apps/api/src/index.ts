import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { env } from "./env.ts";

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`api listening on http://localhost:${info.port} (${env.NODE_ENV})`);
});

const shutdown = () => process.exit(0);
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
