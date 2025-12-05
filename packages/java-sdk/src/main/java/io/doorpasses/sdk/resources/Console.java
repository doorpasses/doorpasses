package io.doorpasses.sdk.resources;

import io.doorpasses.sdk.http.HttpClient;
import java.util.Map;

/**
 * Console resource for managing card templates (Enterprise only).
 */
public class Console {
    private final HttpClient http;

    public Console(HttpClient httpClient) {
        this.http = httpClient;
    }

    /**
     * Read a card template.
     *
     * @param cardTemplateId The ID of the card template to read
     * @return The card template
     * @throws java.io.IOException if the request fails
     */
    public Object readTemplate(String cardTemplateId) throws java.io.IOException {
        java.util.Map<String, Object> sigPayload = new java.util.HashMap<>();
        sigPayload.put("id", cardTemplateId);
        return http.get("/v1/console/card-templates/" + cardTemplateId, sigPayload, Object.class);
    }

    /**
     * Publish a card template.
     *
     * @param cardTemplateId The ID of the card template to publish
     * @return Success response
     * @throws java.io.IOException if the request fails
     */
    public io.doorpasses.sdk.models.SuccessResponse publishTemplate(String cardTemplateId) throws java.io.IOException {
        return http.post("/v1/console/card-templates/" + cardTemplateId + "/publish", null,
                io.doorpasses.sdk.models.SuccessResponse.class);
    }

    /**
     * Read event logs for a card template.
     *
     * @param cardTemplateId The ID of the card template
     * @param filters Optional filters for the event logs
     * @return Array of event log entries
     * @throws java.io.IOException if the request fails
     */
    public Object eventLog(String cardTemplateId, Map<String, Object> filters) throws java.io.IOException {
        Map<String, Object> sigPayload = new java.util.HashMap<>();
        sigPayload.put("id", cardTemplateId);

        if (filters != null) {
            if (filters.containsKey("device")) sigPayload.put("device", filters.get("device"));
            if (filters.containsKey("startDate")) sigPayload.put("start_date", filters.get("startDate"));
            if (filters.containsKey("endDate")) sigPayload.put("end_date", filters.get("endDate"));
            if (filters.containsKey("eventType")) sigPayload.put("event_type", filters.get("eventType"));
        }

        return http.get("/v1/console/card-templates/" + cardTemplateId + "/logs", sigPayload, Object.class);
    }
}
