# DoorPasses PHP SDK

Official PHP SDK for DoorPasses - Digital Access Control Platform

## Installation

Install the SDK using Composer:

```bash
composer require doorpasses/doorpasses-php
```

## Requirements

- PHP 8.0 or higher
- Composer
- ext-json

## Quick Start

```php
<?php

require 'vendor/autoload.php';

use DoorPasses\Client;

// Initialize the client
$accountId = getenv('DOORPASSES_ACCOUNT_ID');
$sharedSecret = getenv('DOORPASSES_SHARED_SECRET');

$client = new Client($accountId, $sharedSecret);

// Issue an access pass
$accessPass = $client->accessPasses->issue([
    'cardTemplateId' => 'template_123',
    'fullName' => 'John Doe',
    'email' => 'john@example.com',
    'cardNumber' => '12345',
    'startDate' => '2025-11-01T00:00:00Z',
    'expirationDate' => '2026-11-01T00:00:00Z'
]);

echo "Install URL: {$accessPass['url']}\n";
```

## Configuration

You can configure the SDK with custom options:

```php
$client = new Client($accountId, $sharedSecret, [
    'baseUrl' => 'https://api.doorpasses.io',
    'timeout' => 60 // seconds
]);
```

## Usage

### Access Passes

#### Issue an Access Pass

```php
$accessPass = $client->accessPasses->issue([
    'cardTemplateId' => 'template_123',
    'fullName' => 'John Doe',
    'email' => 'john@example.com',
    'phoneNumber' => '+1234567890',
    'cardNumber' => '12345',
    'startDate' => '2025-11-01T00:00:00Z',
    'expirationDate' => '2026-11-01T00:00:00Z',
    'classification' => 'full_time',
    'title' => 'Software Engineer',
    'employeePhoto' => 'base64_encoded_image',
    'metadata' => [
        'department' => 'Engineering',
        'badge_type' => 'employee'
    ]
]);
```

#### List Access Passes

```php
// List all access passes
$passes = $client->accessPasses->list();

// Filter by template ID
$passes = $client->accessPasses->list([
    'templateId' => 'template_123'
]);

// Filter by state
$passes = $client->accessPasses->list([
    'state' => 'active'
]);
```

#### Update an Access Pass

```php
$client->accessPasses->update([
    'accessPassId' => 'pass_123',
    'fullName' => 'Jane Doe',
    'title' => 'Senior Engineer',
    'expirationDate' => '2027-11-01T00:00:00Z'
]);
```

#### Suspend an Access Pass

```php
$client->accessPasses->suspend('pass_123');
```

#### Resume an Access Pass

```php
$client->accessPasses->resume('pass_123');
```

#### Unlink an Access Pass

```php
$client->accessPasses->unlink('pass_123');
```

#### Delete an Access Pass

```php
$client->accessPasses->delete('pass_123');
```

### Console (Enterprise Only)

#### Create a Card Template

```php
$template = $client->console->createTemplate([
    'name' => 'Employee Access Pass',
    'platform' => 'apple',
    'useCase' => 'employee_badge',
    'protocol' => 'desfire',
    'allowOnMultipleDevices' => true,
    'watchCount' => 2,
    'iphoneCount' => 3,
    'design' => [
        'backgroundColor' => '#FFFFFF',
        'labelColor' => '#000000',
        'labelSecondaryColor' => '#333333',
        'backgroundImage' => 'base64_encoded_image',
        'logoImage' => 'base64_encoded_image',
        'iconImage' => 'base64_encoded_image'
    ],
    'supportInfo' => [
        'supportUrl' => 'https://help.yourcompany.com',
        'supportPhoneNumber' => '+1-555-123-4567',
        'supportEmail' => 'support@yourcompany.com',
        'privacyPolicyUrl' => 'https://yourcompany.com/privacy',
        'termsAndConditionsUrl' => 'https://yourcompany.com/terms'
    ],
    'metadata' => [
        'version' => '2.1'
    ]
]);
```

#### Read a Card Template

```php
$template = $client->console->readTemplate('template_123');
```

#### Update a Card Template

```php
$template = $client->console->updateTemplate([
    'cardTemplateId' => 'template_123',
    'name' => 'Updated Employee Access Pass',
    'allowOnMultipleDevices' => true
]);
```

#### Publish a Card Template

```php
$client->console->publishTemplate('template_123');
```

#### Read Event Logs

```php
$events = $client->console->eventLog([
    'cardTemplateId' => 'template_123',
    'filters' => [
        'device' => 'mobile',
        'startDate' => '2025-10-01T00:00:00Z',
        'endDate' => '2025-11-01T00:00:00Z',
        'eventType' => 'install'
    ]
]);
```

#### iOS Preflight

```php
$response = $client->console->iosPreflight([
    'cardTemplateId' => 'template_123',
    'accessPassExId' => 'pass_ex_123'
]);
```

## Error Handling

The SDK throws exceptions for errors:

```php
try {
    $client->accessPasses->issue($params);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test:coverage
```

Run static analysis:

```bash
composer analyse
```

## Development

### Install dependencies

```bash
composer install
```

### Run tests

```bash
composer test
```

## Support

- Documentation: [https://docs.doorpasses.io](https://docs.doorpasses.io)
- Issues: [https://github.com/mohammedzamakhan/doorpasses/issues](https://github.com/mohammedzamakhan/doorpasses/issues)

## License

MIT License - see LICENSE file for details

## About DoorPasses

DoorPasses is a comprehensive digital access control platform that enables seamless integration of NFC-enabled access passes with Apple Wallet and Google Wallet for the MENA region.
