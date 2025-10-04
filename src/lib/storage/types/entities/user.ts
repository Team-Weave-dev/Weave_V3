/**
 * User Entity Type Definitions
 *
 * This file defines the User entity schema and related types.
 * Designed for Supabase compatibility and localStorage storage.
 */

import { isValidEmail, isValidISODate } from '../validators';

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

  /** Account creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

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
