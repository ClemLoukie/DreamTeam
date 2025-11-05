Feature: delete Category

        I want to delete a category

        Background: Server is running
            Given the server is running

        Scenario: Delete a Category (Normal Flow)
            When the user deletes a Categors ID <ID>
            Then there is 200 ok
            Examples:
                | ID |
                | 5  |

        Scenario: Deletes a different category (alternate Flow)
            When the user deletes a different Categors ID <ID>
            Then there is 200 ok
            Examples:
                | ID |
                | 3  |

Scenario: deletes a Category with invalid ID (ERROR Flow)
            When the user deletes an invalid Categors ID <ID>
            Then there is error 404
            Examples:
                | ID  |
                | 0   |
        