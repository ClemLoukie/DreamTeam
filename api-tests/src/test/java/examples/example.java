package mytests;

import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class example {

    private static final String BASE_URL = "http://localhost:4567";

    @Test
    void testGetTodos() {
        given().
                baseUri(BASE_URL).
                when().
                get("/todos").
                then().
                statusCode(200).              // ✅ Expect HTTP 200 OK
                body("size()", greaterThan(0)); // ✅ Expect at least 1 todo from startup data
    }

    @Test
    void testCreateTodo() {
        String newTodo = "{ \"title\": \"JUnit Test Todo\", \"doneStatus\": \"false\", \"description\": \"created from test\" }";

        given().
                baseUri(BASE_URL).
                contentType("application/json").
                body(newTodo).
                when().
                post("/todos").
                then().
                statusCode(201).                   // ✅ Expect created
                body("title", equalTo("JUnit Test Todo")); // ✅ Echo back
    }
}
