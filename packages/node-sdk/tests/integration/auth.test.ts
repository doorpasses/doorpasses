import { describe, it, expect } from 'vitest';
import {
  encodePayload,
  createSignature,
  verifySignature,
  createAuthHeaders,
  createGetAuthHeaders,
} from '../../src/auth';

describe('Authentication Integration Tests', () => {
  const testSharedSecret = 'test-shared-secret-123';
  const testAccountId = 'test-account-id';

  describe('encodePayload', () => {
    it('should encode simple payload to base64', () => {
      const payload = { id: '123', name: 'test' };
      const encoded = encodePayload(payload);

      // Decode to verify
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      expect(decoded).toEqual(payload);
    });

    it('should encode empty payload', () => {
      const payload = {};
      const encoded = encodePayload(payload);

      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      expect(decoded).toEqual(payload);
    });

    it('should encode complex nested payload', () => {
      const payload = {
        user: { id: '123', name: 'John' },
        metadata: { tags: ['a', 'b'], active: true },
      };
      const encoded = encodePayload(payload);

      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      expect(decoded).toEqual(payload);
    });
  });

  describe('createSignature', () => {
    it('should create consistent signature for same input', () => {
      const payload = { id: '123' };
      const encoded = encodePayload(payload);

      const sig1 = createSignature(testSharedSecret, encoded);
      const sig2 = createSignature(testSharedSecret, encoded);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex is 64 chars
    });

    it('should create different signatures for different payloads', () => {
      const payload1 = { id: '123' };
      const payload2 = { id: '456' };

      const encoded1 = encodePayload(payload1);
      const encoded2 = encodePayload(payload2);

      const sig1 = createSignature(testSharedSecret, encoded1);
      const sig2 = createSignature(testSharedSecret, encoded2);

      expect(sig1).not.toBe(sig2);
    });

    it('should create different signatures for different secrets', () => {
      const payload = { id: '123' };
      const encoded = encodePayload(payload);

      const sig1 = createSignature('secret1', encoded);
      const sig2 = createSignature('secret2', encoded);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const payload = { id: '123', action: 'test' };
      const encoded = encodePayload(payload);
      const signature = createSignature(testSharedSecret, encoded);

      const isValid = verifySignature(testSharedSecret, encoded, signature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = { id: '123' };
      const encoded = encodePayload(payload);
      const invalidSignature = 'invalid-signature-hash';

      const isValid = verifySignature(testSharedSecret, encoded, invalidSignature);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const payload = { id: '123' };
      const encoded = encodePayload(payload);
      const signature = createSignature('wrong-secret', encoded);

      const isValid = verifySignature(testSharedSecret, encoded, signature);
      expect(isValid).toBe(false);
    });

    it('should reject signature with tampered payload', () => {
      const payload1 = { id: '123' };
      const payload2 = { id: '456' };

      const encoded1 = encodePayload(payload1);
      const encoded2 = encodePayload(payload2);

      const signature = createSignature(testSharedSecret, encoded1);

      const isValid = verifySignature(testSharedSecret, encoded2, signature);
      expect(isValid).toBe(false);
    });
  });

  describe('createAuthHeaders', () => {
    it('should create valid auth headers with payload', () => {
      const payload = {
        cardTemplateId: 'template_123',
        fullName: 'John Doe',
      };

      const headers = createAuthHeaders(testAccountId, testSharedSecret, payload);

      expect(headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create valid auth headers without payload', () => {
      const headers = createAuthHeaders(testAccountId, testSharedSecret);

      expect(headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create valid auth headers with empty payload', () => {
      const headers = createAuthHeaders(testAccountId, testSharedSecret, {});

      expect(headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create different signatures for different payloads', () => {
      const payload1 = { id: '123' };
      const payload2 = { id: '456' };

      const headers1 = createAuthHeaders(testAccountId, testSharedSecret, payload1);
      const headers2 = createAuthHeaders(testAccountId, testSharedSecret, payload2);

      expect(headers1['X-PAYLOAD-SIG']).not.toBe(headers2['X-PAYLOAD-SIG']);
    });
  });

  describe('createGetAuthHeaders', () => {
    it('should create valid GET auth headers with sig payload', () => {
      const sigPayload = {
        template_id: 'template_123',
        state: 'active',
      };

      const result = createGetAuthHeaders(testAccountId, testSharedSecret, sigPayload);

      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('sigPayload');
      expect(result.headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(result.headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
      expect(result.sigPayload).toBeTruthy();

      // Verify the sigPayload is base64 encoded
      const decoded = JSON.parse(Buffer.from(result.sigPayload, 'base64').toString());
      expect(decoded).toEqual(sigPayload);
    });

    it('should create valid GET auth headers without sig payload', () => {
      const result = createGetAuthHeaders(testAccountId, testSharedSecret);

      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('sigPayload');
      expect(result.headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);

      const decoded = JSON.parse(Buffer.from(result.sigPayload, 'base64').toString());
      expect(decoded).toEqual({ id: '0' });
    });

    it('should create verifiable signature in GET headers', () => {
      const sigPayload = { id: '123', filter: 'test' };
      const result = createGetAuthHeaders(testAccountId, testSharedSecret, sigPayload);

      const isValid = verifySignature(
        testSharedSecret,
        result.sigPayload,
        result.headers['X-PAYLOAD-SIG']
      );

      expect(isValid).toBe(true);
    });
  });

  describe('End-to-End Auth Flow', () => {
    it('should complete full auth cycle for POST request', () => {
      const requestPayload = {
        cardTemplateId: 'template_123',
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      // Client creates headers
      const headers = createAuthHeaders(testAccountId, testSharedSecret, requestPayload);

      // Server would receive headers and verify
      const encodedPayload = encodePayload(requestPayload);
      const isValid = verifySignature(
        testSharedSecret,
        encodedPayload,
        headers['X-PAYLOAD-SIG']
      );

      expect(isValid).toBe(true);
    });

    it('should complete full auth cycle for GET request', () => {
      const queryParams = {
        template_id: 'template_123',
        state: 'active',
      };

      // Client creates GET headers
      const result = createGetAuthHeaders(testAccountId, testSharedSecret, queryParams);

      // Server would receive and verify
      const isValid = verifySignature(
        testSharedSecret,
        result.sigPayload,
        result.headers['X-PAYLOAD-SIG']
      );

      expect(isValid).toBe(true);

      // Verify payload can be decoded
      const decoded = JSON.parse(Buffer.from(result.sigPayload, 'base64').toString());
      expect(decoded).toEqual(queryParams);
    });

    it('should detect tampered payload in full auth cycle', () => {
      const originalPayload = { id: '123', action: 'create' };
      const tamperedPayload = { id: '456', action: 'delete' };

      // Client creates signature with original payload
      const headers = createAuthHeaders(testAccountId, testSharedSecret, originalPayload);

      // Attacker tampers with payload
      const tamperedEncoded = encodePayload(tamperedPayload);

      // Server verification should fail
      const isValid = verifySignature(
        testSharedSecret,
        tamperedEncoded,
        headers['X-PAYLOAD-SIG']
      );

      expect(isValid).toBe(false);
    });
  });
});
