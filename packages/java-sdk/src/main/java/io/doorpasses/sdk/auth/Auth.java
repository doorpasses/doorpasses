package io.doorpasses.sdk.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Authentication utilities for the DoorPasses API.
 * <p>
 * Handles payload encoding and signature generation using SHA-256.
 */
public class Auth {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Encodes a payload to base64.
     *
     * @param payload The payload to encode
     * @return Base64 encoded payload
     */
    public static String encodePayload(Object payload) {
        try {
            String jsonString = objectMapper.writeValueAsString(payload);
            return Base64.getEncoder().encodeToString(jsonString.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to encode payload", e);
        }
    }

    /**
     * Creates a signature for a payload using the shared secret.
     * <p>
     * Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()
     *
     * @param sharedSecret The shared secret
     * @param encodedPayload The base64 encoded payload
     * @return Hex digest of the signature
     */
    public static String createSignature(String sharedSecret, String encodedPayload) {
        try {
            String message = sharedSecret + encodedPayload;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(message.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verifies a signature matches the expected value.
     *
     * @param sharedSecret The shared secret
     * @param encodedPayload The base64 encoded payload
     * @param signature The signature to verify
     * @return true if the signature is valid
     */
    public static boolean verifySignature(String sharedSecret, String encodedPayload, String signature) {
        String expectedSignature = createSignature(sharedSecret, encodedPayload);
        return expectedSignature.equals(signature);
    }

    /**
     * Creates authentication headers for API requests.
     *
     * @param accountId The account ID
     * @param sharedSecret The shared secret
     * @param payload The request payload (can be null)
     * @return Map of authentication headers
     */
    public static Map<String, String> createAuthHeaders(String accountId, String sharedSecret, Object payload) {
        String encodedPayload;

        if (payload != null) {
            encodedPayload = encodePayload(payload);
        } else {
            // Default payload when no body is provided
            Map<String, String> defaultPayload = new HashMap<>();
            defaultPayload.put("id", "0");
            encodedPayload = encodePayload(defaultPayload);
        }

        String signature = createSignature(sharedSecret, encodedPayload);

        Map<String, String> headers = new HashMap<>();
        headers.put("X-ACCT-ID", accountId);
        headers.put("X-PAYLOAD-SIG", signature);
        headers.put("Content-Type", "application/json");

        return headers;
    }

    /**
     * Creates authentication headers for GET requests.
     *
     * @param accountId The account ID
     * @param sharedSecret The shared secret
     * @param sigPayload Optional signature payload
     * @return AuthHeadersResult containing headers and encoded payload
     */
    public static AuthHeadersResult createGetAuthHeaders(String accountId, String sharedSecret, Map<String, Object> sigPayload) {
        Map<String, Object> payload = sigPayload != null ? sigPayload : new HashMap<>();
        if (payload.isEmpty()) {
            payload.put("id", "0");
        }

        String encodedPayload = encodePayload(payload);
        String signature = createSignature(sharedSecret, encodedPayload);

        Map<String, String> headers = new HashMap<>();
        headers.put("X-ACCT-ID", accountId);
        headers.put("X-PAYLOAD-SIG", signature);
        headers.put("Content-Type", "application/json");

        return new AuthHeadersResult(headers, encodedPayload);
    }

    /**
     * Converts byte array to hex string.
     *
     * @param bytes Byte array
     * @return Hex string
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Result class for authentication headers.
     */
    public static class AuthHeadersResult {
        private final Map<String, String> headers;
        private final String sigPayload;

        public AuthHeadersResult(Map<String, String> headers, String sigPayload) {
            this.headers = headers;
            this.sigPayload = sigPayload;
        }

        public Map<String, String> getHeaders() {
            return headers;
        }

        public String getSigPayload() {
            return sigPayload;
        }
    }
}
