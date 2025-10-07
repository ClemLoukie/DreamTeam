package JSONEndpoints.categories;

import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestMethodOrder(MethodOrderer.Random.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class CategoryEndpointTests {
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
                given().baseUri(BASE_URL).get("/categories").then().statusCode(200);
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

    @DisplayName("CAPABILITY: Retrieve headers for all categories")
    // return all "categories" headers
    @Test
    void testGetCategoryHeaders() {
        given().
                baseUri(BASE_URL).
                when().
                head("/categories").
                then().
                statusCode(200)
                .header("Content-Type", equalTo("application/json"))
                .header("Transfer-Encoding", equalTo("chunked"));
    }

    @DisplayName("CAPABILITY: Retrieve body for all categories")
    // return starter categories
    @Test
    void testGetCategories() {
        given().
                baseUri(BASE_URL).
                when().
                get("/categories").
                then().
                statusCode(200)
                .body("size()", equalTo(1));
    }



    @DisplayName("CAPABILITY: POST to categories")
    // make a new category with post
    @Test
    void testPOSTCategories() {
        String requestBody = """
        {
            "title": "r sint occaecat cupi",
            "description": "ur sint occaecat cup"
        }
    """;
        given().
                baseUri(BASE_URL).
                when().
                body(requestBody).
                when().
                post("/categories").
                then().
                statusCode(201).
		body("title", equalTo("r sint occaecat cupi")).
		body("description", equalTo("ur sint occaecat cup"));
    }

    @DisplayName("ERROR: POST with invalid data")
    // make a new category with post
    @Test
    void testPOSTCategoriesBAD() {
        String requestBody = """
        {
            "id" : "1"
            "title": "r sint occaecat cupi",
            "description": "ur sint occaecat cup"
        }
    """;
        given().
                baseUri(BASE_URL).
                when().
                body(requestBody).
                when().
                post("/categories").
                then().
                statusCode(400);
    }

	@DisplayName("CAPABILITY: Retrieve existing category by ID")
    	@Test
    	void testGetCategoryByID() {
        	given()
                .baseUri(BASE_URL)
                .when()
                .get("/categories/1")
                .then()
                .statusCode(200);
    }

    @DisplayName("ERROR: Retrieve existing category from bad ID")
    @Test
    void testGetCategoryByIDBAD() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/categories/0")
                .then()
                .statusCode(404);
    }

    @DisplayName("Capability: get header data from an id")
    @Test
    void testGetCategoryHeadersID() {
        given().
                baseUri(BASE_URL).
                when().
                head("/categories/1").
                then().
                statusCode(200);
    }

    @DisplayName("BUG: when using head on invalid id still returns")
    @Test
    void testGetCategoryHeadersBug() {
        given().
                baseUri(BASE_URL).
                when().
                head("/categories/0").
                then().
                statusCode(200);
    }


	
    @DisplayName("CAPABILITY: Edit existing category using POST /categories/:id")
    @Test
    void testEditCategoryByID() {
        String requestBody = """
        {
            "title": "Updated",
            "description": "Updated"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/categories/1")
                .then()
                .statusCode(200)
                .body("title", equalTo("Updated"))
                .body("description", equalTo("Updated"));
    }

    @DisplayName("ERROR: Edit invalid category using POST /categories/:id")
    @Test
    void testEditCategoryByIDBAD() {
        String requestBody = """
        {
            "title": "Updated",
            "description": "Updated"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/categories/0")
                .then()
                .statusCode(404);
    }

    @DisplayName("CAPABILITY: Edit existing category using PUT /categories/:id")
    @Test
    void testEditCategoryByIDPUT() {
        String requestBody = """
        {
            "title": "Updated PUT",
            "description": "Updated PUT"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .put("/categories/1")
                .then()
                .statusCode(200)
                .body("title", equalTo("Updated PUT"))
                .body("description", equalTo("Updated PUT"));
    }

    DisplayName("ERROR: Edit invalid category using PUT /categories/:id")
    @Test
    void testEditCategoryByIDPUTBAD() {
        String requestBody = """
        {
            "title": "Updated PUT",
            "description": "Updated PUT"
        }
        """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .put("/categories/0")
                .then()
                .statusCode(404);
    }


    @DisplayName("CAPABILITY: Delete existing category and confirm it no longer exists")
    @Test
    void testDeleteTodo() {
        // Create a temporary category
        String requestBody = """
        {
            "title": "To die"
        }
        """;
        String id = given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Delete and confirm
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/categories/" + id)
                .then()
                .statusCode(200);

        given()
                .baseUri(BASE_URL)
                .when()
                .get("/categories/" + id)
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR: double delete")
    @Test
    void testDeleteTodoBAD() {
        // Create a temporary category
        String requestBody = """
        {
            "title": "To die"
        }
        """;
        String id = given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/categories")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Delete and confirm
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/categories/" + id)
                .then()
                .statusCode(200);

        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/categories/" + id)
                .then()
                .statusCode(404);
    }

    @DisplayName("ERROR CASE: DELETE on /categories (without ID) returns 405")
    @Test
    void testDeleteOnCategoriesRoot() {
        given()
                .baseUri(BASE_URL)
                .when()
                .delete("/categories")
                .then()
                .statusCode(405);
    }

    @DisplayName("ERROR CASE: Retrieve non-existent object returns 404")
    @Test
    void testGetNonCategoryTodo() {
        given()
                .baseUri(BASE_URL)
                .when()
                .get("/categories/0")
                .then()
                .statusCode(404);
    }
    @DisplayName("ERROR CASE: invalid syntax JSON payload - 400 Bad Request")
    @Test
    void testInvalidSyntaxJSON() {
        String requestBody = """
            {
                "title ": "Bad data
            """;

        given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post("/categoriess")
                .then()
                .statusCode(400);
    }









}
