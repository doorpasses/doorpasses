import { HttpClient } from './http-client';
import { AccessPasses } from './resources/access-passes';
import { Console } from './resources/console';
import { DoorPassesConfig } from './types';

/**
 * Main DoorPasses SDK client
 *
 * @example
 * ```typescript
 * import DoorPasses from 'doorpasses';
 *
 * const accountId = process.env.DOORPASSES_ACCOUNT_ID;
 * const sharedSecret = process.env.DOORPASSES_SHARED_SECRET;
 *
 * const client = new DoorPasses(accountId, sharedSecret);
 *
 * // Issue an access pass
 * const accessPass = await client.accessPasses.issue({
 *   cardTemplateId: "template_123",
 *   fullName: "John Doe",
 *   email: "john@example.com",
 *   cardNumber: "12345",
 *   startDate: "2025-11-01T00:00:00Z",
 *   expirationDate: "2026-11-01T00:00:00Z"
 * });
 * ```
 */
export class DoorPasses {
  private http: HttpClient;

  /**
   * Access passes resource for managing access passes
   */
  public readonly accessPasses: AccessPasses;

  /**
   * Console resource for managing card templates (Enterprise only)
   */
  public readonly console: Console;

  /**
   * Creates a new DoorPasses client instance
   *
   * @param accountId - Your DoorPasses account ID (X-ACCT-ID)
   * @param sharedSecret - Your DoorPasses shared secret for signing requests
   * @param options - Optional configuration
   * @param options.baseUrl - Base URL for the DoorPasses API (default: https://api.doorpasses.io)
   * @param options.timeout - Request timeout in milliseconds (default: 30000)
   *
   * @example
   * ```typescript
   * // Using environment variables
   * const client = new DoorPasses(
   *   process.env.DOORPASSES_ACCOUNT_ID!,
   *   process.env.DOORPASSES_SHARED_SECRET!
   * );
   *
   * // With custom configuration
   * const client = new DoorPasses(
   *   accountId,
   *   sharedSecret,
   *   {
   *     baseUrl: 'https://api.doorpasses.io',
   *     timeout: 60000
   *   }
   * );
   * ```
   */
  constructor(accountId: string, sharedSecret: string, options?: Partial<DoorPassesConfig>) {
    if (!accountId || !sharedSecret) {
      throw new Error('accountId and sharedSecret are required');
    }

    const baseUrl = options?.baseUrl || 'https://api.doorpasses.io';
    const timeout = options?.timeout || 30000;

    this.http = new HttpClient(accountId, sharedSecret, baseUrl, timeout);
    this.accessPasses = new AccessPasses(this.http);
    this.console = new Console(this.http);
  }

  /**
   * Health check to verify API connectivity
   *
   * @returns Health status information
   */
  async health(): Promise<any> {
    return this.http.get('/health');
  }
}

export default DoorPasses;
