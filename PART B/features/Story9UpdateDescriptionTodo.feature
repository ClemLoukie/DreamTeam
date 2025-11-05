Feature: Update a TODO description
	Background:
		Given the server is running
		And this TODO exists
			| id | title           | doneStatus | description       |
			| 1  | "Finish report" | false      | "write last part" |

	Scenario: Normal Flow
		When the TODO with id <id> has its description updated to <description>
		Then the TODO with id <id> has description <description>
		And the student is notified that the update operation succeeded
		Examples:
			| id | description             |
			| 1  | "write the conclusion" |

	Scenario: Error Flow - TODO not found
		When the TODO with id <id> has its description updated to <description>
		Then the student is notified that the TODO was not found with message <message>
		Examples:
			| id  | description             | message                            |
			| 999 | "doesn't matter"       | "Could not find thing with id 999" |

	Scenario: Alternate Flow - XML
		When the TODO with id <id> has its description updated to <description> with XML
		Then the TODO with id <id> has description <description>
		And the student is notified that the update operation succeeded
		Examples:
			| id | description             |
			| 1  | "write the conclusion" |

