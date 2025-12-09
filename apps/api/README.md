# DoorPasses API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Access Pass Management](#access-pass-management)
3. [Card Template Management](#card-template-management)
4. [Webhooks](#webhooks)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

DoorPasses API uses a dual authentication mechanism for enhanced security:

### Headers Required

```
X-ACCT-ID: Your account ID (provided during onboarding)
X-PAYLOAD-SIG: SHA256 signature of the payload
```

### Generating the Signature

The signature is generated using SHA256 hash of the concatenation of:
- Your shared secret
- Base64-encoded JSON payload

#### Example (Node.js)

```javascript
const crypto = require('crypto');

function generatePayloadSignature(sharedSecret, payload) {
  // Convert payload to JSON string
  const jsonPayload = JSON.stringify(payload);

  // Base64 encode the payload
  const base64Payload = Buffer.from(jsonPayload).toString('base64');

  // Create SHA256 hash
  const hash = crypto.createHash('sha256');
  hash.update(sharedSecret + base64Payload);

  // Return hex digest
  return hash.digest('hex');
}

// Example usage
const sharedSecret = 'your-shared-secret-here';
const payload = {
  card_template_id: '0xt3mp14t3',
  full_name: 'Ahmed Al-Mansouri',
  email: 'ahmed@company.com',
  // ... other fields
};

const signature = generatePayloadSignature(sharedSecret, payload);
console.log('Signature:', signature);
```

#### Example (Python)

```python
import hashlib
import base64
import json

def generate_payload_signature(shared_secret, payload):
    # Convert payload to JSON string
    json_payload = json.dumps(payload, separators=(',', ':'))

    # Base64 encode the payload
    base64_payload = base64.b64encode(json_payload.encode()).decode()

    # Create SHA256 hash
    hash_input = shared_secret + base64_payload
    signature = hashlib.sha256(hash_input.encode()).hexdigest()

    return signature

# Example usage
shared_secret = 'your-shared-secret-here'
payload = {
    'card_template_id': '0xt3mp14t3',
    'full_name': 'Ahmed Al-Mansouri',
    'email': 'ahmed@company.com',
    # ... other fields
}

signature = generate_payload_signature(shared_secret, payload)
print('Signature:', signature)
```

### GET Requests

For GET requests, include the payload as a query parameter:

```bash
GET /v1/access-passes?template_id=0xt3mp14t3&sig_payload={"id":"0xt3mp14t3"}
```

The `sig_payload` should be URL-encoded JSON that is used for signature generation.

---

## Access Pass Management

### Issue Access Pass

Create a new digital access pass for an employee or guest.

**Endpoint:** `POST /v1/access-passes`

**Authentication:** Required

**Request Body:**

```json
{
  "card_template_id": "0xt3mp14t3",
  "employee_id": "EMP-001",
  "full_name": "Ahmed Al-Mansouri",
  "email": "ahmed@company.com",
  "phone_number": "+971501234567",
  "classification": "full_time",
  "title": "Senior Engineer",
  "site_code": "123",
  "card_number": "45678",
  "start_date": "2025-01-01T00:00:00Z",
  "expiration_date": "2025-12-31T23:59:59Z",
  "employee_photo": "base64-encoded-image-here",
  "metadata": {
    "department": "Engineering",
    "location": "Dubai Office"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "install_url": "https://doorpasses.com/install/0xp4551d",
    "state": "PENDING",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### List Access Passes

Retrieve a list of access passes for a specific card template.

**Endpoint:** `GET /v1/access-passes`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| template_id | string | Yes | Card template ID |
| state | string | No | Filter by state (PENDING, ACTIVE, SUSPENDED, UNLINKED, DELETED, EXPIRED) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |

**Example Request:**

```bash
GET /v1/access-passes?template_id=0xt3mp14t3&state=ACTIVE&page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "exId": "0xp4551d",
        "fullName": "Ahmed Al-Mansouri",
        "email": "ahmed@company.com",
        "employeeId": "EMP-001",
        "state": "ACTIVE",
        "startDate": "2025-01-01T00:00:00Z",
        "expirationDate": "2025-12-31T23:59:59Z",
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Update Access Pass

Update information on an existing access pass.

**Endpoint:** `PATCH /v1/access-passes/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "full_name": "Ahmed Abdullah Al-Mansouri",
  "title": "Lead Engineer",
  "expiration_date": "2026-12-31T23:59:59Z",
  "metadata": {
    "department": "Engineering",
    "location": "Abu Dhabi Office"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "state": "ACTIVE",
    "updated_at": "2025-01-16T14:20:00Z"
  }
}
```

### Suspend Access Pass

Temporarily disable an access pass.

**Endpoint:** `POST /v1/access-passes/:id/suspend`

**Authentication:** Required

**Request Body:** Empty or `{"id": "0xp4551d"}` for signature

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "state": "SUSPENDED",
    "updated_at": "2025-01-16T14:25:00Z"
  }
}
```

### Resume Access Pass

Re-enable a previously suspended access pass.

**Endpoint:** `POST /v1/access-passes/:id/resume`

**Authentication:** Required

**Request Body:** Empty or `{"id": "0xp4551d"}` for signature

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "state": "ACTIVE",
    "updated_at": "2025-01-16T14:30:00Z"
  }
}
```

