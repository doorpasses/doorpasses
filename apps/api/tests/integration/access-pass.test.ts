import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import {
  createTestAccount,
  generateAuthHeaders,
  generateAuthHeadersForGet,
  createTestCardTemplate,
  createTestAccessPass,
  cleanupTestAccount,
  createPublishedCardTemplate,
} from '../helpers/test-utils';

const app = createApp();

describe('Access Pass API Integration Tests', () => {
  let testAccount: any;
  let testCardTemplate: any;

  beforeAll(async () => {
    // Create test account with STARTER tier
    testAccount = await createTestAccount('STARTER');
    // Create a published card template for access pass testing
    testCardTemplate = await createPublishedCardTemplate(testAccount.account.id);
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestAccount(testAccount.account.accountId);
  });

  describe('POST /v1/access-passes - Issue Access Pass', () => {
    it('should issue a new access pass with valid authentication', async () => {
      const now = new Date().toISOString();
      const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        card_template_id: testCardTemplate.exId,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        employee_id: 'EMP123',
        classification: 'full_time',
        title: 'Software Engineer',
        start_date: now,
        expiration_date: oneYearLater,
        site_code: '100',
        card_number: '12345',
        metadata: {
          department: 'Engineering',
        },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/access-passes')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('externalId');
      expect(response.body.data).toHaveProperty('status', 'PENDING'); // Newly created passes are PENDING
      expect(response.body.data.metadata).toMatchObject(payload.metadata);
    });

    it('should fail without authentication headers', async () => {
      const now = new Date().toISOString();
      const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        card_template_id: testCardTemplate.exId,
        full_name: 'Jane Doe',
        start_date: now,
        expiration_date: oneYearLater,
        site_code: '100',
        card_number: '12346',
      };

      const response = await request(app)
        .post('/v1/access-passes')
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid signature', async () => {
      const now = new Date().toISOString();
      const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        card_template_id: testCardTemplate.exId,
        full_name: 'Invalid User',
        start_date: now,
        expiration_date: oneYearLater,
        site_code: '100',
        card_number: '12347',
      };

      const response = await request(app)
        .post('/v1/access-passes')
        .set({
          'X-ACCT-ID': testAccount.accountId,
          'X-PAYLOAD-SIG': 'invalid-signature',
        })
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid card template ID', async () => {
      const now = new Date().toISOString();
      const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        card_template_id: 'invalid-template-id',
        full_name: 'Test User',
        start_date: now,
        expiration_date: oneYearLater,
        site_code: '100',
        card_number: '12348',
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post('/v1/access-passes')
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /v1/access-passes - List Access Passes', () => {
    let createdAccessPass: any;

    beforeAll(async () => {
      // Create an access pass for listing tests
      createdAccessPass = await createTestAccessPass(
        testAccount.account.id,
        testCardTemplate.id
      );
    });

    it('should list access passes for a card template', async () => {
      const sigPayload = {
        template_id: testCardTemplate.exId,
        limit: 10,
        offset: 0,
      };

      const { headers, query } = generateAuthHeadersForGet(
        testAccount.accountId,
        testAccount.sharedSecret,
        sigPayload
      );

      const response = await request(app)
        .get('/v1/access-passes')
        .set(headers)
        .query({
          ...query,
          template_id: testCardTemplate.exId,
          limit: 10,
          offset: 0,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('passes');
      expect(Array.isArray(response.body.data.passes)).toBe(true);
      expect(response.body.data.passes.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/v1/access-passes')
        .query({ template_id: testCardTemplate.exId })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /v1/access-passes/:id - Update Access Pass', () => {
    let accessPassToUpdate: any;

    beforeAll(async () => {
      accessPassToUpdate = await createTestAccessPass(
        testAccount.account.id,
        testCardTemplate.id
      );
    });

    it('should update an access pass with valid authentication', async () => {
      const updatePayload = {
        metadata: {
          name: 'Updated User Name',
          version: 2,
          additionalField: 'new value',
        },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch(`/v1/access-passes/${accessPassToUpdate.exId}`)
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.metadata).toMatchObject(updatePayload.metadata);
    });

    it('should fail to update non-existent access pass', async () => {
      const updatePayload = {
        metadata: { name: 'Should Fail' },
      };

      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        updatePayload
      );

      const response = await request(app)
        .patch('/v1/access-passes/non-existent-id')
        .set(headers)
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /v1/access-passes/:id/suspend - Suspend Access Pass', () => {
    let accessPassToSuspend: any;

    beforeAll(async () => {
      accessPassToSuspend = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'suspend-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should suspend an active access pass', async () => {
      const payload = { id: accessPassToSuspend.exId };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToSuspend.exId}/suspend`)
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'SUSPENDED');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToSuspend.id}/suspend`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /v1/access-passes/:id/resume - Resume Access Pass', () => {
    let accessPassToResume: any;

    beforeAll(async () => {
      accessPassToResume = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'resume-test-user',
          status: 'SUSPENDED',
        }
      );
    });

    it('should resume a suspended access pass', async () => {
      const payload = { id: accessPassToResume.exId };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToResume.exId}/resume`)
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'ACTIVE');
    });
  });

  describe('POST /v1/access-passes/:id/unlink - Unlink Access Pass', () => {
    let accessPassToUnlink: any;

    beforeAll(async () => {
      accessPassToUnlink = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'unlink-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should unlink an access pass', async () => {
      const payload = { id: accessPassToUnlink.exId };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToUnlink.exId}/unlink`)
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'UNLINKED');
    });
  });

  describe('POST /v1/access-passes/:id/delete - Delete Access Pass', () => {
    let accessPassToDelete: any;

    beforeAll(async () => {
      accessPassToDelete = await createTestAccessPass(
        testAccount.account.accountId,
        testCardTemplate.id,
        {
          externalUserId: 'delete-test-user',
          status: 'ACTIVE',
        }
      );
    });

    it('should delete an access pass', async () => {
      const payload = { id: accessPassToDelete.exId };
      const headers = generateAuthHeaders(
        testAccount.accountId,
        testAccount.sharedSecret,
        payload
      );

      const response = await request(app)
        .post(`/v1/access-passes/${accessPassToDelete.exId}/delete`)
        .set(headers)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'DELETED');
    });
  });
});
