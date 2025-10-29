Feature: Mark a Task as Done on a Course Todo List

    As a student, I mark a task as done on my course to do list, so I can track my accomplishments.

    Background: TODOs are created and related to course todo list.
		Given the server is running
		And TODOs with the following details exist
		    | title                  | doneStatus | description       |
            | Work on group project  | false      | setup the project | 
            | Finish webwork         | false      | 3 problems left   | 
            | Do Shakespeare Reading | false      | Act 1 only        | 
        And course todo list projects with the following details exist  
            | title                  | completed  | description     | active |
            | MATH 141               | false      | Calc 2          | true   |
            | ENGL 202               | false      | Literature      | true   |
            | Intro to SE            | false      | Coding          | true   |

    Scenario Outline: Mark task as done on a course todo list (Normal Flow)
        When a student assigns a doneStatus <doneStatus> to a TODO with title <title>
        Then the todo with title <title> is now set to doneStatus <doneStatus>
        And the student is notified of the completion of the update operation

        Examples:
            | title                    | doneStatus   | description       |
            | "Work on group project"  | "true"       | setup the project |
            | "Finish webwork"         | "true"       | 3 problems left   |
            | "Do Shakespeare Reading" | "false"      | Act 1 only        |

    Scenario Outline: Mark a task as done on a course todo list after assigning the task to the list (Alternative Flow)
        When a student adds a TODO with title <title> to a course todo list with name <course>
        And a student assigns a doneStatus <doneStatus> to a TODO with title <title>
        Then the todo with title <title> is now set to doneStatus <doneStatus>
        And the student is notified of the completion of the update operation

        Examples:
            | title                    | doneStatus   | description       | course        | 
            | "Finish webwork"         | "true"       | 3 problems left   | "MATH 141"    | 
            | "Do Shakespeare Reading" | "true"       | Act 1 only        | "ENGL 202"    | 
            | "Work on group project"  | "true"       | setup the project | "Intro to SE" |

    Scenario Outline: Mark task with non-existing ID as done on a course todo list (Error Flow)
        Given a TODO with id <non_existing_id> does not exist
        When a student assigns a doneStatus <doneStatus> to the todo with id <non_existing_id>
        Then the student is notified of the non-existence error with a message <message>

        Examples:
            | non_existing_id | doneStatus | message                                                 |
            | "50"            | "true"     | "No such todo entity instance with GUID or ID 50 found" |

