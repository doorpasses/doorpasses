package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Success response model.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SuccessResponse {
    private boolean success;
    private String message;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
