Feature: Change Project Description

  As a student, I want to change a project description, to better represent the work that is to be completed.

  Background: Server is running
    Given the server is running
    And the following project exists
      | project_id   |
      | "1"          |

  Scenario Outline: Updating a project description with JSON (Normal Flow)
    When the student requests to update the description of project with id <project_id> to <description> with JSON
    Then the description of project with id <project_id> is set to <description>
    And the status code 200 is returned

    Examples:
      | project_id | description                 |
      | "1"          | "Scan paperwork for filing" |

  Scenario Outline: Updating a project description with XML (Alternate Flow)
    When the student requests to update the description of project with id <project_id> to <description> with XML
    Then the description of project with id <project_id> is set to <description>
    And the status code 200 is returned

    Examples:
      | project_id   | description                 |
      | "1"          | "Scan paperwork for filing" |

  Scenario Outline: Updating description for a non-existent project with JSON (Error Flow)
    Given a project with ID equal to <project_id> does not exist
    When the student requests to update the description of the non existent project with id <project_id> to <description> with JSON
    Then the student is notified of the non-existence error with a message <message>
    And the status code 404 is returned

    Examples:
      | project_id   | description            | message                                                 |
      | "50"         | "Review pull requests" | "Invalid GUID" |
