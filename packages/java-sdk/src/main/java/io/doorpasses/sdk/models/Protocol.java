package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Protocol type enum.
 */
public enum Protocol {
    DESFIRE("desfire"),
    SEOS("seos"),
    SMART_TAP("smart_tap");

    private final String value;

    Protocol(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
