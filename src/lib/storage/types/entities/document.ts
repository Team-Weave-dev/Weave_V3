/**
 * Document Entity Type Definitions
 *
 * This file defines the Document entity schema and related types.
 * Supports contracts, invoices, estimates, reports, and other documents.
 */

import type { JsonObject } from '../base';
import { isValidISODate, isStringArray, isPositiveNumber } from '../validators';

/**
 * Document type
 */
export type DocumentType = 'contract' | 'invoice' | 'estimate' | 'report' | 'etc';

/**
 * Document status
 */
export type DocumentStatus = 'draft' | 'sent' | 'approved' | 'completed' | 'archived';

/**
 * Document source
 */
export type DocumentSource = 'generated' | 'uploaded' | 'imported';

/**
 * Document signature information
 */
export interface DocumentSignature extends JsonObject {
  /** Signer name */
  name: string;

  /** Signature timestamp (ISO 8601, optional) */
  signedAt?: string;

  /** IP address (optional) */
  ip?: string;
}

/**
 * Document entity
 */
export interface Document extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  /** Project ID (foreign key) */
  projectId: string;

  /** User ID (foreign key) */
  userId: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Document name */
  name: string;

  /** Document type */
  type: DocumentType;

  // ========================================
  // Status
  // ========================================

  /** Document status */
  status: DocumentStatus;

  // ========================================
  // Content
  // ========================================

  /** Document content (Markdown or HTML, optional) */
  content?: string;

  /** Template ID (optional) */
  templateId?: string;

  /** Document source (optional) */
  source?: DocumentSource;

  // ========================================
  // Metadata
  // ========================================

  /** Document version (optional) */
  version?: number;

  /** Document tags (optional) */
  tags?: string[];

  /** File size in bytes (optional) */
  size?: number;

  // ========================================
  // Signatures (for contracts)
  // ========================================

  /** Document signatures (optional) */
  signatures?: DocumentSignature[];

  /** Saved timestamp (ISO 8601) */
  savedAt: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for DocumentSignature
 */
export function isDocumentSignature(data: unknown): data is DocumentSignature {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as DocumentSignature).name === 'string'
  );
}

/**
 * Type guard for Document
 */
export function isDocument(data: unknown): data is Document {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Document;

  // Required fields
  if (!d.id || typeof d.id !== 'string') return false;
  if (!d.projectId || typeof d.projectId !== 'string') return false;
  if (!d.userId || typeof d.userId !== 'string') return false;
  if (!d.name || typeof d.name !== 'string') return false;
  if (!['contract', 'invoice', 'estimate', 'report', 'etc'].includes(d.type)) return false;
  if (!['draft', 'sent', 'approved', 'completed', 'archived'].includes(d.status)) return false;
  if (!isValidISODate(d.savedAt)) return false;
  if (!isValidISODate(d.createdAt)) return false;
  if (!isValidISODate(d.updatedAt)) return false;

  // Optional fields
  if (d.content !== undefined && typeof d.content !== 'string') return false;
  if (d.templateId !== undefined && typeof d.templateId !== 'string') return false;

  // Optional source validation
  if (
    d.source !== undefined &&
    !['generated', 'uploaded', 'imported'].includes(d.source)
  ) {
    return false;
  }

  // Optional number validation
  if (d.version !== undefined && !isPositiveNumber(d.version)) return false;
  if (d.size !== undefined && !isPositiveNumber(d.size)) return false;

  // Optional array validation
  if (d.tags !== undefined && !isStringArray(d.tags)) return false;

  // Optional signatures validation
  if (d.signatures !== undefined) {
    if (!Array.isArray(d.signatures)) return false;
    if (!d.signatures.every(isDocumentSignature)) return false;
  }

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial document type for updates
 */
export type DocumentUpdate = Partial<
  Omit<Document, 'id' | 'projectId' | 'userId' | 'createdAt'>
>;

/**
 * Document creation payload (without auto-generated fields)
 */
export type DocumentCreate = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>;
