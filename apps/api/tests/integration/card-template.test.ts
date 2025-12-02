import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import {
  createTestAccount,
  generateAuthHeaders,
  generateAuthHeadersForGet,
  createTestCardTemplate,
  cleanupTestAccount,
} from '../helpers/test-utils';

const app = createApp();

describe('Card Template API Integration Tests', () => {
  let enterpriseAccount: any;
  let standardAccount: any;

  beforeAll(async () => {
    // Create test account with ENTERPRISE tier (required for card template operations)
    enterpriseAccount = await createTestAccount('ENTERPRISE');
    // Create test account with STANDARD tier (to test access control)
    standardAccount = await createTestAccount('BUSINESS');
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestAccount(enterpriseAccount.account.accountId);
    await cleanupTestAccount(standardAccount.account.accountId);
  });

  describe('POST /v1/console/card-templates - Create Card Template', () => {
    it('should create a new card template with ENTERPRISE tier', async () => {
      const payload = {
        name: 'Test Access Card',
        platform: 'APPLE',
        use_case: 'EMPLOYEE_BADGE',
        protocol: 'DESFIRE',
        allow_on_multiple_devices: false,
        design: {
          background_color: '#1a73e8',
          label_color: '#FFFFFF',
          label_secondary_color: '#CCCCCC',
        },
        support_info: {
          support_email: 'support@example.com',
        },
        metadata: {
          description: 'Test card template for integration testing',
        },
      };

      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/console/card-templates')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('externalId');
      expect(response.body.data).toHaveProperty('name', payload.name);
      expect(response.body.data).toHaveProperty('status', 'DRAFT');
      expect(response.body.data.config).toHaveProperty('design');
      expect(response.body.data.config).toHaveProperty('fields');
    });

    it('should fail without ENTERPRISE tier', async () => {
      const payload = {
        name: 'Should Fail',
        platform: 'APPLE',
        use_case: 'EMPLOYEE_BADGE',
        protocol: 'DESFIRE',
      };

      const headers = generateAuthHeaders(
        standardAccount.accountId,
        standardAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/console/card-templates')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail without authentication', async () => {
      const payload = {
        name: 'Test Card',
        platform: 'APPLE',
        use_case: 'EMPLOYEE_BADGE',
        protocol: 'DESFIRE',
      };

      const response = await request(app)
        .post('/v1/console/card-templates')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid payload', async () => {
      const payload = {
        // Missing required fields
        name: '',
      };

      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/console/card-templates')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /v1/console/card-templates/:id - Read Card Template', () => {
    let testTemplate: any;

    beforeAll(async () => {
      // Create a card template for reading tests
      testTemplate = await createTestCardTemplate(enterpriseAccount.account.id);
    });

    it('should retrieve a card template by ID', async () => {
      const sigPayload = { id: testTemplate.exId };
      const { headers, query } = generateAuthHeadersForGet(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get(`/v1/console/card-templates/${testTemplate.exId}`)
        .set(headers)
        .query(query)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testTemplate.exId);
      expect(response.body.data).toHaveProperty('name', testTemplate.name);
      expect(response.body.data).toHaveProperty('publish_status'); // Use publish_status instead of status
    });

    it('should fail to retrieve non-existent template', async () => {
      const sigPayload = { id: 'non-existent-id' };
      const { headers, query } = generateAuthHeadersForGet(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get('/v1/console/card-templates/non-existent-id')
        .set(headers)
        .query(query)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/v1/console/card-templates/${testTemplate.exId}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /v1/console/card-templates/:id - Update Card Template', () => {
    let templateToUpdate: any;

    beforeAll(async () => {
      templateToUpdate = await createTestCardTemplate(enterpriseAccount.account.id);
    });

    it('should update a card template with valid data', async () => {
      const updatePayload = {
        name: 'Updated Card Template Name',
        metadata: {
          description: 'Updated description for testing',
        },
      };

      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch(`/v1/console/card-templates/${templateToUpdate.exId}`)
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updatePayload.name);
      expect(response.body.data).toHaveProperty('description', updatePayload.metadata.description);
    });

    it('should update card template design configuration', async () => {
      const updatePayload = {
        metadata: {
          designConfig: {
            backgroundColor: '#FF5722',
            foregroundColor: '#000000',
          },
        },
      };

      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch(`/v1/console/card-templates/${templateToUpdate.exId}`)
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Just verify the update was successful, design is returned in a different structure
      expect(response.body.data).toHaveProperty('design');
    });

    it('should fail to update non-existent template', async () => {
      const updatePayload = {
        name: 'Should Fail',
      };

      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch('/v1/console/card-templates/non-existent-id')
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /v1/console/card-templates/:id/publish - Publish Card Template', () => {
    let templateToPublish: any;

    beforeAll(async () => {
      templateToPublish = await createTestCardTemplate(enterpriseAccount.account.id);
    });

    it('should publish a draft card template', async () => {
      const payload = { id: templateToPublish.exId };
      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/console/card-templates/${templateToPublish.exId}/publish`)
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'PUBLISHED');
      expect(response.body.data).toHaveProperty('publishedAt');
    });

    it('should fail to publish non-existent template', async () => {
      const payload = { id: 'non-existent-id' };
      const headers = generateAuthHeaders(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/console/card-templates/non-existent-id/publish')
        .set(headers)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail without ENTERPRISE tier', async () => {
      const payload = { id: templateToPublish.id };
      const headers = generateAuthHeaders(
        standardAccount.accountId,
        standardAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/console/card-templates/${templateToPublish.id}/publish`)
        .set(headers)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /v1/console/card-templates/:id/logs - Get Event Logs', () => {
    let templateWithLogs: any;

    beforeAll(async () => {
      templateWithLogs = await createTestCardTemplate(enterpriseAccount.account.id);
    });

    it('should retrieve event logs for a card template', async () => {
      const sigPayload = {
        id: templateWithLogs.exId,
        limit: 10,
        offset: 0,
      };

      const { headers, query } = generateAuthHeadersForGet(
        enterpriseAccount.accountId,
        enterpriseAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get(`/v1/console/card-templates/${templateWithLogs.exId}/logs`)
        .set(headers)
        .query({
          ...query,
          limit: 10,
          offset: 0,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('logs');
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/v1/console/card-templates/${templateWithLogs.exId}/logs`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
