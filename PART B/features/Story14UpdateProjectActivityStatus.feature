Feature: Change Project Activity Status

  As a student, I want to change a project activity status, to have a better view of my ongoing projects.

  Background: Server is running
    Given the server is running
    And the following project exists
      | project_id   |
      | "1"          |

  Scenario Outline: Updating a project activity status with JSON (Normal Flow)
    When the student requests to update the activity status of project with id <project_id> to <activity_status> with JSON
    Then the activity status of project with id <project_id> is set to <activity_status>
    And the status code 200 is returned

    Examples:
      | project_id | activity_status                 |
      | "1"        | "true"                          |

  Scenario Outline: Updating a project activity status with XML (Alternate Flow)
    When the student requests to update the activity status of project with id <project_id> to <activity_status> with XML
    Then the activity status of project with id <project_id> is set to <activity_status>
    And the status code 200 is returned

    Examples:
      | project_id | activity_status                 |
      | "1"        | "false"                         |

  Scenario Outline: Updating activity status for a non-existent project (Error Flow)
    Given a project with ID equal to <project_id> does not exist
    When the student requests to update the activity status of a non existent project with id <project_id> to <activity_status> with JSON
    Then the student is notified of the non-existence error with a message <message>
    And the status code 404 is returned

    Examples:
      | project_id | activity_status            | message                                                 |
      | "50"       | "false"                    | "Invalid GUID"                                          |
