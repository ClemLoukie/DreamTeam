Feature: Query incomplete tasks

        As a student, I remove a to do list for a class which I am no longer taking, to declutter my schedule.

        Background: The server is up and running
            Given the server is running
            And the following project exists
                | project_id |
                | 1          |

        Scenario Outline: deleting to do list for an existing class (Normal Flow)
            Given student is registered in the class with id <project_id>
            When the student requests to delete tasks from the project <project_id>
            Then the system returns an empty to do list for the project with id <project_id>
            And the student is notified of the completion of the deletion operation

        Examples:
            | project_id   |
            | "1"          |

        Scenario Outline: deleting to do list for an existing class by deleting the class (Alternate Flow)
            Given student is registered in the class with id <project_id>
            When the student requests to delete project with id <project_id> to clear up schedule
            Then the student is notified of the completion of the deletion operation

        Examples:
            | project_id   |
            | "1"          |

        Scenario Outline: deleting a nonexistent class to remove to do list (Error Flow)
            Given a project with ID of <project_id> does not exist
            When the student requests to delete nonexistent project <project_id> to clear up schedule
            Then the student is notified of the non-existence error with a message <message>
            
        Examples:
            | project_id   | message                                         |
            | "33"         | "Could not find any instances with projects/33" |
