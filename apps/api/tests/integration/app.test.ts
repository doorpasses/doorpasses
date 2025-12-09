import { describe, it, expect } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';

const app = createApp();

describe('App Basic Integration Tests', () => {
  describe('GET / - Welcome Endpoint', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data.message).toContain('DoorPasses');
    });
  });

  describe('GET /health - Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should include service information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('service');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/v1/non-existent-api')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle POST to non-existent routes', async () => {
      const response = await request(app)
        .post('/non-existent-route')
        .send({ test: 'data' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet should set various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Request Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      // This test uses a public endpoint that would parse JSON
      const response = await request(app)
        .post('/v1/wallet/apple/v1/log')
        .set('Content-Type', 'application/json')
        .send({ logs: ['test log'] });

      // Should not fail with JSON parsing error
      expect(response.status).toBeLessThan(500);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/v1/wallet/apple/v1/log')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Should return 400 for malformed JSON, not 500
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should not rate limit health check endpoint', async () => {
      // Make multiple requests to health check
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      // All should succeed (health check is not rate limited)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Try to access a route with invalid method
      const response = await request(app)
        .patch('/health')
        .send({});

      // Should return proper error format
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('success', false);
      }
    });
  });

  describe('Content-Type Headers', () => {
    it('should return JSON content type for API responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return JSON for error responses', async () => {
      const response = await request(app)
        .get('/non-existent')
        .expect(404);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
