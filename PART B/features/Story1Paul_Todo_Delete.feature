Feature: Delete Todo

    As a student I want to delete a todo item

    Background: Server is running
        Given the server is running
        And the following TODO exist
            | id | title             | doneStatus | description       |
            | 1  | "Finish homework" | false      | "math and science"|
     
    Scenario Outline: Scenario Outline name (Normal Flow)
        When a student deletes the TODO with id <id>
        Then the TODO with id <id> is deleted
        AND the student is notified of the completion of the deletion operation

    Scenario Outline: Scenario Outline name (Error Flow)
        When a student attempts to delete the TODO with id <id>
        Then the student is notified of the error with message <message>
    Examples:
        | id | message                           |
        | 2  | "TODO with id 2 does not exist."  |