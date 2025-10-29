Feature: Create Todo

    As a student I want to create a todo item

    Background: Server is running
        Given the server is running

    Scenario Outline: Scenario Outline name (Normal Flow)
        When a student creates a TODO with title <title>, doneStatus <doneStatus>, and description <description>
        Then the TODO with title <title> is created
        AND the student is notified of the completion of the creation operation
    Examples:
        | title                  | doneStatus | description       |
        | "Finish homework"      | false      | "math and science"|