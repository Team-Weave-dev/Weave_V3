/**
 * Client Entity Type Definitions
 *
 * This file defines the Client entity schema and related types.
 * Designed for business client/customer management.
 */

import type { JsonObject } from '../base';

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

  // All fields are optional, just check types if present
  if (addr.street !== undefined && typeof addr.street !== 'string') return false;
  if (addr.city !== undefined && typeof addr.city !== 'string') return false;
  if (addr.state !== undefined && typeof addr.state !== 'string') return false;
  if (addr.zipCode !== undefined && typeof addr.zipCode !== 'string') return false;
  if (addr.country !== undefined && typeof addr.country !== 'string') return false;

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
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as Client).id === 'string' &&
    'userId' in data &&
    typeof (data as Client).userId === 'string' &&
    'name' in data &&
    typeof (data as Client).name === 'string' &&
    'createdAt' in data &&
    typeof (data as Client).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as Client).updatedAt === 'string'
  );
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
