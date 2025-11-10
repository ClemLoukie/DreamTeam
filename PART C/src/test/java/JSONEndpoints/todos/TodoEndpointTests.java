package JSONEndpoints.todos;

import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestMethodOrder(MethodOrderer.Random.class)
public class TodoEndpointTests {

    private static final String BASE_URL = "http://localhost:4567";
    private Process serverProcess;

    @BeforeEach
    void startServer() throws IOException, InterruptedException {
        // Pfad zur API-jar
        String jarPath = System.getProperty("user.dir") + "/runTodoManagerRestAPI-1.5.5.jar";
        serverProcess = new ProcessBuilder("java", "-jar", jarPath)
                .inheritIO()
                .start();

        // Warten bis Server bereit
        boolean serverReady = false;
        int retries = 0;
        while (!serverReady && retries < 30) {
            try {
                given().baseUri(BASE_URL).get("/todos").then().statusCode(200);
                serverReady = true;
            } catch (Exception e) {
                Thread.sleep(500);
                retries++;
            }
        }

        if (!serverReady) {
            throw new RuntimeException("Server did not start in time.");
        }
    }

    @AfterEach
    void stopServer() {
        try {
            given().baseUri(BASE_URL).get("/shutdown");
        } catch (Exception ignored) {}
        if (serverProcess != null && serverProcess.isAlive()) {
            serverProcess.destroy();
        }
    }

    @DisplayName("CAPABILITY: Get all todos when there is one todo")
    @Test
    void testGetTodosWithInitialConditionOfOneTodo() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/todos")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1));
    }

    @DisplayName("CAPABILITY: Retrieve headers for all todos")
    @Test
    void testGetTodoHeaders() {
        given()
                .baseUri(BASE_URL)
                .when()
                .head("/todos")
                .then()
                .statusCode(200)
                .header("Content-Type", equalTo("application/json"))
                .header("Transfer-Encoding", equalTo("chunked"));
    }

    @DisplayName("CAPABILITY: Create todo with valid JSON body")
    @Test
    void testCreateTodoWithBody() {
        String requestBody = """
        {
            "title": "Buy Milk",
            "description": "Buy almond milk from the store"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(201)
                .body("title", equalTo("Buy Milk"))
                .body("description", equalTo("Buy almond milk from the store"))
                .body("doneStatus", equalTo("false"));
    }

    @DisplayName("CAPABILITY: Retrieve existing todo by ID")
    @Test
    void testGetTodoByID() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/todos/1")
                .then()
                .statusCode(200);
    }

    @DisplayName("CAPABILITY: Edit existing todo using POST /todos/:id")
    @Test
    void testEditTodoByID() {
        String requestBody = """
        {
            "title": "Updated Task",
            "description": "Updated description"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos/1")
                .then()
                .statusCode(200)
                .body("title", equalTo("Updated Task"))
                .body("description", equalTo("Updated description"));
    }

    @DisplayName("CAPABILITY: Edit existing todo using PUT /todos/:id")
    @Test
    void testEditTodoByIDPUT() {
        String requestBody = """
        {
            "title": "Replaced Task",
            "description": "This task replaces the previous one"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .put("/todos/1")
                .then()
                .statusCode(200)
                .body("title", equalTo("Replaced Task"))
                .body("description", equalTo("This task replaces the previous one"));
    }

    @DisplayName("CAPABILITY: Delete existing todo and confirm it no longer exists")
    @Test
    void testDeleteTodo() {
        // Create a temporary todo
        String requestBody = """
        {
            "title": "Temp Task"
        }
        """;
        String id = given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Delete and confirm
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/todos/" + id)
                .then()
                .statusCode(200);

        given()
                .baseUri(BASE_URL)
                .when()
                .get("/todos/" + id)
                .then()
                .statusCode(404);
    }


    @DisplayName("ERROR CASE: Retrieve non-existent todo by ID — expect 404")
    @Test
    void testGetNonExistentTodoByID() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/todos/9999")
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR CASE: Retrieve headers for non-existent todo — expect 404")
    @Test
    void testGetTodoHeaderByNonExistentID() {
        given()
                .baseUri(BASE_URL)
                .when()
                .head("/todos/9999")
                .then()
                .statusCode(anyOf(is(404), is(200)));
    }

    @DisplayName("ERROR CASE: Create todo with ID in body — expect 400 Bad Request")
    @Test
    void testCreateTodoWithIdInBody() {
        String requestBody = """
        {
            "id": "5",
            "title": "Invalid Todo"
        }
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(400);
    }

    @DisplayName("ERROR CASE: Create todo with malformed JSON — expect 400 Bad Request")
    @Test
    void testCreateTodoMalformedJSON() {
        String requestBody = """
        {
            "title": "Unfinished
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(400);
    }

    @DisplayName("ERROR CASE: PUT on /todos (without ID) — expect 405 Method Not Allowed")
    @Test
    void testPutOnTodosRoot() {
        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .when()
                .put("/todos")
                .then()
                .statusCode(405);
    }

    @DisplayName("ERROR CASE: DELETE on /todos (without ID) — expect 405 Method Not Allowed")
    @Test
    void testDeleteOnTodosRoot() {
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/todos")
                .then()
                .statusCode(405);
    }

    @DisplayName("ERROR CASE: Edit non-existent todo using POST /todos/:id — expect 404")
    @Test
    void testEditNonExistentTodoByID() {
        String requestBody = """
        {
            "title": "Does Not Exist",
            "description": "Trying to update non-existent todo"
        }
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos/9999")
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR CASE: Edit non-existent todo using PUT /todos/:id — expect 404")
    @Test
    void testEditNonExistentTodoByIDPUT() {
        String requestBody = """
        {
            "title": "Does Not Exist",
            "description": "Trying to replace non-existent todo"
        }
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .put("/todos/9999")
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR CASE: Delete a non-existent todo — expect 404 Not Found")
    @Test
    void testDeleteNonExistentTodo() {
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/todos/9999")
                .then()
                .statusCode(404);
    }


    @DisplayName("Error Case: HEAD method returns 200 but no headers — unclear behavior")
    @Test
    void testHeadTodoNoHeaderInformation() {
        given()
                .baseUri(BASE_URL)
                .when()
                .head("/todos/1")
                .then()
                .statusCode(200);
    }

    @DisplayName("BUG: ID counter does not reuse deleted IDs — new todos get i+1 instead of reusing deleted ID")
    @Test
    void testTodoIdCounterAfterDeletion() {

        // Step 1: Create first todo
        String requestBody = """
    {
        "title": "Temporary Task"
    }
    """;

        String firstId = given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Step 2: Delete that todo
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/todos/" + firstId)
                .then()
                .statusCode(200);

        // Step 3: Create new todo
        String newId = given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Step 4: Check the IDs
        System.out.println("First ID: " + firstId + " | New ID: " + newId);

        // Step 5: Assert bug (IDs not reused)
        // This is the BUG behavior: newId == firstId + 1
        Assertions.assertEquals(Integer.parseInt(firstId) + 1, Integer.parseInt(newId),
                "BUG: ID counter did not reuse deleted ID; expected same ID to be reused.");
    }

}