### Unlink Access Pass

Remove the access pass from the current device.

**Endpoint:** `POST /v1/access-passes/:id/unlink`

**Authentication:** Required

**Request Body:** Empty or `{"id": "0xp4551d"}` for signature

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "state": "UNLINKED",
    "updated_at": "2025-01-16T14:35:00Z"
  }
}
```

### Delete Access Pass

Permanently delete an access pass.

**Endpoint:** `POST /v1/access-passes/:id/delete`

**Authentication:** Required

**Request Body:** Empty or `{"id": "0xp4551d"}` for signature

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xp4551d",
    "state": "DELETED",
    "updated_at": "2025-01-16T14:40:00Z"
  }
}
```

---

## Card Template Management

**Note:** All card template endpoints require **Enterprise tier** access.

### Create Card Template

Create a new card template for issuing access passes.

**Endpoint:** `POST /v1/console/card-templates`

**Authentication:** Required (Enterprise)

**Request Body:**

```json
{
  "name": "Employee Access Badge",
  "platform": "APPLE",
  "use_case": "EMPLOYEE_BADGE",
  "protocol": "DESFIRE",
  "allow_on_multiple_devices": true,
  "watch_count": 2,
  "iphone_count": 3,
  "design": {
    "background_color": "#FFFFFF",
    "label_color": "#000000",
    "label_secondary_color": "#666666",
    "background_image": "base64-encoded-image",
    "logo_image": "base64-encoded-logo",
    "icon_image": "base64-encoded-icon"
  },
  "support_info": {
    "support_url": "https://help.yourcompany.com",
    "support_phone_number": "+971-4-1234567",
    "support_email": "support@yourcompany.com",
    "privacy_policy_url": "https://yourcompany.com/privacy",
    "terms_and_conditions_url": "https://yourcompany.com/terms"
  },
  "metadata": {
    "version": "1.0",
    "created_by": "admin"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xt3mp14t3",
    "name": "Employee Access Badge",
    "platform": "APPLE",
    "use_case": "EMPLOYEE_BADGE",
    "protocol": "DESFIRE",
    "publish_status": "DRAFT",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### Read Card Template

Retrieve details of a card template.

**Endpoint:** `GET /v1/console/card-templates/:id`

**Authentication:** Required (Enterprise)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xt3mp14t3",
    "name": "Employee Access Badge",
    "platform": "APPLE",
    "use_case": "EMPLOYEE_BADGE",
    "protocol": "DESFIRE",
    "allow_on_multiple_devices": true,
    "watch_count": 2,
    "iphone_count": 3,
    "design": {
      "background_color": "#FFFFFF",
      "label_color": "#000000",
      "label_secondary_color": "#666666"
    },
    "support_info": {
      "support_url": "https://help.yourcompany.com",
      "support_phone_number": "+971-4-1234567",
      "support_email": "support@yourcompany.com",
      "privacy_policy_url": "https://yourcompany.com/privacy",
      "terms_and_conditions_url": "https://yourcompany.com/terms"
    },
    "publish_status": "PUBLISHED",
    "published_at": "2025-01-15T12:00:00Z",
    "metadata": {
      "version": "1.0",
      "created_by": "admin"
    },
    "access_passes_count": 150,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  }
}
```

