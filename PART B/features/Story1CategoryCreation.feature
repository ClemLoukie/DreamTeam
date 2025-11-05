Feature: Create Category

        I want more categories than the pre-made ones so i will add my own

        Background: Server is running
            Given the server is running

        Scenario: Create a Category (Normal Flow)
            When a description <Description> and title <Title> are used to create a category
            Then there is returns 201
            Examples:
                | Title  | Description     |
                | "Bobs" | "Bob lies here" |

        Scenario: Create a Category with no description (alternate Flow)
            When a title <Title> is used to create a category
            Then there is returns 201
            Examples:
                | Title  |
                | "Bobs" |

Scenario: Create a Category with no title (ERROR Flow)
            When a description <Description> is used to create a category
            Then then status code 400
            Examples:
                | Description     |
                | "Bob lies here" |
        

