Feature: Edit a member

  Background:
    Given the member directory is open
    And a member exists for the scenario

  Scenario: Editing a member updates the directory
    When I search for the scenario token
    And I rename the listed member
    Then a success toast "Member updated" is shown
    And the renamed member is listed
