"""Main DoorPasses SDK client."""
from typing import Any, Optional

from .http_client import HttpClient
from .resources import AccessPasses, Console


class DoorPasses:
    """
    Main DoorPasses SDK client.

    Example:
        ```python
        from doorpasses import DoorPasses

        account_id = os.environ.get("DOORPASSES_ACCOUNT_ID")
        shared_secret = os.environ.get("DOORPASSES_SHARED_SECRET")

        client = DoorPasses(account_id, shared_secret)

        # Issue an access pass
        access_pass = client.access_passes.issue({
            "cardTemplateId": "template_123",
            "fullName": "John Doe",
            "email": "john@example.com",
            "cardNumber": "12345",
            "startDate": "2025-11-01T00:00:00Z",
            "expirationDate": "2026-11-01T00:00:00Z"
        })
        ```
    """

    def __init__(
        self,
        account_id: str,
        shared_secret: str,
        base_url: Optional[str] = None,
        timeout: Optional[int] = None,
    ):
        """
        Create a new DoorPasses client instance.

        Args:
            account_id: Your DoorPasses account ID (X-ACCT-ID)
            shared_secret: Your DoorPasses shared secret for signing requests
            base_url: Base URL for the DoorPasses API (default: https://api.doorpasses.io)
            timeout: Request timeout in milliseconds (default: 30000)

        Raises:
            ValueError: If account_id or shared_secret is not provided

        Example:
            ```python
            # Using environment variables
            client = DoorPasses(
                os.environ.get("DOORPASSES_ACCOUNT_ID"),
                os.environ.get("DOORPASSES_SHARED_SECRET")
            )

            # With custom configuration
            client = DoorPasses(
                account_id,
                shared_secret,
                base_url="https://api.doorpasses.io",
                timeout=60000
            )
            ```
        """
        if not account_id or not shared_secret:
            raise ValueError("account_id and shared_secret are required")

        _base_url = base_url or "https://api.doorpasses.io"
        _timeout = timeout or 30000

        self._http = HttpClient(account_id, shared_secret, _base_url, _timeout)

        # Initialize resources
        self.access_passes = AccessPasses(self._http)
        self.console = Console(self._http)

    def health(self) -> Any:
        """
        Health check to verify API connectivity.

        Returns:
            Health status information
        """
        return self._http.get("/health")
