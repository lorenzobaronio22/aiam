# Testing

This directory is the home of the project's testing strategy. The Gherkin
feature files under [`features/`](./features) are the **canonical, executable
specification** for end-to-end behaviour; the prose below explains how the
whole test suite fits together and which guardrails keep it honest.

## Strategy

Testing follows a pragmatic pyramid. Fast, deterministic unit tests carry most
of the weight; a thin end-to-end layer proves the real app works in a browser.

| Level            | Where                                                                               | What it proves                                                             | Runner                |
| ---------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------- |
| Unit             | `apps/api/tests`, `packages/api-contract/tests`, `apps/website/src/**/*.test.ts(x)` | Services, schemas, routes, hooks, and components behave in isolation.      | Vitest (`vp test`)    |
| Contract         | `packages/api-contract/tests`                                                       | The shared route tree, schemas, and typed client agree on one API surface. | Vitest                |
| End-to-end (BDD) | `apps/e2e` + `docs/testing/features`                                                | The documented user journeys work in a real browser against the real API.  | Playwright + Cucumber |

Unit tests mock at the seam (`./api.ts`, `@/lib/members.ts`, the service
container) so they never touch the network. The e2e layer exercises everything
together, with the API kept in its default in-memory state.

## Commands

```bash
vp run test                # unit tests, all packages
vp run test:coverage       # unit tests + coverage + threshold guardrail
vp run coverage:summary    # aggregate coverage table from every package
vp run test:e2e            # build contract, compile features, run Playwright
vp run test:e2e:headed     # same, with a visible browser
vp run test:all            # coverage and e2e
```

`vp run ready` (build → `vp check` → coverage) is the full pre-merge gate.

## Coverage guardrail

Every unit test run enforces a minimum coverage percentage. A drop below the
threshold **fails the command** rather than merely printing a warning:

| Package                 | Statements | Branches | Functions | Lines |
| ----------------------- | ---------- | -------- | --------- | ----- |
| `apps/api`              | 90%        | 85%      | 90%       | 90%   |
| `apps/website`          | 90%        | 85%      | 90%       | 90%   |
| `packages/api-contract` | 90%        | 85%      | 90%       | 90%   |

Thresholds live next to the tests in each package's `vite.config.ts`
(`test.coverage.thresholds`). Exclusions are deliberate and small:

- Process entry points that only start a listener (`src/index.ts`, `src/main.tsx`).
- Generated shadcn/ui primitives (`src/components/ui/**`) — registry output, not our code.
- Type-only modules and ambient declarations.
- Test utilities (`src/test/**`).

When you add a feature, add tests that keep the numbers at or above these
floors. Raise a threshold when a package comfortably exceeds it; never lower one
to make a red build green.

## Coverage reports

`vp run test:coverage` writes `coverage/` in every package with:

- `text` and `text-summary` — printed in the terminal.
- `json-summary` — machine-readable, consumed by `scripts/coverage-summary.mjs`.
- `lcov` — for IDE tooling and coverage services.
- `html` — a browsable report at `coverage/index.html`.

`vp run coverage:summary` aggregates every package's `coverage-summary.json` into
one table, which is convenient as a local report or as input to a future CI job.

## End-to-end scenarios (Cucumber/Gherkin)

The behaviour of the app is documented as Gherkin and lives in
[`features/`](./features):

| Feature file                                                      | Functionality                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| [`member-directory.feature`](./features/member-directory.feature) | Listing members, empty states, and pagination.            |
| [`member-search.feature`](./features/member-search.feature)       | Searching by first name, last name, email, and case.      |
| [`member-create.feature`](./features/member-create.feature)       | Creating a member, required-field validation, duplicates. |
| [`member-edit.feature`](./features/member-edit.feature)           | Editing an existing member.                               |
| [`member-delete.feature`](./features/member-delete.feature)       | Deleting and cancelling a delete.                         |
| [`theme.feature`](./features/theme.feature)                       | Switching between light and dark themes.                  |

These files are not just documentation — they are executed. `apps/e2e`
([`playwright.config.ts`](../../apps/e2e/playwright.config.ts)) points
`playwright-bdd` at `docs/testing/features`, compiles each scenario into a
Playwright test with `bddgen`, and runs it with step definitions in
`apps/e2e/steps`. The feature text and the test can never drift apart, because
deleting or renaming a step makes the build fail.

### How the e2e project is wired

```
docs/testing/features/*.feature   (source of truth: the spec)
        │  bddgen
        ▼
apps/e2e/.features-gen/*.spec.js  (generated Playwright tests)
        │  playwright test
        ▼
apps/e2e/steps/*.steps.ts         (step definitions → page + API helpers)
        │
        ├─ page: the website (Vite dev server, proxy → API)
        └─ world: per-scenario data via the REST API (arrange & clean up)
```

- **One source of truth.** Features live in the docs; the e2e project consumes
  them. Edit the Gherkin to change the specification.
- **Isolated scenarios.** Each scenario gets a unique `token` from the `world`
  fixture, creates only the data it needs, and deletes it afterwards, so
  scenarios do not depend on ordering or on each other.
- **Arrange via API, assert via UI.** Setup uses the REST API (fast and
  explicit); the assertions drive the real interface.
- **Shared in-memory API.** Because the API keeps members in memory for the
  whole run, e2e runs with a single worker (`workers: 1`).

### Adding a scenario

1. Write the scenario in the relevant `.feature` file under
   `docs/testing/features` — this is the specification.
2. Run `vp run test:e2e`. `bddgen` fails on a missing step definition rather
   than silently skipping it.
3. Implement the missing step in `apps/e2e/steps`. Reuse the existing steps and
   the `world` fixture where you can.
4. Keep the scenario's data namespaced by the scenario token, and assert on the
   UI, not on internal state.
