#!/usr/bin/env node
/**
 * Aggregates the per-package Vitest coverage summaries into one table.
 *
 * Each package writes `coverage/coverage-summary.json`; this script collects
 * them so coverage can be reported as a single number instead of one report per
 * package.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const METRICS = ["statements", "branches", "functions", "lines"];
const WORKSPACES = ["apps", "packages"];

/** @returns {{ name: string, metrics: Record<string, { covered: number, total: number }> }[]} */
function collect() {
  const packages = [];

  for (const workspace of WORKSPACES) {
    if (!existsSync(workspace)) continue;
    for (const entry of readdirSync(workspace)) {
      const summaryPath = join(workspace, entry, "coverage", "coverage-summary.json");
      if (!existsSync(summaryPath)) continue;

      const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
      const metrics = {};
      for (const metric of METRICS) {
        metrics[metric] = {
          covered: summary.total[metric].covered,
          total: summary.total[metric].total,
        };
      }
      packages.push({ name: entry, metrics });
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

function percent({ covered, total }) {
  if (total === 0) return "n/a";
  return `${((covered / total) * 100).toFixed(1)}%`;
}

const packages = collect();

if (packages.length === 0) {
  console.log("No coverage reports found. Run `vp run test:coverage` first.");
  process.exit(0);
}

const overall = {};
for (const metric of METRICS) {
  overall[metric] = packages.reduce(
    (accumulator, pkg) => ({
      covered: accumulator.covered + pkg.metrics[metric].covered,
      total: accumulator.total + pkg.metrics[metric].total,
    }),
    { covered: 0, total: 0 },
  );
}

const header = `| Package | ${METRICS.map((m) => m[0].toUpperCase() + m.slice(1)).join(" | ")} |`;
const separator = `| --- | ${METRICS.map(() => "---").join(" | ")} |`;
const rows = packages.map(
  (pkg) => `| ${pkg.name} | ${METRICS.map((m) => percent(pkg.metrics[m])).join(" | ")} |`,
);
const totalRow = `| **All packages** | ${METRICS.map((m) => `**${percent(overall[m])}**`).join(" | ")} |`;

console.log(["## Test coverage", "", header, separator, ...rows, totalRow].join("\n"));
