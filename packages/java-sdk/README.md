# DoorPasses Java SDK

Official Java SDK for [DoorPasses](https://doorpasses.io) - Digital Access Control Platform for the MENA region.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Requirements

- Java 11 or higher
- Maven 3.6 or higher

## Installation

### Maven

Add this dependency to your project's POM:

```xml
<dependency>
    <groupId>io.doorpasses</groupId>
    <artifactId>doorpasses-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```gradle
implementation 'io.doorpasses:doorpasses-java-sdk:1.0.0'
```

## Quick Start

```java
import io.doorpasses.sdk.DoorPasses;
import io.doorpasses.sdk.models.AccessPass;
import io.doorpasses.sdk.models.IssueAccessPassParams;

public class Example {
    public static void main(String[] args) throws Exception {
        String accountId = System.getenv("DOORPASSES_ACCOUNT_ID");
        String sharedSecret = System.getenv("DOORPASSES_SHARED_SECRET");

        DoorPasses client = new DoorPasses(accountId, sharedSecret);

        // Issue an access pass
        IssueAccessPassParams params = new IssueAccessPassParams(
            "template_123",
            "12345",
            "John Doe",
            "2025-11-01T00:00:00Z",
            "2026-11-01T00:00:00Z"
        );
        params.setEmail("john@example.com");
        params.setPhoneNumber("+966501234567");

        AccessPass accessPass = client.accessPasses.issue(params);
        System.out.println("Access pass created: " + accessPass.getUrl());
    }
}
```

## Authentication

DoorPasses uses a dual authentication mechanism:

1. **X-ACCT-ID header**: Your static account ID
2. **X-PAYLOAD-SIG header**: A SHA256 signature of your payload using your shared secret

You can find both keys in your DoorPasses console on the API keys page. The SDK handles authentication automatically.

## Usage

### Initialize the Client

```java
import io.doorpasses.sdk.DoorPasses;

// Basic initialization
DoorPasses client = new DoorPasses(accountId, sharedSecret);

// With custom configuration
DoorPasses client = new DoorPasses(
    accountId,
    sharedSecret,
    "https://api.doorpasses.io",
    60000  // 60 seconds timeout
);
```

### Access Passes

#### Issue an Access Pass

```java
import io.doorpasses.sdk.models.IssueAccessPassParams;
import io.doorpasses.sdk.models.Classification;
import java.util.HashMap;
import java.util.Map;

IssueAccessPassParams params = new IssueAccessPassParams(
    "template_123",
    "12345",
    "Ahmed Al-Rashid",
    "2025-11-01T00:00:00Z",
    "2026-11-01T00:00:00Z"
);

params.setEmployeeId("emp_456");
params.setEmail("ahmed@company.sa");
params.setPhoneNumber("+966501234567");
params.setClassification(Classification.FULL_TIME);
params.setTitle("Engineering Manager");
params.setSiteCode("100");

// Add metadata
Map<String, Object> metadata = new HashMap<>();
metadata.put("department", "engineering");
metadata.put("badgeType", "permanent");
params.setMetadata(metadata);

AccessPass accessPass = client.accessPasses.issue(params);
System.out.println("Install URL: " + accessPass.getUrl());
```

#### List Access Passes

```java
import io.doorpasses.sdk.models.AccessPassState;
import java.util.List;

// List all access passes
List<AccessPass> allPasses = client.accessPasses.list();

// Filter by template ID
List<AccessPass> templatePasses = client.accessPasses.list("template_123", null);

// Filter by state
List<AccessPass> activePasses = client.accessPasses.list(null, AccessPassState.ACTIVE);

// Filter by both
List<AccessPass> filteredPasses = client.accessPasses.list("template_123", AccessPassState.ACTIVE);
```

#### Update an Access Pass

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> updateData = new HashMap<>();
updateData.put("fullName", "Ahmed Al-Rashid (Updated)");
updateData.put("title", "Senior Engineering Manager");
updateData.put("expirationDate", "2027-01-01T00:00:00Z");

AccessPass updatedPass = client.accessPasses.update("pass_123", updateData);
```

#### Suspend an Access Pass

```java
import io.doorpasses.sdk.models.SuccessResponse;

SuccessResponse response = client.accessPasses.suspend("pass_123");
System.out.println("Access pass suspended: " + response.getMessage());
```

#### Resume an Access Pass

```java
SuccessResponse response = client.accessPasses.resume("pass_123");
System.out.println("Access pass resumed: " + response.getMessage());
```

#### Unlink an Access Pass

```java
SuccessResponse response = client.accessPasses.unlink("pass_123");
System.out.println("Access pass unlinked from device: " + response.getMessage());
```

#### Delete an Access Pass

```java
SuccessResponse response = client.accessPasses.delete("pass_123");
System.out.println("Access pass deleted: " + response.getMessage());
```

### Card Templates (Enterprise Only)

#### Read a Card Template

```java
Object template = client.console.readTemplate("template_123");
```

#### Publish a Card Template

```java
SuccessResponse response = client.console.publishTemplate("template_123");
System.out.println("Template published: " + response.getMessage());
```

#### Read Event Logs

```java
import java.util.HashMap;
import java.util.Map;

// Get all events
Object events = client.console.eventLog("template_123", null);

// Filter events
Map<String, Object> filters = new HashMap<>();
filters.put("device", "mobile");
filters.put("startDate", "2025-10-01T00:00:00Z");
filters.put("endDate", "2025-11-01T00:00:00Z");
filters.put("eventType", "install");

Object filteredEvents = client.console.eventLog("template_123", filters);
```

### Health Check

```java
Object health = client.health();
System.out.println("API Status: " + health);
```

## Error Handling

The SDK throws `IOException` when API requests fail:

```java
import java.io.IOException;

try {
    IssueAccessPassParams params = new IssueAccessPassParams(
        "invalid_template",
        "12345",
        "Test User",
        "2025-11-01T00:00:00Z",
        "2026-11-01T00:00:00Z"
    );
    AccessPass accessPass = client.accessPasses.issue(params);
} catch (IOException e) {
    System.err.println("Error: " + e.getMessage());
    // Handle error appropriately
}
```

## Environment Variables

It's recommended to store your credentials in environment variables:

```bash
# .env or environment
export DOORPASSES_ACCOUNT_ID=your_account_id
export DOORPASSES_SHARED_SECRET=your_shared_secret
```

Then use them in your code:

```java
String accountId = System.getenv("DOORPASSES_ACCOUNT_ID");
String sharedSecret = System.getenv("DOORPASSES_SHARED_SECRET");

DoorPasses client = new DoorPasses(accountId, sharedSecret);
```

## Building from Source

```bash
# Clone the repository
git clone https://github.com/mohammedzamakhan/doorpasses.git
cd doorpasses/packages/java-sdk

# Build the project
mvn clean package

# Run tests
mvn test

# Install to local Maven repository
mvn install
```

## Examples

Check out the [examples directory](../../examples) for complete working examples.

## API Reference

For detailed API documentation, visit [https://docs.doorpasses.io](https://docs.doorpasses.io)

## Support

- Documentation: [https://docs.doorpasses.io](https://docs.doorpasses.io)
- GitHub Issues: [https://github.com/mohammedzamakhan/doorpasses/issues](https://github.com/mohammedzamakhan/doorpasses/issues)
- Email: support@doorpasses.io

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.
