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

    @BeforeAll
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

    @AfterAll
    void stopServer() {
        try {
            given().baseUri(BASE_URL).get("/shutdown");
        } catch (Exception ignored) {}
        if (serverProcess != null && serverProcess.isAlive()) {
            serverProcess.destroy();
        }
    }

    // We do not reset the database as we want to test the same exploratory conditions as
    // the exploratory testing
    @Test
    @Order(1)
    void testGetProjectsWithInitialConditionOfOneProject() {
        given().
                baseUri(BASE_URL).
                when().
                get("/projects").
                then().statusCode(200).
                body("size()", equalTo(1));
    }

    @Test
    @Order(2)
    void testCreateProjectWithTitle() {
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
                body("active", equalTo("false"));
                //body("id", equalTo("2")); // because there is only 1 entry
    }

    @Test
    @Order(3)
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
                body("active", equalTo("false"));
                //body("id", equalTo("3")); // because there is only 1 entry
    }

    @Test
    void deleteProjectActualBehaviour() {
//        Response createResponse = given().
//                baseUri(BASE_URL).
//                when().
//                get("/projects").
//                then().statusCode(200).extract().response();
//
//        given().
//                baseUri(BASE_URL).
//                header("Content-Type", "application/json").
//                when().
//                delete("/projects/:id").
//                then().
//                statusCode(200).
//                body("title", equalTo("")).
//                body("description", equalTo("")).
//                body("completed", equalTo("false")).
//                body("active", equalTo("false")).
//                body("id", equalTo("3")); // because there is only 1 entry
//
//        given().
//                baseUri(BASE_URL).
//                when().
//                get("/projects").
//                then().
//                // API should return 404 Not Found for a deleted resource
//                        statusCode(404);
    }

    @Test
    void testGetProjectsWhenNone() {

    }

}
