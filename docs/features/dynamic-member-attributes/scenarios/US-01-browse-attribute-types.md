# Scenarios: Browse available member attribute types

Gherkin scenarios for
[US-01: Browse available member attribute types](../user-stories/US-01-browse-attribute-types.md).
Each scenario maps 1:1 to an acceptance criterion already listed in that
story — no additional edge cases have been added here.

```gherkin
Feature: Browse member attribute types
  As a user of the members app
  I want to browse the list of attribute types that can be defined on a member
  So that I understand what kinds of attributes exist and how each one is meant to be used

  Scenario: Viewing all registered attribute types
    Given the attribute type registry contains one or more attribute types
    When a user browses the attribute type catalog
    Then they see every registered attribute type
    And each attribute type is shown with its name and its description

  Scenario: Current registry contains only the Free Text Note type
    Given the attribute type registry currently defines exactly one attribute type, "Free Text Note"
    When a user browses the attribute type catalog
    Then they see exactly one entry, "Free Text Note"
    And its description explains that it is a freeform note of up to 1000 characters
    And its description explains that it may be left blank

  Scenario: Catalog reflects the backend-defined registry
    Given the backend attribute type registry defines a set of attribute types
    When a user browses the attribute type catalog
    Then the catalog shown to the user matches exactly the types defined in the backend registry
    And the frontend does not hardcode this list itself

  Scenario: Catalog fails to load
    Given the attribute type catalog endpoint is unreachable or returns an error
    When a user tries to browse the attribute type catalog
    Then they see a clear message that the list could not be loaded
    And no raw error details are shown to the user

  Scenario: Attribute type registry is empty
    Given the attribute type registry currently defines zero attribute types
    When a user browses the attribute type catalog
    Then they see a clear empty state
    And they do not see a blank screen
```
