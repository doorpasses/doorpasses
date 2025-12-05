package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Classification type enum.
 */
public enum Classification {
    FULL_TIME("full_time"),
    CONTRACTOR("contractor"),
    PART_TIME("part_time"),
    TEMPORARY("temporary");

    private final String value;

    Classification(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
