Feature: find Category

        I want to get a category

        Background: Server is running
            Given the server is running

        Scenario: GET a Category (Normal Flow)
            When the user uses GETs
            Then there is 200 ok
            Examples:
                

        Scenario: GET a category with ID (alternate Flow)
            When the user GETs with an ID <ID>
            Then there is 200 ok
            Examples:
                | ID |
                | 1  |

        Scenario: GET invalid ID (ERROR Flow)
            When the user GETS an invalid ID <ID>
            Then there is error 404
            Examples:
                | ID   |
                | 0    |
        