# DoorPasses Go SDK

Official Go SDK for [DoorPasses](https://doorpasses.io) - Digital Access Control Platform for the MENA region.

[![Go Reference](https://pkg.go.dev/badge/github.com/mohammedzamakhan/doorpasses/packages/go-sdk.svg)](https://pkg.go.dev/github.com/mohammedzamakhan/doorpasses/packages/go-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
go get github.com/mohammedzamakhan/doorpasses/packages/go-sdk
```

## Quick Start

```go
package main

import (
    "fmt"
    "log"
    "os"
    "time"

    doorpasses "github.com/mohammedzamakhan/doorpasses/packages/go-sdk"
)

func main() {
    accountID := os.Getenv("DOORPASSES_ACCOUNT_ID")
    sharedSecret := os.Getenv("DOORPASSES_SHARED_SECRET")

    client, err := doorpasses.NewClient(accountID, sharedSecret, nil)
    if err != nil {
        log.Fatal(err)
    }

    // Issue an access pass
    accessPass, err := client.AccessPasses.Issue(doorpasses.IssueAccessPassParams{
        CardTemplateID:  "template_123",
        FullName:        "John Doe",
        Email:           "john@example.com",
        PhoneNumber:     "+966501234567",
        CardNumber:      "12345",
        StartDate:       time.Now().Format(time.RFC3339),
        ExpirationDate:  time.Now().AddDate(1, 0, 0).Format(time.RFC3339),
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Access pass created: %s\n", accessPass.URL)
}
```

## Authentication

DoorPasses uses a dual authentication mechanism:

1. **X-ACCT-ID header**: Your static account ID
2. **X-PAYLOAD-SIG header**: A SHA256 signature of your payload using your shared secret

You can find both keys in your DoorPasses console on the API keys page. The SDK handles authentication automatically.

## Usage

### Initialize the Client

```go
import (
    "time"
    doorpasses "github.com/mohammedzamakhan/doorpasses/packages/go-sdk"
)

// Basic initialization
client, err := doorpasses.NewClient(accountID, sharedSecret, nil)
if err != nil {
    log.Fatal(err)
}

// With custom configuration
client, err := doorpasses.NewClient(accountID, sharedSecret, &doorpasses.Config{
    BaseURL: "https://api.doorpasses.io",
    Timeout: 60 * time.Second,
})
if err != nil {
    log.Fatal(err)
}
```

### Access Passes

#### Issue an Access Pass

```go
fullTime := doorpasses.ClassificationFullTime
accessPass, err := client.AccessPasses.Issue(doorpasses.IssueAccessPassParams{
    CardTemplateID:  "template_123",
    EmployeeID:      "emp_456",
    FullName:        "Ahmed Al-Rashid",
    Email:           "ahmed@company.sa",
    PhoneNumber:     "+966501234567",
    Classification:  fullTime,
    CardNumber:      "12345",
    SiteCode:        "100",
    StartDate:       time.Now().Format(time.RFC3339),
    ExpirationDate:  time.Now().AddDate(1, 0, 0).Format(time.RFC3339),
    Title:           "Engineering Manager",
    EmployeePhoto:   "[base64_encoded_image]",
    Metadata: map[string]interface{}{
        "department": "engineering",
        "badgeType":  "permanent",
    },
})
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Install URL: %s\n", accessPass.URL)
```

#### List Access Passes

```go
// List all access passes for a template
passes, err := client.AccessPasses.List(&doorpasses.ListAccessPassesParams{
    TemplateID: "template_123",
})
if err != nil {
    log.Fatal(err)
}

// Filter by state
activePasses, err := client.AccessPasses.List(&doorpasses.ListAccessPassesParams{
    State: doorpasses.AccessPassStateActive,
})
if err != nil {
    log.Fatal(err)
}

// List all
allPasses, err := client.AccessPasses.List(nil)
if err != nil {
    log.Fatal(err)
}
```

#### Update an Access Pass

```go
updatedPass, err := client.AccessPasses.Update(doorpasses.UpdateAccessPassParams{
    AccessPassID:   "pass_123",
    FullName:       "Ahmed Al-Rashid (Updated)",
    Title:          "Senior Engineering Manager",
    ExpirationDate: "2027-01-01T00:00:00Z",
})
if err != nil {
    log.Fatal(err)
}
```

#### Suspend an Access Pass

```go
resp, err := client.AccessPasses.Suspend("pass_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Message)
```

#### Resume an Access Pass

```go
resp, err := client.AccessPasses.Resume("pass_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Message)
```

#### Unlink an Access Pass

```go
resp, err := client.AccessPasses.Unlink("pass_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Message)
```

#### Delete an Access Pass

```go
resp, err := client.AccessPasses.Delete("pass_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Message)
```

### Card Templates (Enterprise Only)

#### Create a Card Template

```go
allowMultiple := true
watchCount := 2
iphoneCount := 3

template, err := client.Console.CreateTemplate(doorpasses.CreateCardTemplateParams{
    Name:                   "Employee Badge - Corporate",
    Platform:               doorpasses.PlatformApple,
    UseCase:                doorpasses.UseCaseEmployeeBadge,
    Protocol:               doorpasses.ProtocolDesfire,
    AllowOnMultipleDevices: &allowMultiple,
    WatchCount:             &watchCount,
    IPhoneCount:            &iphoneCount,
    Design: &doorpasses.CardTemplateDesign{
        BackgroundColor:     "#FFFFFF",
        LabelColor:          "#000000",
        LabelSecondaryColor: "#333333",
        BackgroundImage:     "[base64_encoded_image]",
        LogoImage:           "[base64_encoded_image]",
        IconImage:           "[base64_encoded_image]",
    },
    SupportInfo: &doorpasses.SupportInfo{
        SupportURL:            "https://help.company.sa",
        SupportPhoneNumber:    "+966112345678",
        SupportEmail:          "support@company.sa",
        PrivacyPolicyURL:      "https://company.sa/privacy",
        TermsAndConditionsURL: "https://company.sa/terms",
    },
    Metadata: map[string]interface{}{
        "version":     "1.0",
        "environment": "production",
    },
})
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Template created: %s\n", template.ID)
```

#### Read a Card Template

```go
template, err := client.Console.ReadTemplate("template_123")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Template: %s\n", template.Name)
```

#### Update a Card Template

```go
allowMultiple := true
watchCount := 3

updatedTemplate, err := client.Console.UpdateTemplate(doorpasses.UpdateCardTemplateParams{
    CardTemplateID:         "template_123",
    Name:                   "Employee Badge - Corporate (Updated)",
    AllowOnMultipleDevices: &allowMultiple,
    WatchCount:             &watchCount,
    SupportInfo: &doorpasses.SupportInfo{
        SupportEmail: "newsupport@company.sa",
    },
})
if err != nil {
    log.Fatal(err)
}
```

#### Publish a Card Template

```go
resp, err := client.Console.PublishTemplate("template_123")
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Message)
```

#### Read Event Logs

```go
// Get all events
events, err := client.Console.EventLog(doorpasses.ReadEventLogParams{
    CardTemplateID: "template_123",
})
if err != nil {
    log.Fatal(err)
}

// Filter events
thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
filteredEvents, err := client.Console.EventLog(doorpasses.ReadEventLogParams{
    CardTemplateID: "template_123",
    Filters: &doorpasses.EventLogFilters{
        Device:    doorpasses.DeviceTypeMobile,
        StartDate: thirtyDaysAgo.Format(time.RFC3339),
        EndDate:   time.Now().Format(time.RFC3339),
        EventType: doorpasses.EventTypeInstall,
    },
})
if err != nil {
    log.Fatal(err)
}

for _, event := range filteredEvents {
    fmt.Printf("Event: %s at %s\n", event.Type, event.Timestamp)
}
```

### Health Check

```go
health, err := client.Health()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("API Status: %v\n", health)
```

## Error Handling

The SDK returns errors when API requests fail:

```go
accessPass, err := client.AccessPasses.Issue(doorpasses.IssueAccessPassParams{
    CardTemplateID: "invalid_template",
    FullName:       "Test User",
    CardNumber:     "12345",
    StartDate:      time.Now().Format(time.RFC3339),
    ExpirationDate: time.Now().AddDate(1, 0, 0).Format(time.RFC3339),
})
if err != nil {
    log.Printf("Error: %v", err)
    // Handle error appropriately
    return
}
```

## Type Safety

The SDK provides full type safety with Go structs and constants:

```go
import doorpasses "github.com/mohammedzamakhan/doorpasses/packages/go-sdk"

params := doorpasses.IssueAccessPassParams{
    CardTemplateID: "template_123",
    FullName:       "John Doe",
    CardNumber:     "12345",
    StartDate:      time.Now().Format(time.RFC3339),
    ExpirationDate: time.Now().AddDate(1, 0, 0).Format(time.RFC3339),
}

var accessPass *doorpasses.AccessPass
accessPass, err := client.AccessPasses.Issue(params)
if err != nil {
    log.Fatal(err)
}
```

## Environment Variables

It's recommended to store your credentials in environment variables:

```bash
# .env
export DOORPASSES_ACCOUNT_ID=your_account_id
export DOORPASSES_SHARED_SECRET=your_shared_secret
```

Then use them in your code:

```go
package main

import (
    "log"
    "os"

    doorpasses "github.com/mohammedzamakhan/doorpasses/packages/go-sdk"
)

func main() {
    client, err := doorpasses.NewClient(
        os.Getenv("DOORPASSES_ACCOUNT_ID"),
        os.Getenv("DOORPASSES_SHARED_SECRET"),
        nil,
    )
    if err != nil {
        log.Fatal(err)
    }

    // Use client...
}
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
