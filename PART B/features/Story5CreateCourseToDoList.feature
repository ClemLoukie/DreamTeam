Feature: Create a Course Todo List

    As a student, I create a to do list for a new class I am taking, so I can manage course work.

    Background: Server is running, Course Todo List is created
        Given the server is running

    Scenario Outline: Create a course todo list (Normal Flow)
        When a student creates a new course todo list with <title>, <completed>, <description>, and <active>
        Then the course todo list is created with <title>, <completed>, <description>, and <active>
        And the student is notified of the completion of the update operation

        Examples:
            | title      | completed | description  | active |
            | "MATH 141" | "false"   | "Calc 2"     | "true" |
            | "ENGL 202" | "false"   | "Literature" | "true" |

    Scenario Outline: Create a course todo list without specifying the title (Alternative Flow)
        When a student creates a new course todo list with <completed>, <description>, and <active>
        Then the course todo list is created with <completed>, <description>, and <active>
        And the student is notified of the completion of the update operation

        Examples:
            | completed | description  | active |
            | "false"   | "Calc 2"     | "true" |
            | "false"   | "Literature" | "true" |

        Scenario Outline: Create a course todo list with invalid input type for active status (Error Flow)
            When a student creates a new course todo list with <title>, <completed>, <description>, and wrong <bad_active>
            Then the student is notified of the failed validation with a message <message>

        Examples:
            | title      | completed | description | bad_active | message                                       |
            | "MATH 141" | "false"   | "Calc 2"    | "yes"      | "Failed Validation: active should be BOOLEAN" |
