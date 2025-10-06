package JSONEndpoints.projects;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ProjectEndpointTest {

    private static final String BASE_URL = "http://localhost:4567";
    private Process serverProcess;

    @BeforeEach
    void startServer() throws IOException, InterruptedException {
        String jarPath = System.getProperty("user.dir") + "/runTodoManagerRestAPI-1.5.5.jar";
        serverProcess = new ProcessBuilder("java", "-jar", jarPath)
                .inheritIO()
                .start();

        boolean serverReady = false;
        int retries = 0;
        while (!serverReady && retries < 30) {
            try {
                given().baseUri(BASE_URL).get("/projects").then().statusCode(200);
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

    // return all the instances of project
    @Test
    void testGetProjectsWithInitialConditionOfOneProject() {
        given().
                baseUri(BASE_URL).
                when().
                get("/projects").
                then().statusCode(200).
                body("size()", equalTo(1));
    }

    // return all project headers
    @Test
    void testGetProjectHeaders() {
        given().
                baseUri(BASE_URL).
                when().
                head("/projects").
                then().
                statusCode(200)
                .header("Content-Type", equalTo("application/json"))
                .header("Transfer-Encoding", equalTo("chunked"));
    }


    // create project without a ID using the field values in the body of the message
    // Undocumented capability
    @Test
    void testCreateProjectWithNoBody() {
        given().
                baseUri(BASE_URL).
                header("Content-Type", "application/json").
                when().
                post("/projects").
                then().
                statusCode(201).
                body("title", equalTo("")).
                body("description", equalTo("")).
                body("completed", equalTo("false")).
                body("active", equalTo("false")).
                body("id" , equalTo("2"));

    }

    // create project without a ID using the field values in the body of the message
    @Test
    void testCreateProjectWithBody() {
        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given().
                baseUri(BASE_URL).
                header("Content-Type", "application/json").
                body(requestBody).
                when().
                post("/projects").
                then().
                statusCode(201).
                body("title", equalTo("School")).
                body("description", equalTo("Meeting for 429 group")).
                body("completed", equalTo("false")).
                body("active", equalTo("false")).
                body("id" , equalTo("2"));

    }

    @Test
    void testPutProject() {
        given().
                baseUri(BASE_URL).
                header("Content-Type", "application/json").
                when().
                put("/projects").
                then().
                statusCode(405);

    }

    @Test
    void testDeleteProject() {
        given().
                baseUri(BASE_URL).
                header("Content-Type", "application/json").
                when().
                delete("/projects").
                then().
                statusCode(405);

    }


    // return a specific instances of project using a id
    @Test
    void getExistentProjectByID() {

        given()
                .baseUri(BASE_URL)
                .when()
                .get("/projects/" + 1)
                .then()
                .statusCode(200);
    }

    //
    @Test
    void getNonExistentProjectByID() {

        given()
                .baseUri(BASE_URL)
                .when()
                .get("/projects/" + 100)
                .then()
                .statusCode(404);
    }

    @Test
    void editExistentProjectByID() {

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given()
                .baseUri(BASE_URL).
                header("Content-Type", "application/json").
                body(requestBody).
                when()
                .post("/projects/" + 1)
                .then()
                .statusCode(200).
                body("title", equalTo("School")).
                body("description", equalTo("Meeting for 429 group"));
    }

    @Test
    void editExistentProjectByIDNoBody() {

        String requestBody = """
        {
        }
    """;

        given()
                .baseUri(BASE_URL).
                header("Content-Type", "application/json").
                body(requestBody)
                .when()
                .post("/projects/" + 1)
                .then()
                .statusCode(200);
    }

    @Test
    void editExistentProjectByIDPUT() {

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .put("/projects/" + 1)
                .then()
                .statusCode(200).
                body("title", equalTo("School")).
                body("description", equalTo("Meeting for 429 group"));
    }

    // delete a specific instances of project using a id
    @Test
    void deleteProject() {

        // Delete
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/projects/" + 1) // testing deleting the original entry
                .then()
                .statusCode(is(200));

        // Is project gone?
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/projects/" + 1)
                .then()
                .statusCode(404);
    }


}
