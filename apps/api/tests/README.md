# Integration Tests

This directory contains integration tests for the DoorPasses API using Vitest and Supertest.

## Overview

The integration tests verify the complete API functionality including:
- Access Pass APIs (issue, list, update, suspend, resume, unlink, delete)
- Card Template APIs (create, read, update, publish, logs)
- Wallet APIs (Apple Wallet & Google Wallet integration)
- Basic application endpoints (health check, welcome)

## Test Structure

```
tests/
├── integration/           # Integration test files
│   ├── access-pass.test.ts   # Access Pass API tests
│   ├── card-template.test.ts # Card Template API tests
│   ├── wallet.test.ts        # Wallet API tests
│   └── app.test.ts           # Basic app tests
├── helpers/               # Test utilities
│   └── test-utils.ts         # Helper functions for testing
├── setup.vitest.ts       # Vitest setup and teardown
└── README.md             # This file
```

## Prerequisites

Before running the tests, ensure you have:

1. **PostgreSQL Database**: Running instance with test database
2. **Redis**: Running instance for caching
3. **Environment Variables**: Properly configured `.env` file

### Required Environment Variables

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/doorpasses_test
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=your-test-secret
CORS_ORIGIN=*
```

## Running Tests

### Run all integration tests

```bash
npm run test:integration
```

### Run tests in watch mode

```bash
npm run test:integration:watch
```

### Run tests with coverage

```bash
npm run test:integration:coverage
```

### Run tests with UI

```bash
npm run test:integration:ui
```

### Run specific test file

```bash
npx vitest tests/integration/access-pass.test.ts
```

### Run tests matching pattern

```bash
npx vitest -t "should issue a new access pass"
```

## Test Utilities

The `test-utils.ts` file provides helper functions:

### `createTestAccount(tier?: AccountTier)`
Creates a test account with specified tier (default: STANDARD)

### `generateAuthHeaders(accountId, sharedSecret, payload?)`
Generates authentication headers for API requests

### `generateAuthHeadersForGet(accountId, sharedSecret, sigPayload?)`
Generates authentication headers with sig_payload for GET requests

### `createTestCardTemplate(accountId)`
Creates a draft card template for testing

### `createPublishedCardTemplate(accountId)`
Creates a published card template for testing

### `createTestAccessPass(accountId, cardTemplateId, data?)`
Creates an access pass for testing

### `cleanupTestAccount(accountId)`
Cleans up all data associated with a test account

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import { createTestAccount, generateAuthHeaders, cleanupTestAccount } from '../helpers/test-utils';

const app = createApp();

describe('My API Tests', () => {
  let testAccount: any;

  beforeAll(async () => {
    testAccount = await createTestAccount('STANDARD');
  });

  afterAll(async () => {
    await cleanupTestAccount(testAccount.account.accountId);
  });

  it('should do something', async () => {
    const payload = { key: 'value' };
    const headers = generateAuthHeaders(
      testAccount.accountId,
      testAccount.sharedSecret,
      payload
    );

    const response = await request(app)
      .post('/v1/endpoint')
      .set(headers)
      .send(payload)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });
});
```

### Testing Authenticated Endpoints

For POST/PATCH/PUT requests:
```typescript
const payload = { data: 'value' };
const headers = generateAuthHeaders(accountId, sharedSecret, payload);

await request(app)
  .post('/v1/endpoint')
  .set(headers)
  .send(payload);
```

For GET requests:
```typescript
const sigPayload = { param: 'value' };
const { headers, query } = generateAuthHeadersForGet(accountId, sharedSecret, sigPayload);

await request(app)
  .get('/v1/endpoint')
  .set(headers)
  .query({ ...query, param: 'value' });
```

## GitHub Actions

The integration tests run automatically on:
- Pull requests to `main` branch
- Pushes to `main` branch

The workflow includes:
1. Setting up PostgreSQL and Redis services
2. Installing dependencies
3. Running database migrations
4. Running integration tests
5. Running linting and build checks
6. Uploading coverage reports (if configured)

See `.github/workflows/integration-tests.yml` for details.

## Troubleshooting

### Database Connection Issues

If tests fail with database connection errors:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in your `.env` file
3. Run migrations: `npm run prisma:migrate`

### Redis Connection Issues

If tests fail with Redis connection errors:
1. Ensure Redis is running: `redis-cli ping`
2. Check Redis configuration in `.env`

### Test Cleanup Issues

If tests fail due to existing data:
1. Clear test database: `npx prisma migrate reset`
2. Ensure `afterAll` hooks are properly cleaning up test data

### Rate Limiting Issues

If tests fail due to rate limiting:
1. Use separate test accounts for each test suite
2. Consider increasing rate limits for test environment
3. Add delays between requests if needed

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `afterAll` hooks
3. **Authentication**: Use helper functions for generating auth headers
4. **Assertions**: Use descriptive expectations and check all relevant fields
5. **Error Cases**: Test both success and failure scenarios
6. **Performance**: Keep tests fast by mocking external services when possible

## Coverage

To view coverage reports after running tests with coverage:

```bash
npm run test:integration:coverage
open coverage/index.html
```

Target coverage goals:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%
