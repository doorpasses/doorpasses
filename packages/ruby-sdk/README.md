# DoorPasses Ruby SDK

Official Ruby SDK for [DoorPasses](https://doorpasses.io) - Digital Access Control Platform for the MENA region.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'doorpasses'
```

And then execute:

```bash
bundle install
```

Or install it yourself as:

```bash
gem install doorpasses
```

## Quick Start

```ruby
require 'doorpasses'

# Initialize the client
client = DoorPasses::Client.new(
  ENV['DOORPASSES_ACCOUNT_ID'],
  ENV['DOORPASSES_SHARED_SECRET']
)

# Issue an access pass
access_pass = client.access_passes.issue(
  card_template_id: '0xd3adb00b5',
  employee_id: '123456789',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone_number: '+1-555-123-4567',
  classification: 'full_time',
  card_number: '12345',
  start_date: '2025-11-02T00:00:00Z',
  expiration_date: '2026-11-02T00:00:00Z'
)

puts "Install URL: #{access_pass['url']}"
```

## Authentication

The DoorPasses SDK uses a dual authentication mechanism:

1. **Account ID** (`X-ACCT-ID` header): A static account identifier
2. **Shared Secret** (`X-PAYLOAD-SIG` header): Used to sign every API request

You can find both keys in your [DoorPasses console](https://console.doorpasses.io) on the API keys page.

The shared secret scheme works as follows:
- For every request, the SDK uses your shared secret as the salt with a base64 encoded version of your payload
- This is passed through a SHA256 hashing function
- The resulting hash is sent in the `X-PAYLOAD-SIG` header

**The SDK handles all authentication automatically** - you just need to provide your credentials when initializing the client.

## Usage

### Access Passes

#### Issue an Access Pass

```ruby
access_pass = client.access_passes.issue(
  card_template_id: '0xd3adb00b5',
  employee_id: '123456789',
  tag_id: 'DDEADB33FB00B5',
  full_name: 'Jane Smith',
  email: 'jane@example.com',
  phone_number: '+1-555-987-6543',
  classification: 'contractor',
  card_number: '54321',
  start_date: '2025-11-02T00:00:00Z',
  expiration_date: '2026-02-02T00:00:00Z',
  employee_photo: '[base64_encoded_image]',
  title: 'Software Engineer',
  metadata: {
    department: 'engineering',
    badge_type: 'contractor'
  }
)
```

#### List Access Passes

```ruby
# List all access passes
passes = client.access_passes.list

# Filter by template
passes = client.access_passes.list(template_id: '0xd3adb00b5')

# Filter by state
passes = client.access_passes.list(state: 'active')
```

#### Update an Access Pass

```ruby
updated_pass = client.access_passes.update(
  card_id: '0xc4rd1d',
  full_name: 'Jane Smith-Doe',
  title: 'Senior Software Engineer'
)
```

#### Suspend an Access Pass

```ruby
client.access_passes.suspend('0xc4rd1d')
```

#### Resume an Access Pass

```ruby
client.access_passes.resume('0xc4rd1d')
```

#### Unlink an Access Pass

```ruby
client.access_passes.unlink('0xc4rd1d')
```

#### Delete an Access Pass

```ruby
client.access_passes.delete('0xc4rd1d')
```

### Console API (Enterprise Only)

#### Create a Card Template

```ruby
template = client.console.create_template(
  name: 'Employee Access Pass',
  platform: 'apple',
  use_case: 'employee_badge',
  protocol: 'desfire',
  allow_on_multiple_devices: true,
  watch_count: 2,
  iphone_count: 3,
  design: {
    background_color: '#FFFFFF',
    label_color: '#000000',
    label_secondary_color: '#333333',
    background_image: '[base64_encoded_image]',
    logo_image: '[base64_encoded_image]',
    icon_image: '[base64_encoded_image]'
  },
  support_info: {
    support_url: 'https://help.yourcompany.com',
    support_phone_number: '+1-555-123-4567',
    support_email: 'support@yourcompany.com',
    privacy_policy_url: 'https://yourcompany.com/privacy',
    terms_and_conditions_url: 'https://yourcompany.com/terms'
  }
)
```

#### Update a Card Template

```ruby
updated_template = client.console.update_template(
  card_template_id: '0xd3adb00b5',
  name: 'Updated Employee Badge',
  allow_on_multiple_devices: true
)
```

#### Read a Card Template

```ruby
template = client.console.read_template('0xd3adb00b5')
```

#### Read Event Log

```ruby
events = client.console.event_log(
  card_template_id: '0xd3adb00b5',
  filters: {
    device: 'mobile',
    start_date: '2025-10-03T00:00:00Z',
    end_date: '2025-11-02T00:00:00Z',
    event_type: 'install'
  }
)
```

#### iOS Preflight

```ruby
response = client.console.ios_preflight(
  card_template_id: '0xt3mp14t3-3x1d',
  access_pass_ex_id: '0xp455-3x1d'
)

puts "Provisioning Credential ID: #{response['provisioningCredentialIdentifier']}"
```

## Configuration

### Custom Base URL

```ruby
client = DoorPasses::Client.new(
  account_id,
  shared_secret,
  base_url: 'https://api.custom.doorpasses.io'
)
```

### Custom Timeout

```ruby
client = DoorPasses::Client.new(
  account_id,
  shared_secret,
  timeout: 60_000 # in milliseconds
)
```

## Error Handling

The SDK raises specific exceptions for different error cases:

```ruby
begin
  access_pass = client.access_passes.issue(params)
rescue DoorPasses::BadRequestError => e
  puts "Invalid request: #{e.message}"
rescue DoorPasses::UnauthorizedError => e
  puts "Authentication failed: #{e.message}"
rescue DoorPasses::ForbiddenError => e
  puts "Access forbidden: #{e.message}"
rescue DoorPasses::NotFoundError => e
  puts "Resource not found: #{e.message}"
rescue DoorPasses::RateLimitError => e
  puts "Rate limit exceeded: #{e.message}"
rescue DoorPasses::ServerError => e
  puts "Server error: #{e.message}"
rescue DoorPasses::DoorPassesError => e
  puts "API error: #{e.message}"
end
```

## Hotel Use Case

For hotel implementations, you can include additional parameters:

```ruby
access_pass = client.access_passes.issue(
  card_template_id: '0xd3adb00b5',
  full_name: 'Guest Name',
  email: 'guest@email.com',
  member_id: 'LOYALTY123',
  membership_status: 'gold',
  is_pass_ready_to_transact: true,
  tile_data: {
    check_in_available_window_start_date_time: '2025-11-02T14:00:00Z',
    check_in_available_window_end_date_time: '2025-11-02T23:00:00Z',
    check_in_url: 'https://hotel.com/checkin',
    is_checked_in: false,
    number_of_rooms_reserved: 1,
    room_numbers: ['101']
  },
  reservations: {
    check_in_date_time: '2025-11-02T15:00:00Z',
    is_checked_in: true,
    number_of_rooms_reserved: 1,
    property_location: 'Dubai Marina',
    property_name: 'Luxury Hotel & Spa',
    property_map_url: 'https://maps.hotel.com',
    property_category: 'travel',
    reservation_end_date_time: '2025-11-05T11:00:00Z',
    reservation_number: 'RES123456',
    reservation_start_date_time: '2025-11-02T15:00:00Z',
    room_numbers: ['101']
  }
)
```

## Development

After checking out the repo, run `bundle install` to install dependencies. Then, run `bundle exec rspec` to run the tests.

To install this gem onto your local machine, run `bundle exec rake install`.

## Testing

```bash
# Run tests
bundle exec rspec

# Run tests with coverage
bundle exec rspec

# Run linter
bundle exec rubocop

# Auto-fix linter issues
bundle exec rubocop -a
```

## Requirements

- Ruby >= 2.7.0
- Faraday >= 2.0

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/mohammedzamakhan/doorpasses.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Support

- 📧 Email: support@doorpasses.io
- 📖 Documentation: https://docs.doorpasses.io
- 🐛 Issue Tracker: https://github.com/mohammedzamakhan/doorpasses/issues

## About DoorPasses

DoorPasses is the leading digital access control platform for the MENA region, enabling organizations to deploy NFC-based access passes on Apple Wallet and Google Wallet.
