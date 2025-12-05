import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from '../../src/http-client';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('HttpClient Integration Tests', () => {
  const testAccountId = 'test-account-123';
  const testSharedSecret = 'test-shared-secret-456';
  const testBaseUrl = 'https://api.doorpasses.io';
  const testTimeout = 30000;

  let mockAxiosInstance: any;
  let httpClient: HttpClient;
  let errorHandler: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn((onSuccess: any, onError: any) => {
            errorHandler = onError;
            return onSuccess;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    httpClient = new HttpClient(testAccountId, testSharedSecret, testBaseUrl, testTimeout);
  });

  describe('Initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: testBaseUrl,
        timeout: testTimeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should register response interceptor', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('GET Requests', () => {
    it('should make GET request with authentication', async () => {
      const mockData = { id: '123', name: 'Test' };
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
          params: expect.objectContaining({
            sig_payload: expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should make GET request with custom sig payload', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      const customPayload = { filter: 'active', limit: 10 };

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.get('/test', customPayload);

      expect(mockAxiosInstance.get).toHaveBeenCalled();

      const callArgs = mockAxiosInstance.get.mock.calls[0];
      const params = callArgs[1].params;

      expect(params.sig_payload).toBeDefined();
      expect(result).toEqual(mockData);
    });

    it('should return direct data if no data wrapper', async () => {
      const mockResponse = { status: 'healthy' };
      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await httpClient.get('/health');

      expect(result).toEqual(mockResponse);
    });

    it('should include signature in GET request', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: {} },
      });

      await httpClient.get('/test');

      const callArgs = mockAxiosInstance.get.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('POST Requests', () => {
    it('should make POST request with authentication', async () => {
      const mockData = { id: '123', created: true };
      const postData = { name: 'Test', value: 42 };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.post('/test', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/test',
        postData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should make POST request without body', async () => {
      const mockData = { success: true };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.post('/test');

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should create signature based on POST data', async () => {
      const postData = { userId: '123', action: 'create' };

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: {} },
      });

      await httpClient.post('/test', postData);

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const headers = callArgs[2].headers;

      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle different signatures for different data', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { data: {} },
      });

      await httpClient.post('/test', { id: '1' });
      const sig1 = mockAxiosInstance.post.mock.calls[0][2].headers['X-PAYLOAD-SIG'];

      await httpClient.post('/test', { id: '2' });
      const sig2 = mockAxiosInstance.post.mock.calls[1][2].headers['X-PAYLOAD-SIG'];

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('PATCH Requests', () => {
    it('should make PATCH request with authentication', async () => {
      const mockData = { id: '123', updated: true };
      const patchData = { name: 'Updated Name' };

      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.patch('/test/123', patchData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/test/123',
        patchData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should make PATCH request without body', async () => {
      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: { success: true } },
      });

      const result = await httpClient.patch('/test/123');

      expect(result).toEqual({ success: true });
    });
  });

  describe('DELETE Requests', () => {
    it('should make DELETE request with authentication', async () => {
      const mockData = { success: true, message: 'Deleted' };

      mockAxiosInstance.delete.mockResolvedValue({
        data: { data: mockData },
      });

      const result = await httpClient.delete('/test/123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/test/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should include authentication headers in DELETE', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        data: { data: {} },
      });

      await httpClient.delete('/test/123');

      const callArgs = mockAxiosInstance.delete.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['X-ACCT-ID']).toBe(testAccountId);
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Error Handling - API Errors', () => {
    it('should handle 400 Bad Request errors', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Invalid request parameters' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError).toBeInstanceOf(Error);
        expect(thrownError.message).toContain('400');
        expect(thrownError.message).toContain('Invalid request parameters');
      }
    });

    it('should handle 401 Unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Invalid credentials' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError).toBeInstanceOf(Error);
        expect(thrownError.message).toContain('401');
        expect(thrownError.message).toContain('Invalid credentials');
      }
    });

    it('should handle 403 Forbidden errors', async () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'Enterprise tier required' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('403');
        expect(thrownError.message).toContain('Enterprise tier required');
      }
    });

    it('should handle 404 Not Found errors', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Resource not found' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('404');
        expect(thrownError.message).toContain('Resource not found');
      }
    });

    it('should handle 500 Server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('500');
        expect(thrownError.message).toContain('Internal server error');
      }
    });

    it('should use message field if error field not present', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Validation failed' },
        },
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('Validation failed');
      }
    });

    it('should use generic message if no error details', async () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
        message: 'Network error',
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('500');
        expect(thrownError.message).toContain('Network error');
      }
    });
  });

  describe('Error Handling - Network Errors', () => {
    it('should handle network timeout errors', async () => {
      const error = {
        request: {},
        message: 'timeout of 30000ms exceeded',
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError).toBeInstanceOf(Error);
        expect(thrownError.message).toContain('No response received');
      }
    });

    it('should handle connection refused errors', async () => {
      const error = {
        request: {},
        message: 'connect ECONNREFUSED',
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('No response received');
      }
    });

    it('should handle DNS errors', async () => {
      const error = {
        request: {},
        message: 'getaddrinfo ENOTFOUND',
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError.message).toContain('No response received');
      }
    });
  });

  describe('Error Handling - Request Setup Errors', () => {
    it('should handle request setup errors', async () => {
      const error = {
        message: 'Invalid URL',
      };

      try {
        errorHandler(error);
        expect.fail('Should have thrown an error');
      } catch (thrownError: any) {
        expect(thrownError).toBeInstanceOf(Error);
        expect(thrownError.message).toContain('Request setup error');
        expect(thrownError.message).toContain('Invalid URL');
      }
    });
  });

  describe('Authentication Headers Consistency', () => {
    it('should use same account ID for all requests', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });
      mockAxiosInstance.post.mockResolvedValue({ data: {} });
      mockAxiosInstance.patch.mockResolvedValue({ data: {} });
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await httpClient.get('/test');
      await httpClient.post('/test', {});
      await httpClient.patch('/test', {});
      await httpClient.delete('/test');

      const getHeaders = mockAxiosInstance.get.mock.calls[0][1].headers;
      const postHeaders = mockAxiosInstance.post.mock.calls[0][2].headers;
      const patchHeaders = mockAxiosInstance.patch.mock.calls[0][2].headers;
      const deleteHeaders = mockAxiosInstance.delete.mock.calls[0][1].headers;

      expect(getHeaders['X-ACCT-ID']).toBe(testAccountId);
      expect(postHeaders['X-ACCT-ID']).toBe(testAccountId);
      expect(patchHeaders['X-ACCT-ID']).toBe(testAccountId);
      expect(deleteHeaders['X-ACCT-ID']).toBe(testAccountId);
    });

    it('should include Content-Type header in all requests', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await httpClient.get('/test');
      await httpClient.post('/test', {});

      const getHeaders = mockAxiosInstance.get.mock.calls[0][1].headers;
      const postHeaders = mockAxiosInstance.post.mock.calls[0][2].headers;

      expect(getHeaders['Content-Type']).toBe('application/json');
      expect(postHeaders['Content-Type']).toBe('application/json');
    });
  });

  describe('Response Data Extraction', () => {
    it('should extract data from data.data wrapper', async () => {
      const nestedData = { id: '123', value: 'test' };
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: nestedData },
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual(nestedData);
    });

    it('should return root data if no data wrapper', async () => {
      const rootData = { status: 'ok' };
      mockAxiosInstance.get.mockResolvedValue({
        data: rootData,
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual(rootData);
    });

    it('should handle arrays in data wrapper', async () => {
      const arrayData = [{ id: '1' }, { id: '2' }];
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: arrayData },
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual(arrayData);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { data: {} } });
      mockAxiosInstance.post.mockResolvedValue({ data: { data: {} } });
      mockAxiosInstance.patch.mockResolvedValue({ data: { data: {} } });

      const requests = [
        httpClient.get('/test1'),
        httpClient.get('/test2'),
        httpClient.post('/test3', { data: 'test' }),
        httpClient.patch('/test4', { data: 'test' }),
      ];

      await Promise.all(requests);

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.patch).toHaveBeenCalledTimes(1);
    });

    it('should maintain separate signatures for concurrent requests', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { data: {} } });

      await Promise.all([
        httpClient.post('/test', { id: '1' }),
        httpClient.post('/test', { id: '2' }),
        httpClient.post('/test', { id: '3' }),
      ]);

      const sigs = mockAxiosInstance.post.mock.calls.map(
        (call) => call[2].headers['X-PAYLOAD-SIG']
      );

      // All signatures should be different since payloads are different
      expect(new Set(sigs).size).toBe(3);
    });
  });
});
