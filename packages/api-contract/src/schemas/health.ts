import { z } from "zod";

export const HealthSchema = z.object({
  status: z.literal("ok"),
  uptimeMs: z.number().int().min(0),
});

export type Health = z.infer<typeof HealthSchema>;
