/**
 * Project Entity Type Definitions
 *
 * This file defines the Project entity schema and all related types.
 * Includes WBS system, payment tracking, and document management.
 */

import type { JsonObject } from '../base';

// ============================================================================
// Payment & Settlement Types
// ============================================================================

/**
 * Settlement method for project payments
 */
export type SettlementMethod =
  | 'not_set'              // Not set
  | 'advance_final'        // Advance + Final
  | 'advance_interim_final' // Advance + Interim + Final
  | 'post_payment';        // Post-payment

/**
 * Payment status tracking
 */
export type PaymentStatus =
  | 'advance_completed'    // Advance payment completed
  | 'interim_completed'    // Interim payment completed
  | 'final_completed'      // Final payment completed
  | 'not_started';         // Not started

// ============================================================================
// WBS (Work Breakdown Structure) Types
// ============================================================================

/**
 * WBS task status
 */
export type WBSTaskStatus = 'pending' | 'in_progress' | 'completed';

/**
 * WBS task item
 */
export interface WBSTask extends JsonObject {
  /** Unique task ID */
  id: string;

  /** Task name */
  name: string;

  /** Task description (optional) */
  description?: string;

  /** Task status */
  status: WBSTaskStatus;

  /** Assignee (optional) */
  assignee?: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Start timestamp (ISO 8601, optional) */
  startedAt?: string;

  /** Completion timestamp (ISO 8601, optional) */
  completedAt?: string;

  /** Display order for drag-and-drop */
  order: number;
}

// ============================================================================
// Document Types
// ============================================================================

/**
 * Individual document status
 */
export interface DocumentStatus {
  /** Whether document exists */
  exists: boolean;

  /** Document status */
  status: 'none' | 'draft' | 'completed' | 'approved' | 'sent';

  /** Last update timestamp (ISO 8601, optional) */
  lastUpdated?: string;

  /** Number of documents (for multiple documents) */
  count?: number;
}

/**
 * Project document status (comprehensive)
 */
export interface ProjectDocumentStatus extends JsonObject {
  /** Contract documents */
  contract: DocumentStatus;

  /** Invoice documents */
  invoice: DocumentStatus;

  /** Report documents */
  report: DocumentStatus;

  /** Estimate documents */
  estimate: DocumentStatus;

  /** Other documents */
  etc: DocumentStatus;
}

/**
 * Document basic information
 */
export interface DocumentInfo extends JsonObject {
  /** Document ID */
  id: string;

  /** Document name */
  name: string;

  /** Document type */
  type: 'contract' | 'invoice' | 'estimate' | 'report' | 'etc';

  /** Document status */
  status: 'draft' | 'sent' | 'approved' | 'completed' | 'archived';

  /** Saved timestamp (ISO 8601) */
  savedAt: string;
}

/**
 * Estimate information
 */
export interface EstimateInfo {
  /** Total estimate amount */
  totalAmount?: number;

  /** Estimate content */
  content?: string;

  /** Creation timestamp (ISO 8601) */
  createdAt?: string;

  /** Valid until timestamp (ISO 8601) */
  validUntil?: string;

  /** Estimate status */
  status?: 'draft' | 'sent' | 'approved' | 'rejected';
}

/**
 * Contract information
 */
export interface ContractInfo {
  /** Total contract amount */
  totalAmount?: number;

  /** Contract content */
  content?: string;

  /** Contractor information */
  contractorInfo?: {
    name: string;
    position: string;
  };

  /** Report information */
  reportInfo?: {
    type: string;
  };

  /** Estimate information */
  estimateInfo?: {
    type: string;
  };

  /** Document issuance information */
  documentIssue?: {
    taxInvoice: string;
    receipt: string;
    cashReceipt: string;
    businessReceipt: string;
  };

  /** Other information */
  other?: {
    date: string;
  };
}

/**
 * Billing/Settlement information
 */
export interface BillingInfo {
  /** Total project amount */
  totalAmount: number;

  /** Total paid amount (contract + interim + final) */
  paidAmount: number;

  /** Remaining unpaid amount */
  remainingAmount: number;

  /** Contract payment (advance payment) */
  contractAmount: number;

  /** Interim payment */
  interimAmount: number;

  /** Final payment */
  finalAmount: number;

  /** Actual contract payment received */
  contractPaid: number;

  /** Actual interim payment received */
  interimPaid: number;

  /** Actual final payment received */
  finalPaid: number;
}

// ============================================================================
// Project Entity
// ============================================================================

/**
 * Project status
 */
export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

/**
 * Project priority
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Project visibility
 */
export type ProjectVisibility = 'private' | 'team' | 'public';

