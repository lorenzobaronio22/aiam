import { expect, test, vi } from "vite-plus/test";
import { createApiClient } from "../src/client.ts";

test("createApiClient routes requests through the injected fetch", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ status: "ok", uptimeMs: 1 }), {
        headers: { "content-type": "application/json" },
      }),
  );

  const client = createApiClient("http://api.test", { fetch: fetchMock });
  const res = await client.health.$get();

  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toMatchObject({ status: "ok" });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
