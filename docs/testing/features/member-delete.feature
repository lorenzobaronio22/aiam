Feature: Delete a member

  Background:
    Given the member directory is open
    And a member exists for the scenario

  Scenario: Deleting a member removes them from the directory
    When I search for the scenario token
    And I delete the listed member
    Then a success toast "Member deleted" is shown
    And the directory shows the empty state "No matching members"

  Scenario: Cancelling the delete keeps the member
    When I search for the scenario token
    And I cancel deleting the listed member
    Then the listed member is still shown
