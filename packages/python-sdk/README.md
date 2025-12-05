# DoorPasses Python SDK

Official Python SDK for [DoorPasses](https://doorpasses.io) - Digital Access Control Platform for the MENA region.

[![PyPI version](https://img.shields.io/pypi/v/doorpasses.svg)](https://pypi.org/project/doorpasses/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Versions](https://img.shields.io/pypi/pyversions/doorpasses.svg)](https://pypi.org/project/doorpasses/)

## Installation

```bash
pip install doorpasses
```

## Quick Start

```python
from doorpasses import DoorPasses
import os

account_id = os.environ.get("DOORPASSES_ACCOUNT_ID")
shared_secret = os.environ.get("DOORPASSES_SHARED_SECRET")

client = DoorPasses(account_id, shared_secret)

# Issue an access pass
access_pass = client.access_passes.issue({
    "cardTemplateId": "template_123",
    "fullName": "Ahmed Al-Rashid",
    "email": "ahmed@company.sa",
    "phoneNumber": "+966501234567",
    "cardNumber": "12345",
    "startDate": "2025-11-01T00:00:00Z",
    "expirationDate": "2026-11-01T00:00:00Z"
})

print(f"Access pass created: {access_pass['url']}")
```

## Authentication

DoorPasses uses a dual authentication mechanism:

1. **X-ACCT-ID header**: Your static account ID
2. **X-PAYLOAD-SIG header**: A SHA256 signature of your payload using your shared secret

You can find both keys in your DoorPasses console on the API keys page. The SDK handles authentication automatically.

## Usage

### Initialize the Client

```python
from doorpasses import DoorPasses

# Basic initialization
client = DoorPasses(account_id, shared_secret)

# With custom configuration
client = DoorPasses(
    account_id,
    shared_secret,
    base_url="https://api.doorpasses.io",
    timeout=60000  # 60 seconds
)
```

### Access Passes

#### Issue an Access Pass

```python
from datetime import datetime, timedelta

access_pass = client.access_passes.issue({
    "cardTemplateId": "template_123",
    "employeeId": "emp_456",
    "fullName": "Ahmed Al-Rashid",
    "email": "ahmed@company.sa",
    "phoneNumber": "+966501234567",
    "classification": "full_time",
    "cardNumber": "12345",
    "siteCode": "100",
    "startDate": datetime.now().isoformat(),
    "expirationDate": (datetime.now() + timedelta(days=365)).isoformat(),
    "title": "Engineering Manager",
    "employeePhoto": "[base64_encoded_image]",
    "metadata": {
        "department": "engineering",
        "badgeType": "permanent"
    }
})

print(f"Install URL: {access_pass['url']}")
```

#### List Access Passes

```python
# List all access passes for a template
passes = client.access_passes.list({
    "templateId": "template_123"
})

# Filter by state
active_passes = client.access_passes.list({
    "state": "active"
})

# List all
all_passes = client.access_passes.list()
```

#### Update an Access Pass

```python
updated_pass = client.access_passes.update({
    "accessPassId": "pass_123",
    "fullName": "Ahmed Al-Rashid (Updated)",
    "title": "Senior Engineering Manager",
    "expirationDate": "2027-01-01T00:00:00Z"
})
```

#### Suspend an Access Pass

```python
result = client.access_passes.suspend("pass_123")
print("Access pass suspended")
```

#### Resume an Access Pass

```python
result = client.access_passes.resume("pass_123")
print("Access pass resumed")
```

#### Unlink an Access Pass

```python
result = client.access_passes.unlink("pass_123")
print("Access pass unlinked from device")
```

#### Delete an Access Pass

```python
result = client.access_passes.delete("pass_123")
print("Access pass deleted")
```

### Card Templates (Enterprise Only)

#### Create a Card Template

```python
template = client.console.create_template({
    "name": "Employee Badge - Corporate",
    "platform": "apple",
    "useCase": "employee_badge",
    "protocol": "desfire",
    "allowOnMultipleDevices": True,
    "watchCount": 2,
    "iphoneCount": 3,
    "design": {
        "backgroundColor": "#FFFFFF",
        "labelColor": "#000000",
        "labelSecondaryColor": "#333333",
        "backgroundImage": "[base64_encoded_image]",
        "logoImage": "[base64_encoded_image]",
        "iconImage": "[base64_encoded_image]"
    },
    "supportInfo": {
        "supportUrl": "https://help.company.sa",
        "supportPhoneNumber": "+966112345678",
        "supportEmail": "support@company.sa",
        "privacyPolicyUrl": "https://company.sa/privacy",
        "termsAndConditionsUrl": "https://company.sa/terms"
    },
    "metadata": {
        "version": "1.0",
        "environment": "production"
    }
})

print(f"Template created: {template['id']}")
```

#### Read a Card Template

```python
template = client.console.read_template("template_123")
print(f"Template: {template['name']}")
```

#### Update a Card Template

```python
updated_template = client.console.update_template({
    "cardTemplateId": "template_123",
    "name": "Employee Badge - Corporate (Updated)",
    "allowOnMultipleDevices": True,
    "watchCount": 3,
    "supportInfo": {
        "supportEmail": "newsupport@company.sa"
    }
})
```

#### Publish a Card Template

```python
result = client.console.publish_template("template_123")
print("Template published")
```

#### Read Event Logs

```python
from datetime import datetime, timedelta

# Get all events
events = client.console.event_log({
    "cardTemplateId": "template_123"
})

# Filter events
filtered_events = client.console.event_log({
    "cardTemplateId": "template_123",
    "filters": {
        "device": "mobile",
        "startDate": (datetime.now() - timedelta(days=30)).isoformat(),
        "endDate": datetime.now().isoformat(),
        "eventType": "install"
    }
})

for event in events:
    print(f"Event: {event['type']} at {event['timestamp']}")
```

### Health Check

```python
health = client.health()
print(f"API Status: {health['status']}")
```

## Error Handling

The SDK raises exceptions when API requests fail:

```python
try:
    access_pass = client.access_passes.issue({
        "cardTemplateId": "invalid_template",
        "fullName": "Test User",
        "cardNumber": "12345",
        "startDate": datetime.now().isoformat(),
        "expirationDate": (datetime.now() + timedelta(days=365)).isoformat()
    })
except Exception as error:
    print(f"Error: {error}")
    # Handle error appropriately
```

## Type Hints

The SDK includes comprehensive type hints for better IDE support:

```python
from doorpasses import DoorPasses, IssueAccessPassParams, AccessPass
from typing import Dict

params: IssueAccessPassParams = {
    "cardTemplateId": "template_123",
    "fullName": "John Doe",
    "cardNumber": "12345",
    "startDate": "2025-11-01T00:00:00Z",
    "expirationDate": "2026-11-01T00:00:00Z"
}

access_pass: AccessPass = client.access_passes.issue(params)
```

## Environment Variables

It's recommended to store your credentials in environment variables:

```bash
# .env
DOORPASSES_ACCOUNT_ID=your_account_id
DOORPASSES_SHARED_SECRET=your_shared_secret
```

Then use them in your code:

```python
from doorpasses import DoorPasses
import os
from dotenv import load_dotenv

load_dotenv()

client = DoorPasses(
    os.environ.get("DOORPASSES_ACCOUNT_ID"),
    os.environ.get("DOORPASSES_SHARED_SECRET")
)
```

## Development

### Install Dependencies

```bash
cd packages/python-sdk
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest
```

### Run Tests with Coverage

```bash
pytest --cov=doorpasses --cov-report=html
```

### Format Code

```bash
black doorpasses tests
```

### Type Checking

```bash
mypy doorpasses
```

### Linting

```bash
ruff check doorpasses tests
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
