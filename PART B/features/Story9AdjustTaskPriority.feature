Feature: Adjust task priority

        As a student, I want to adjust the priority of a task, to help better manage my time

        Background: Server is running, HIGH, MEDIUM, and LOW priority categories are created
            Given the server is running
            And categories LOW, MEDIUM, and HIGH exist

        Scenario Outline: Assigning a new Priority to an existing task (Normal Flow)
            Given a task with ID equal to <task_id> exists
            And the task with ID of <task_id> has a priority of <current_priority>
            When the student requests to delete priority of <current_priority> from task with <task_id>
            And the student requests to add priority of <new_priority> to task of <task_id>
            Then the task with ID of <task_id> has a priority of <new_priority>
            And the student is notified of the completion of the creation operation

        Examples:
            | task_id | current_priority | new_priority |
            | 1       | "LOW"            | "MEDIUM"     |
            | 1       | "LOW"            | "HIGH"       |
            | 1       | "MEDIUM"         | "LOW"        |
            | 1       | "MEDIUM"         | "HIGH"       |
            | 1       | "HIGH"           | "MEDIUM"     |
            | 1       | "HIGH"           | "LOW"        |

        Scenario Outline: Assigning a new Priority equal to the current priority (Alternate Flow)
            Given a task with ID equal to <task_id> exists
            And the task with ID of <task_id> has a priority of <current_priority>
            And current priority <current_priority> is equal to <new_priority>
            When the student requests to add priority of <new_priority> to task of <task_id>
            Then the task with ID of <task_id> has a priority of <new_priority>
            And the student is notified of the completion of the creation operation

        Examples:
            | task_id | current_priority | new_priority |
            | 1       | "MEDIUM"         | "MEDIUM"     |
            | 1       | "LOW"            | "LOW"        |
            | 1       | "HIGH"           | "HIGH"       |

        Scenario Outline: Assigning a new Priority to a non-existent task (Error Flow)
            Given a task with ID equal to <task_id> does not exist
            When the student requests to delete priority of <current_priority> from task with <task_id>
            Then the student is notified of the non-existence error with a message <message>

        Examples:
            | task_id | current_priority | message                                                   |
            | 50      | "HIGH"           | "Could not find any instances with todos/50/categories/5" |
