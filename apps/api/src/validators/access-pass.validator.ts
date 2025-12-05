import { z } from 'zod';

// Helper schemas
const tagIdSchema = z
  .string()
  .length(14, 'Tag ID must be exactly 14 characters (7 bytes)')
  .regex(/^[0-9A-Fa-f]+$/, 'Tag ID must be hexadecimal');

const fileDataSchema = z
  .string()
  .max(64, 'File data must not exceed 64 characters')
  .regex(/^[0-9A-Fa-f]+$/, 'File data must be hexadecimal');

const siteCodeSchema = z
  .string()
  .regex(/^\d+$/, 'Site code must be numeric')
  .refine((val) => parseInt(val) < 256, 'Site code must be under 255');

const cardNumberSchema = z
  .string()
  .regex(/^\d+$/, 'Card number must be numeric')
  .refine((val) => parseInt(val) < 65536, 'Card number must be under 65,535');

// Hotel-specific schemas
const hotelTileDataSchema = z.object({
  checkInAvailableWindowStartDateTime: z.string().datetime().optional(),
  checkInAvailableWindowEndDateTime: z.string().datetime().optional(),
  checkInDateTime: z.string().datetime().optional(),
  checkInURL: z.string().url().optional(),
  isCheckedIn: z.boolean().optional(),
  numberOfRoomsReserved: z.number().int().positive().optional(),
  roomNumbers: z.array(z.string()).optional(),
});

const hotelReservationsSchema = z.object({
  checkInDateTime: z.string().datetime().optional(),
  isCheckedIn: z.boolean().optional(),
  numberOfRoomsReserved: z.number().int().positive().optional(),
  propertyLocation: z.string().optional(),
  propertyName: z.string().optional(),
  propertyMapUrl: z.string().url().optional(),
  propertyCategory: z.enum(['travel']).optional(),
  restaurantVoucher: z.string().optional(),
  reservationEndDateTime: z.string().datetime().optional(),
  reservationNumber: z.string().optional(),
  reservationStartDateTime: z.string().datetime().optional(),
  roomNumbers: z.array(z.string()).optional(),
});

// Issue Access Pass Schema
export const issueAccessPassSchema = z.object({
  card_template_id: z.string().min(1, 'Card template ID is required'),
  employee_id: z.string().optional(),
  tag_id: tagIdSchema.optional(),
  site_code: siteCodeSchema.optional(),
  card_number: cardNumberSchema.optional(),
  file_data: fileDataSchema.optional(),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  classification: z.string().optional(),
  start_date: z.string().datetime('Start date must be in ISO8601 format'),
  expiration_date: z.string().datetime('Expiration date must be in ISO8601 format'),
  employee_photo: z.string().optional(), // Base64 encoded
  title: z.string().optional(),
  member_id: z.string().optional(),
  membership_status: z.string().optional(),
  is_pass_ready_to_transact: z.boolean().optional(),
  tile_data: hotelTileDataSchema.optional(),
  reservations: hotelReservationsSchema.optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    // Either site_code + card_number OR file_data must be present
    if (!data.file_data && (!data.site_code || !data.card_number)) {
      return false;
    }
    return true;
  },
  {
    message: 'Either file_data or both site_code and card_number must be provided',
  }
);

// Update Access Pass Schema
export const updateAccessPassSchema = z.object({
  employee_id: z.string().optional(),
  full_name: z.string().min(1).optional(),
  classification: z.string().optional(),
  expiration_date: z.string().datetime().optional(),
  employee_photo: z.string().optional(),
  title: z.string().optional(),
  file_data: fileDataSchema.optional(),
  is_pass_ready_to_transact: z.boolean().optional(),
  tile_data: hotelTileDataSchema.optional(),
  reservations: hotelReservationsSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

// List Access Passes Schema
export const listAccessPassesSchema = z.object({
  template_id: z.string().min(1, 'Template ID is required'),
  state: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'UNLINKED', 'DELETED', 'EXPIRED']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Export types
export type IssueAccessPassInput = z.infer<typeof issueAccessPassSchema>;
export type UpdateAccessPassInput = z.infer<typeof updateAccessPassSchema>;
export type ListAccessPassesInput = z.infer<typeof listAccessPassesSchema>;
