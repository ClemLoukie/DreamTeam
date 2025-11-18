package JSONEndpoints.categories;

import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.management.*;
import java.util.*;

public class CategoryEndpointPerformanceTests {

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

    @DisplayName("Performance: Transaction time, CPU, and Memory for create, edit, delete (Categories)")
    @Test
    void performanceTestCUD_Categories() {

        int[] numOfObjects = {1, 2, 5, 10, 50, 100, 200, 500, 1000, 2000};
        int overall_id = 2;

        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        Runtime runtime = Runtime.getRuntime();

        File csvFile = new File("CategoryPerformanceResults.csv");

        try (PrintWriter writer = new PrintWriter(new FileWriter(csvFile))) {
            writer.println("Objects,Create(ms),Edit(ms),Delete(ms),CPU_Load,Free_Memory(MB)");

            for (int num : numOfObjects) {

                // Request bodies
                String requestBody = """
                        {
                            "title": "2025 Category",
                            "description": "Category created during performance testing"
                        }
                        """;

                String updatedBody = """
                        {
                            "title": "Updated Category",
                            "description": "Updated performance test category"
                        }
                        """;

                long startCreate = System.nanoTime();
                for (int i = 0; i < num; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(requestBody)
                        .when()
                        .post("/categories")
                        .then()
                        .statusCode(201);
                }
                double createTime = (System.nanoTime() - startCreate) / 1_000_000.0;

                long startEdit = System.nanoTime();
                for (int i = 0; i < num; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(updatedBody)
                        .when()
                        .put("/categories/" + (i + overall_id))
                        .then()
                        .statusCode(anyOf(is(200), is(201)))
                        .body("title", equalTo("Updated Category"));
                }
                double editTime = (System.nanoTime() - startEdit) / 1_000_000.0;

                long startDelete = System.nanoTime();
                for (int i = 0; i < num; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .when()
                        .delete("/categories/" + (i + overall_id))
                        .then()
                        .statusCode(is(200));
                }
                double deleteTime = (System.nanoTime() - startDelete) / 1_000_000.0;

                double cpuLoad = osBean.getSystemLoadAverage();
                long freeMemoryMB = runtime.freeMemory() / (1024 * 1024);

                writer.printf(Locale.US,
                        "%d,%.2f,%.2f,%.2f,%.2f,%d%n",
                        num, createTime, editTime, deleteTime, cpuLoad, freeMemoryMB);

                overall_id += num;
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
