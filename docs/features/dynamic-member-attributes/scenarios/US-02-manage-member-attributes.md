# Scenarios: Manage a member's attributes

Gherkin scenarios for
[US-02: Manage a member's attributes](../user-stories/US-02-manage-member-attributes.md).
Each scenario maps 1:1 to an acceptance criterion already listed in that
story — no additional edge cases have been added here.

```gherkin
Feature: Manage a member's attributes
  As a user of the members app
  I want to add, edit, and remove attributes on a specific member, choosing the attribute type and a label for each one
  So that I can enrich a member's record with additional, freeform information beyond name/email

  Scenario: Adding a new attribute to a member
    Given the attribute type catalog contains one or more attribute types
    When a user adds a new attribute to a member, choosing an attribute type, a label, and a value
    Then the attribute is added to that member
    And it is shown with its chosen label and value

  Scenario: Adding multiple attributes of the same type
    Given a member already has one or more attributes of a given attribute type
    When a user adds another attribute of that same type to the member
    Then it is added as a separate, distinct attribute
    And there is no limit on how many attributes of the same type the member can have

  Scenario: Label is mandatory
    Given a user is adding or editing an attribute on a member
    When they leave the label blank
    Then the attribute is rejected
    And they see a clear validation error explaining the label is mandatory

  Scenario: Labels must be unique within a member
    Given a member already has an attribute with a certain label
    When a user tries to add or rename another attribute on that member to the same label
    Then the action is rejected
    And they see a clear error explaining the label is already in use on that member

  Scenario: Editing an existing attribute
    Given a member has an existing attribute
    When a user edits its label and/or its value
    Then the attribute is updated with the new label and/or value
    And its attribute type remains unchanged

  Scenario: Removing an existing attribute
    Given a member has an existing attribute
    When a user removes it
    Then it is deleted immediately
    And no confirmation step is required

  Scenario: Attribute value violates its type's validation rule
    Given an attribute type has a validation rule, such as Free Text Note's 1000-character maximum
    When a user adds or edits a value that violates that rule
    Then the backend rejects the value
    And they see a clear validation error

  Scenario: Attributes are displayed in insertion order
    Given a member has multiple attributes added at different times
    When their attributes are displayed
    Then they appear in the order they were added
    And this order does not depend on their attribute type
```
