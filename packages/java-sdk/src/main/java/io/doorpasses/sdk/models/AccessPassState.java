package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Access Pass state enum.
 */
public enum AccessPassState {
    ACTIVE("active"),
    SUSPENDED("suspended"),
    UNLINKED("unlinked"),
    DELETED("deleted"),
    EXPIRED("expired");

    private final String value;

    AccessPassState(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
