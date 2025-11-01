Feature: Delete a TODO
  Background:
    Given the server is running
    And this TODO exists
      | id | title           | doneStatus | description       |
      | 1  | "Finish report" | false      | "write last part" |

  Scenario: Normal Flow
    When the TODO with id <id> is deleted
    Then the TODO with id <id> no longer exists
    And the student is notified that the delete operation succeeded
    Examples:
      | id |
      | 1  |

  Scenario: Error Flow
    When the TODO with id <id> is deleted
    Then the student is notified that the TODO was not found with message <message>
    Examples:
      | id  | message                            |
      | 999 | "Could not find thing with id 999" |