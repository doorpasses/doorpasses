<?php

namespace DoorPasses;

/**
 * Authentication utilities for DoorPasses API
 */
class Auth
{
    /**
     * Encodes a payload to base64
     *
     * @param array|object $payload The payload to encode
     * @return string Base64 encoded payload
     */
    public static function encodePayload($payload): string
    {
        $jsonString = json_encode($payload);
        return base64_encode($jsonString);
    }

    /**
     * Creates a signature for a payload using the shared secret
     * Following the DoorPasses-style authentication:
     * SHA256(shared_secret + base64_encoded_payload).hexdigest()
     *
     * @param string $sharedSecret The shared secret
     * @param string $encodedPayload Base64 encoded payload
     * @return string The signature hash
     */
    public static function createSignature(string $sharedSecret, string $encodedPayload): string
    {
        $message = $sharedSecret . $encodedPayload;
        return hash('sha256', $message);
    }

    /**
     * Verifies a signature matches the expected value
     *
     * @param string $sharedSecret The shared secret
     * @param string $encodedPayload Base64 encoded payload
     * @param string $signature The signature to verify
     * @return bool True if signature is valid
     */
    public static function verifySignature(string $sharedSecret, string $encodedPayload, string $signature): bool
    {
        $expectedSignature = self::createSignature($sharedSecret, $encodedPayload);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Creates authentication headers for API requests
     *
     * @param string $accountId The account ID
     * @param string $sharedSecret The shared secret
     * @param array|null $payload The request payload
     * @return array The authentication headers
     */
    public static function createAuthHeaders(string $accountId, string $sharedSecret, ?array $payload = null): array
    {
        if (!empty($payload)) {
            $encodedPayload = self::encodePayload($payload);
        } else {
            // Default payload when no body is provided
            $encodedPayload = self::encodePayload(['id' => '0']);
        }

        $signature = self::createSignature($sharedSecret, $encodedPayload);

        return [
            'X-ACCT-ID' => $accountId,
            'X-PAYLOAD-SIG' => $signature,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Creates authentication headers for GET requests
     *
     * @param string $accountId The account ID
     * @param string $sharedSecret The shared secret
     * @param array|null $sigPayload The signature payload
     * @return array Array with 'headers' and 'sigPayload' keys
     */
    public static function createGetAuthHeaders(string $accountId, string $sharedSecret, ?array $sigPayload = null): array
    {
        $payload = $sigPayload ?? ['id' => '0'];
        $encodedPayload = self::encodePayload($payload);
        $signature = self::createSignature($sharedSecret, $encodedPayload);

        return [
            'headers' => [
                'X-ACCT-ID' => $accountId,
                'X-PAYLOAD-SIG' => $signature,
                'Content-Type' => 'application/json',
            ],
            'sigPayload' => $encodedPayload,
        ];
    }
}
