Feature: Add a Project to the List of Projects

  As a student, I want to add a project to my bulletin, so that I can track my tasks on it.

  Background: Server is running
    Given the server is running

  Scenario Outline: Add a new project to the list of projects with JSON (Normal Flow)
    When a student creates a project with title <title>, completed status <completed>, activity status <active>, and description <description> using JSON format
    Then the project with title <title>, completed status <completed>, activity status <active>, and description <description> is added to the list of project instances
    And the status code 201 is returned

    Examples:
      | title      | completed | active   | description |
      | "COMP 360" | "false"   | "true"   | "Proofs"    |
      | "COMP 362" | "false"   | "true"   | "Proofs Hon"|
      | "MATH 262" | "false"   | "true"   | "Tears"     |

  Scenario Outline: Add a new project to the list of projects with XML (Alternative Flow)
    When a student creates a project with title <title>, completed status <completed>, activity status <active>, and description <description> using XML format
    Then the project with title <title>, completed status <completed>, activity status <active>, and description <description> is added to the list of project instances
    And the status code 201 is returned

    Examples:
      | title      | completed | active   | description  |
      | "COMP 360" | "false"   | "true"   | "Proofs"     |
      | "COMP 362" | "false"   | "true"   | "Proofs Hon" |
      | "MATH 262" | "false"   | "true"   | "Tears"      |

  Scenario Outline: Add a project with XML syntax using JSON (Error Flow)
    When a student creates a project with title <title> using XML syntax for JSON
    Then the system returns an error message <message>
    And the status code 400 is returned

    Examples:
      | title      | message                                                                                           |
      | "MATH 141" | "java.lang.IllegalStateException: Expected BEGIN_OBJECT but was STRING" |
