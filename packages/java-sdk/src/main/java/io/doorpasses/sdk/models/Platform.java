package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Platform type enum.
 */
public enum Platform {
    APPLE("apple"),
    GOOGLE("google");

    private final String value;

    Platform(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
