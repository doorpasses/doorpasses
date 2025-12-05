import { z } from 'zod';

// Design schema
const designSchema = z.object({
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid 6-character hex color')
    .optional(),
  label_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Label color must be a valid 6-character hex color')
    .optional(),
  label_secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary label color must be a valid 6-character hex color')
    .optional(),
  background_image: z.string().optional(), // Base64 encoded
  logo_image: z.string().optional(), // Base64 encoded
  icon_image: z.string().optional(), // Base64 encoded
});

// Support Info schema
const supportInfoSchema = z.object({
  support_url: z.string().url().optional(),
  support_phone_number: z.string().optional(),
  support_email: z.string().email().optional(),
  privacy_policy_url: z.string().url().optional(),
  terms_and_conditions_url: z.string().url().optional(),
});

// Create Card Template Schema
export const createCardTemplateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    platform: z.enum(['APPLE', 'GOOGLE'], {
      errorMap: () => ({ message: 'Platform must be either APPLE or GOOGLE' }),
    }),
    use_case: z.enum(['EMPLOYEE_BADGE', 'HOTEL', 'RESIDENTIAL', 'VEHICLE'], {
      errorMap: () => ({
        message: 'Use case must be EMPLOYEE_BADGE, HOTEL, RESIDENTIAL, or VEHICLE',
      }),
    }),
    protocol: z.enum(['DESFIRE', 'SEOS', 'SMART_TAP'], {
      errorMap: () => ({ message: 'Protocol must be DESFIRE, SEOS, or SMART_TAP' }),
    }),
    allow_on_multiple_devices: z.boolean().optional().default(false),
    watch_count: z.number().int().min(1).max(5).optional(),
    iphone_count: z.number().int().min(1).max(5).optional(),
    design: designSchema.optional(),
    support_info: supportInfoSchema.optional(),
    metadata: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      // If allow_on_multiple_devices is true and platform is APPLE, watch_count and iphone_count can be set
      if (data.allow_on_multiple_devices && data.platform === 'APPLE') {
        return true;
      }
      // If allow_on_multiple_devices is false, watch_count and iphone_count should not be set
      if (!data.allow_on_multiple_devices && (data.watch_count || data.iphone_count)) {
        return false;
      }
      return true;
    },
    {
      message: 'watch_count and iphone_count can only be set when allow_on_multiple_devices is true',
    }
  );

// Update Card Template Schema
export const updateCardTemplateSchema = z
  .object({
    name: z.string().min(1).optional(),
    allow_on_multiple_devices: z.boolean().optional(),
    watch_count: z.number().int().min(1).max(5).optional(),
    iphone_count: z.number().int().min(1).max(5).optional(),
    design: designSchema.optional(),
    support_info: supportInfoSchema.optional(),
    metadata: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      // Validation for watch_count and iphone_count
      if ((data.watch_count || data.iphone_count) && data.allow_on_multiple_devices === false) {
        return false;
      }
      return true;
    },
    {
      message:
        'watch_count and iphone_count can only be set when allow_on_multiple_devices is true',
    }
  );

// Read Event Log Schema
export const readEventLogSchema = z.object({
  device: z.enum(['mobile', 'watch']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  event_type: z
    .enum(['issue', 'install', 'update', 'suspend', 'resume', 'unlink'])
    .optional(),
});

// Export types
export type CreateCardTemplateInput = z.infer<typeof createCardTemplateSchema>;
export type UpdateCardTemplateInput = z.infer<typeof updateCardTemplateSchema>;
export type ReadEventLogInput = z.infer<typeof readEventLogSchema>;
