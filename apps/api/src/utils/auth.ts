import crypto from 'crypto';

/**
 * Generate a SHA256 hash signature for payload authentication
 * Implements dual authentication mechanism using account ID and payload signature
 *
 * @param sharedSecret - The shared secret key
 * @param payload - The request payload (base64 encoded)
 * @returns SHA256 hex digest
 */
export function generatePayloadSignature(sharedSecret: string, payload: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(sharedSecret + payload);
  return hash.digest('hex');
}

/**
 * Verify payload signature
 *
 * @param sharedSecret - The shared secret key
 * @param payload - The request payload (base64 encoded)
 * @param signature - The signature to verify
 * @returns boolean indicating if signature is valid
 */
export function verifyPayloadSignature(
  sharedSecret: string,
  payload: string,
  signature: string
): boolean {
  const expectedSignature = generatePayloadSignature(sharedSecret, payload);
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * Generate a random account ID
 * Format: 0x followed by 10 random hex characters
 */
export function generateAccountId(): string {
  return '0x' + crypto.randomBytes(5).toString('hex');
}

/**
 * Generate a random shared secret
 * 32 bytes = 64 hex characters
 */
export function generateSharedSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random external ID for resources
 * Format: 0x followed by random hex characters
 */
export function generateExternalId(length: number = 10): string {
  return '0x' + crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
}

/**
 * Generate a bearer token for webhooks
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Hash a password using bcrypt-like method (for future use)
 */
export function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

/**
 * Encode payload to base64 for signature generation
 */
export function encodePayload(payload: any): string {
  const jsonString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return Buffer.from(jsonString).toString('base64');
}

/**
 * Decode base64 payload
 */
export function decodePayload(encodedPayload: string): any {
  try {
    const decoded = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}
