Feature: Update a TODO doneStatus
	Background:
		Given the server is running
		And this TODO exists
			| id | title           | doneStatus | description       |
			| 1  | "Finish report" | false      | "write last part" |

	Scenario: Normal Flow
		When the TODO with id <id> has its doneStatus updated to <doneStatus>
		Then the TODO with id <id> has doneStatus <doneStatus>
		And the student is notified that the update operation succeeded
		Examples:
			| id | doneStatus |
			| 1  | true       |

	Scenario: Error Flow - validation
		When the TODO with id <id> has its doneStatus updated to <doneStatus>
		Then the student is notified that validation failed with message <message>
		Examples:
			| id | doneStatus   | message                     |
			| 1  | "notbool"   | "doneStatus must be BOOLEAN" |

	Scenario: Alternate Flow - XML
		When the TODO with id <id> has its doneStatus updated to <doneStatus> with XML
		Then the TODO with id <id> has doneStatus <doneStatus>
		And the student is notified that the update operation succeeded
		Examples:
			| id | doneStatus |
			| 1  | true       |
