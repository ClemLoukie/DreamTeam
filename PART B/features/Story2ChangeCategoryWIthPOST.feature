Feature: change Category

        I want to change a category with post

        Background: Server is running
            Given the server is running

        Scenario: Change a Category (Normal Flow)
            When with a description <Description>, title <Title> and id <ID> the user posts a Categor ID
            Then there is returns 200
            Examples:
                | Title     | Description        | ID |
                | "Bobless" | "no Bobs lie here" | 3  |

        Scenario: change a Category with no description (alternate Flow)
            When with a title <Title> and id <ID> the user posts a Categor ID
            Then there is returns 200
            Examples:
                | Title     | ID |
                | "Bobless" | 2  |

Scenario:  a Category with invalid ID (ERROR Flow)
            When with a description <Description> and id <ID> the user posts a Categor ID
            Then there is returns 404
            Examples:
                | Description        | ID   |
                | "no Bobs lie here" | 0    |
        