"""HTTP client for making authenticated requests to the DoorPasses API."""
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import requests

from .auth import create_auth_headers, create_get_auth_headers


class HttpClient:
    """HTTP client for making authenticated requests to the DoorPasses API."""

    def __init__(self, account_id: str, shared_secret: str, base_url: str, timeout: int):
        """
        Initialize the HTTP client.

        Args:
            account_id: Your DoorPasses account ID
            shared_secret: Your DoorPasses shared secret
            base_url: Base URL for the API
            timeout: Request timeout in seconds
        """
        self.account_id = account_id
        self.shared_secret = shared_secret
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout / 1000.0  # Convert milliseconds to seconds

        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def _handle_response(self, response: requests.Response) -> Any:
        """
        Handle API response and extract data.

        Args:
            response: The response object

        Returns:
            Response data

        Raises:
            Exception: If the response indicates an error
        """
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            error_message = None
            try:
                error_data = response.json()
                error_message = error_data.get("error") or error_data.get("message")
            except Exception:
                pass

            if error_message:
                raise Exception(f"DoorPasses API Error ({response.status_code}): {error_message}")
            else:
                raise Exception(f"DoorPasses API Error ({response.status_code}): {str(e)}")

        try:
            data = response.json()
            return data.get("data", data)
        except Exception:
            return response.text

    def get(self, url: str, sig_payload: Optional[Dict[str, Any]] = None) -> Any:
        """
        Make a GET request.

        Args:
            url: The endpoint URL
            sig_payload: Optional signature payload

        Returns:
            Response data
        """
        headers, encoded_payload = create_get_auth_headers(
            self.account_id, self.shared_secret, sig_payload
        )

        full_url = f"{self.base_url}{url}"
        params = {"sig_payload": encoded_payload}

        try:
            response = self.session.get(full_url, headers=headers, params=params, timeout=self.timeout)
            return self._handle_response(response)
        except requests.exceptions.Timeout:
            raise Exception("Request timeout - no response received from DoorPasses API")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request error: {str(e)}")

    def post(self, url: str, data: Optional[Any] = None) -> Any:
        """
        Make a POST request.

        Args:
            url: The endpoint URL
            data: Optional request body

        Returns:
            Response data
        """
        headers = create_auth_headers(self.account_id, self.shared_secret, data)
        full_url = f"{self.base_url}{url}"

        try:
            response = self.session.post(
                full_url, json=data, headers=headers, timeout=self.timeout
            )
            return self._handle_response(response)
        except requests.exceptions.Timeout:
            raise Exception("Request timeout - no response received from DoorPasses API")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request error: {str(e)}")

    def patch(self, url: str, data: Optional[Any] = None) -> Any:
        """
        Make a PATCH request.

        Args:
            url: The endpoint URL
            data: Optional request body

        Returns:
            Response data
        """
        headers = create_auth_headers(self.account_id, self.shared_secret, data)
        full_url = f"{self.base_url}{url}"

        try:
            response = self.session.patch(
                full_url, json=data, headers=headers, timeout=self.timeout
            )
            return self._handle_response(response)
        except requests.exceptions.Timeout:
            raise Exception("Request timeout - no response received from DoorPasses API")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request error: {str(e)}")

    def delete(self, url: str) -> Any:
        """
        Make a DELETE request.

        Args:
            url: The endpoint URL

        Returns:
            Response data
        """
        headers = create_auth_headers(self.account_id, self.shared_secret)
        full_url = f"{self.base_url}{url}"

        try:
            response = self.session.delete(full_url, headers=headers, timeout=self.timeout)
            return self._handle_response(response)
        except requests.exceptions.Timeout:
            raise Exception("Request timeout - no response received from DoorPasses API")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request error: {str(e)}")
