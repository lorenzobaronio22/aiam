Feature: Create a member

  Background:
    Given the member directory is open

  Scenario: A new member is added to the directory
    When I add a member using the scenario token
    Then a success toast "Member created" is shown
    And searching for the scenario token lists the member

  Scenario: Required fields are validated before submitting
    When I open the add member dialog
    And I submit the member form
    Then the form shows the validation error "First name is required"
    And the form shows the validation error "Enter a valid email address"

  Scenario: A duplicate email is rejected
    When I open the add member dialog
    And I fill the member form with a unique name and the email "ada.lovelace@example.com"
    And I submit the member form
    Then an error toast containing "already exists" is shown
    And the add member dialog stays open
