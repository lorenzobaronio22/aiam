# US-02: Manage a member's attributes

## Story

As a **user of the members app**,
I want to **add, edit, and remove attributes on a specific member, choosing
the attribute type and a label for each one**,
So that **I can enrich a member's record with additional, freeform
information beyond name/email**.

## Background

This story builds directly on
[US-01: Browse available member attribute types](US-01-browse-attribute-types.md).
The catalog of attribute *types* (currently just
[Free Text Note](../attribute-types/free-text-note.md)) is browsable and
defined in code. This story is about attaching **attribute values** to an
actual member, using one of those catalog types.

Each attribute a user adds to a member consists of:

- an **attribute type**, chosen from the catalog (e.g. Free Text Note),
- a **label**, chosen by the user, used to identify/display that specific
  attribute (e.g. two Free Text Note attributes on the same member could be
  labeled "Allergies" and "Emergency contact"),
- a **value**, validated according to the rules of its attribute type.

A member can have **any number of attributes of the same type** — each one
is a separate, independent attribute distinguished by its label.

## Acceptance criteria

- Given the attribute type catalog, when a user adds a new attribute to a
  member, then they can choose any attribute type from the catalog, provide
  a label, and provide a value for it.
- Given a member already has one or more attributes of a given type, when a
  user adds another attribute of that same type, then it is added as a
  separate, distinct attribute (there is no limit on how many attributes of
  the same type a member can have).
- Given a user is adding or editing an attribute, when they leave the label
  blank, then the attribute is rejected with a clear validation error (the
  label is mandatory).
- Given a member already has an attribute with a certain label, when a user
  tries to add or rename another attribute to that same label, then the
  action is rejected with a clear error (labels must be unique within a
  member).
- Given a member has an existing attribute, when a user edits it, then they
  can change its label and/or its value, but the attribute type itself
  cannot be changed after creation.
- Given a member has an existing attribute, when a user removes it, then it
  is deleted immediately, without requiring a confirmation step.
- Given an attribute type has a validation rule (e.g. Free Text Note's
  1000-character maximum), when a user adds or edits a value that violates
  that rule, then the backend rejects it with a clear validation error.
- Given a member has multiple attributes, when they are displayed, then
  they appear in the order they were added (insertion order), regardless
  of type.

## API expectations (backend)

- The member resource gains a collection of attributes. Each attribute
  records: which catalog attribute type it is (its `key`), the user-chosen
  `label`, and its `value`.
- The backend validates, on add and on edit:
  - the attribute type `key` refers to an entry that exists in the
    attribute type registry,
  - the `label` is non-blank,
  - the `label` is unique among that member's other attributes,
  - the `value` satisfies the validation rule(s) of its attribute type
    (e.g. Free Text Note's 1000-character maximum).
- Attribute type validation rules are therefore enforced server-side, not
  just in the UI — the registry becomes the single source of truth for
  both the human-readable catalog (US-01) and the machine-enforced rules
  (this story).
- Insertion order is preserved and returned as-is (no server-side
  reordering/sorting).

## Where this lives in the UI

Adding, editing, and removing a member's attributes lives in a **dedicated
section/page for managing that member's attributes**, separate from the
existing member create/edit form (`MemberForm`).

## Out of scope

- Defining new attribute *types* (still code-only, per US-01).
- Changing an existing attribute's type after creation (only its label
  and/or value can be edited).
- A confirmation step before removing an attribute.
- Manually reordering attributes (display order is always insertion
  order).
- Searching/filtering members by attribute value.
- Any attribute type other than Free Text Note (more types may be added to
  the registry later, independently of this story).

## Open decisions (resolved)

The following were explicitly asked and confirmed for this story (do not
re-litigate without asking again):

1. **Label uniqueness**: unique per member — no two attributes on the same
   member may share a label, regardless of type.
2. **Label requirement**: mandatory, must be non-blank.
3. **Max attributes per type**: unlimited.
4. **Edit scope**: only the label and value can be edited; the attribute
   type is fixed once created.
5. **Delete confirmation**: removal is immediate, no confirmation step.
6. **Validation enforcement**: the backend enforces each attribute type's
   validation rule(s) server-side.
7. **UI placement**: a separate, dedicated section/page for managing a
   member's attributes (not embedded in `MemberForm`).
8. **Display ordering**: insertion order (order added), not grouped or
   sorted.
