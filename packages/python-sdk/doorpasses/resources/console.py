"""Console resource for managing card templates (Enterprise only)."""

from typing import Any, Dict, List, cast

from ..types import (
    CardTemplate,
    CreateCardTemplateParams,
    EventLogEntry,
    ReadEventLogParams,
    UpdateCardTemplateParams,
)


class Console:
    """Console resource for managing card templates (Enterprise only)."""

    def __init__(self, http_client: Any):
        """
        Initialize the Console resource.

        Args:
            http_client: The HTTP client instance
        """
        self.http = http_client

    def create_template(self, params: CreateCardTemplateParams) -> CardTemplate:
        """
        Create a new card template.

        Args:
            params: Parameters for creating the card template

        Returns:
            The created card template

        Note:
            Requires Enterprise tier
        """
        return cast(CardTemplate, self.http.post("/v1/console/card-templates", params))

    def read_template(self, card_template_id: str) -> CardTemplate:
        """
        Read a card template.

        Args:
            card_template_id: The ID of the card template to read

        Returns:
            The card template

        Note:
            Requires Enterprise tier
        """
        return cast(
            CardTemplate,
            self.http.get(
                f"/v1/console/card-templates/{card_template_id}", {"id": card_template_id}
            ),
        )

    def update_template(self, params: UpdateCardTemplateParams) -> CardTemplate:
        """
        Update a card template.

        Args:
            params: Parameters for updating the card template

        Returns:
            The updated card template

        Note:
            Requires Enterprise tier
        """
        card_template_id = params.pop("cardTemplateId")
        return cast(
            CardTemplate,
            self.http.patch(f"/v1/console/card-templates/{card_template_id}", params),
        )

    def publish_template(self, card_template_id: str) -> Dict[str, Any]:
        """
        Publish a card template.

        Args:
            card_template_id: The ID of the card template to publish

        Returns:
            Success response

        Note:
            Requires Enterprise tier
        """
        return cast(
            Dict[str, Any],
            self.http.post(f"/v1/console/card-templates/{card_template_id}/publish"),
        )

    def event_log(self, params: ReadEventLogParams) -> List[EventLogEntry]:
        """
        Read event logs for a card template.

        Args:
            params: Parameters for filtering event logs

        Returns:
            Array of event log entries

        Note:
            Requires Enterprise tier
        """
        card_template_id = params["cardTemplateId"]
        filters = params.get("filters")

        sig_payload: Dict[str, Any] = {"id": card_template_id}

        if filters:
            if filters.get("device"):
                sig_payload["device"] = filters["device"]
            if filters.get("startDate"):
                sig_payload["start_date"] = filters["startDate"]
            if filters.get("endDate"):
                sig_payload["end_date"] = filters["endDate"]
            if filters.get("eventType"):
                sig_payload["event_type"] = filters["eventType"]

        return cast(
            List[EventLogEntry],
            self.http.get(f"/v1/console/card-templates/{card_template_id}/logs", sig_payload),
        )
