# DoorPasses Rust SDK

Official Rust SDK for the [DoorPasses](https://doorpasses.io) digital access control platform. Manage digital access passes for Apple Wallet and Google Wallet with a type-safe, async-first API.

[![Crates.io](https://img.shields.io/crates/v/doorpasses.svg)](https://crates.io/crates/doorpasses)
[![Documentation](https://docs.rs/doorpasses/badge.svg)](https://docs.rs/doorpasses)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- ✨ **Full API Coverage** - Complete implementation of the DoorPasses API
- 🔒 **Type-Safe** - Leverages Rust's type system for compile-time safety
- ⚡ **Async/Await** - Built on tokio for high-performance async operations
- 🔐 **Automatic Authentication** - Handles request signing automatically
- 📱 **Digital Wallets** - Support for Apple Wallet and Google Wallet
- 🎫 **Access Control** - Manage digital credentials for physical access
- 🏢 **Enterprise Ready** - Template management for enterprise accounts

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
doorpasses = "1.0"
tokio = { version = "1", features = ["full"] }
```

## Quick Start

```rust
use doorpasses::{DoorPasses, types::IssueAccessPassParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the client
    let client = DoorPasses::new(
        "your_account_id".to_string(),
        "your_shared_secret".to_string()
    )?;

    // Issue a new access pass
    let params = IssueAccessPassParams {
        card_template_id: "template_123".to_string(),
        full_name: "John Doe".to_string(),
        start_date: "2024-01-01".to_string(),
        expiration_date: "2024-12-31".to_string(),
        email: Some("john@example.com".to_string()),
        ..Default::default()
    };

    let access_pass = client.access_passes.issue(params).await?;
    println!("Created access pass: {}", access_pass.id);

    Ok(())
}
```

## Configuration

### Basic Configuration

```rust
use doorpasses::DoorPasses;

let client = DoorPasses::new(
    "account_id".to_string(),
    "shared_secret".to_string()
)?;
```

### Custom Configuration

```rust
use doorpasses::{DoorPasses, DoorPassesConfig};
use std::time::Duration;

let config = DoorPassesConfig::new(
    "account_id".to_string(),
    "shared_secret".to_string()
)
.with_base_url("https://api.staging.doorpasses.io".to_string())
.with_timeout(Duration::from_secs(60));

let client = DoorPasses::with_config(config)?;
```

## Usage Examples

### Managing Access Passes

```rust
use doorpasses::{DoorPasses, types::{IssueAccessPassParams, ListAccessPassesParams, AccessPassState}};

// Issue a new pass
let params = IssueAccessPassParams {
    card_template_id: "template_123".to_string(),
    full_name: "Jane Smith".to_string(),
    start_date: "2024-01-01".to_string(),
    expiration_date: "2024-12-31".to_string(),
    employee_id: Some("EMP001".to_string()),
    classification: Some(Classification::FullTime),
    ..Default::default()
};

let pass = client.access_passes.issue(params).await?;

// List active passes
let list_params = ListAccessPassesParams {
    state: Some(AccessPassState::Active),
    limit: Some(10),
    ..Default::default()
};

let passes = client.access_passes.list(Some(list_params)).await?;

// Update a pass
let update_params = UpdateAccessPassParams {
    access_pass_id: pass.id.clone(),
    email: Some("newemail@example.com".to_string()),
    ..Default::default()
};

let updated = client.access_passes.update(update_params).await?;

// Suspend a pass
client.access_passes.suspend(&pass.id).await?;

// Resume a pass
client.access_passes.resume(&pass.id).await?;

// Delete a pass
client.access_passes.delete(&pass.id).await?;
```

### Managing Card Templates (Enterprise)

```rust
use doorpasses::types::{CreateCardTemplateParams, Platform, UseCase, Protocol, CardTemplateDesign};

// Create a template
let design = CardTemplateDesign {
    background_color: Some("#000000".to_string()),
    foreground_color: Some("#FFFFFF".to_string()),
    logo_url: Some("https://example.com/logo.png".to_string()),
    ..Default::default()
};

let params = CreateCardTemplateParams {
    name: "Employee Badge".to_string(),
    platform: Platform::Apple,
    use_case: UseCase::EmployeeBadge,
    protocol: Protocol::Seos,
    design: Some(design),
    support_info: None,
    metadata: None,
};

let template = client.console.create_template(params).await?;

// Read a template
let template = client.console.read_template("template_id").await?;

// Publish a template
client.console.publish_template("template_id").await?;
```

### Event Logging

```rust
use doorpasses::types::ReadEventLogParams;

let params = ReadEventLogParams {
    access_pass_id: Some("pass_123".to_string()),
    event_type: Some("access_granted".to_string()),
    limit: Some(50),
    ..Default::default()
};

let events = client.console.event_log(Some(params)).await?;
```

## API Resources

### Access Passes

- `issue(params)` - Issue a new access pass
- `list(params)` - List access passes with optional filtering
- `update(params)` - Update an existing access pass
- `suspend(id)` - Suspend an access pass
- `resume(id)` - Resume a suspended pass
- `unlink(id)` - Unlink a pass from device
- `delete(id)` - Permanently delete a pass

### Console (Enterprise)

- `create_template(params)` - Create a card template
- `read_template(id)` - Read a card template
- `update_template(params)` - Update a template
- `publish_template(id)` - Publish a template
- `event_log(params)` - Read event logs

## Error Handling

The SDK uses a comprehensive error type:

```rust
use doorpasses::error::{DoorPassesError, Result};

match client.access_passes.issue(params).await {
    Ok(pass) => println!("Success: {}", pass.id),
    Err(DoorPassesError::ApiError { status, message }) => {
        eprintln!("API Error {}: {}", status, message);
    }
    Err(DoorPassesError::AuthError(msg)) => {
        eprintln!("Authentication failed: {}", msg);
    }
    Err(DoorPassesError::NotFound(msg)) => {
        eprintln!("Resource not found: {}", msg);
    }
    Err(e) => eprintln!("Error: {}", e),
}
```

## Development

### Building

```bash
cargo build
```

### Running Tests

```bash
cargo test
```

### Running Examples

```bash
# Set environment variables
export DOORPASSES_ACCOUNT_ID=your_account_id
export DOORPASSES_SHARED_SECRET=your_shared_secret

# Run example
cargo run --example basic_usage
cargo run --example access_passes
```

### Linting

```bash
cargo clippy -- -D warnings
```

### Formatting

```bash
cargo fmt
```

### Documentation

```bash
cargo doc --open
```

## Testing

The SDK includes comprehensive unit tests and integration tests:

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_client_creation

# Run with coverage (requires cargo-tarpaulin)
cargo tarpaulin --out Html
```

## Minimum Supported Rust Version (MSRV)

This crate requires Rust 1.70 or later.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.doorpasses.io)
- 💬 [GitHub Issues](https://github.com/mohammedzamakhan/doorpasses/issues)
- 🌐 [Website](https://doorpasses.io)

## Related SDKs

- [Node.js SDK](../node-sdk)
- [Python SDK](../python-sdk)
- [PHP SDK](../php-sdk)
- [Java SDK](../java-sdk)
- [Go SDK](../go-sdk)
- [C# SDK](../csharp-sdk)
- [Ruby SDK](../ruby-sdk)
