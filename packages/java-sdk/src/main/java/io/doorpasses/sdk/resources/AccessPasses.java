package io.doorpasses.sdk.resources;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.doorpasses.sdk.http.HttpClient;
import io.doorpasses.sdk.models.AccessPass;
import io.doorpasses.sdk.models.AccessPassState;
import io.doorpasses.sdk.models.IssueAccessPassParams;
import io.doorpasses.sdk.models.SuccessResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AccessPasses resource for managing access passes.
 */
public class AccessPasses {
    private final HttpClient http;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public AccessPasses(HttpClient httpClient) {
        this.http = httpClient;
    }

    /**
     * Issue a new access pass.
     *
     * @param params Parameters for issuing the access pass
     * @return The created access pass with installation URL
     * @throws IOException if the request fails
     */
    public AccessPass issue(IssueAccessPassParams params) throws IOException {
        return http.post("/v1/access-passes", params, AccessPass.class);
    }

    /**
     * List access passes with optional filtering.
     *
     * @return Array of access passes
     * @throws IOException if the request fails
     */
    public List<AccessPass> list() throws IOException {
        return list(null, null);
    }

    /**
     * List access passes with optional filtering.
     *
     * @param templateId Filter by template ID
     * @param state Filter by state
     * @return Array of access passes
     * @throws IOException if the request fails
     */
    public List<AccessPass> list(String templateId, AccessPassState state) throws IOException {
        Map<String, Object> sigPayload = new HashMap<>();

        if (templateId != null) {
            sigPayload.put("template_id", templateId);
        }
        if (state != null) {
            sigPayload.put("state", state.getValue());
        }

        // Using a workaround for generic List types
        Object response = http.get("/v1/access-passes", sigPayload.isEmpty() ? null : sigPayload, Object.class);
        return objectMapper.convertValue(response, new TypeReference<List<AccessPass>>() {});
    }

    /**
     * Update an access pass.
     *
     * @param accessPassId The ID of the access pass to update
     * @param updateData The update data
     * @return The updated access pass
     * @throws IOException if the request fails
     */
    public AccessPass update(String accessPassId, Map<String, Object> updateData) throws IOException {
        return http.patch("/v1/access-passes/" + accessPassId, updateData, AccessPass.class);
    }

    /**
     * Suspend an access pass.
     *
     * @param accessPassId The ID of the access pass to suspend
     * @return Success response
     * @throws IOException if the request fails
     */
    public SuccessResponse suspend(String accessPassId) throws IOException {
        return http.post("/v1/access-passes/" + accessPassId + "/suspend", null, SuccessResponse.class);
    }

    /**
     * Resume a suspended access pass.
     *
     * @param accessPassId The ID of the access pass to resume
     * @return Success response
     * @throws IOException if the request fails
     */
    public SuccessResponse resume(String accessPassId) throws IOException {
        return http.post("/v1/access-passes/" + accessPassId + "/resume", null, SuccessResponse.class);
    }

    /**
     * Unlink an access pass from the user's device.
     *
     * @param accessPassId The ID of the access pass to unlink
     * @return Success response
     * @throws IOException if the request fails
     */
    public SuccessResponse unlink(String accessPassId) throws IOException {
        return http.post("/v1/access-passes/" + accessPassId + "/unlink", null, SuccessResponse.class);
    }

    /**
     * Delete an access pass permanently.
     *
     * @param accessPassId The ID of the access pass to delete
     * @return Success response
     * @throws IOException if the request fails
     */
    public SuccessResponse delete(String accessPassId) throws IOException {
        return http.post("/v1/access-passes/" + accessPassId + "/delete", null, SuccessResponse.class);
    }
}
