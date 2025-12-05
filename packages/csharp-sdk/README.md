# DoorPasses C# SDK

Official C# SDK for DoorPasses - Digital Access Control Platform

[![NuGet](https://img.shields.io/nuget/v/DoorPasses.svg)](https://www.nuget.org/packages/DoorPasses/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

Install the SDK via NuGet Package Manager:

```bash
dotnet add package DoorPasses
```

Or via Package Manager Console:

```powershell
Install-Package DoorPasses
```

## Quick Start

```csharp
using DoorPasses;
using DoorPasses.Models;

// Initialize the client
var accountId = Environment.GetEnvironmentVariable("DOORPASSES_ACCOUNT_ID");
var sharedSecret = Environment.GetEnvironmentVariable("DOORPASSES_SHARED_SECRET");

var client = new DoorPassesClient(accountId, sharedSecret);

// Issue an access pass
var accessPass = await client.AccessPasses.IssueAsync(new IssueAccessPassRequest
{
    CardTemplateId = "template_123",
    FullName = "John Doe",
    Email = "john@example.com",
    CardNumber = "12345",
    StartDate = DateTime.UtcNow.ToString("o"),
    ExpirationDate = DateTime.UtcNow.AddYears(1).ToString("o")
});

Console.WriteLine($"Access pass created: {accessPass.Url}");
```

## Authentication

The SDK uses a dual authentication mechanism:

1. **Account ID** - Sent in the `X-ACCT-ID` header
2. **Shared Secret** - Used to sign requests with SHA256 in the `X-PAYLOAD-SIG` header

You can find both keys in your DoorPasses console on the API keys page.

```csharp
var client = new DoorPassesClient(
    accountId: "your-account-id",
    sharedSecret: "your-shared-secret"
);
```

### Custom Configuration

```csharp
var client = new DoorPassesClient(
    accountId: "your-account-id",
    sharedSecret: "your-shared-secret",
    config: new DoorPassesConfig
    {
        BaseUrl = "https://api.doorpasses.io",
        Timeout = 60000 // 60 seconds
    }
);
```

## Features

### Access Passes

#### List Access Passes

Retrieve a list of access passes for a specific card template with optional filtering.

```csharp
// Get all access passes
var allPasses = await client.AccessPasses.ListAsync();

// Filter by template
var templatePasses = await client.AccessPasses.ListAsync(new ListAccessPassesRequest
{
    TemplateId = "template_123"
});

// Filter by state
var activePasses = await client.AccessPasses.ListAsync(new ListAccessPassesRequest
{
    State = "active"
});

foreach (var pass in allPasses)
{
    Console.WriteLine($"Pass ID: {pass.Id}, Name: {pass.FullName}, State: {pass.State}");
}
```

#### Issue Access Pass

Create and provision a new access pass.

```csharp
var accessPass = await client.AccessPasses.IssueAsync(new IssueAccessPassRequest
{
    CardTemplateId = "template_123",
    EmployeeId = "emp_456",
    TagId = "DDEADB33FB00B5",
    FullName = "Jane Smith",
    Email = "jane.smith@company.com",
    PhoneNumber = "+1-555-123-4567",
    Classification = "full_time",
    StartDate = DateTime.UtcNow.ToString("o"),
    ExpirationDate = DateTime.UtcNow.AddYears(1).ToString("o"),
    EmployeePhoto = "[base64_encoded_image]",
    Title = "Senior Engineer",
    Metadata = new Dictionary<string, object>
    {
        ["department"] = "engineering",
        ["floor"] = 5
    }
});

Console.WriteLine($"Install URL: {accessPass.Url}");
```

#### Update Access Pass

Update information for an existing access pass.

```csharp
await client.AccessPasses.UpdateAsync("pass_123", new UpdateAccessPassRequest
{
    FullName = "Jane Smith-Johnson",
    Title = "Lead Engineer",
    ExpirationDate = DateTime.UtcNow.AddYears(2).ToString("o")
});

Console.WriteLine("Access pass updated successfully");
```

#### Suspend Access Pass

Temporarily disable an access pass.

```csharp
await client.AccessPasses.SuspendAsync("pass_123");
Console.WriteLine("Access pass suspended");
```

#### Resume Access Pass

Re-enable a previously suspended access pass.

```csharp
await client.AccessPasses.ResumeAsync("pass_123");
Console.WriteLine("Access pass resumed");
```

#### Unlink Access Pass

Force removal of an access pass from the user's device.

```csharp
await client.AccessPasses.UnlinkAsync("pass_123");
Console.WriteLine("Access pass unlinked");
```

#### Delete Access Pass

Permanently delete an access pass and prevent future installs.

```csharp
await client.AccessPasses.DeleteAsync("pass_123");
Console.WriteLine("Access pass deleted");
```

### Console (Enterprise Only)

#### Create Card Template

Create a new card template via the console API.

```csharp
var template = await client.Console.CreateTemplateAsync(new CreateCardTemplateRequest
{
    Name = "Employee Badge",
    Platform = "apple",
    UseCase = "employee_badge",
    Protocol = "desfire",
    AllowOnMultipleDevices = true,
    WatchCount = 2,
    IphoneCount = 3,
    Design = new CardTemplateDesign
    {
        BackgroundColor = "#FFFFFF",
        LabelColor = "#000000",
        LabelSecondaryColor = "#333333",
        BackgroundImage = "[base64_encoded_image]",
        LogoImage = "[base64_encoded_image]",
        IconImage = "[base64_encoded_image]"
    },
    SupportInfo = new SupportInfo
    {
        SupportUrl = "https://help.company.com",
        SupportPhoneNumber = "+1-555-123-4567",
        SupportEmail = "support@company.com",
        PrivacyPolicyUrl = "https://company.com/privacy",
        TermsAndConditionsUrl = "https://company.com/terms"
    },
    Metadata = new Dictionary<string, object>
    {
        ["version"] = "2.1",
        ["approval_status"] = "approved"
    }
});

Console.WriteLine($"Template created: {template.Id}");
```

#### Read Card Template

Retrieve information about a card template.

```csharp
var template = await client.Console.ReadTemplateAsync("template_123");

Console.WriteLine($"Template: {template.Name}");
Console.WriteLine($"Platform: {template.Platform}");
Console.WriteLine($"Protocol: {template.Protocol}");
```

#### Update Card Template

Update an existing card template.

```csharp
var template = await client.Console.UpdateTemplateAsync("template_123", new UpdateCardTemplateRequest
{
    Name = "Updated Employee Badge",
    AllowOnMultipleDevices = true,
    WatchCount = 3,
    SupportInfo = new SupportInfo
    {
        SupportEmail = "newsupport@company.com"
    }
});

Console.WriteLine($"Template updated: {template.Id}");
```

#### Read Event Log

Retrieve event logs for a card template.

```csharp
var events = await client.Console.EventLogAsync("template_123", new EventLogFilters
{
    Device = "mobile",
    StartDate = DateTime.UtcNow.AddDays(-30).ToString("o"),
    EndDate = DateTime.UtcNow.ToString("o"),
    EventType = "install"
});

foreach (var evt in events)
{
    Console.WriteLine($"Event: {evt.Type} at {evt.Timestamp}");
}
```

## Error Handling

The SDK throws `DoorPassesException` for API errors:

```csharp
using DoorPasses.Http;

try
{
    var accessPass = await client.AccessPasses.IssueAsync(request);
}
catch (DoorPassesException ex)
{
    Console.WriteLine($"API Error: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Unexpected error: {ex.Message}");
}
```

## Working with DateTime

The API expects ISO 8601 formatted timestamps. Use `DateTime.ToString("o")` for proper formatting:

```csharp
var request = new IssueAccessPassRequest
{
    StartDate = DateTime.UtcNow.ToString("o"),
    ExpirationDate = DateTime.UtcNow.AddYears(1).ToString("o")
};
```

## Disposing the Client

The `DoorPassesClient` implements `IDisposable`. Make sure to dispose of it when done:

```csharp
using (var client = new DoorPassesClient(accountId, sharedSecret))
{
    // Use the client
    var passes = await client.AccessPasses.ListAsync();
}
// Client is automatically disposed here
```

Or use explicit disposal:

```csharp
var client = new DoorPassesClient(accountId, sharedSecret);
try
{
    // Use the client
}
finally
{
    client.Dispose();
}
```

## Requirements

- .NET Standard 2.1 or higher
- .NET Core 3.0+
- .NET 5.0+
- .NET Framework 4.7.2+ (via .NET Standard 2.1 compatibility)

## Dependencies

- Newtonsoft.Json (13.0.3+)
- System.Net.Http (4.3.4+)

## Support

For issues and questions:
- GitHub Issues: [https://github.com/mohammedzamakhan/doorpasses/issues](https://github.com/mohammedzamakhan/doorpasses/issues)
- Email: support@doorpasses.io

## License

This SDK is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.
