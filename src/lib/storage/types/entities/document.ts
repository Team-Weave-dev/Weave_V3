/**
 * Document Entity Type Definitions
 *
 * This file defines the Document entity schema and related types.
 * Supports contracts, invoices, estimates, reports, and other documents.
 */

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
export interface DocumentSignature {
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
export interface Document {
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
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as Document).id === 'string' &&
    'projectId' in data &&
    typeof (data as Document).projectId === 'string' &&
    'userId' in data &&
    typeof (data as Document).userId === 'string' &&
    'name' in data &&
    typeof (data as Document).name === 'string' &&
    'type' in data &&
    ['contract', 'invoice', 'estimate', 'report', 'etc'].includes(
      (data as Document).type
    ) &&
    'status' in data &&
    ['draft', 'sent', 'approved', 'completed', 'archived'].includes(
      (data as Document).status
    ) &&
    'savedAt' in data &&
    typeof (data as Document).savedAt === 'string' &&
    'createdAt' in data &&
    typeof (data as Document).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as Document).updatedAt === 'string'
  );
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
