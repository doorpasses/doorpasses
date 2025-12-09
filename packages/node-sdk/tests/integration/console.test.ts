import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DoorPasses } from '../../src/client';
import { CardTemplate, EventLogEntry } from '../../src/types';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('Console Integration Tests', () => {
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
          use: vi.fn((success: any) => success),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new DoorPasses(testAccountId, testSharedSecret);
  });

  describe('Create Card Template', () => {
    it('should create a basic card template', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_123',
        name: 'Employee Badge Template',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const params = {
        name: 'Employee Badge Template',
        platform: 'apple' as const,
        useCase: 'employee_badge' as const,
        protocol: 'desfire' as const,
      };

      const result = await client.console.createTemplate(params);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/console/card-templates',
        params,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockTemplate);
      expect(result.id).toBe('template_123');
    });

    it('should create card template with full configuration', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_456',
        name: 'Premium Badge',
        platform: 'google',
        useCase: 'employee_badge',
        protocol: 'seos',
        allowOnMultipleDevices: true,
        watchCount: 2,
        iphoneCount: 3,
        design: {
          backgroundColor: '#1E3A8A',
          labelColor: '#FFFFFF',
          labelSecondaryColor: '#9CA3AF',
          backgroundImage: 'https://example.com/bg.jpg',
          logoImage: 'https://example.com/logo.png',
          iconImage: 'https://example.com/icon.png',
        },
        supportInfo: {
          supportUrl: 'https://support.example.com',
          supportPhoneNumber: '+1234567890',
          supportEmail: 'support@example.com',
          privacyPolicyUrl: 'https://example.com/privacy',
          termsAndConditionsUrl: 'https://example.com/terms',
        },
        metadata: { department: 'Engineering', version: 2 },
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const params = {
        name: 'Premium Badge',
        platform: 'google' as const,
        useCase: 'employee_badge' as const,
        protocol: 'seos' as const,
        allowOnMultipleDevices: true,
        watchCount: 2,
        iphoneCount: 3,
        design: {
          backgroundColor: '#1E3A8A',
          labelColor: '#FFFFFF',
          labelSecondaryColor: '#9CA3AF',
          backgroundImage: 'https://example.com/bg.jpg',
          logoImage: 'https://example.com/logo.png',
          iconImage: 'https://example.com/icon.png',
        },
        supportInfo: {
          supportUrl: 'https://support.example.com',
          supportPhoneNumber: '+1234567890',
          supportEmail: 'support@example.com',
          privacyPolicyUrl: 'https://example.com/privacy',
          termsAndConditionsUrl: 'https://example.com/terms',
        },
        metadata: { department: 'Engineering', version: 2 },
      };

      const result = await client.console.createTemplate(params);

      expect(result).toEqual(mockTemplate);
      expect(result.design?.backgroundColor).toBe('#1E3A8A');
      expect(result.supportInfo?.supportEmail).toBe('support@example.com');
    });

    it('should create hotel use case template', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_hotel',
        name: 'Hotel Room Key',
        platform: 'apple',
        useCase: 'hotel',
        protocol: 'smart_tap',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const result = await client.console.createTemplate({
        name: 'Hotel Room Key',
        platform: 'apple',
        useCase: 'hotel',
        protocol: 'smart_tap',
      });

      expect(result.useCase).toBe('hotel');
    });
  });

  describe('Read Card Template', () => {
    it('should read a card template by ID', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_123',
        name: 'Employee Badge',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const result = await client.console.readTemplate('template_123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/console/card-templates/template_123',
        expect.objectContaining({
          headers: expect.any(Object),
          params: expect.objectContaining({
            sig_payload: expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockTemplate);
    });

    it('should include authentication headers', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: {} },
      });

      await client.console.readTemplate('template_123');

      const callArgs = mockAxiosInstance.get.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers).toHaveProperty('X-ACCT-ID', testAccountId);
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Update Card Template', () => {
    it('should update card template name', async () => {
      const mockUpdatedTemplate: CardTemplate = {
        id: 'template_123',
        name: 'Updated Badge Template',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T10:00:00Z',
      };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: mockUpdatedTemplate },
      });

      const result = await client.console.updateTemplate({
        cardTemplateId: 'template_123',
        name: 'Updated Badge Template',
      });

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/v1/console/card-templates/template_123',
        { name: 'Updated Badge Template' },
        expect.any(Object)
      );

      expect(result.name).toBe('Updated Badge Template');
    });

    it('should update multiple template fields', async () => {
      const mockUpdatedTemplate: CardTemplate = {
        id: 'template_123',
        name: 'Badge',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        allowOnMultipleDevices: true,
        watchCount: 3,
        iphoneCount: 5,
        supportInfo: {
          supportEmail: 'newsupport@example.com',
          supportPhoneNumber: '+9876543210',
        },
        metadata: { updated: true, version: 2 },
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T10:00:00Z',
      };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: mockUpdatedTemplate },
      });

      const result = await client.console.updateTemplate({
        cardTemplateId: 'template_123',
        allowOnMultipleDevices: true,
        watchCount: 3,
        iphoneCount: 5,
        supportInfo: {
          supportEmail: 'newsupport@example.com',
          supportPhoneNumber: '+9876543210',
        },
        metadata: { updated: true, version: 2 },
      });

      expect(result).toEqual(mockUpdatedTemplate);
    });
  });

  describe('Publish Card Template', () => {
    it('should publish a card template', async () => {
      const mockResponse = {
        success: true,
        message: 'Card template published successfully',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.console.publishTemplate('template_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/console/card-templates/template_123/publish',
        undefined,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Event Log', () => {
    it('should read event logs without filters', async () => {
      const mockLogs: EventLogEntry[] = [
        {
          id: 'log_1',
          type: 'issue',
          timestamp: '2025-11-02T00:00:00Z',
          userId: 'user_123',
          device: 'mobile',
          metadata: { passId: 'pass_123' },
        },
        {
          id: 'log_2',
          type: 'install',
          timestamp: '2025-11-02T01:00:00Z',
          userId: 'user_123',
          device: 'mobile',
          metadata: { passId: 'pass_123' },
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockLogs },
      });

      const result = await client.console.eventLog({
        cardTemplateId: 'template_123',
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/console/card-templates/template_123/logs',
        expect.any(Object)
      );

      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(2);
    });

    it('should read event logs with device filter', async () => {
      const mockLogs: EventLogEntry[] = [
        {
          id: 'log_1',
          type: 'install',
          timestamp: '2025-11-02T00:00:00Z',
          device: 'watch',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockLogs },
      });

      const result = await client.console.eventLog({
        cardTemplateId: 'template_123',
        filters: { device: 'watch' },
      });

      expect(result).toEqual(mockLogs);
      expect(result[0].device).toBe('watch');
    });

    it('should read event logs with date range filter', async () => {
      const mockLogs: EventLogEntry[] = [
        {
          id: 'log_1',
          type: 'update',
          timestamp: '2025-11-02T12:00:00Z',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockLogs },
      });

      const result = await client.console.eventLog({
        cardTemplateId: 'template_123',
        filters: {
          startDate: '2025-11-01T00:00:00Z',
          endDate: '2025-11-03T00:00:00Z',
        },
      });

      expect(result).toEqual(mockLogs);
    });

    it('should read event logs with event type filter', async () => {
      const mockLogs: EventLogEntry[] = [
        {
          id: 'log_1',
          type: 'suspend',
          timestamp: '2025-11-02T12:00:00Z',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockLogs },
      });

      const result = await client.console.eventLog({
        cardTemplateId: 'template_123',
        filters: { eventType: 'suspend' },
      });

      expect(result).toEqual(mockLogs);
    });

    it('should read event logs with multiple filters', async () => {
      const mockLogs: EventLogEntry[] = [];

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockLogs },
      });

      const result = await client.console.eventLog({
        cardTemplateId: 'template_123',
        filters: {
          device: 'mobile',
          startDate: '2025-11-01T00:00:00Z',
          endDate: '2025-11-03T00:00:00Z',
          eventType: 'install',
        },
      });

      expect(result).toEqual(mockLogs);
    });
  });

  describe('Card Template Lifecycle', () => {
    it('should handle full lifecycle: create -> read -> update -> publish', async () => {
      // Create
      const mockTemplate: CardTemplate = {
        id: 'template_lifecycle',
        name: 'Test Template',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: mockTemplate },
      });

      const created = await client.console.createTemplate({
        name: 'Test Template',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
      });

      expect(created.id).toBe('template_lifecycle');

      // Read
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: mockTemplate },
      });

      const read = await client.console.readTemplate(created.id);
      expect(read).toEqual(mockTemplate);

      // Update
      const updatedTemplate = { ...mockTemplate, name: 'Updated Template' };
      mockAxiosInstance.patch.mockResolvedValueOnce({
        data: { data: updatedTemplate },
      });

      const updated = await client.console.updateTemplate({
        cardTemplateId: created.id,
        name: 'Updated Template',
      });

      expect(updated.name).toBe('Updated Template');

      // Publish
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { success: true, message: 'Published' } },
      });

      const published = await client.console.publishTemplate(created.id);
      expect(published.success).toBe(true);
    });
  });

  describe('Platform and Protocol Support', () => {
    it('should support Apple platform with DESFire protocol', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_1',
        name: 'Apple DESFire',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const result = await client.console.createTemplate({
        name: 'Apple DESFire',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'desfire',
      });

      expect(result.platform).toBe('apple');
      expect(result.protocol).toBe('desfire');
    });

    it('should support Google platform with Smart Tap protocol', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_2',
        name: 'Google Smart Tap',
        platform: 'google',
        useCase: 'employee_badge',
        protocol: 'smart_tap',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const result = await client.console.createTemplate({
        name: 'Google Smart Tap',
        platform: 'google',
        useCase: 'employee_badge',
        protocol: 'smart_tap',
      });

      expect(result.platform).toBe('google');
      expect(result.protocol).toBe('smart_tap');
    });

    it('should support SEOS protocol', async () => {
      const mockTemplate: CardTemplate = {
        id: 'template_3',
        name: 'SEOS Badge',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'seos',
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockTemplate },
      });

      const result = await client.console.createTemplate({
        name: 'SEOS Badge',
        platform: 'apple',
        useCase: 'employee_badge',
        protocol: 'seos',
      });

      expect(result.protocol).toBe('seos');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors for create operation', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { error: 'Enterprise tier required' },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(errorResponse);

      await expect(
        client.console.createTemplate({
          name: 'Test',
          platform: 'apple',
          useCase: 'employee_badge',
          protocol: 'desfire',
        })
      ).rejects.toThrow();
    });

    it('should handle not found errors', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Template not found' },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(errorResponse);

      await expect(
        client.console.readTemplate('non-existent')
      ).rejects.toThrow();
    });
  });
});
