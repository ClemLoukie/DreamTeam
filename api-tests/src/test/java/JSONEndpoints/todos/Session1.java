package JSONEndpoints.todos;

import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class Session1 {
    private static final String BASE_URL = "http://localhost:4567";

    @Test
    void testGetTodos() {
        given().
                baseUri(BASE_URL).
                when().
                get("/todos").
                then().
                statusCode(200).
                body("size()", greaterThan(0));
    }

}
