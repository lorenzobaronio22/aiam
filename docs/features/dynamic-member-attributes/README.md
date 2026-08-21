# Dynamic Member Attributes

## Goal

Allow members to be enriched with additional, strongly-typed **attributes**
(e.g. a phone number, a home address, a free text note) beyond the fixed
`name`/`email` fields. Each attribute **type** is defined in code: the code
owns its validation rules, and every type also carries human-readable
metadata (a name and a description) so that a non-technical user can
understand what it is and how to use it.

## Current scope

- **US-01** covers **browsing the catalog of attribute types**.
- **US-02** covers **adding, editing, and removing attribute values on a
  member** (choosing a type from the catalog, and a user-chosen label).

We are starting with a single attribute type: **Free Text Note**.

## Contents

- [`user-stories/US-01-browse-attribute-types.md`](user-stories/US-01-browse-attribute-types.md) —
  the user story for browsing the attribute type catalog.
- [`scenarios/US-01-browse-attribute-types.md`](scenarios/US-01-browse-attribute-types.md) —
  Gherkin scenarios for US-01.
- [`user-stories/US-02-manage-member-attributes.md`](user-stories/US-02-manage-member-attributes.md) —
  the user story for adding/editing/removing a member's attributes.
- [`scenarios/US-02-manage-member-attributes.md`](scenarios/US-02-manage-member-attributes.md) —
  Gherkin scenarios for US-02.
- [`attribute-types/free-text-note.md`](attribute-types/free-text-note.md) —
  the spec (name, description, validation rules) for the first attribute
  type, which the catalog must expose.

## Decisions log

Product decisions made so far (do not re-litigate without asking again):

1. **Scope**: this story is catalog browsing only; attaching attribute
   values to members is a future story.
2. **Catalog data source**: the catalog is backed by a code-defined registry
   in the backend and exposed via a new API endpoint (not frontend-only
   static data).
3. **Catalog fields**: each attribute type is described by a `key`, a
   human-readable `name`, and a `description` (no separate structured
   "validation summary" field — usage details belong in the description
   text).
4. **Free Text Note validation**: exactly one rule — maximum length of
   1000 characters. No other constraints (e.g. it may be blank/empty).
5. **Where the browsing UI lives**: intentionally left open for the
   implementation to decide; the user story describes the expected
   user-visible behavior only, not a specific page/route.
6. **US-02 label uniqueness**: a user-chosen attribute label must be
   unique per member (across all attribute types on that member).
7. **US-02 label requirement**: mandatory, must be non-blank.
8. **US-02 max attributes per type**: unlimited — a member can have any
   number of attributes of the same type.
9. **US-02 edit scope**: only an attribute's label and value can be
   edited; its type is fixed once created.
10. **US-02 delete confirmation**: removing an attribute is immediate, no
    confirmation step.
11. **US-02 validation enforcement**: the backend enforces each attribute
    type's validation rule(s) server-side (not just in the UI).
12. **US-02 UI placement**: a separate, dedicated section/page for
    managing a member's attributes, not embedded in the existing
    `MemberForm`.
13. **US-02 display ordering**: attributes are shown in insertion order
    (order added), not grouped or sorted.
