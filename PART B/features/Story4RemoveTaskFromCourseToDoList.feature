Feature: Remove a Task from a Course Todo List

    As a student, I remove an unnecessary task from my course to do list, so I can forget about it.

    Background: TODOs are created and related to course todo list.
        Given the server is running
        And TODOs with the following details exist
            | title                  | doneStatus | description       |
            | Work on group project  | false      | setup the project |
            | Finish webwork         | false      | 3 problems left   |
            | Do Shakespeare Reading | false      | Act 1 only        |
        And course todo list projects with the following details exist
            | title       | completed | description | active |
            | MATH 141    | false     | Calc 2      | true   |
            | ENGL 202    | false     | Literature  | true   |
            | Intro to SE | false     | Coding      | true   |
        And TODOs with titles associated with courses
            | title                  | course      |
            | Work on group project  | Intro to SE |
            | Finish webwork         | MATH 141    |
            | Do Shakespeare Reading | ENGL 202    |

        Scenario Outline: Remove a task from a course todo list (Normal Flow)
            When a student removes a TODO with title <title> from a course todo list with name <course>
            Then the TODO with title <title> is removed from the course todo list with name <course>
            And the student is notified of the completion of the deletion operation

        Examples:
            | title                    | doneStatus | description     | course     |
            | "Finish webwork"         | "false"    | 3 problems left | "MATH 141" |
            | "Do Shakespeare Reading" | "false"    | Act 1 only      | "ENGL 202" |

        Scenario Outline: Remove a task from a course todo list after marking the task as done (Alternative Flow)
            Given a student assigns a doneStatus <doneStatus> to a TODO with title <title>
            When a student removes a TODO with title <title> from a course todo list with name <course>
            Then the TODO with title <title> is removed from the course todo list with name <course>
            And the student is notified of the completion of the deletion operation

        Examples:
            | title                   | doneStatus | description       | course        |
            | "Work on group project" | "true"     | setup the project | "Intro to SE" |

#  EXPECTED BEHAVIOR: Return Code = 404 and Error Message = "Could not find [resource name]"
#  ACTUAL BEHAVIOR: Return Code = 400 and null pointer exception
        Scenario Outline: Remove a non-existing task from a course todo list (Error Flow) - BUG
            Given a TODO with id <non_existing_id> does not exist
            When a student removes a TODO with id <non_existing_id> from a course todo list with name <course>
            Then the student is notified of the failed validation with a message <message>

        Examples:
            | non_existing_id | course     | message                                                    |
            | "50"            | "MATH 141" | "{\"errorMessages\":[\"java.lang.NullPointerException\"]}" |
