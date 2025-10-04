/**
 * User Entity Type Definitions
 *
 * This file defines the User entity schema and related types.
 * Designed for Supabase compatibility and localStorage storage.
 */

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
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as User).id === 'string' &&
    'email' in data &&
    typeof (data as User).email === 'string' &&
    'name' in data &&
    typeof (data as User).name === 'string' &&
    'createdAt' in data &&
    typeof (data as User).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as User).updatedAt === 'string'
  );
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
