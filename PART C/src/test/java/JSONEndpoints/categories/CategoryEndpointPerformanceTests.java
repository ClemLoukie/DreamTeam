package JSONEndpoints.categories;

import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import java.io.IOException;

@TestMethodOrder(MethodOrderer.Random.class)
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

    @DisplayName("Performance: Category transaction time, CPU, and Memory for create, edit, delete")
    @Test
    void performanceTestCUD() {
        int[] numOfObjects = {1, 2, 5, 10, 50, 75, 100, 1000, 2000, 3000}; // ,2000,3000,4000,5000,6000,7000,8000,9000,10000
        List<String> results = new ArrayList<>();
        int overall_id = 2;

        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        Runtime runtime = Runtime.getRuntime();

        File csvFile = new File("CategoryPerformanceResults.csv");
        try (PrintWriter writer = new PrintWriter(new FileWriter(csvFile))) {
            writer.println("Objects,Create(ms),Edit(ms),Delete(ms),CPU_Load,Free_Memory(MB)");

            for (int num : numOfObjects) {

                int i = 0;
                String requestBody = """
                        {
                            "title": "test category",
                            "description": "this is a description"
                        }
                        """; // We will not edit the requestBody per use

                long startCreate = System.nanoTime();
                // Create (post)
                for (i = 0; i < num; i++) {

                    String id = given().
                            baseUri(BASE_URL).
                            contentType("application/json").
                            body(requestBody).
                            when().
                            post("/categories").
                            then().
                            statusCode(201).
                            extract().
                            path("id");

                }
                double createTime = (System.nanoTime() - startCreate) / 1000000.0;

                long startEdit = System.nanoTime();


                // Edit (put)
                for (i = 0; i < num; i++) {
                    given()
                            .baseUri(BASE_URL).
                            contentType("application/json").
                            body(requestBody).
                            when()
                            .put("/categories/" + (i + overall_id))
                            .then()
                            .statusCode(200).
                            body("title", equalTo("test category")).
                            body("description", equalTo("this is a description"));
                }

                double editTime = (System.nanoTime() - startEdit) / 1000000.0;

                long startDelete = System.nanoTime();

                // Delete
                for (i = 0; i < num; i++) {

                    given()
                            .baseUri(BASE_URL)
                            .when()
                            .delete("/categories/" + (i + overall_id)) // testing deleting the original entry
                            .then()
                            .statusCode(is(200));
                    // We do not need to check the object has been deleted as we dd this during unit testing PART A
                }
                double deleteTime = (System.nanoTime() - startDelete) / 1000000.0;

                double cpuLoad = osBean.getSystemLoadAverage(); // may return -1 on Windows
                long freeMemoryMB = runtime.freeMemory() / (1024 * 1024);

                // Save results
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
