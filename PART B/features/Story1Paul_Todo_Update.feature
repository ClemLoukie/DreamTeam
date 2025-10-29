Feature: Update Todo

    As a student, I want to update my to do list for a class so that I can keep track of my tasks.

    Background: The server is up and running
        Given the server is running
        And the following TODOs exist
        | todo_id | title            | doneStatus | description        |
        | 1       | "Finish homework"| false      | "math and science" |

    Scenario Outline: Updating TODO (Normal Flow)
        When a student updates the TODO with id <todo_id> to have title <title>, doneStatus <doneStatus>, and description <description>
        Then the TODO with id <todo_id> should have title <title>, doneStatus <doneStatus>, and description <description>
        Examples:
        | todo_id | title              | doneStatus | description            |
        | 1       | "Finish homework"  | true       | "math and science"     |

    Scenario Outline: Updating TODO (Error Flow)
        When a student attempts to update the TODO with non existing todo id <todo_id> to have title <title>, doneStatus <doneStatus>, and description <description>
        Then the system should return an error message <errorMessage>
        Examples:
        | todo_id | title             | doneStatus | description        | errorMessage                     |
        | 99      | "Non-existent"    | false      | "This TODO does not exist" | "Error: TODO with id 99 not found" |


    