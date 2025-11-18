package JSONEndpoints.categories;

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

public class CategoryEndpointPerformanceTests {

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
                given().baseUri(BASE_URL).get("/categories").then().statusCode(200);
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

    @DisplayName("Performance: Categories – Real CPU%, Real RAM")
    @Test
    void performanceTestCategories() {

        int[] numObjects = {1, 2, 5, 10, 50, 100, 200, 500, 1000, 2000};
        int offset = 2;

        File csv = new File("CategoryPerformanceResults.csv");

        try (PrintWriter writer = new PrintWriter(new FileWriter(csv))) {
            writer.println("Objects,Create(ms),Edit(ms),Delete(ms),CPU(%),Memory(MB)");

            for (int n : numObjects) {

                // Bodies
                String bodyCreate = """
                        {
                            "title": "Perf Category",
                            "description": "Load test category"
                        }
                        """;

                String bodyUpdate = """
                        {
                            "title": "Updated Category",
                            "description": "Updated during performance testing"
                        }
                        """;

                // ----- Create -----
                long sCreate = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(bodyCreate)
                        .post("/categories")
                        .then()
                        .statusCode(201);
                }
                double tCreate = (System.nanoTime() - sCreate) / 1_000_000.0;


                // ----- Edit -----
                long sEdit = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .contentType("application/json")
                        .body(bodyUpdate)
                        .put("/categories/" + (i + offset))
                        .then()
                        .statusCode(anyOf(is(200), is(201)));
                }
                double tEdit = (System.nanoTime() - sEdit) / 1_000_000.0;


                // ----- Delete -----
                long sDelete = System.nanoTime();
                for (int i = 0; i < n; i++) {
                    given()
                        .baseUri(BASE_URL)
                        .delete("/categories/" + (i + offset))
                        .then()
                        .statusCode(is(200));
                }
                double tDelete = (System.nanoTime() - sDelete) / 1_000_000.0;


                // ----- REAL CPU & RAM -----
                double cpu = getProcessCpuPercent();
                long mem = getProcessMemoryMB();


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
