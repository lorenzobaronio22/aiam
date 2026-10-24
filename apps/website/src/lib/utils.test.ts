import { expect, test } from "vite-plus/test";
import { cn } from "./utils.ts";

test("cn merges class names and drops falsy values", () => {
  const isHidden = false;
  expect(cn("flex", undefined, "gap-2")).toBe("flex gap-2");
  expect(cn("p-2", isHidden && "hidden")).toBe("p-2");
});

test("cn resolves conflicting Tailwind utilities in favour of the last one", () => {
  expect(cn("p-2", "p-4")).toBe("p-4");
});
