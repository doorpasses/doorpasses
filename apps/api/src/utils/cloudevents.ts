import { CloudEvent, WebhookEventType } from '../types';
import { nanoid } from 'nanoid';

/**
 * Create a CloudEvent compliant event object
 * Following the CloudEvents 1.0 specification
 * https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md
 */
export function createCloudEvent(
  eventType: WebhookEventType,
  data: Record<string, any>
): CloudEvent {
  return {
    specversion: '1.0',
    id: nanoid(),
    source: 'doorpasses',
    type: eventType,
    datacontenttype: 'application/json',
    time: new Date().toISOString(),
    data,
  };
}

/**
 * Validate a CloudEvent object
 */
export function validateCloudEvent(event: any): boolean {
  const requiredFields = ['specversion', 'id', 'source', 'type'];

  for (const field of requiredFields) {
    if (!event[field]) {
      return false;
    }
  }

  // Validate spec version
  if (event.specversion !== '1.0') {
    return false;
  }

  return true;
}

/**
 * Convert event type to CloudEvent format
 * Example: ACCESS_PASS_ISSUED -> ag.access_pass.issued
 */
export function formatEventType(eventType: string): string {
  return eventType
    .toLowerCase()
    .replace(/_/g, '.');
}
