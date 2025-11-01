Feature: Delete a Project from the List of Projects

  As a student, I remove a project which I am no longer working on, to declutter my bulletin.

  Background: The server is up and running
    Given the server is running
    And the following project exists
      | project_id |
      | 1          |

  Scenario Outline: Deleting Instance of Project with JSON (Normal Flow)
    When the student requests to delete project with id <project_id> to declutter bulletin with JSON
    Then the project with id <project_id> is deleted
    And the status code 200 is returned

    Examples:
      | project_id   |
      | "1"          |

  Scenario Outline: Deleting Instance of Project with XML (Alternate Flow)
    When the student requests to delete project with id <project_id> to declutter bulletin with XML
    Then the project with id <project_id> is deleted
    And the status code 200 is returned

    Examples:
      | project_id   |
      | "1"          |

  Scenario Outline: Deleting Nonexistent Instance of Project with JSON (Error Flow)
    Given a project with ID of <project_id> does not exist
    When the student requests to delete nonexistent project <project_id> to declutter bulletin
    Then the student is notified of the non-existence error with a message <message>
    And  the status code 404 is returned

    Examples:
      | project_id   | message                                         |
      | "33"         | "Could not find any instances with projects/33" |
