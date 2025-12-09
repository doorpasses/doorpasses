"""AccessPasses resource for managing access passes."""

from typing import Any, Dict, List, Optional, cast

from ..types import (
    AccessPass,
    IssueAccessPassParams,
    ListAccessPassesParams,
    UpdateAccessPassParams,
)


class AccessPasses:
    """AccessPasses resource for managing access passes."""

    def __init__(self, http_client: Any):
        """
        Initialize the AccessPasses resource.

        Args:
            http_client: The HTTP client instance
        """
        self.http = http_client

    def issue(self, params: IssueAccessPassParams) -> AccessPass:
        """
        Issue a new access pass.

        Args:
            params: Parameters for issuing the access pass

        Returns:
            The created access pass with installation URL
        """
        return cast(AccessPass, self.http.post("/v1/access-passes", params))

    def list(self, params: Optional[ListAccessPassesParams] = None) -> List[AccessPass]:
        """
        List access passes with optional filtering.

        Args:
            params: Optional parameters for filtering

        Returns:
            Array of access passes
        """
        sig_payload: Dict[str, Any] = {}

        if params:
            if params.get("templateId"):
                sig_payload["template_id"] = params["templateId"]
            if params.get("state"):
                sig_payload["state"] = params["state"]

        return cast(List[AccessPass], self.http.get("/v1/access-passes", sig_payload))

    def update(self, params: UpdateAccessPassParams) -> AccessPass:
        """
        Update an access pass.

        Args:
            params: Parameters for updating the access pass

        Returns:
            The updated access pass
        """
        access_pass_id = params.pop("accessPassId")
        return cast(AccessPass, self.http.patch(f"/v1/access-passes/{access_pass_id}", params))

    def suspend(self, access_pass_id: str) -> Dict[str, Any]:
        """
        Suspend an access pass.

        Args:
            access_pass_id: The ID of the access pass to suspend

        Returns:
            Success response
        """
        return cast(Dict[str, Any], self.http.post(f"/v1/access-passes/{access_pass_id}/suspend"))

    def resume(self, access_pass_id: str) -> Dict[str, Any]:
        """
        Resume a suspended access pass.

        Args:
            access_pass_id: The ID of the access pass to resume

        Returns:
            Success response
        """
        return cast(Dict[str, Any], self.http.post(f"/v1/access-passes/{access_pass_id}/resume"))

    def unlink(self, access_pass_id: str) -> Dict[str, Any]:
        """
        Unlink an access pass from the user's device.

        Args:
            access_pass_id: The ID of the access pass to unlink

        Returns:
            Success response
        """
        return cast(Dict[str, Any], self.http.post(f"/v1/access-passes/{access_pass_id}/unlink"))

    def delete(self, access_pass_id: str) -> Dict[str, Any]:
        """
        Delete an access pass permanently.

        Args:
            access_pass_id: The ID of the access pass to delete

        Returns:
            Success response
        """
        return cast(Dict[str, Any], self.http.post(f"/v1/access-passes/{access_pass_id}/delete"))
