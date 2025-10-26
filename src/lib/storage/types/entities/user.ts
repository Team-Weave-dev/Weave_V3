/**
 * User Entity Type Definitions
 *
 * This file defines the User entity schema and related types.
 * Designed for Supabase compatibility and localStorage storage.
 */

import { isValidEmail, isValidISODate } from '../validators';

/**
 * Business type for users
 */
export type BusinessType = 'freelancer' | 'individual' | 'corporation';

/**
 * Plan type
 */
export type PlanType = 'free' | 'basic' | 'pro';

/**
 * User metadata
 */
export interface UserMetadata {
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en';
  timezone?: string;
}

/**
 * User entity representing application users
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;

  /** User email address */
  email: string;

  /** User display name */
  name: string;

  /** User avatar URL (optional) */
  avatar?: string;

  /** Phone number (optional) */
  phone?: string;

  /** Business registration number (optional) */
  businessNumber?: string;

  /** Address (optional) */
  address?: string;

  /** Detailed address (optional) */
  addressDetail?: string;

  /** Business type (optional) */
  businessType?: BusinessType;

  /** Subscription plan (optional, defaults to 'free') */
  plan?: PlanType;

  /** Account creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;

  /** Device ID that made the last update (for audit trail) */
  device_id?: string;

  /** User preferences and metadata */
  metadata?: UserMetadata;
}

/**
 * Type guard to check if data is a valid User
 *
 * @param data - Unknown data to validate
 * @returns True if data conforms to User interface
 */
export function isUser(data: unknown): data is User {
  if (typeof data !== 'object' || data === null) return false;

  const u = data as User;

  // Required fields with format validation
  if (!u.id || typeof u.id !== 'string') return false;
  if (!isValidEmail(u.email)) return false;
  if (!u.name || typeof u.name !== 'string') return false;
  if (!isValidISODate(u.createdAt)) return false;
  if (!isValidISODate(u.updatedAt)) return false;

  // Optional fields validation
  if (u.avatar !== undefined && typeof u.avatar !== 'string') return false;
  if (u.phone !== undefined && typeof u.phone !== 'string') return false;
  if (u.updated_by !== undefined && typeof u.updated_by !== 'string') return false;
  if (u.device_id !== undefined && typeof u.device_id !== 'string') return false;
  if (u.businessNumber !== undefined && typeof u.businessNumber !== 'string') return false;
  if (u.address !== undefined && typeof u.address !== 'string') return false;
  if (u.addressDetail !== undefined && typeof u.addressDetail !== 'string') return false;
  if (
    u.businessType !== undefined &&
    u.businessType !== 'freelancer' &&
    u.businessType !== 'individual' &&
    u.businessType !== 'corporation'
  ) {
    return false;
  }
  if (
    u.plan !== undefined &&
    u.plan !== 'free' &&
    u.plan !== 'basic' &&
    u.plan !== 'pro'
  ) {
    return false;
  }
  if (u.metadata !== undefined && !isUserMetadata(u.metadata)) return false;

  return true;
}

/**
 * Validate user metadata structure
 *
 * @param metadata - Metadata object to validate
 * @returns True if metadata is valid
 */
export function isUserMetadata(metadata: unknown): metadata is UserMetadata {
  if (typeof metadata !== 'object' || metadata === null) {
    return false;
  }

  const meta = metadata as UserMetadata;

  // Optional fields validation
  if (meta.theme !== undefined && meta.theme !== 'light' && meta.theme !== 'dark') {
    return false;
  }

  if (meta.language !== undefined && meta.language !== 'ko' && meta.language !== 'en') {
    return false;
  }

  if (meta.timezone !== undefined && typeof meta.timezone !== 'string') {
    return false;
  }

  return true;
}

/**
 * Partial user type for updates
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>;

/**
 * User creation payload (without auto-generated fields)
 */
export type UserCreate = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
