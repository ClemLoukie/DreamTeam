Feature: Query Set of Projects via a parameter

  As a student, I want to view projects that fit a certain requirement, to quickly retrieve the details
  of my desired projects without scrolling.

  Background: The server is up and running
    Given the server is running
    And the following projects exists
      | project_title       | completed | active  |
      | "Have fun"          | "true"    | "false" |
      | "AI agent"          | "false"   | "false" |
      | "AI agent"          | "true"    | "false" |

  Scenario Outline: Querying a project from the list of project instances by title (Normal Flow)
    When the student requests to query projects with title <project_title>
    Then the projects with title <project_title> are displayed
    And the status code 200 is returned

    Examples:
      | project_title       |
      | "Have fun"          |
      | "AI agent"          |
      | "AI agent"          |

  Scenario Outline: Querying projects from the list of project instances by completed status (Alternate Flow)
    When the student requests to query a project with completed status <completed>
    Then the projects with completed status <completed> are displayed
    And the status code 200 is returned

    Examples:
      | completed       |
      | "true"          |

#  EXPECTED BEHAVIOR: Return Code = 404 and Error Message = "Could not find [resource name]"
#  ACTUAL BEHAVIOR: Return Code = 200 and returned list of projects existing in the API
  Scenario Outline: Querying projects from the list of project instances by non existent parameter (Error Flow) - BUG
    When the student requests to query a project with non existent parameter of value <non_existent>
    Then a list of projects is displayed
    And the status code 200 is returned

    Examples:
      | non_existent       |
      | "blurg"            |
