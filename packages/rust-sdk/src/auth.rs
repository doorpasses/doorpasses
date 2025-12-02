use base64::{engine::general_purpose, Engine as _};
use sha2::{Digest, Sha256};

/// Encode a payload to base64
pub fn encode_payload(payload: &serde_json::Value) -> String {
    let json_string = serde_json::to_string(payload).unwrap_or_else(|_| "{}".to_string());
    general_purpose::STANDARD.encode(json_string.as_bytes())
}

/// Create a signature for authentication
///
/// The signature is created by:
/// 1. Encoding the payload as base64
/// 2. Concatenating shared_secret + encoded_payload
/// 3. Computing SHA256 hash
/// 4. Converting to hexadecimal string
pub fn create_signature(shared_secret: &str, encoded_payload: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", shared_secret, encoded_payload).as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

/// Verify a signature
pub fn verify_signature(
    shared_secret: &str,
    encoded_payload: &str,
    signature: &str,
) -> bool {
    let expected_signature = create_signature(shared_secret, encoded_payload);
    expected_signature == signature
}

/// Create authentication headers for POST/PATCH requests
pub fn create_auth_headers(
    account_id: &str,
    shared_secret: &str,
    payload: Option<&serde_json::Value>,
) -> (String, String) {
    let encoded_payload = if let Some(p) = payload {
        encode_payload(p)
    } else {
        encode_payload(&serde_json::json!({}))
    };

    let signature = create_signature(shared_secret, &encoded_payload);

    (account_id.to_string(), signature)
}

/// Create authentication headers for GET requests
pub fn create_get_auth_headers(
    account_id: &str,
    shared_secret: &str,
    query_params: Option<&serde_json::Value>,
) -> (String, String) {
    create_auth_headers(account_id, shared_secret, query_params)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_encode_payload() {
        let payload = json!({
            "test": "value"
        });
        let encoded = encode_payload(&payload);
        assert!(!encoded.is_empty());

        // Verify it's valid base64
        let decoded = general_purpose::STANDARD.decode(&encoded).unwrap();
        let decoded_str = String::from_utf8(decoded).unwrap();
        assert!(decoded_str.contains("test"));
        assert!(decoded_str.contains("value"));
    }

    #[test]
    fn test_create_signature() {
        let secret = "test_secret";
        let payload = "test_payload";

        let signature1 = create_signature(secret, payload);
        let signature2 = create_signature(secret, payload);

        // Same inputs should produce same signature
        assert_eq!(signature1, signature2);

        // Signature should be hex string (64 chars for SHA256)
        assert_eq!(signature1.len(), 64);
    }

    #[test]
    fn test_verify_signature() {
        let secret = "test_secret";
        let payload = "test_payload";
        let signature = create_signature(secret, payload);

        // Valid signature should verify
        assert!(verify_signature(secret, payload, &signature));

        // Invalid signature should not verify
        assert!(!verify_signature(secret, payload, "invalid"));

        // Different payload should not verify
        assert!(!verify_signature(secret, "different", &signature));
    }

    #[test]
    fn test_create_auth_headers() {
        let account_id = "test_account";
        let secret = "test_secret";
        let payload = json!({
            "key": "value"
        });

        let (acct_id, signature) = create_auth_headers(account_id, secret, Some(&payload));

        assert_eq!(acct_id, account_id);
        assert_eq!(signature.len(), 64); // SHA256 hex string
    }

    #[test]
    fn test_create_auth_headers_no_payload() {
        let account_id = "test_account";
        let secret = "test_secret";

        let (acct_id, signature) = create_auth_headers(account_id, secret, None);

        assert_eq!(acct_id, account_id);
        assert_eq!(signature.len(), 64);
    }

    #[test]
    fn test_signature_deterministic() {
        let secret = "my_secret";
        let payload = json!({
            "fullName": "John Doe",
            "email": "john@example.com"
        });

        let encoded = encode_payload(&payload);
        let sig1 = create_signature(secret, &encoded);
        let sig2 = create_signature(secret, &encoded);

        assert_eq!(sig1, sig2);
    }
}
