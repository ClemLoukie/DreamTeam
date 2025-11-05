Feature: change Category PUT

        I want to change a category with put

        Background: Server is running
            Given the server is running

        Scenario: Change a Category (Normal Flow)
            When with a description <Description>, title <Title> and id <ID> the user puts a Categor ID
            Then there is returns 200
            Examples:
                | Title     | Description        | ID |
                | "Bobless" | "no Bobs lie here" | 3  |

        Scenario: change a Category with no description (alternate Flow)
            When with a title <Title> and if <ID> the user puts a Categor ID
            Then there is returns 200
            Examples:
                | Title     | ID |
                | "Bobless" | 2  |

Scenario: Create a Category with invalid ID (ERROR Flow)
            When with a description <Description>, title <Title> and id <ID> the user puts a Categor ID
            Then there is returns 404
            Examples:
                | Title     | Description        | ID   |
                | "Bobless" | "no Bobs lie here" | 0    |
        