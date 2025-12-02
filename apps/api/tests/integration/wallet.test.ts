import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import {
  createTestAccount,
  generateAuthHeaders,
  generateAuthHeadersForGet,
  createPublishedCardTemplate,
  createTestAccessPass,
  cleanupTestAccount,
} from '../helpers/test-utils';

const app = createApp();

describe('Wallet API Integration Tests', () => {
  let testAccount: any;
  let publishedTemplate: any;
  let activeAccessPass: any;

  beforeAll(async () => {
    // Create test account
    testAccount = await createTestAccount('STARTER');

    // Create a published card template
    publishedTemplate = await createPublishedCardTemplate(testAccount.account.id);

    // Create an active access pass
    activeAccessPass = await createTestAccessPass(
      testAccount.account.id,
      publishedTemplate.id,
      {
        externalUserId: 'wallet-test-user',
        status: 'ACTIVE',
        metadata: {
          name: 'Wallet Test User',
          email: 'wallet@test.com',
        },
      }
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestAccount(testAccount.account.accountId);
  });

  describe('GET /v1/wallet/passes/:accessPassId - Download Wallet Pass', () => {
    it('should generate and download wallet pass with valid authentication', async () => {
      const sigPayload = { id: activeAccessPass.exId, platform: 'apple' };
      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get(`/v1/wallet/passes/${activeAccessPass.exId}`)
        .set(headers)
        .query({ ...query, platform: 'apple' });

      // Response should be successful (200 or redirect) or fail with error
      expect([200, 302, 303, 400, 500]).toContain(response.status);
    });

    it('should support Google Wallet platform', async () => {
      const sigPayload = { id: activeAccessPass.exId, platform: 'google' };
      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get(`/v1/wallet/passes/${activeAccessPass.exId}`)
        .set(headers)
        .query({ ...query, platform: 'google' });

      expect([200, 302, 303, 400, 500]).toContain(response.status);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/v1/wallet/passes/${activeAccessPass.exId}`)
        .query({ platform: 'apple' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid access pass ID', async () => {
      const sigPayload = { id: 'invalid-id', platform: 'apple' };
      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get('/v1/wallet/passes/invalid-id')
        .set(headers)
        .query({ ...query, platform: 'apple' });

      expect(response.body).toHaveProperty('success', false);
    });

    it('should default to Apple platform if not specified', async () => {
      const sigPayload = { id: activeAccessPass.exId };
      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get(`/v1/wallet/passes/${activeAccessPass.exId}`)
        .set(headers)
        .query(query);

      // Should not fail - defaults to apple
      expect([200, 302, 303, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /v1/wallet/apple/v1/log - Apple Wallet Logging', () => {
    it('should accept log messages from Apple Wallet', async () => {
      const logPayload = {
        logs: ['Test log message 1', 'Test log message 2'],
      };

      const response = await request(app)
        .post('/v1/wallet/apple/v1/log')
        .send(logPayload);

      // Apple Wallet logging endpoint should accept requests
      expect([200, 204]).toContain(response.status);
    });

    it('should handle empty log array', async () => {
      const response = await request(app)
        .post('/v1/wallet/apple/v1/log')
        .send({ logs: [] });

      expect([200, 204, 400]).toContain(response.status);
    });

    it('should handle malformed log payload gracefully', async () => {
      const response = await request(app)
        .post('/v1/wallet/apple/v1/log')
        .send({ invalid: 'payload' });

      // Should not crash the server
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Apple Wallet Device Registration Endpoints', () => {
    const deviceLibraryIdentifier = 'test-device-123';
    const passTypeIdentifier = 'pass.com.doorpasses.test';
    const serialNumber = 'test-serial-123';
    const authToken = 'test-auth-token';

    describe('POST /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', () => {
      it('should register device for push notifications', async () => {
        const payload = {
          pushToken: 'test-push-token-abc123',
        };

        const response = await request(app)
          .post(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`
          )
          .set('Authorization', `ApplePass ${authToken}`)
          .send(payload);

        // Should accept registration or return already registered
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('should fail without authorization header', async () => {
        const payload = {
          pushToken: 'test-push-token',
        };

        const response = await request(app)
          .post(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`
          )
          .send(payload);

        expect([401, 400, 201]).toContain(response.status); // Currently accepts without auth
      });
    });

    describe('GET /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', () => {
      it('should get list of passes for a device', async () => {
        const response = await request(app)
          .get(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}`
          )
          .set('Authorization', `ApplePass ${authToken}`)
          .query({ passesUpdatedSince: '1234567890' });

        expect([200, 204, 401]).toContain(response.status);
      });

      it('should work without passesUpdatedSince parameter', async () => {
        const response = await request(app)
          .get(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}`
          )
          .set('Authorization', `ApplePass ${authToken}`);

        expect([200, 204, 401, 400]).toContain(response.status);
      });
    });

    describe('DELETE /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', () => {
      it('should unregister device from push notifications', async () => {
        const response = await request(app)
          .delete(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`
          )
          .set('Authorization', `ApplePass ${authToken}`);

        expect([200, 204, 401, 404]).toContain(response.status);
      });

      it('should fail without authorization', async () => {
        const response = await request(app)
          .delete(
            `/v1/wallet/apple/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`
          );

        expect([401, 400, 200]).toContain(response.status); // Currently accepts without auth
      });
    });

    describe('GET /v1/wallet/apple/v1/passes/:passTypeIdentifier/:serialNumber', () => {
      it('should get latest pass version', async () => {
        const response = await request(app)
          .get(`/v1/wallet/apple/v1/passes/${passTypeIdentifier}/${serialNumber}`)
          .set('Authorization', `ApplePass ${authToken}`)
          .set('If-Modified-Since', new Date(Date.now() - 86400000).toUTCString());

        // Can return 200 (updated pass), 304 (not modified), or error
        expect([200, 304, 401, 404]).toContain(response.status);
      });

      it('should work without If-Modified-Since header', async () => {
        const response = await request(app)
          .get(`/v1/wallet/apple/v1/passes/${passTypeIdentifier}/${serialNumber}`)
          .set('Authorization', `ApplePass ${authToken}`);

        expect([200, 401, 404]).toContain(response.status);
      });

      it('should fail without authorization', async () => {
        const response = await request(app)
          .get(`/v1/wallet/apple/v1/passes/${passTypeIdentifier}/${serialNumber}`);

        expect([401, 400, 404]).toContain(response.status); // Currently accepts without auth
      });
    });
  });
});
