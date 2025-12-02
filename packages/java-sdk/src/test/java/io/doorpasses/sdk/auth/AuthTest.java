package io.doorpasses.sdk.auth;

import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Auth utilities.
 */
public class AuthTest {

    @Test
    public void testEncodePayload() {
        Map<String, String> payload = new HashMap<>();
        payload.put("id", "test");

        String encoded = Auth.encodePayload(payload);
        assertNotNull(encoded);
        assertFalse(encoded.isEmpty());
    }

    @Test
    public void testCreateSignature() {
        String sharedSecret = "test-secret";
        String encodedPayload = "dGVzdA==";

        String signature = Auth.createSignature(sharedSecret, encodedPayload);
        assertNotNull(signature);
        assertEquals(64, signature.length()); // SHA-256 produces 64 hex characters
    }

    @Test
    public void testVerifySignature() {
        String sharedSecret = "test-secret";
        String encodedPayload = "dGVzdA==";

        String signature = Auth.createSignature(sharedSecret, encodedPayload);
        assertTrue(Auth.verifySignature(sharedSecret, encodedPayload, signature));
        assertFalse(Auth.verifySignature(sharedSecret, encodedPayload, "invalid-signature"));
    }

    @Test
    public void testCreateAuthHeaders() {
        Map<String, String> headers = Auth.createAuthHeaders("account-id", "shared-secret", null);

        assertNotNull(headers);
        assertTrue(headers.containsKey("X-ACCT-ID"));
        assertTrue(headers.containsKey("X-PAYLOAD-SIG"));
        assertTrue(headers.containsKey("Content-Type"));
        assertEquals("account-id", headers.get("X-ACCT-ID"));
        assertEquals("application/json", headers.get("Content-Type"));
    }

    @Test
    public void testCreateGetAuthHeaders() {
        Auth.AuthHeadersResult result = Auth.createGetAuthHeaders("account-id", "shared-secret", null);

        assertNotNull(result);
        assertNotNull(result.getHeaders());
        assertNotNull(result.getSigPayload());
        assertTrue(result.getHeaders().containsKey("X-ACCT-ID"));
        assertTrue(result.getHeaders().containsKey("X-PAYLOAD-SIG"));
    }
}
