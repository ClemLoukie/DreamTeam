Feature: Change Task Description

        As a student, I want to change a task description, to better represent the work to do.

        Background: Server is running
            Given the server is running

        Scenario Outline: Updating a task description (Normal Flow)
            Given a task with ID equal to <task_id> exists
            When a student requests to update the description of task with id <task_id> to <description>
            Then the description of task with id <task_id> is set to <description>
            And the student is notified of the completion of the update operation

        Examples:
            | task_id | description                 |
            | 1       | "Scan paperwork for filing" |
    
        Scenario Outline: Updating a task description by overwriting the task (Alternate Flow)
            Given a task with ID equal to <task_id> exists
            When a student requests to update the description of task with id <task_id> to <description> by overwriting the task with title <title>
            Then the description of task with id <task_id> is set to <description>
            And the student is notified of the completion of the update operation

        Examples:
            | task_id | description                 | title            |
            | 1       | "Scan paperwork for filing" | "scan paperwork" |
    
        Scenario Outline: Updating description for a non-existent task (Error Flow)
            Given a task with ID equal to <task_id> does not exist
            When a student requests to update the description of task with id <task_id> to <description>
            Then the student is notified of the non-existence error with a message <message>

        Examples:
            | task_id | description            | message                                                 |
            | 50      | "Review pull requests" | "No such todo entity instance with GUID or ID 50 found" |
