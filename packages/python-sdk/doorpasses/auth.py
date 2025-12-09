"""Authentication utilities for DoorPasses SDK."""

import base64
import hashlib
import json
from typing import Any, Dict, Optional, Tuple


def encode_payload(payload: Any) -> str:
    """
    Encode a payload to base64.

    Args:
        payload: The payload to encode

    Returns:
        Base64 encoded string
    """
    json_string = json.dumps(payload, separators=(",", ":"))
    return base64.b64encode(json_string.encode()).decode()


def create_signature(shared_secret: str, encoded_payload: str) -> str:
    """
    Create a signature for a payload using the shared secret.

    Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()

    Args:
        shared_secret: The shared secret key
        encoded_payload: Base64 encoded payload

    Returns:
        Hex digest of the SHA256 hash
    """
    message = shared_secret + encoded_payload
    return hashlib.sha256(message.encode()).hexdigest()


def verify_signature(shared_secret: str, encoded_payload: str, signature: str) -> bool:
    """
    Verify a signature matches the expected value.

    Args:
        shared_secret: The shared secret key
        encoded_payload: Base64 encoded payload
        signature: The signature to verify

    Returns:
        True if signature is valid, False otherwise
    """
    expected_signature = create_signature(shared_secret, encoded_payload)
    return expected_signature == signature


def create_auth_headers(
    account_id: str, shared_secret: str, payload: Optional[Any] = None
) -> Dict[str, str]:
    """
    Create authentication headers for API requests.

    Args:
        account_id: Your DoorPasses account ID
        shared_secret: Your DoorPasses shared secret
        payload: Optional payload for the request

    Returns:
        Dictionary of headers
    """
    if payload and (isinstance(payload, dict) and len(payload) > 0 or payload):
        encoded_payload = encode_payload(payload)
    else:
        # Default payload when no body is provided
        encoded_payload = encode_payload({"id": "0"})

    signature = create_signature(shared_secret, encoded_payload)

    return {
        "X-ACCT-ID": account_id,
        "X-PAYLOAD-SIG": signature,
        "Content-Type": "application/json",
    }


def create_get_auth_headers(
    account_id: str, shared_secret: str, sig_payload: Optional[Dict[str, Any]] = None
) -> Tuple[Dict[str, str], str]:
    """
    Create authentication headers for GET requests.

    Args:
        account_id: Your DoorPasses account ID
        shared_secret: Your DoorPasses shared secret
        sig_payload: Optional signature payload

    Returns:
        Tuple of (headers dict, encoded_payload string)
    """
    payload = sig_payload or {"id": "0"}
    encoded_payload = encode_payload(payload)
    signature = create_signature(shared_secret, encoded_payload)

    headers = {
        "X-ACCT-ID": account_id,
        "X-PAYLOAD-SIG": signature,
        "Content-Type": "application/json",
    }

    return headers, encoded_payload
