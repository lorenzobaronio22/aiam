Feature: Theme

  Background:
    Given the member directory is open

  Scenario: Switching to dark mode
    When I choose the "Dark" theme
    Then the page uses the dark theme

  Scenario: Switching back to light mode
    When I choose the "Dark" theme
    And I choose the "Light" theme
    Then the page uses the light theme
