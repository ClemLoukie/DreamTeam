package examples;

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


}
