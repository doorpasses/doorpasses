package io.doorpasses.sdk;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic tests for the DoorPasses SDK.
 */
public class DoorPassesTest {

    @Test
    public void testClientCreation() {
        DoorPasses client = new DoorPasses("test-account-id", "test-shared-secret");
        assertNotNull(client);
        assertNotNull(client.accessPasses);
        assertNotNull(client.console);
    }

    @Test
    public void testClientCreationWithNullAccountId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new DoorPasses(null, "test-shared-secret");
        });
    }

    @Test
    public void testClientCreationWithNullSharedSecret() {
        assertThrows(IllegalArgumentException.class, () -> {
            new DoorPasses("test-account-id", null);
        });
    }

    @Test
    public void testClientCreationWithEmptyAccountId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new DoorPasses("", "test-shared-secret");
        });
    }

    @Test
    public void testClientCreationWithEmptySharedSecret() {
        assertThrows(IllegalArgumentException.class, () -> {
            new DoorPasses("test-account-id", "");
        });
    }

    @Test
    public void testClientCreationWithCustomConfig() {
        DoorPasses client = new DoorPasses(
            "test-account-id",
            "test-shared-secret",
            "https://custom-api.doorpasses.io",
            60000
        );
        assertNotNull(client);
    }
}
