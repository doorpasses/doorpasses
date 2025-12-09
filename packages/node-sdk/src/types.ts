/**
 * Configuration options for the DoorPasses client
 */
export interface DoorPassesConfig {
  accountId: string;
  sharedSecret: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Common response wrapper
 */
export interface DoorPassesResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Access Pass state
 */
export type AccessPassState = 'active' | 'suspended' | 'unlinked' | 'deleted' | 'expired';

/**
 * Platform type
 */
export type Platform = 'apple' | 'google';

/**
 * Protocol type
 */
export type Protocol = 'desfire' | 'seos' | 'smart_tap';

/**
 * Classification type
 */
export type Classification = 'full_time' | 'contractor' | 'part_time' | 'temporary';

/**
 * Account tier
 */
export type AccountTier = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

/**
 * Access Pass interface
 */
export interface AccessPass {
  id: string;
  cardTemplateId: string;
  employeeId?: string;
  tagId?: string;
  siteCode?: string;
  cardNumber?: string;
  fileData?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  classification?: Classification;
  startDate: string;
  expirationDate: string;
  employeePhoto?: string;
  title?: string;
  state: AccessPassState;
  url?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for issuing an access pass
 */
export interface IssueAccessPassParams {
  cardTemplateId: string;
  employeeId?: string;
  tagId?: string;
  siteCode?: string;
  cardNumber: string;
  fileData?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  classification?: Classification;
  startDate: string;
  expirationDate: string;
  employeePhoto?: string;
  title?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for updating an access pass
 */
export interface UpdateAccessPassParams {
  accessPassId: string;
  employeeId?: string;
  fullName?: string;
  classification?: Classification;
  expirationDate?: string;
  employeePhoto?: string;
  title?: string;
  fileData?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for listing access passes
 */
export interface ListAccessPassesParams {
  templateId?: string;
  state?: AccessPassState;
}

/**
 * Design configuration for card templates
 */
export interface CardTemplateDesign {
  backgroundColor?: string;
  labelColor?: string;
  labelSecondaryColor?: string;
  backgroundImage?: string;
  logoImage?: string;
  iconImage?: string;
}

/**
 * Support information for card templates
 */
export interface SupportInfo {
  supportUrl?: string;
  supportPhoneNumber?: string;
  supportEmail?: string;
  privacyPolicyUrl?: string;
  termsAndConditionsUrl?: string;
}

/**
 * Card Template interface
 */
export interface CardTemplate {
  id: string;
  name: string;
  platform: Platform;
  useCase: 'employee_badge' | 'hotel';
  protocol: Protocol;
  allowOnMultipleDevices?: boolean;
  watchCount?: number;
  iphoneCount?: number;
  design?: CardTemplateDesign;
  supportInfo?: SupportInfo;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a card template
 */
export interface CreateCardTemplateParams {
  name: string;
  platform: Platform;
  useCase: 'employee_badge' | 'hotel';
  protocol: Protocol;
  allowOnMultipleDevices?: boolean;
  watchCount?: number;
  iphoneCount?: number;
  design?: CardTemplateDesign;
  supportInfo?: SupportInfo;
  metadata?: Record<string, any>;
}

/**
 * Parameters for updating a card template
 */
export interface UpdateCardTemplateParams {
  cardTemplateId: string;
  name?: string;
  allowOnMultipleDevices?: boolean;
  watchCount?: number;
  iphoneCount?: number;
  supportInfo?: SupportInfo;
  metadata?: Record<string, any>;
}

/**
 * Event log entry
 */
export interface EventLogEntry {
  id: string;
  type: string;
  timestamp: string;
  userId?: string;
  device?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for filtering event logs
 */
export interface EventLogFilters {
  device?: 'mobile' | 'watch';
  startDate?: string;
  endDate?: string;
  eventType?: 'issue' | 'install' | 'update' | 'suspend' | 'resume' | 'unlink';
}

/**
 * Parameters for reading event logs
 */
export interface ReadEventLogParams {
  cardTemplateId: string;
  filters?: EventLogFilters;
}
