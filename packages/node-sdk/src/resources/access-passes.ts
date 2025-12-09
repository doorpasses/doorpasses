import { HttpClient } from '../http-client';
import {
  AccessPass,
  IssueAccessPassParams,
  UpdateAccessPassParams,
  ListAccessPassesParams,
} from '../types';

/**
 * AccessPasses resource for managing access passes
 */
export class AccessPasses {
  private http: HttpClient;

  constructor(httpClient: HttpClient) {
    this.http = httpClient;
  }

  /**
   * Issue a new access pass
   * @param params - Parameters for issuing the access pass
   * @returns The created access pass with installation URL
   */
  async issue(params: IssueAccessPassParams): Promise<AccessPass> {
    return this.http.post<AccessPass>('/v1/access-passes', params);
  }

  /**
   * List access passes with optional filtering
   * @param params - Optional parameters for filtering
   * @returns Array of access passes
   */
  async list(params?: ListAccessPassesParams): Promise<AccessPass[]> {
    const sigPayload: Record<string, any> = {};

    if (params?.templateId) {
      sigPayload.template_id = params.templateId;
    }
    if (params?.state) {
      sigPayload.state = params.state;
    }

    return this.http.get<AccessPass[]>('/v1/access-passes', sigPayload);
  }

  /**
   * Update an access pass
   * @param params - Parameters for updating the access pass
   * @returns The updated access pass
   */
  async update(params: UpdateAccessPassParams): Promise<AccessPass> {
    const { accessPassId, ...updateData } = params;
    return this.http.patch<AccessPass>(`/v1/access-passes/${accessPassId}`, updateData);
  }

  /**
   * Suspend an access pass
   * @param accessPassId - The ID of the access pass to suspend
   * @returns Success response
   */
  async suspend(accessPassId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/v1/access-passes/${accessPassId}/suspend`);
  }

  /**
   * Resume a suspended access pass
   * @param accessPassId - The ID of the access pass to resume
   * @returns Success response
   */
  async resume(accessPassId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/v1/access-passes/${accessPassId}/resume`);
  }

  /**
   * Unlink an access pass from the user's device
   * @param accessPassId - The ID of the access pass to unlink
   * @returns Success response
   */
  async unlink(accessPassId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/v1/access-passes/${accessPassId}/unlink`);
  }

  /**
   * Delete an access pass permanently
   * @param accessPassId - The ID of the access pass to delete
   * @returns Success response
   */
  async delete(accessPassId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/v1/access-passes/${accessPassId}/delete`);
  }
}
