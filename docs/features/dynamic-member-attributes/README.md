# Dynamic Member Attributes

## Goal

Allow members to be enriched with additional, strongly-typed **attributes**
(e.g. a phone number, a home address, a free text note) beyond the fixed
`name`/`email` fields. Each attribute **type** is defined in code: the code
owns its validation rules, and every type also carries human-readable
metadata (a name and a description) so that a non-technical user can
understand what it is and how to use it.

## Current scope

This iteration only covers **browsing the catalog of attribute types**.
Attaching an attribute value to an actual member (create/edit/view on a
member record) is explicitly **out of scope** here and will be a separate,
future user story.

We are starting with a single attribute type: **Free Text Note**.

## Contents

- [`user-stories/US-01-browse-attribute-types.md`](user-stories/US-01-browse-attribute-types.md) —
  the user story for browsing the attribute type catalog.
- [`scenarios/US-01-browse-attribute-types.md`](scenarios/US-01-browse-attribute-types.md) —
  Gherkin scenarios for US-01.
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
