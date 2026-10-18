Feature: Member directory

  The home screen lists the members in the directory. Results are paged so the
  list stays readable as the directory grows.

  Background:
    Given the member directory is open

  Scenario: Seeded members are listed
    Then the directory lists the member "Ada Lovelace"
    And the directory reports at least 5 members

  Scenario: A search with no matches shows guidance
    When I search for "zzz-no-such-member"
    Then the directory shows the empty state "No matching members"

  Scenario: A long result set is paginated
    Given 11 members match the scenario token
    When I search for the scenario token
    Then the page indicator reads "Page 1 of 2"
    And the "Next" button is enabled
    And the "Previous" button is disabled
    When I click the "Next" button
    Then the page indicator reads "Page 2 of 2"
    And the "Previous" button is enabled
