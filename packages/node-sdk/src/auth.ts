import * as crypto from 'crypto';

/**
 * Encodes a payload to base64
 */
export function encodePayload(payload: any): string {
  const jsonString = JSON.stringify(payload);
  return Buffer.from(jsonString).toString('base64');
}

/**
 * Creates a signature for a payload using the shared secret
 * Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()
 */
export function createSignature(sharedSecret: string, encodedPayload: string): string {
  const message = sharedSecret + encodedPayload;
  return crypto.createHash('sha256').update(message).digest('hex');
}

/**
 * Verifies a signature matches the expected value
 */
export function verifySignature(
  sharedSecret: string,
  encodedPayload: string,
  signature: string
): boolean {
  const expectedSignature = createSignature(sharedSecret, encodedPayload);
  return expectedSignature === signature;
}

/**
 * Creates authentication headers for API requests
 */
export function createAuthHeaders(
  accountId: string,
  sharedSecret: string,
  payload?: any
): Record<string, string> {
  let encodedPayload: string;

  if (payload && Object.keys(payload).length > 0) {
    encodedPayload = encodePayload(payload);
  } else {
    // Default payload when no body is provided
    encodedPayload = encodePayload({ id: '0' });
  }

  const signature = createSignature(sharedSecret, encodedPayload);

  return {
    'X-ACCT-ID': accountId,
    'X-PAYLOAD-SIG': signature,
    'Content-Type': 'application/json',
  };
}

/**
 * Creates authentication headers for GET requests
 */
export function createGetAuthHeaders(
  accountId: string,
  sharedSecret: string,
  sigPayload?: Record<string, any>
): { headers: Record<string, string>; sigPayload: string } {
  const payload = sigPayload || { id: '0' };
  const encodedPayload = encodePayload(payload);
  const signature = createSignature(sharedSecret, encodedPayload);

  return {
    headers: {
      'X-ACCT-ID': accountId,
      'X-PAYLOAD-SIG': signature,
      'Content-Type': 'application/json',
    },
    sigPayload: encodedPayload,
  };
}
