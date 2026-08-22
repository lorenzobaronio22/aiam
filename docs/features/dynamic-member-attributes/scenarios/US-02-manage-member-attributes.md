# Scenarios: Manage attribute definitions across all members

Gherkin scenarios for
[US-02: Manage attribute definitions across all members](../user-stories/US-02-manage-member-attributes.md).
Each scenario maps 1:1 to an acceptance criterion already listed in that
story — no additional edge cases have been added here.

```gherkin
Feature: Manage attribute definitions across all members
  As a user of the members app
  I want to define, edit, and reversibly delete attribute definitions that apply to every member, choosing an attribute type and a label for each one
  So that I can extend the shared member data model with additional, freeform fields beyond name/email, without touching code

  Scenario: Creating a new attribute definition
    Given the attribute type catalog contains one or more attribute types
    When a user creates a new attribute definition, choosing an attribute type and a label
    Then the definition is created
    And a field for it becomes available on every member's form

  Scenario: Creating multiple definitions of the same type
    Given one or more attribute definitions of a given attribute type already exist
    When a user creates another definition of that same type
    Then it is created as a separate, distinct definition
    And there is no limit on how many definitions of the same type may exist

  Scenario: Label is mandatory
    Given a user is creating or editing an attribute definition
    When they leave the label blank
    Then the definition is rejected
    And they see a clear validation error explaining the label is mandatory

  Scenario: Labels must be unique among active definitions
    Given an active attribute definition already has a certain label
    When a user tries to create or rename another active definition to that same label
    Then the action is rejected
    And they see a clear error explaining the label is already in use

  Scenario: Reusing the label of a soft-deleted definition
    Given an attribute definition with a certain label has been soft-deleted
    When a user creates a new definition using that same label
    Then the new definition is created successfully

  Scenario: Editing an attribute definition's label
    Given an existing attribute definition
    When a user edits its label
    Then the definition is updated with the new label
    And its attribute type remains unchanged

  Scenario: Soft-deleting an attribute definition
    Given an existing attribute definition
    When a user deletes it
    Then it is soft-deleted immediately, without a confirmation step
    And its field disappears from every member's form
    And any values members had entered for it are hidden from users, without being discarded

  Scenario: Restoring a soft-deleted attribute definition
    Given a soft-deleted attribute definition
    When a user restores it
    Then its field reappears on every member's form
    And every member's previously stored value for it, if any, reappears as well

  Scenario: Restoring a definition whose label now collides
    Given a soft-deleted attribute definition whose label now matches a currently active definition's label
    When a user tries to restore it
    Then the restore is rejected
    And they see a clear error explaining the label conflict

  Scenario: Viewing the attribute definitions list
    Given one or more active and deleted attribute definitions exist
    When a user views the attribute definitions list page
    Then they see every definition along with its status, active or deleted

  Scenario: Attribute value violates its type's validation rule
    Given an attribute type has a validation rule, such as Free Text Note's 1000-character maximum
    When a member's value for that definition violates the rule
    Then the backend rejects the value
    And they see a clear validation error

  Scenario: Attribute values are optional
    Given a member's form with one or more active attribute definitions
    When a user fills in the form
    Then they may leave any attribute definition's value blank

  Scenario: Attribute definitions are displayed in insertion order
    Given multiple attribute definitions created at different times
    When they are displayed, on the definitions list page or as fields on a member's form
    Then they appear in the order they were defined
    And this order does not depend on their attribute type
```

