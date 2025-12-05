import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createAuthHeaders, createGetAuthHeaders } from './auth';

/**
 * HTTP client for making authenticated requests to the DoorPasses API
 */
export class HttpClient {
  private client: AxiosInstance;
  private accountId: string;
  private sharedSecret: string;

  constructor(accountId: string, sharedSecret: string, baseUrl: string, timeout: number) {
    this.accountId = accountId;
    this.sharedSecret = sharedSecret;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
          throw new Error(`DoorPasses API Error (${error.response.status}): ${errorMessage}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('No response received from DoorPasses API');
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Makes a GET request
   */
  async get<T>(url: string, sigPayload?: Record<string, any>): Promise<T> {
    const { headers, sigPayload: encodedPayload } = createGetAuthHeaders(
      this.accountId,
      this.sharedSecret,
      sigPayload
    );

    const response: AxiosResponse<any> = await this.client.get(url, {
      headers,
      params: {
        sig_payload: encodedPayload,
      },
    });

    return response.data.data || response.data;
  }

  /**
   * Makes a POST request
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const headers = createAuthHeaders(this.accountId, this.sharedSecret, data);
    const response: AxiosResponse<any> = await this.client.post(url, data, { headers });
    return response.data.data || response.data;
  }

  /**
   * Makes a PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<T> {
    const headers = createAuthHeaders(this.accountId, this.sharedSecret, data);
    const response: AxiosResponse<any> = await this.client.patch(url, data, { headers });
    return response.data.data || response.data;
  }

  /**
   * Makes a DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    const headers = createAuthHeaders(this.accountId, this.sharedSecret);
    const response: AxiosResponse<any> = await this.client.delete(url, { headers });
    return response.data.data || response.data;
  }
}
