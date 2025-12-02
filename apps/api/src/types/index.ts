import { Request } from 'express';
import { TFunction } from 'i18next';

// Extend Express Request to include authenticated account and i18n
export interface AuthenticatedRequest extends Omit<Request, 'language' | 't'> {
  account?: {
    id: string;
    accountId: string;
    tier: string;
  };
  t?: TFunction;
  language?: string;
}

// CloudEvents spec for webhooks
export interface CloudEvent {
  specversion: string;
  id: string;
  source: string;
  type: string;
  datacontenttype: string;
  time: string;
  data: Record<string, any>;
}

// API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hotel Tile Data
export interface HotelTileData {
  checkInAvailableWindowStartDateTime?: string;
  checkInAvailableWindowEndDateTime?: string;
  checkInDateTime?: string;
  checkInURL?: string;
  isCheckedIn?: boolean;
  numberOfRoomsReserved?: number;
  roomNumbers?: string[];
}

// Hotel Reservations
export interface HotelReservations {
  checkInDateTime?: string;
  isCheckedIn?: boolean;
  numberOfRoomsReserved?: number;
  propertyLocation?: string;
  propertyName?: string;
  propertyMapUrl?: string;
  propertyCategory?: string;
  restaurantVoucher?: string;
  reservationEndDateTime?: string;
  reservationNumber?: string;
  reservationStartDateTime?: string;
  roomNumbers?: string[];
}

// Event types for webhooks
export enum WebhookEventType {
  // Access Pass Events
  ACCESS_PASS_ISSUED = 'ag.access_pass.issued',
  ACCESS_PASS_ACTIVATED = 'ag.access_pass.activated',
  ACCESS_PASS_UPDATED = 'ag.access_pass.updated',
  ACCESS_PASS_SUSPENDED = 'ag.access_pass.suspended',
  ACCESS_PASS_RESUMED = 'ag.access_pass.resumed',
  ACCESS_PASS_UNLINKED = 'ag.access_pass.unlinked',
  ACCESS_PASS_DELETED = 'ag.access_pass.deleted',
  ACCESS_PASS_EXPIRED = 'ag.access_pass.expired',

  // Card Template Events
  CARD_TEMPLATE_CREATED = 'ag.card_template.created',
  CARD_TEMPLATE_UPDATED = 'ag.card_template.updated',
  CARD_TEMPLATE_REQUESTED_PUBLISHING = 'ag.card_template.requested_publishing',
  CARD_TEMPLATE_PUBLISHED = 'ag.card_template.published',

  // Credential Profile Events
  CREDENTIAL_PROFILE_CREATED = 'ag.credential_profile.created',
  CREDENTIAL_PROFILE_ATTACHED_TO_TEMPLATE = 'ag.credential_profile.attached_to_template',
}

// MENA specific types
export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface RegionalSettings {
  timezone: string;
  language: 'ar' | 'en';
  prayerTimes?: PrayerTimes;
}
