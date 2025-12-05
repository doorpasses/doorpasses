"""Tests for authentication module."""

from doorpasses.auth import (
    create_auth_headers,
    create_get_auth_headers,
    create_signature,
    encode_payload,
    verify_signature,
)


class TestAuth:
    """Test authentication utilities."""

    def test_encode_payload(self):
        """Test payload encoding."""
        payload = {"id": "123", "name": "test"}
        encoded = encode_payload(payload)
        assert isinstance(encoded, str)
        assert len(encoded) > 0

    def test_create_signature(self):
        """Test signature creation."""
        shared_secret = "test_secret"
        encoded_payload = encode_payload({"id": "0"})
        signature = create_signature(shared_secret, encoded_payload)

        assert isinstance(signature, str)
        assert len(signature) == 64  # SHA256 hex digest length

    def test_verify_signature(self):
        """Test signature verification."""
        shared_secret = "test_secret"
        encoded_payload = encode_payload({"id": "0"})
        signature = create_signature(shared_secret, encoded_payload)

        assert verify_signature(shared_secret, encoded_payload, signature) is True
        assert verify_signature(shared_secret, encoded_payload, "invalid") is False

    def test_create_auth_headers(self):
        """Test auth headers creation."""
        account_id = "test_account"
        shared_secret = "test_secret"
        payload = {"test": "data"}

        headers = create_auth_headers(account_id, shared_secret, payload)

        assert "X-ACCT-ID" in headers
        assert "X-PAYLOAD-SIG" in headers
        assert "Content-Type" in headers
        assert headers["X-ACCT-ID"] == account_id

    def test_create_auth_headers_no_payload(self):
        """Test auth headers creation without payload."""
        account_id = "test_account"
        shared_secret = "test_secret"

        headers = create_auth_headers(account_id, shared_secret)

        assert "X-ACCT-ID" in headers
        assert "X-PAYLOAD-SIG" in headers

    def test_create_get_auth_headers(self):
        """Test GET auth headers creation."""
        account_id = "test_account"
        shared_secret = "test_secret"
        sig_payload = {"id": "123"}

        headers, encoded_payload = create_get_auth_headers(account_id, shared_secret, sig_payload)

        assert "X-ACCT-ID" in headers
        assert "X-PAYLOAD-SIG" in headers
        assert isinstance(encoded_payload, str)
        assert len(encoded_payload) > 0
