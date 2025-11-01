Feature: Query TODOs
  Background:
    Given the server is running
    And these TODOs exist
      | id | title            | doneStatus | description           |
      | 1  | "Finish report"  | false      | "write the last part" |
      | 2  | "Prepare slides" | true       | "final review"        |

  Scenario: Normal Flow
    When all TODOs are requested
    Then all existing TODOs are returned
    And the student is notified that the query succeeded

  Scenario: Alternate Flow
    When the TODO with id <id> is requested
    Then the TODO with id <id> is returned
    And the student is notified that the query succeeded
    Examples:
      | id |
      | 1  |

  Scenario: Error Flow
    When the TODO with id <id> is requested
    Then the student is notified that the TODO was not found with message <message>
    Examples:
      | id  | message                            |
      | 999 | "Could not find thing with id 999" |
