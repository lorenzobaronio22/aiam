# Dynamic Member Attributes

## Goal

Allow the member data model to be extended, at runtime and without code
changes, with additional, strongly-typed **attribute definitions** (e.g. a
phone number, a home address, a free text note) beyond the fixed
`name`/`email` fields. Each attribute **type** is defined in code: the code
owns its validation rules, and every type also carries human-readable
metadata (a name and a description) so that a non-technical user can
understand what it is and how to use it.

An **attribute definition** is a global field built on top of an attribute
type (e.g. a Free Text Note definition labeled "Allergies"). Once defined,
it applies to **every member**: every member's form gains that field, and
each member may optionally provide a value for it. Attribute definitions
are not attached to a single member's record — they are shared, global
schema, similar to adding a column that every member can (optionally) fill
in.

## Current scope

- **US-01** covers **browsing the catalog of attribute types**.
- **US-02** covers **defining, editing, and reversibly deleting attribute
  definitions that apply to all members**, and having those definitions
  rendered as dynamic fields on the member form.

We are starting with a single attribute type: **Free Text Note**.

## Contents

- [`user-stories/US-01-browse-attribute-types.md`](user-stories/US-01-browse-attribute-types.md) —
  the user story for browsing the attribute type catalog.
- [`scenarios/US-01-browse-attribute-types.md`](scenarios/US-01-browse-attribute-types.md) —
  Gherkin scenarios for US-01.
- [`user-stories/US-02-manage-member-attributes.md`](user-stories/US-02-manage-member-attributes.md) —
  the user story for defining/editing/reversibly-deleting the global
  attribute definitions shared by all members.
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
6. **US-02 attributes are global, not per-member**: an "attribute
   definition" (type + label) is defined once and applies to every
   member; there is no concept of a member having its own independent
   set of attributes.
7. **US-02 label uniqueness**: a definition's label must be unique among
   currently **active** (non-deleted) definitions. A label freed up by a
   soft-deleted definition may be reused by a new definition.
8. **US-02 label requirement**: mandatory, must be non-blank.
9. **US-02 max definitions per type**: unlimited — any number of
   definitions can share the same attribute type.
10. **US-02 edit scope**: only a definition's label can be edited; its
    type is fixed once created.
11. **US-02 deletion is soft/reversible**: deleting a definition never
    hard-deletes it; it flips its status to "deleted", hides its field
    from every member's form, and hides its previously stored values
    from users (without discarding them) until it is restored. No
    confirmation step is required, since deletion is reversible.
12. **US-02 restore conflicts**: restoring a deleted definition is
    rejected with a clear error if its label collides with a currently
    active definition's label.
13. **US-02 validation enforcement**: the backend enforces each attribute
    type's validation rule(s) server-side (not just in the UI).
14. **US-02 UI placement**: a dedicated "Attribute Definitions" page
    manages the global definitions (create, edit label, soft-delete,
    restore); per-member values are edited directly within the existing
    `MemberForm`, which renders one field per active definition.
15. **US-02 value optionality**: providing a value for a definition is
    optional per member — it may be left blank.
16. **US-02 display ordering**: attribute definitions (and their fields
    on `MemberForm`) are shown in insertion order (order defined), not
    grouped or sorted.
