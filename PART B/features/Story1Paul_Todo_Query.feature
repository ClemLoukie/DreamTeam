Feature: Query Todo

    As a student, I want to query my to do list for a class so that I can see my tasks.

    Background: The server is up and running
        Given the server is running
        And the following TODOs exist
        | todo_id | title            | doneStatus | description        |
        | 1       | "Finish homework"| false      | "math and science" |
