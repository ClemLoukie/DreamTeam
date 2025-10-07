package JSONEndpoints.todos;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestMethodOrder(MethodOrderer.Random.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
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
                .header("Content-Type", "application/json")
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
                .header("Content-Type", "application/json")
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
                .header("Content-Type", "application/json")
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
                .header("Content-Type", "application/json")
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

    // -------------------------------------------------------------------------
    // ERROR CASES
    // -------------------------------------------------------------------------

    @DisplayName("ERROR CASE: Create todo with ID in body returns 400")
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
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(400);
    }

    @DisplayName("ERROR CASE: PUT on /todos (without ID) returns 405")
    @Test
    void testPutOnTodosRoot() {
        given()
                .baseUri(BASE_URL)
                .when()
                .put("/todos")
                .then()
                .statusCode(405);
    }

    @DisplayName("ERROR CASE: DELETE on /todos (without ID) returns 405")
    @Test
    void testDeleteOnTodosRoot() {
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/todos")
                .then()
                .statusCode(405);
    }

    @DisplayName("ERROR CASE: Retrieve non-existent todo returns 404")
    @Test
    void testGetNonExistentTodo() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/todos/9999")
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR CASE: Malformed JSON payload - 400 Bad Request")
    @Test
    void testMalformedJSON() {
        String requestBody = """
            {
                "title": "Broken
            """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/todos")
                .then()
                .statusCode(400);
    }

    // -------------------------------------------------------------------------
    // BUG VALIDATION / EDGE CASES
    // -------------------------------------------------------------------------

    @DisplayName("BUG: Empty POST body returns 400 (expected) — validate behavior")
    @Test
    void testCreateTodoEmptyBody() {
        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .when()
                .post("/todos")
                .then()
                .statusCode(anyOf(is(400), is(500))); // accept either depending on API
    }

    @DisplayName("BUG: HEAD method returns 200 but no headers — unclear behavior")
    @Test
    void testHeadTodoNoHeaderInformation() {
        given()
                .baseUri(BASE_URL)
                .when()
                .head("/todos/1")
                .then()
                .statusCode(200);
    }








}