/**
 * Project entity
 */
export interface Project extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  /** User ID (foreign key) */
  userId: string;

  /** Client ID (foreign key, optional) */
  clientId?: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Project number (e.g., WEAVE_001) */
  no: string;

  /** Project name */
  name: string;

  /** Project description (optional) */
  description?: string;

  /** Project detailed content (optional) */
  projectContent?: string;

  // ========================================
  // Status
  // ========================================

  /** Project status */
  status: ProjectStatus;

  /**
   * Project progress (0-100)
   * @deprecated Use WBS system for automatic calculation
   * Kept for backward compatibility, use as read-only
   */
  progress: number;

  /** Payment progress (0-100, optional) */
  paymentProgress?: number;

  // ========================================
  // Schedule
  // ========================================

  /** Start date (ISO 8601, optional) */
  startDate?: string;

  /** End date / Deadline (ISO 8601, optional) */
  endDate?: string;

  /** Registration date (ISO 8601) */
  registrationDate: string;

  /** Last modified date (ISO 8601) */
  modifiedDate: string;

  // ========================================
  // Budget & Payment
  // ========================================

  /** Budget amount (optional) */
  budget?: number;

  /** Actual cost (optional) */
  actualCost?: number;

  /** Total project amount (optional) */
  totalAmount?: number;

  /** Currency (KRW, USD, etc.) */
  currency?: string;

  // ========================================
  // Payment System
  // ========================================

  /** Settlement method (optional) */
  settlementMethod?: SettlementMethod;

  /** Payment status (optional) */
  paymentStatus?: PaymentStatus;

  // ========================================
  // WBS (Work Breakdown Structure)
  // ========================================

  /**
   * Project task list (single source of truth for progress)
   * Progress is automatically calculated from WBS tasks
   */
  wbsTasks: WBSTask[];

  // ========================================
  // Lazy Loading Flags
  // ========================================

  /** Contract exists flag */
  hasContract: boolean;

  /** Billing exists flag */
  hasBilling: boolean;

  /** Documents exist flag */
  hasDocuments: boolean;

  // ========================================
  // Detailed Information (Lazy Loading)
  // ========================================

  /** Contract information (optional, lazy loaded) */
  contract?: ContractInfo;

  /** Estimate information (optional, lazy loaded) */
  estimate?: EstimateInfo;

  /** Billing information (optional, lazy loaded) */
  billing?: BillingInfo;

  /** Document list (optional, lazy loaded) */
  documents?: DocumentInfo[];

  /** Document status summary (optional) */
  documentStatus?: ProjectDocumentStatus;

  // ========================================
  // Metadata
  // ========================================

  /** Project tags (optional) */
  tags?: string[];

  /** Project priority (optional) */
  priority?: ProjectPriority;

  /** Project visibility (optional) */
  visibility?: ProjectVisibility;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for WBSTask
 */
export function isWBSTask(data: unknown): data is WBSTask {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as WBSTask).id === 'string' &&
    'name' in data &&
    typeof (data as WBSTask).name === 'string' &&
    'status' in data &&
    ['pending', 'in_progress', 'completed'].includes((data as WBSTask).status) &&
    'order' in data &&
    typeof (data as WBSTask).order === 'number' &&
    'createdAt' in data &&
    typeof (data as WBSTask).createdAt === 'string'
  );
}

/**
 * Type guard for Project
 */
export function isProject(data: unknown): data is Project {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as Project).id === 'string' &&
    'userId' in data &&
    typeof (data as Project).userId === 'string' &&
    'no' in data &&
    typeof (data as Project).no === 'string' &&
    'name' in data &&
    typeof (data as Project).name === 'string' &&
    'status' in data &&
    ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'].includes(
      (data as Project).status
    ) &&
    'progress' in data &&
    typeof (data as Project).progress === 'number' &&
    'wbsTasks' in data &&
    Array.isArray((data as Project).wbsTasks) &&
    'hasContract' in data &&
    typeof (data as Project).hasContract === 'boolean' &&
    'hasBilling' in data &&
    typeof (data as Project).hasBilling === 'boolean' &&
    'hasDocuments' in data &&
    typeof (data as Project).hasDocuments === 'boolean' &&
    'createdAt' in data &&
    typeof (data as Project).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as Project).updatedAt === 'string'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial project type for updates
 */
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>;

/**
 * Project creation payload (without auto-generated fields)
 */
export type ProjectCreate = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Project list item (without heavy lazy-loaded fields)
 */
export type ProjectListItem = Omit<
  Project,
  'contract' | 'estimate' | 'billing' | 'documents'
>;