### Update Card Template

Update an existing card template.

**Endpoint:** `PATCH /v1/console/card-templates/:id`

**Authentication:** Required (Enterprise)

**Request Body:**

```json
{
  "name": "Updated Employee Access Badge",
  "support_info": {
    "support_email": "newsupport@yourcompany.com"
  },
  "metadata": {
    "version": "1.1",
    "updated_by": "admin"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "0xt3mp14t3",
    "name": "Updated Employee Access Badge",
    "updated_at": "2025-01-16T15:00:00Z"
  }
}
```

### Read Event Logs

Retrieve event logs for a card template.

**Endpoint:** `GET /v1/console/card-templates/:id/logs`

**Authentication:** Required (Enterprise)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| device | string | Filter by device (mobile, watch) |
| start_date | datetime | Filter events after this date (ISO8601) |
| end_date | datetime | Filter events before this date (ISO8601) |
| event_type | string | Filter by event type (issue, install, update, suspend, resume, unlink) |
| page | number | Page number |
| limit | number | Items per page |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "log-id-123",
        "event_type": "ACCESS_PASS_ISSUED",
        "device": "mobile",
        "access_pass": {
          "id": "0xp4551d",
          "full_name": "Ahmed Al-Mansouri",
          "employee_id": "EMP-001"
        },
        "metadata": null,
        "created_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 500,
      "totalPages": 5
    }
  }
}
```

---

## Webhooks

DoorPasses sends webhook notifications for various events using the CloudEvents specification.

### CloudEvents Format

All webhook payloads follow the CloudEvents 1.0 specification:

```json
{
  "specversion": "1.0",
  "id": "unique-event-id-12345",
  "source": "doorpasses",
  "type": "ag.access_pass.issued",
  "datacontenttype": "application/json",
  "time": "2025-01-15T10:30:00Z",
  "data": {
    "access_pass_id": "0xp4551d",
    "protocol": "DESFIRE",
    "metadata": {}
  }
}
```

### Event Types

#### Access Pass Events

- `ag.access_pass.issued` - Access pass created
- `ag.access_pass.activated` - Access pass activated on device
- `ag.access_pass.updated` - Access pass information updated
- `ag.access_pass.suspended` - Access pass suspended
- `ag.access_pass.resumed` - Access pass resumed
- `ag.access_pass.unlinked` - Access pass unlinked from device
- `ag.access_pass.deleted` - Access pass deleted
- `ag.access_pass.expired` - Access pass expired

#### Card Template Events

- `ag.card_template.created` - Card template created
- `ag.card_template.updated` - Card template updated
- `ag.card_template.published` - Card template published

### Webhook Authentication

Webhooks are authenticated using a Bearer token that you provide when registering the webhook:

```
Authorization: Bearer your-webhook-secret
```

### Webhook Delivery

- Webhooks are sent with a timeout of 10 seconds
- Failed deliveries are retried up to 10 times with exponential backoff
- Retry attempts continue for up to 6 hours
- Your endpoint should return HTTP 200 or 201 to acknowledge receipt

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional details if available"
    }
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_ENTRY | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Sensitive operations**: 20 requests per 15 minutes per IP

Rate limit information is included in response headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642252800
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP, please try again later"
  }
}
```

---

## Support

For API support:
- Email: api-support@doorpasses.com
- Documentation: https://docs.doorpasses.com
- Status Page: https://status.doorpasses.com
