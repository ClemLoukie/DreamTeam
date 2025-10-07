package JSONEndpoints.projects;

import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestMethodOrder(MethodOrderer.Random.class)
public class ProjectEndpointTests {

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

    @DisplayName("CAPABILITY: Get all projects when there is one project")
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

    @DisplayName("CAPABILITY: Retrieve headers for all projects")
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


    @DisplayName("BUG: Create project with no body still succeeds (returns default empty fields)")
    // create project without a ID using the field values in the body of the message
    // Undocumented capability
    @Test
    void testCreateProjectWithNoBody() {
        given().
                baseUri(BASE_URL).
                contentType("application/json").
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

    @DisplayName("BUG: When create project fails, the id still increments")
    @Test
    void testCreateFailedProjectsCausesIdIncrementation() {

        // Create a first entry to get baseline ID
        String id = given().
                baseUri(BASE_URL).
                contentType("application/json").
                when().
                post("/projects").
                then().
                statusCode(201).
                extract().
                path("id");;

        // fail at creating an entry

        String requestBody = """
        {
            "glurb": "1"
        }
    """;

        given().
                baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody).
                when().
                post("/projects").
                then().
                statusCode(400);

        //create new entry and assert id

        // Create a first entry to get baseline ID
        given().
                baseUri(BASE_URL).
                contentType("application/json").
                when().
                post("/projects").
                then().
                statusCode(201).
                body("id", equalTo(Integer.toString(Integer.parseInt(id)+2)));;
    }

    @DisplayName("CAPABILITY: Create project with valid JSON body")
    // create project without a ID using the field values in the body of the message
    // proof of concept: ensuring no side effects are introduced

    @Test
    void testCreateProjectWithBody() {

        // Obtain initial count of projects in database
        int initialCount =
                given()
                        .baseUri(BASE_URL)
                        .when()
                        .get("/projects")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("projects.size()");

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given().
                baseUri(BASE_URL).
                contentType("application/json").
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

        // Obtain final count of projects in database

        int finalCount =
                given()
                        .baseUri(BASE_URL)
                        .when()
                        .get("/projects")
                        .then()
                        .statusCode(200)
                        .extract()
                        .path("projects.size()");

        // Ensure value is correct
        Assertions.assertEquals(initialCount + 1, finalCount,
                "Project list size should STRICTLY increase by 1 after creation");

    }

