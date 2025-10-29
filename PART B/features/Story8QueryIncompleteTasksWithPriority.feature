Feature: Query all high priority incomplete tasks from all my classes,

        As a student, I query all incomplete HIGH priority tasks from all my classes, to identity my short-term goals.

        Background: Server is running, HIGH, MEDIUM, and LOW priority categories are created
            Given the server is running
            And categories LOW, MEDIUM, and HIGH exist

        Scenario: Query high priority incomplete tasks from all my classes (Normal Flow)
            Given the task with ID of <task_id> exists and has a priority of <current_priority> and done status <done_status>
            When the user requests to query tasks with priority <current_priority> from all registered class
            Then the system returns a list of tasks with incomplete status <done_status> along with a priority of <current_priority>
            And the student is notified of the completion of the query operation
        
        Examples:
            | task_id | project_id | current_priority | done_status |
            | 3       | 1          | "HIGH"           | "false"     |

        Scenario: Querying incomplete task for classes that dont consist of any high priority tasks (Alternate flow)
            Given the task with ID of <task_id> exists and has a priority of <current_priority> and done status <done_status>
            When the user requests to query tasks with priority <requested_priority> from all registered class
            Then the system returns an empty list of tasks with incomplete status <done_status> along with a priority of <requested_priority>
            And the student is notified of the completion of the query operation
       
        Examples:
            | task_id | project_id | current_priority | requested_priority | done_status |
            | 3       | 1          | "LOW"            | "HIGH"             | "false"     |
            
        #  EXPECTED BEHAVIOR: Return Code = 404 and Error Message = "Could not find [resource name]"
        #  ACTUAL BEHAVIOR: Return Code = 200 and returned list of tasks existing in the API 
        Scenario: Querying task from a non-existent project (Error Flow)
            Given a project with ID of <project_id> does not exist
            When the student requests to query incomplete tasks with priority <current_priority> for the project <project_id>
            Then the student is notified of the non-existence error

        Examples:
            | task_id | project_id | current_priority |
            | 1       | "33"       | "HIGH"           |