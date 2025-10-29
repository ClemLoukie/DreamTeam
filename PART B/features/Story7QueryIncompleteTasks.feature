Feature: Query incomplete tasks

        As a student, I query the incomplete tasks for a class I am taking, to help manage my time.

        Background: The server is up and running
            Given the server is running
            And the following incomplete tasks exist
                | task_id |
                | 1       |
                | 2       |
            And the following incomplete tasks are part of the following course todo list
                | task_id | project_id |
                | 1       | 1          |
                | 2       | 1          |

        Scenario Outline: Querying incomplete tasks for a class (Normal Flow)
            When the student requests to query incomplete tasks for the project <project_id>
            Then the system displays the following list of incomplete tasks
            And the student is notified of the completion of the query operation

        Examples:
            | task_id | project_id |
            | 1       | "1"        |
            | 2       | "1"        |

        Scenario Outline: Querying incomplete tasks for a class that has all tasks marked as completed (Alternate Flow)
            Given a class with id <project_id> and title <course> with all tasks belonging to it being complete
            When the student requests to query incomplete tasks for the project <project_id>
            Then the system returns an empty list of tasks
            And the student is notified of the completion of the query operation

        Examples:
            | project_id | course     |
            | "2"        | "COMP 350" |

#  EXPECTED BEHAVIOR: Return Code = 404 and Error Message = "Could not find [resource name]"
#  ACTUAL BEHAVIOR: Return Code = 200 and returned list of tasks existing in the API 
        Scenario Outline: Querying incomplete tasks from a non-existent project (Error Flow) - BUG
            Given a project with ID of <project_id> does not exist
            When the student requests to query incomplete tasks for the project <project_id>
            Then the student is notified of the non-existence error
        Examples:
            | task_id | project_id |
            | 1       | "33"       |