    @DisplayName("ERROR CASE: Create project with id - error code 400")
    // create project without a ID using the field values in the body of the message
    @Test
    void testCreateProjectWithIdInBody() {
        String requestBody = """
        {
            "id":"5"
        }
    """;

        given().
                baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody).
                when().
                post("/projects").
                then().
                statusCode(400);

    }

    @DisplayName("ERROR CASE: PUT on /projects (without ID) not allowed — expect 405")
    @Test
    void testPutProject() {
        given().
                baseUri(BASE_URL).
                contentType("application/json").
                when().
                put("/projects").
                then().
                statusCode(405);

    }

    @DisplayName("ERROR CASE: DELETE on /projects (without ID) not allowed — expect 405")
    @Test
    void testDeleteProject() {
        given().
                baseUri(BASE_URL).
                contentType("application/json").
                when().
                delete("/projects").
                then().
                statusCode(405);

    }

    @DisplayName("CAPABILITY: Retrieve header for a project by id")
    // return all project headers
    @Test
    void testGetProjectHeaderById() {
        given().
                baseUri(BASE_URL).
                when().
                head("/projects/1").
                then().
                statusCode(200)
                .header("Content-Type", equalTo("application/json"))
                .header("Transfer-Encoding", equalTo("chunked"));
    }

    @DisplayName("BUG: Retrieve header for a project by non existent id returns 200")
    // return all project headers
    @Test
    void testGetProjectHeaderByNonExsitentId() {
        given().
                baseUri(BASE_URL).
                when().
                head("/projects/1").
                then().
                statusCode(200);
    }


    @DisplayName("CAPABILITY: Retrieve existing project by ID (GET /projects/:id)")
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

    @DisplayName("ERROR CASE: Retrieve non-existent project by ID returns 404")
    @Test
    void getNonExistentProjectByID() {

        given()
                .baseUri(BASE_URL)
                .when()
                .get("/projects/" + 100)
                .then()
                .statusCode(404);
    }

    @DisplayName("CAPABILITY: Edit existing project using POST /projects/:id")
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
                contentType("application/json").
                body(requestBody).
                when()
                .post("/projects/" + 1)
                .then()
                .statusCode(200).
                body("title", equalTo("School")).
                body("description", equalTo("Meeting for 429 group"));
    }

    @DisplayName("BUG: Edit project with empty JSON body still returns 200 instead of error")
    @Test
    void editExistentProjectByIDNoBody() {

        String requestBody = """
        {
        }
    """;

        given()
                .baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody)
                .when()
                .post("/projects/" + 1)
                .then()
                .statusCode(200);
    }

    @DisplayName("ERROR CASE: Edit non existent project using POST /projects/:id")
    @Test
    void editNonExistentProjectByID() {

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given()
                .baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody).
                when()
                .post("/projects/" + 500)
                .then()
                .statusCode(404);
    }

    @DisplayName("CAPABILITY: Edit existing project using PUT /projects/:id")
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
                .contentType("application/json")
                .body(requestBody)
                .when()
                .put("/projects/" + 1)
                .then()
                .statusCode(200).
                body("title", equalTo("School")).
                body("description", equalTo("Meeting for 429 group"));
    }

    @DisplayName("BUG: Edit existing project using PUT with empty json body still returns 200 instead of error")
    @Test
    void editExistentProjectByIDPUTNoData() {

        String requestBody = """
        {
        }
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .put("/projects/" + 1)
                .then()
                .statusCode(200);
    }

    @DisplayName("ERROR CASE: Edit non existent project using PUT /projects/:id")
    @Test
    void editNonExistentProjectByIDPUT() {

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group"
        }
    """;

        given()
                .baseUri(BASE_URL)
                .contentType("application/json")
                .body(requestBody)
                .when()
                .put("/projects/" + 500)
                .then()
                .statusCode(404);
    }

    @DisplayName("CAPABILITY: Delete existing project and confirm it no longer exists")
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

    @DisplayName("ERROR CASE: Delete a non existent project - 404 not found")
    @Test
    void deleteProjectTwice() {

        // Delete
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/projects/" + 1) // testing deleting the original entry
                .then()
                .statusCode(is(200));

        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/projects/" + 1)
                .then()
                .statusCode(is(404));
    }

    @DisplayName("ERROR CASE: JSON payload is malformed - 400 Bad Request")
    @Test
    void testCreateProjectWithMalformedJSON() {
        String requestBody = """
                    {
                        "title": "School",
                        "description": "Meeting for 429 group"
                    
                """;


        given().
                baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody).
                when().
                post("/projects").
                then().
                statusCode(400);

    }

    @DisplayName("ERROR CASE: XML payload is malformed - 400 Bad Request")
    @Test
    void testCreateProjectWithMalformedXML() {
        String requestBody = """
                    <title>hello<title>
                """;


        given().
                baseUri(BASE_URL).
                header("Content-Type", "application/xml").
                body(requestBody).
                when().
                post("/projects").
                then().
                statusCode(400);

    }

    @DisplayName("CAPABILITY: Command-line style query ?title")
    @Test
    void testConfirmCommandLineCompound() {

        String requestBody = """
        {
            "title": "School",
            "description": "Meeting for 429 group",
            "completed": false
        }
    """;

        given().
                baseUri(BASE_URL).
                contentType("application/json").
                body(requestBody).
                when().
                post("/projects");

        given().
                baseUri(BASE_URL).
                when().
                get("/projects?title=School").
                then().
                statusCode(200).body("projects.title", everyItem(equalTo("School")));

    }


}
