# US-01: Browse available member attribute types

## Story

As a **user of the members app**,
I want to **browse the list of attribute types that can be defined on a member**,
So that **I understand what kinds of attributes exist and how each one is meant to be used, before I try to use one**.

## Background

Member attributes (e.g. a phone number, a home address, a free text note)
are defined in code as a fixed **catalog** of attribute *types*. Each type
in the catalog carries:

- a stable `key` identifying the type,
- a human-readable `name`,
- a human-readable `description` explaining what it's for and how to use
  it (including relevant limits, e.g. "up to 1000 characters").

For this iteration the catalog contains exactly **one** entry:
[Free Text Note](../attribute-types/free-text-note.md).

Attaching an attribute value to a member is **not** part of this story —
this story is only about discovering/understanding what attribute types
are available.

## Acceptance criteria

- Given the catalog of attribute types, when a user browses it, then they
  can see every registered attribute type, each shown with its name and
  description.
- Given the current registry, when a user browses the catalog, then they
  see exactly one entry: **Free Text Note**, whose description explains
  that it is a freeform note of up to 1000 characters and may be left
  blank.
- Given the catalog is browsed, when it loads, then the data comes from a
  backend API endpoint backed by the code-defined registry (the frontend
  does not hardcode the list).
- Given the catalog endpoint is unreachable or returns an error, when a
  user tries to browse, then they see a clear message that the list
  could not be loaded (no silent failure, no raw error dump).
- Given the catalog is empty (registry has zero types — not expected in
  this iteration, but possible in the future), when a user browses it,
  then they see a clear empty state rather than a blank screen.

## API expectations (backend)

- A new endpoint exposes the attribute type registry as a list, where each
  item includes at minimum: `key`, `name`, `description`.
- The registry is defined in code (single source of truth); the endpoint
  simply serializes it. Adding a new attribute type in the future means
  adding an entry to the code registry, not changing the API contract.

## Out of scope

- Adding, editing, or removing attribute *types* at runtime (types are
  defined in code only).
- Attaching/assigning an attribute value to a specific member.
- Any attribute type other than Free Text Note.
- Authentication/authorization for who may browse the catalog (the app
  currently has no auth system).

## Open decisions (resolved)

See the [decisions log](../README.md#decisions-log) in the feature
overview for the product decisions this story relies on.
