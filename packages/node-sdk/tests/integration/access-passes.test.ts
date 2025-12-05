import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DoorPasses } from '../../src/client';
import { AccessPass, AccessPassState } from '../../src/types';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('Access Passes Integration Tests', () => {
  const testAccountId = 'test-account-123';
  const testSharedSecret = 'test-shared-secret-456';
  let client: DoorPasses;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn((success: any) => {
            // Store the success handler for testing
            return success;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new DoorPasses(testAccountId, testSharedSecret);
  });

  describe('Issue Access Pass', () => {
    it('should issue an access pass with required fields', async () => {
      const mockAccessPass: AccessPass = {
        id: 'pass_123',
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'John Doe',
        email: 'john@example.com',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
        state: 'active',
        url: 'https://doorpasses.io/install/pass_123',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockAccessPass },
      });

      const params = {
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'John Doe',
        email: 'john@example.com',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
      };

      const result = await client.accessPasses.issue(params);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/access-passes',
        params,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockAccessPass);
      expect(result.id).toBe('pass_123');
      expect(result.url).toBeDefined();
    });

    it('should issue access pass with all optional fields', async () => {
      const mockAccessPass: AccessPass = {
        id: 'pass_456',
        cardTemplateId: 'template_123',
        employeeId: 'EMP001',
        tagId: 'TAG001',
        siteCode: 'SITE001',
        cardNumber: '12345',
        fileData: 'base64encodeddata',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+1234567890',
        classification: 'full_time',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
        employeePhoto: 'https://example.com/photo.jpg',
        title: 'Senior Engineer',
        state: 'active',
        metadata: { department: 'Engineering', level: 5 },
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockAccessPass },
      });

      const params = {
        cardTemplateId: 'template_123',
        employeeId: 'EMP001',
        tagId: 'TAG001',
        siteCode: 'SITE001',
        cardNumber: '12345',
        fileData: 'base64encodeddata',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+1234567890',
        classification: 'full_time' as const,
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
        employeePhoto: 'https://example.com/photo.jpg',
        title: 'Senior Engineer',
        metadata: { department: 'Engineering', level: 5 },
      };

      const result = await client.accessPasses.issue(params);

      expect(result).toEqual(mockAccessPass);
      expect(result.employeeId).toBe('EMP001');
      expect(result.metadata).toEqual({ department: 'Engineering', level: 5 });
    });

    it('should include correct authentication headers', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { data: {} },
      });

      const params = {
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'John Doe',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
      };

      await client.accessPasses.issue(params);

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const headers = callArgs[2].headers;

      expect(headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('List Access Passes', () => {
    it('should list all access passes without filters', async () => {
      const mockAccessPasses: AccessPass[] = [
        {
          id: 'pass_1',
          cardTemplateId: 'template_123',
          cardNumber: '12345',
          fullName: 'John Doe',
          startDate: '2025-11-01T00:00:00Z',
          expirationDate: '2026-11-01T00:00:00Z',
          state: 'active',
          createdAt: '2025-11-02T00:00:00Z',
          updatedAt: '2025-11-02T00:00:00Z',
        },
        {
          id: 'pass_2',
          cardTemplateId: 'template_123',
          cardNumber: '67890',
          fullName: 'Jane Smith',
          startDate: '2025-11-01T00:00:00Z',
          expirationDate: '2026-11-01T00:00:00Z',
          state: 'suspended',
          createdAt: '2025-11-02T00:00:00Z',
          updatedAt: '2025-11-02T00:00:00Z',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockAccessPasses },
      });

      const result = await client.accessPasses.list();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/access-passes',
        expect.objectContaining({
          headers: expect.any(Object),
          params: expect.objectContaining({
            sig_payload: expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockAccessPasses);
      expect(result).toHaveLength(2);
    });

    it('should list access passes filtered by templateId', async () => {
      const mockAccessPasses: AccessPass[] = [
        {
          id: 'pass_1',
          cardTemplateId: 'template_abc',
          cardNumber: '12345',
          fullName: 'John Doe',
          startDate: '2025-11-01T00:00:00Z',
          expirationDate: '2026-11-01T00:00:00Z',
          state: 'active',
          createdAt: '2025-11-02T00:00:00Z',
          updatedAt: '2025-11-02T00:00:00Z',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockAccessPasses },
      });

      const result = await client.accessPasses.list({
        templateId: 'template_abc',
      });

      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockAccessPasses);
    });

    it('should list access passes filtered by state', async () => {
      const mockAccessPasses: AccessPass[] = [
        {
          id: 'pass_1',
          cardTemplateId: 'template_123',
          cardNumber: '12345',
          fullName: 'John Doe',
          startDate: '2025-11-01T00:00:00Z',
          expirationDate: '2026-11-01T00:00:00Z',
          state: 'active',
          createdAt: '2025-11-02T00:00:00Z',
          updatedAt: '2025-11-02T00:00:00Z',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockAccessPasses },
      });

      const result = await client.accessPasses.list({
        state: 'active',
      });

      expect(result).toEqual(mockAccessPasses);
      expect(result.every((pass) => pass.state === 'active')).toBe(true);
    });

    it('should list access passes with multiple filters', async () => {
      const mockAccessPasses: AccessPass[] = [];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockAccessPasses },
      });

      const result = await client.accessPasses.list({
        templateId: 'template_123',
        state: 'suspended',
      });

      expect(result).toEqual(mockAccessPasses);
    });
  });

  describe('Update Access Pass', () => {
    it('should update access pass with single field', async () => {
      const mockUpdatedPass: AccessPass = {
        id: 'pass_123',
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'John Doe Updated',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
        state: 'active',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T10:00:00Z',
      };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: mockUpdatedPass },
      });

      const result = await client.accessPasses.update({
        accessPassId: 'pass_123',
        fullName: 'John Doe Updated',
      });

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/v1/access-passes/pass_123',
        { fullName: 'John Doe Updated' },
        expect.any(Object)
      );

      expect(result.fullName).toBe('John Doe Updated');
    });

    it('should update access pass with multiple fields', async () => {
      const mockUpdatedPass: AccessPass = {
        id: 'pass_123',
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'Jane Smith',
        title: 'Lead Engineer',
        classification: 'full_time',
        expirationDate: '2027-11-01T00:00:00Z',
        startDate: '2025-11-01T00:00:00Z',
        state: 'active',
        metadata: { updated: true },
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T10:00:00Z',
      };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: mockUpdatedPass },
      });

      const result = await client.accessPasses.update({
        accessPassId: 'pass_123',
        fullName: 'Jane Smith',
        title: 'Lead Engineer',
        classification: 'full_time',
        expirationDate: '2027-11-01T00:00:00Z',
        metadata: { updated: true },
      });

      expect(result).toEqual(mockUpdatedPass);
    });
  });

  describe('Suspend Access Pass', () => {
    it('should suspend an access pass', async () => {
      const mockResponse = {
        success: true,
        message: 'Access pass suspended successfully',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.accessPasses.suspend('pass_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/access-passes/pass_123/suspend',
        undefined,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Resume Access Pass', () => {
    it('should resume a suspended access pass', async () => {
      const mockResponse = {
        success: true,
        message: 'Access pass resumed successfully',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.accessPasses.resume('pass_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/access-passes/pass_123/resume',
        undefined,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Unlink Access Pass', () => {
    it('should unlink an access pass from device', async () => {
      const mockResponse = {
        success: true,
        message: 'Access pass unlinked successfully',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.accessPasses.unlink('pass_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/access-passes/pass_123/unlink',
        undefined,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Delete Access Pass', () => {
    it('should delete an access pass permanently', async () => {
      const mockResponse = {
        success: true,
        message: 'Access pass deleted successfully',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.accessPasses.delete('pass_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/access-passes/pass_123/delete',
        undefined,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Access Pass Lifecycle', () => {
    it('should handle full lifecycle: issue -> suspend -> resume -> delete', async () => {
      // Issue
      const mockAccessPass: AccessPass = {
        id: 'pass_lifecycle',
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'Test User',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
        state: 'active',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: mockAccessPass },
      });

      const issued = await client.accessPasses.issue({
        cardTemplateId: 'template_123',
        cardNumber: '12345',
        fullName: 'Test User',
        startDate: '2025-11-01T00:00:00Z',
        expirationDate: '2026-11-01T00:00:00Z',
      });

      expect(issued.state).toBe('active');

      // Suspend
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { success: true, message: 'Suspended' } },
      });

      const suspended = await client.accessPasses.suspend(issued.id);
      expect(suspended.success).toBe(true);

      // Resume
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { success: true, message: 'Resumed' } },
      });

      const resumed = await client.accessPasses.resume(issued.id);
      expect(resumed.success).toBe(true);

      // Delete
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { success: true, message: 'Deleted' } },
      });

      const deleted = await client.accessPasses.delete(issued.id);
      expect(deleted.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors for issue operation', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Invalid card template ID' },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(errorResponse);

      await expect(
        client.accessPasses.issue({
          cardTemplateId: 'invalid',
          cardNumber: '12345',
          fullName: 'John Doe',
          startDate: '2025-11-01T00:00:00Z',
          expirationDate: '2026-11-01T00:00:00Z',
        })
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(client.accessPasses.list()).rejects.toThrow('Network error');
    });
  });
});
