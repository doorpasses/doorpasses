package doorpasses

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
)

// encodePayload encodes a payload to base64
func encodePayload(payload interface{}) (string, error) {
	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}
	return base64.StdEncoding.EncodeToString(jsonBytes), nil
}

// createSignature creates a signature for a payload using the shared secret
// Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()
func createSignature(sharedSecret, encodedPayload string) string {
	message := sharedSecret + encodedPayload
	hash := sha256.Sum256([]byte(message))
	return fmt.Sprintf("%x", hash)
}

// verifySignature verifies a signature matches the expected value
func verifySignature(sharedSecret, encodedPayload, signature string) bool {
	expectedSignature := createSignature(sharedSecret, encodedPayload)
	return expectedSignature == signature
}

// createAuthHeaders creates authentication headers for API requests
func createAuthHeaders(accountID, sharedSecret string, payload interface{}) (map[string]string, error) {
	var encodedPayload string
	var err error

	if payload != nil {
		encodedPayload, err = encodePayload(payload)
		if err != nil {
			return nil, err
		}
	} else {
		// Default payload when no body is provided
		encodedPayload, err = encodePayload(map[string]string{"id": "0"})
		if err != nil {
			return nil, err
		}
	}

	signature := createSignature(sharedSecret, encodedPayload)

	return map[string]string{
		"X-ACCT-ID":      accountID,
		"X-PAYLOAD-SIG":  signature,
		"Content-Type":   "application/json",
	}, nil
}

// createGetAuthHeaders creates authentication headers for GET requests
func createGetAuthHeaders(accountID, sharedSecret string, sigPayload map[string]interface{}) (map[string]string, string, error) {
	payload := sigPayload
	if payload == nil {
		payload = map[string]interface{}{"id": "0"}
	}

	encodedPayload, err := encodePayload(payload)
	if err != nil {
		return nil, "", err
	}

	signature := createSignature(sharedSecret, encodedPayload)

	headers := map[string]string{
		"X-ACCT-ID":      accountID,
		"X-PAYLOAD-SIG":  signature,
		"Content-Type":   "application/json",
	}

	return headers, encodedPayload, nil
}
