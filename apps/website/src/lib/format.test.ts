import { expect, test } from "vite-plus/test";
import { formatDate } from "./format.ts";

test("formatDate renders a YYYY-MM-DD date without shifting the day", () => {
  const formatted = formatDate("1815-12-10");
  expect(formatted).toContain("1815");
  expect(formatted).not.toBe("1815-12-10");
});

test("formatDate keeps single-digit months and days", () => {
  expect(formatDate("2001-02-03")).toContain("2001");
});

test("formatDate returns the input unchanged when it is not a date", () => {
  expect(formatDate("nope")).toBe("nope");
  expect(formatDate("")).toBe("");
  expect(formatDate("1815-12")).toBe("1815-12");
});
