package JSONEndpoints.projects;

import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

import java.io.*;
import java.lang.management.ManagementFactory;

import com.sun.management.OperatingSystemMXBean;
import oshi.SystemInfo;
import oshi.software.os.OSProcess;
import oshi.software.os.OperatingSystem;

import java.util.*;

public class ProjectEndpointPerformanceTests {

    private static final String BASE_URL = "http://localhost:4567";
    private Process serverProcess;

    private SystemInfo systemInfo;
    private OperatingSystem os;

    @BeforeAll
    static void setupOshi() {}

    @BeforeEach
    void startServer() throws IOException, InterruptedException {
        systemInfo = new SystemInfo();
        os = systemInfo.getOperatingSystem();

        String jarPath = System.getProperty("user.dir") + "/runTodoManagerRestAPI-1.5.5.jar";

        serverProcess = new ProcessBuilder("java", "-jar", jarPath)
                .inheritIO()
                .start();

        boolean ready = false;
        int retries = 0;

        while (!ready && retries < 40) {
            try {
                given().baseUri(BASE_URL).get("/projects").then().statusCode(200);
                ready = true;
            } catch (Exception e) {
                Thread.sleep(500);
                retries++;
            }
        }

        if (!ready) throw new RuntimeException("Server did not start in time.");
    }

    @AfterEach
    void stopServer() {
        try { given().baseUri(BASE_URL).get("/shutdown"); } catch (Exception ignored) {}

        if (serverProcess != null && serverProcess.isAlive()) {
            serverProcess.destroy();
        }
    }

    private double getProcessCpuPercent() throws InterruptedException {
        OperatingSystemMXBean bean =
                (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        double c1 = bean.getProcessCpuLoad();
        Thread.sleep(100);
        double c2 = bean.getProcessCpuLoad();
        Thread.sleep(100);
        double c3 = bean.getProcessCpuLoad();

        double avg = (c1 + c2 + c3) / 3.0;
        return avg * 100.0;
    }

    private long getProcessMemoryMB() {
        long pid = serverProcess.pid();
        OSProcess proc = os.getProcess((int) pid);
        long rss = proc.getResidentSetSize();
        return rss / (1024 * 1024);
    }

    @DisplayName("Performance: Projects – Real CPU%, Real RAM")
    @Test
    void performanceTestCategories() {

        int[] numObjects = {1, 5, 10, 50, 75, 100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000}; // always do 1 less
        int to_tamper = 1; // first added id starts at 2
        int current_number = 1;

        File csv = new File("ProjectPerformanceResults.csv");

        try (PrintWriter writer = new PrintWriter(new FileWriter(csv))) {
            writer.println("Objects,Create(ms),Edit(ms),Delete(ms),Create CPU(%),Edit CPU(%),Delete CPU(%),Create Memory(MB),Edit Memory(MB),Delete Memory(MB)");

            // Bodies
            String bodyCreate = """
                        { 
                           "title": "IceCream Man",
                           "description": ""
                        }
                        """;

            for (int n : numObjects) { // Create the N objects (Populate the system with N objects.)

                // ----- Create -----
                for (int i = 0; i < n - current_number; i++) { // start: n-1 as 1 entry already exists in database when we start it
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(bodyCreate)
                        .when()
                        .post("/projects")
                        .then()
                        .statusCode(201);

                }

            current_number = n;


            long sCreate = System.nanoTime();
            // ----- Create -----
            given()
                    .baseUri(BASE_URL)
                    .contentType("application/json")
                    .body(bodyCreate)
                    .when()
                    .post("/projects")
                    .then()
                    .statusCode(201);
            double tCreate = ((System.nanoTime() - sCreate) / 1_000_000.0);

            double cpuCreate = getProcessCpuPercent(); // TODO: Check method
            long memCreate = getProcessMemoryMB();

            // ----- Edit -----
            String bodyUpdate = """
                    {
                        "title": "Updated Project",
                        "description": "Updated during performance testing"
                    }
                    """;
            long sEdit = System.nanoTime();
            given()
                    .baseUri(BASE_URL)
                    .contentType("application/json")
                    .body(bodyUpdate)
                    .put("/projects/" + (to_tamper))// Always edit
                    .then()
                    .statusCode(anyOf(is(200), is(201)));
            double tEdit = ((System.nanoTime() - sEdit) / 1_000_000.0);
            double cpuEdit = getProcessCpuPercent();
            long memEdit = getProcessMemoryMB();

            // ----- Delete -----
            long sDelete = System.nanoTime();
            given()
                    .baseUri(BASE_URL)
                    .delete("/projects/" + (to_tamper))
                    .then()
                    .statusCode(is(200));
            double tDelete = ((System.nanoTime() - sDelete) / 1_000_000.0);
            double cpuDelete = getProcessCpuPercent();
            long memDelete = getProcessMemoryMB();

            writer.printf(Locale.US,
                    "%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%d,%d,%d%n",
                    n,
                    tCreate, tEdit, tDelete,
                    cpuCreate, cpuEdit, cpuDelete,
                    memCreate, memEdit, memDelete
            )
            ;

                to_tamper += 1;
                List<Object> projects =
                        given()
                                .baseUri(BASE_URL)
                                .get("/projects")
                                .jsonPath()
                                .getList("projects");

//                System.out.println("Number of project entries = " + projects.size());

            }


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
