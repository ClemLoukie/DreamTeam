package JSONEndpoints.todos;

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

public class TodoEndpointPerformanceTests {

    private static final String BASE_URL = "http://localhost:4567";
    private Process serverProcess;

    private SystemInfo systemInfo;
    private OperatingSystem os;

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
                given().baseUri(BASE_URL).get("/todos").then().statusCode(200);
                ready = true;
            } catch (Exception e) {
                Thread.sleep(500);
                retries++;
            }
        }

        if (!ready)
            throw new RuntimeException("Server did not start in time.");
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
        long rss = proc.getResidentSetSize();      // REAL RAM usage
        return rss / (1024 * 1024);
    }

    @DisplayName("Performance: Todos – Real CPU%, Real Memory")
    @Test
    void performanceTestTodos() {

        int[] numObjects = {1, 2, 5, 10, 50, 100, 200, 500, 1000, 2000};
        int offset = 2;

        File csv = new File("TodoPerformanceResults.csv");

        try (PrintWriter writer = new PrintWriter(new FileWriter(csv))) {
            writer.println("Objects,Create(ms),Edit(ms),Delete(ms),CPU(%),Memory(MB)");

            for (int n : numObjects) {

                // Request bodies
                String bodyCreate = """
                        {
                            "title": "Perf Todo",
                            "doneStatus": false,
                            "description": "Load test todo"
                        }
                        """;

                String bodyUpdate = """
                        {
                            "title": "Updated Todo",
                            "doneStatus": true,
                            "description": "Updated during performance test"
                        }
                        """;

                // ----- CREATE -----
                long sCreate = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(bodyCreate)
                        .post("/todos")
                        .then()
                        .statusCode(201);
                }
                double tCreate = (System.nanoTime() - sCreate) / 1_000_000.0;


                // ----- EDIT -----
                long sEdit = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(bodyUpdate)
                        .put("/todos/" + (i + offset))
                        .then()
                        .statusCode(anyOf(is(200), is(201)));
                }
                double tEdit = (System.nanoTime() - sEdit) / 1_000_000.0;


                // ----- DELETE -----
                long sDelete = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .delete("/todos/" + (i + offset))
                        .then()
                        .statusCode(is(200));
                }
                double tDelete = (System.nanoTime() - sDelete) / 1_000_000.0;


                // ----- REAL CPU & RAM -----
                double cpu = getProcessCpuPercent();
                long mem = getProcessMemoryMB();

                // Write CSV row
                writer.printf(Locale.US,
                        "%d,%.2f,%.2f,%.2f,%.2f,%d%n",
                        n, tCreate, tEdit, tDelete, cpu, mem);

                offset += n;
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
