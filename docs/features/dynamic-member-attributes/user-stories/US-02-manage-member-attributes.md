# US-02: Manage attribute definitions across all members

## Story

As a **user of the members app**,
I want to **define, edit, and reversibly delete attribute definitions that
apply to every member, choosing an attribute type and a label for each
one**,
So that **I can extend the shared member data model with additional,
freeform fields beyond name/email, without touching code**.

## Background

This story builds directly on
[US-01: Browse available member attribute types](US-01-browse-attribute-types.md).
The catalog of attribute *types* (currently just
[Free Text Note](../attribute-types/free-text-note.md)) is browsable and
defined in code. This story introduces **attribute definitions**: a
global, user-managed list of fields built on top of that catalog.

An attribute definition consists of:

- an **attribute type**, chosen from the catalog (e.g. Free Text Note),
- a **label**, chosen by the user, used as that field's display name
  everywhere it appears (e.g. "Allergies" or "Emergency contact").

Attribute definitions are **global, not per-member**: once a definition
exists and is active, every member's form gains a field for it, and each
member may optionally provide (or leave blank) a value for it. There is no
concept of a member having its own independent set of attributes — the
definitions are shared schema, and only the *values* differ per member.

Any number of definitions may share the same underlying attribute type —
each one is a separate, independent field distinguished by its label.

Deleting a definition is **reversible**: it is soft-deleted, hiding its
field from every member's form and hiding its previously stored values
from users, without discarding them. Restoring it brings the field — and
every member's previously stored value for it — back.

## Acceptance criteria

- Given the attribute type catalog, when a user creates a new attribute
  definition, then they can choose any attribute type from the catalog and
  provide a label, and the resulting field becomes available on every
  member's form.
- Given one or more attribute definitions of a given type already exist,
  when a user creates another definition of that same type, then it is
  created as a separate, distinct definition (there is no limit on how
  many definitions of the same type may exist).
- Given a user is creating or editing an attribute definition, when they
  leave the label blank, then it is rejected with a clear validation error
  (the label is mandatory).
- Given an active attribute definition already has a certain label, when a
  user tries to create or rename another active definition to that same
  label, then the action is rejected with a clear error (labels must be
  unique among active definitions). A label freed up by a soft-deleted
  definition may be reused by a new one.
- Given an existing attribute definition, when a user edits it, then they
  can change its label, but its attribute type cannot be changed after
  creation.
- Given an existing attribute definition, when a user deletes it, then it
  is soft-deleted immediately (no confirmation step, since the action is
  reversible): its field disappears from every member's form, and any
  values members had previously entered for it are hidden from users
  (but not discarded).
- Given a soft-deleted attribute definition, when a user restores it, then
  its field reappears on every member's form, and every member's
  previously stored value for it (if any) reappears as well.
- Given a soft-deleted attribute definition whose label now collides with
  a currently active definition's label, when a user tries to restore it,
  then the action is rejected with a clear error until the conflict is
  resolved.
- Given the attribute definitions list page, when a user views it, then
  they see both active and deleted definitions along with their status.
- Given an attribute type has a validation rule (e.g. Free Text Note's
  1000-character maximum), when a member's value for that definition
  violates the rule, then the backend rejects it with a clear validation
  error.
- Given a member's form, when a user fills it in, then providing a value
  for any given attribute definition is optional — it may be left blank.
- Given multiple attribute definitions, when they are displayed (on the
  definitions list page or as fields on a member's form), then they appear
  in the order they were defined (insertion order), regardless of type.

## API expectations (backend)

- A new resource represents **attribute definitions**, each recording:
  which catalog attribute type it is (its `key`), the user-chosen `label`,
  and its status (`active` or `deleted`).
- The member resource gains a collection of attribute **values**, one per
  active attribute definition, each optional. Values belonging to a
  soft-deleted definition are omitted from what is shown to users (though
  retained internally so they can reappear if the definition is
  restored).
- The backend validates, on create/edit of a definition:
  - the attribute type `key` refers to an entry that exists in the
    attribute type registry,
  - the `label` is non-blank,
  - the `label` is unique among that other **active** definitions.
- On restore, the backend re-validates label uniqueness among active
  definitions and rejects the restore on conflict.
- On a member's value for a definition, the backend validates that the
  value satisfies the validation rule(s) of its attribute type (e.g. Free
  Text Note's 1000-character maximum).
- Insertion order is preserved and returned as-is (no server-side
  reordering/sorting).

## Where this lives in the UI

- A dedicated **Attribute Definitions** page lists all definitions (active
  and deleted, with their status) and lets a user create a definition
  (type + label), edit a definition's label, soft-delete a definition, and
  restore a deleted one.
- The existing `MemberForm` renders one field per **active** attribute
  definition, alongside the fixed `name`/`email` fields, so a member's
  values are set/edited/cleared as part of saving that member — there is
  no separate per-member attributes page.

## Out of scope

- Defining new attribute *types* (still code-only, per US-01).
- Changing an existing attribute definition's type after creation (only
  its label can be edited).
- Permanently/hard-deleting an attribute definition — deletion is always
  soft and reversible.
- A confirmation step before soft-deleting a definition.
- Manually reordering attribute definitions (display order is always
  insertion order).
- Searching/filtering members by attribute value.
- Any attribute type other than Free Text Note (more types may be added to
  the registry later, independently of this story).

## Open decisions (resolved)

The following were explicitly asked and confirmed for this story (do not
re-litigate without asking again):

1. **Global, not per-member**: an attribute definition (type + label) is
   defined once and applies to every member; there is no per-member set
   of attributes.
2. **Terminology**: "attribute definitions" refers to these global,
   user-managed fields; "attribute types" remains the code-defined
   catalog from US-01.
3. **Label uniqueness**: unique among currently active (non-deleted)
   definitions only — a label freed up by a soft-deleted definition may
   be reused.
4. **Label requirement**: mandatory, must be non-blank.
5. **Max definitions per type**: unlimited.
6. **Edit scope**: only the label can be edited; the attribute type is
   fixed once created.
7. **Delete behavior**: soft delete only (reversible); no hard delete; no
   confirmation step, since the action can be undone.
8. **Restore behavior**: restoring reinstates the field and every
   member's previously stored value; it is rejected if the label collides
   with a currently active definition.
9. **Validation enforcement**: the backend enforces each attribute type's
   validation rule(s) server-side.
10. **UI placement**: a dedicated "Attribute Definitions" page manages
    definitions (create/edit label/soft-delete/restore); per-member
    values are edited directly within `MemberForm`, rendered dynamically
    per active definition.
11. **Value optionality**: providing a value is optional per member —
    it may be left blank.
12. **Display ordering**: insertion order (order defined), not grouped or
    sorted.
