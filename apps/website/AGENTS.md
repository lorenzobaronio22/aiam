# apps/website — Frontend UI

Vite frontend app. It consumes the API through the typed RPC client in
`src/lib/api.ts` (`createApiClient` from `api-contract/client`) — never call
`fetch` against `/api` directly.

## UI is built with shadcn/ui

All UI in this app comes from shadcn registries. Do not hand-roll your own
buttons, dialogs, inputs, tables, sidebars, and similar primitives, and do not
copy component source from the web or from another project.

The shadcn MCP server is configured at the repo root (`opencode.json`, server
`shadcn`, working directory `apps/website`). Use it instead of guessing at
component APIs.

### MCP tools

In Code Mode these are `tools.shadcn.<name>`. Use the search → view → add
sequence:

| Tool                                | Use it to                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `get_project_registries`            | Check which registries `components.json` exposes. Errors when `components.json` is missing. |
| `search_items_in_registries`        | Find items by name or purpose (`"login form"`, `"data table"`).                             |
| `list_items_in_registries`          | Browse a registry, filtered by `types` (e.g. `["ui", "block", "component"]`).               |
| `view_items_in_registries`          | Read an item's files, props, and dependencies before using it.                              |
| `get_item_examples_from_registries` | Pull complete usage examples (`"accordion-demo"`).                                          |
| `get_add_command_for_items`         | Get the exact `shadcn add` command for the items you picked.                                |
| `get_audit_checklist`               | Verify new components/files after generating UI.                                            |

Registries are read from `components.json`. Prefer the tool call over
`vp dlx shadcn@latest list` so results stay structured.

### Workflow

1. `get_project_registries` first. If it reports no registries, the app is not
   shadcn-ready yet — set it up (see below) before building UI.
2. Search or list to find the right item. Prefer an existing `block` over
   assembling a layout from scratch.
3. `view_items_in_registries` to confirm the API, required deps, and file
   targets. Never invent props that the item does not declare.
4. `get_item_examples_from_registries` when you need a working usage pattern.
5. `get_add_command_for_items`, then run that command **from `apps/website`**:

   ```bash
   cd apps/website && vp dlx shadcn@latest add @shadcn/<item>
   ```

6. Compose the UI from the installed components, then run
   `get_audit_checklist` and `vp check`.

### Conventions

- Registry components land in `src/components/ui/`; import them as
  `@/components/ui/<name>`. Blocks and composed components go alongside them,
  not inside `ui/`.
- Merge classes with `cn` from `@/lib/utils`. Do not concatenate Tailwind
  class strings by hand, and do not add `class-variance-authority`,
  `clsx`, or `tailwind-merge` usage that bypasses the generated variants.
- Style with Tailwind utilities and the theme tokens defined in the global
  stylesheet (CSS variables, `dark` class). Never hardcode hex colors or
  duplicate a token's value.
- Keep the `@/*` path alias working: `tsconfig.json` `paths` **and** the
  matching `resolve.alias` in `vite.config.ts` must both exist. `shadcn init`
  prompts for this; verify if it is missing.
- Add a component only when it is actually used. Do not pre-install items.

## Making the app shadcn-ready

`components.json` is the prerequisite for every registry operation. If it is
missing, this app is still the plain Vite starter and shadcn components cannot
be installed.

shadcn/ui needs React and Tailwind. To convert the app, add them through the
workspace (`vp add <pkg> --filter website`), then run the initializer in the app
and follow its prompts for base color, CSS variables, and aliases:

```bash
cd apps/website && vp dlx shadcn@latest init
```

After `init`, `components.json` exists and the MCP tools can list, search, and
install items. When asked to build UI in an uninitialized app, do this setup
first and say so — do not fake components or inline raw markup as a stand-in.

## Verify

```bash
vp check                                 # format, lint, type check
vp run --filter website build            # tsc + vp build
vp dev                                   # api + website together, from repo root
```
