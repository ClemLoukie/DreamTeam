Feature: Create a TODO
  Background:
    Given the server is running

  Scenario: Normal Flow
    When a TODO is created with title <title>, doneStatus <doneStatus>, and description <description>
    Then the TODO with title <title> exists
    And the student is notified that the create operation succeeded
    Examples:
      | title           | doneStatus | description             |
      | "Finish report" | false      | "write the last section" |

  Scenario: Alternate Flow
    When a TODO is created with title <title> and doneStatus <doneStatus>
    Then the TODO with title <title> exists
    And the student is notified that the create operation succeeded
    Examples:
      | title            | doneStatus |
      | "Prepare slides" | true       |

  Scenario: Error Flow
    When a TODO is created with title <title>, doneStatus <doneStatus>, and description <description>
    Then the student is notified that validation failed with message <message>
    Examples:
      | title           | doneStatus | description             | message                                           |
      | "Finish report" | "completed" | "write the last section" | "doneStatus must be BOOLEAN"                     |
