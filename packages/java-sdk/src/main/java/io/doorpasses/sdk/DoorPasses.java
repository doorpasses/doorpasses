package io.doorpasses.sdk;

import io.doorpasses.sdk.http.HttpClient;
import io.doorpasses.sdk.resources.AccessPasses;
import io.doorpasses.sdk.resources.Console;

import java.io.IOException;

/**
 * Main DoorPasses SDK client.
 * <p>
 * Example usage:
 * <pre>{@code
 * String accountId = System.getenv("DOORPASSES_ACCOUNT_ID");
 * String sharedSecret = System.getenv("DOORPASSES_SHARED_SECRET");
 *
 * DoorPasses client = new DoorPasses(accountId, sharedSecret);
 *
 * // Issue an access pass
 * IssueAccessPassParams params = new IssueAccessPassParams(
 *     "template_123",
 *     "12345",
 *     "John Doe",
 *     "2025-11-01T00:00:00Z",
 *     "2026-11-01T00:00:00Z"
 * );
 * params.setEmail("john@example.com");
 *
 * AccessPass accessPass = client.accessPasses.issue(params);
 * System.out.println("Access pass URL: " + accessPass.getUrl());
 * }</pre>
 */
public class DoorPasses {
    private static final String DEFAULT_BASE_URL = "https://api.doorpasses.io";
    private static final long DEFAULT_TIMEOUT = 30000; // 30 seconds

    private final HttpClient http;

    /**
     * Access passes resource for managing access passes.
     */
    public final AccessPasses accessPasses;

    /**
     * Console resource for managing card templates (Enterprise only).
     */
    public final Console console;

    /**
     * Creates a new DoorPasses client instance with default configuration.
     *
     * @param accountId Your DoorPasses account ID (X-ACCT-ID)
     * @param sharedSecret Your DoorPasses shared secret for signing requests
     * @throws IllegalArgumentException if accountId or sharedSecret is null or empty
     */
    public DoorPasses(String accountId, String sharedSecret) {
        this(accountId, sharedSecret, DEFAULT_BASE_URL, DEFAULT_TIMEOUT);
    }

    /**
     * Creates a new DoorPasses client instance with custom configuration.
     *
     * @param accountId Your DoorPasses account ID (X-ACCT-ID)
     * @param sharedSecret Your DoorPasses shared secret for signing requests
     * @param baseUrl Base URL for the DoorPasses API
     * @param timeout Request timeout in milliseconds
     * @throws IllegalArgumentException if accountId or sharedSecret is null or empty
     */
    public DoorPasses(String accountId, String sharedSecret, String baseUrl, long timeout) {
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new IllegalArgumentException("accountId is required");
        }
        if (sharedSecret == null || sharedSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("sharedSecret is required");
        }

        this.http = new HttpClient(accountId, sharedSecret, baseUrl, timeout);
        this.accessPasses = new AccessPasses(this.http);
        this.console = new Console(this.http);
    }

    /**
     * Health check to verify API connectivity.
     *
     * @return Health status information
     * @throws IOException if the request fails
     */
    public Object health() throws IOException {
        return this.http.get("/health", null, Object.class);
    }
}
