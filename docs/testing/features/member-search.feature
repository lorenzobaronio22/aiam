Feature: Member search

  Search matches a member by first name, last name, or email, and ignores case.

  Background:
    Given the member directory is open

  Scenario Outline: Search matches a member by <field>
    When I search for "<term>"
    Then the directory lists the member "<name>"

    Examples:
      | field      | term                    | name              |
      | first name | Katherine               | Katherine Johnson |
      | last name  | Hopper                  | Grace Hopper      |
      | email      | alan.turing@example.com | Alan Turing       |

  Scenario: Search ignores case
    When I search for "LOVELACE"
    Then the directory lists the member "Ada Lovelace"
