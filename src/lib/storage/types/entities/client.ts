/**
 * Client Entity Type Definitions
 *
 * This file defines the Client entity schema and related types.
 * Designed for business client/customer management.
 */

import type { JsonObject } from '../base';
import {
  isValidEmail,
  isValidURL,
  isValidISODate,
  isNumberInRange,
  isStringArray,
} from '../validators';

/**
 * Client address information
 */
export interface ClientAddress {
  /** Street address (optional) */
  street?: string;

  /** City (optional) */
  city?: string;

  /** State/Province (optional) */
  state?: string;

  /** ZIP/Postal code (optional) */
  zipCode?: string;

  /** Country (optional) */
  country?: string;
}

/**
 * Client contact person
 */
export interface ClientContact extends JsonObject {
  /** Contact person name */
  name: string;

  /** Role/Position (optional) */
  role?: string;

  /** Email address (optional) */
  email?: string;

  /** Phone number (optional) */
  phone?: string;

  /** Primary contact flag (optional) */
  isPrimary?: boolean;
}

/**
 * Client entity
 */
export interface Client extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  /** User ID (foreign key) */
  userId: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Client name */
  name: string;

  /** Company name (optional) */
  company?: string;

  /** Email address (optional) */
  email?: string;

  /** Phone number (optional) */
  phone?: string;

  // ========================================
  // Address
  // ========================================

  /** Address information (optional) */
  address?: ClientAddress;

  // ========================================
  // Business Information
  // ========================================

  /** Business registration number (optional) */
  businessNumber?: string;

  /** Tax ID (optional) */
  taxId?: string;

  /** Website URL (optional) */
  website?: string;

  /** Industry sector (optional) */
  industry?: string;

  // ========================================
  // Contacts
  // ========================================

  /** Contact persons list (optional) */
  contacts?: ClientContact[];

  // ========================================
  // Metadata
  // ========================================

  /** Client tags (optional) */
  tags?: string[];

  /** Internal notes (optional) */
  notes?: string;

  /** Client rating 1-5 (optional) */
  rating?: number;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for ClientAddress
 */
export function isClientAddress(data: unknown): data is ClientAddress {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const addr = data as ClientAddress;

  // All fields are optional, just check types if present (use != null to handle both null and undefined)
  if (addr.street != null && typeof addr.street !== 'string') return false;
  if (addr.city != null && typeof addr.city !== 'string') return false;
  if (addr.state != null && typeof addr.state !== 'string') return false;
  if (addr.zipCode != null && typeof addr.zipCode !== 'string') return false;
  if (addr.country != null && typeof addr.country !== 'string') return false;

  return true;
}

/**
 * Type guard for ClientContact
 */
export function isClientContact(data: unknown): data is ClientContact {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as ClientContact).name === 'string'
  );
}

/**
 * Type guard for Client
 */
export function isClient(data: unknown): data is Client {
  if (typeof data !== 'object' || data === null) return false;

  const c = data as Client;

  // Required fields
  if (!c.id || typeof c.id !== 'string') return false;
  if (!c.userId || typeof c.userId !== 'string') return false;
  if (!c.name || typeof c.name !== 'string') return false;
  if (!isValidISODate(c.createdAt)) return false;
  if (!isValidISODate(c.updatedAt)) return false;

  // Optional fields with format validation (use != null to handle both null and undefined)
  if (c.company != null && typeof c.company !== 'string') return false;
  if (c.email != null && !isValidEmail(c.email)) return false;
  if (c.phone != null && typeof c.phone !== 'string') return false;
  if (c.website != null && !isValidURL(c.website)) return false;

  // Optional address validation
  if (c.address != null && !isClientAddress(c.address)) return false;

  // Optional business fields
  if (c.businessNumber != null && typeof c.businessNumber !== 'string') return false;
  if (c.taxId != null && typeof c.taxId !== 'string') return false;
  if (c.industry != null && typeof c.industry !== 'string') return false;

  // Optional contacts array validation
  if (c.contacts != null) {
    if (!Array.isArray(c.contacts)) return false;
    if (!c.contacts.every(isClientContact)) return false;
  }

  // Optional metadata
  if (c.tags != null && !isStringArray(c.tags)) return false;
  if (c.notes != null && typeof c.notes !== 'string') return false;

  // Rating validation (1-5 range)
  if (c.rating != null && !isNumberInRange(c.rating, 1, 5)) return false;

  // Optional updated_by validation
  if (c.updated_by != null && typeof c.updated_by !== 'string') return false;

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial client type for updates
 */
export type ClientUpdate = Partial<Omit<Client, 'id' | 'userId' | 'createdAt'>>;

/**
 * Client creation payload (without auto-generated fields)
 */
export type ClientCreate = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
