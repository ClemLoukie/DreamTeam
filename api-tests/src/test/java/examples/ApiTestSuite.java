package mytests;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ApiTestSuite {

    private static final String BASE_URL = "http://localhost:4567"; // adjust port if needed

    @Test
    void additionWorks() {
        int sum = 2 + 3;
        assertEquals(5, sum, "2 + 3 should equal 5");
    }

    @Test
    void stringNotEmpty() {
        String s = "Hello";
        assertFalse(s.isEmpty(), "String should not be empty");
    }
}
