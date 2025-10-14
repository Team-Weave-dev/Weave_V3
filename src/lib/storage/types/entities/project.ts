/**
 * Project Entity Type Definitions
 *
 * This file defines the Project entity schema and all related types.
 * Includes WBS system, payment tracking, and document management.
 */

import type { JsonObject } from '../base';
import {
  isValidISODate,
  isValidDateRange,
  isNumberInRange,
  isStringArray,
} from '../validators';

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

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;

  /** Device ID that made the last update (for audit trail) */
  device_id?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for WBSTask
 */
export function isWBSTask(data: unknown): data is WBSTask {
  if (typeof data !== 'object' || data === null) {
    console.error('[isWBSTask] Not an object or null');
    return false;
  }

  const task = data as WBSTask;

  // Required fields
  if (!task.id || typeof task.id !== 'string') {
    console.error('[isWBSTask] Invalid id:', task.id);
    return false;
  }
  if (!task.name || typeof task.name !== 'string') {
    console.error('[isWBSTask] Invalid name:', task.name);
    return false;
  }
  if (!['pending', 'in_progress', 'completed'].includes(task.status)) {
    console.error('[isWBSTask] Invalid status:', task.status);
    return false;
  }
  if (typeof task.order !== 'number') {
    console.error('[isWBSTask] Invalid order:', task.order);
    return false;
  }
  if (!isValidISODate(task.createdAt)) {
    console.error('[isWBSTask] Invalid createdAt:', task.createdAt);
    return false;
  }

  // Optional fields with more lenient validation
  if (task.description !== undefined && task.description !== null && typeof task.description !== 'string') {
    console.error('[isWBSTask] Invalid description:', task.description);
    return false;
  }
  if (task.assignee !== undefined && task.assignee !== null && typeof task.assignee !== 'string') {
    console.error('[isWBSTask] Invalid assignee:', task.assignee);
    return false;
  }

  // Optional timestamp fields - allow null or empty string
  if (task.startedAt !== undefined && task.startedAt !== null && task.startedAt !== '') {
    if (!isValidISODate(task.startedAt)) {
      console.error('[isWBSTask] Invalid startedAt:', task.startedAt);
      return false;
    }
  }
  if (task.completedAt !== undefined && task.completedAt !== null && task.completedAt !== '') {
    if (!isValidISODate(task.completedAt)) {
      console.error('[isWBSTask] Invalid completedAt:', task.completedAt);
      return false;
    }
  }

  // Date logic validation - only if both dates are present and valid
  if (task.startedAt && task.completedAt &&
      task.startedAt !== '' && task.completedAt !== '' &&
      !isValidDateRange(task.startedAt, task.completedAt)) {
    console.error('[isWBSTask] Invalid date range:', { startedAt: task.startedAt, completedAt: task.completedAt });
    return false;
  }

  return true;
}

/**
 * Type guard for Project
 */
export function isProject(data: unknown): data is Project {
  if (typeof data !== 'object' || data === null) {
    console.error('[isProject] Not an object or null');
    return false;
  }

  const p = data as Project;

  // Required identity fields
  if (!p.id || typeof p.id !== 'string') {
    console.error('[isProject] Invalid id:', p.id);
    return false;
  }
  if (!p.userId || typeof p.userId !== 'string') {
    console.error('[isProject] Invalid userId:', p.userId);
    return false;
  }

  // Required basic information
  if (!p.no || typeof p.no !== 'string') {
    console.error('[isProject] Invalid no:', p.no);
    return false;
  }
  if (!p.name || typeof p.name !== 'string') {
    console.error('[isProject] Invalid name:', p.name);
    return false;
  }

  // Status validation
  if (
    !['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'].includes(p.status)
  ) {
    console.error('[isProject] Invalid status:', p.status);
    return false;
  }

  // Progress validation (0-100 range)
  if (!isNumberInRange(p.progress, 0, 100)) {
    console.error('[isProject] Invalid progress:', p.progress);
    return false;
  }

  // WBS Tasks validation (array and each element)
  if (!Array.isArray(p.wbsTasks)) {
    console.error('[isProject] wbsTasks is not an array:', p.wbsTasks);
    return false;
  }

  // Validate each WBS task with detailed logging
  for (let i = 0; i < p.wbsTasks.length; i++) {
    if (!isWBSTask(p.wbsTasks[i])) {
      console.error(`[isProject] Invalid WBS task at index ${i}:`, p.wbsTasks[i]);
      return false;
    }
  }

  // Lazy loading flags
  if (typeof p.hasContract !== 'boolean') {
    console.error('[isProject] Invalid hasContract:', p.hasContract);
    return false;
  }
  if (typeof p.hasBilling !== 'boolean') {
    console.error('[isProject] Invalid hasBilling:', p.hasBilling);
    return false;
  }
  if (typeof p.hasDocuments !== 'boolean') {
    console.error('[isProject] Invalid hasDocuments:', p.hasDocuments);
    return false;
  }

  // Timestamps validation
  if (!isValidISODate(p.createdAt)) {
    console.error('[isProject] Invalid createdAt:', p.createdAt);
    return false;
  }
  if (!isValidISODate(p.updatedAt)) {
    console.error('[isProject] Invalid updatedAt:', p.updatedAt);
    return false;
  }
  if (!isValidISODate(p.registrationDate)) {
    console.error('[isProject] Invalid registrationDate:', p.registrationDate);
    return false;
  }
  if (!isValidISODate(p.modifiedDate)) {
    console.error('[isProject] Invalid modifiedDate:', p.modifiedDate);
    return false;
  }

  // Optional fields validation (use != null to handle both null and undefined)
  if (p.clientId != null && typeof p.clientId !== 'string') {
    console.error('[isProject] Invalid clientId:', p.clientId);
    return false;
  }
  if (p.description != null && typeof p.description !== 'string') {
    console.error('[isProject] Invalid description:', p.description);
    return false;
  }
  if (p.projectContent != null && typeof p.projectContent !== 'string') {
    console.error('[isProject] Invalid projectContent:', p.projectContent);
    return false;
  }

  // Optional progress validation
  if (p.paymentProgress != null && !isNumberInRange(p.paymentProgress, 0, 100)) {
    console.error('[isProject] Invalid paymentProgress:', p.paymentProgress);
    return false;
  }

  // Optional date validation
  if (p.startDate != null && !isValidISODate(p.startDate)) {
    console.error('[isProject] Invalid startDate:', p.startDate);
    return false;
  }
  if (p.endDate != null && !isValidISODate(p.endDate)) {
    console.error('[isProject] Invalid endDate:', p.endDate);
    return false;
  }

  // Date range validation
  if (p.startDate && p.endDate && !isValidDateRange(p.startDate, p.endDate)) {
    console.error('[isProject] Invalid date range:', { startDate: p.startDate, endDate: p.endDate });
    return false;
  }

  // Optional number validation
  if (p.budget != null && typeof p.budget !== 'number') {
    console.error('[isProject] Invalid budget:', p.budget);
    return false;
  }
  if (p.actualCost != null && typeof p.actualCost !== 'number') {
    console.error('[isProject] Invalid actualCost:', p.actualCost);
    return false;
  }
  if (p.totalAmount != null && typeof p.totalAmount !== 'number') {
    console.error('[isProject] Invalid totalAmount:', p.totalAmount);
    return false;
  }

  // Optional string validation
  if (p.currency != null && typeof p.currency !== 'string') {
    console.error('[isProject] Invalid currency:', p.currency);
    return false;
  }

  // Optional enum validation
  if (
    p.settlementMethod != null &&
    !['not_set', 'advance_final', 'advance_interim_final', 'post_payment'].includes(
      p.settlementMethod
    )
  ) {
    console.error('[isProject] Invalid settlementMethod:', p.settlementMethod);
    return false;
  }

  if (
    p.paymentStatus != null &&
    !['advance_completed', 'interim_completed', 'final_completed', 'not_started'].includes(
      p.paymentStatus
    )
  ) {
    console.error('[isProject] Invalid paymentStatus:', p.paymentStatus);
    return false;
  }

  if (
    p.priority != null &&
    !['low', 'medium', 'high', 'urgent'].includes(p.priority)
  ) {
    console.error('[isProject] Invalid priority:', p.priority);
    return false;
  }

  if (
    p.visibility != null &&
    !['private', 'team', 'public'].includes(p.visibility)
  ) {
    console.error('[isProject] Invalid visibility:', p.visibility);
    return false;
  }

  // Optional array validation
  if (p.tags != null && !isStringArray(p.tags)) {
    console.error('[isProject] Invalid tags:', p.tags);
    return false;
  }

  // Optional updated_by validation
  if (p.updated_by != null && typeof p.updated_by !== 'string') {
    console.error('[isProject] Invalid updated_by:', p.updated_by);
    return false;
  }

  // Optional device_id validation
  if (p.device_id != null && typeof p.device_id !== 'string') {
    console.error('[isProject] Invalid device_id:', p.device_id);
    return false;
  }

  // DocumentStatus validation (if present)
  if (p.documentStatus != null) {
    if (typeof p.documentStatus !== 'object' || p.documentStatus === null) {
      console.error('[isProject] Invalid documentStatus (not an object):', p.documentStatus);
      return false;
    }

    // Validate each document type status
    const docTypes = ['contract', 'invoice', 'estimate', 'report', 'etc'] as const;
    for (const docType of docTypes) {
      const docStatus = p.documentStatus[docType];
      if (!docStatus) continue;

      // Validate required fields
      if (typeof docStatus.exists !== 'boolean') {
        console.error(`[isProject] Invalid documentStatus.${docType}.exists:`, docStatus.exists);
        return false;
      }
      if (!['none', 'draft', 'completed', 'approved', 'sent'].includes(docStatus.status)) {
        console.error(`[isProject] Invalid documentStatus.${docType}.status:`, docStatus.status);
        return false;
      }

      // Validate optional timestamp fields with better error handling
      if (docStatus.lastUpdated != null) {
        // Allow empty string (treat as undefined)
        if (docStatus.lastUpdated === '') {
          console.warn(`[isProject] documentStatus.${docType}.lastUpdated is empty, treating as undefined`);
        } else if (!isValidISODate(docStatus.lastUpdated)) {
          console.error(`[isProject] Invalid documentStatus.${docType}.lastUpdated:`, docStatus.lastUpdated);
          return false;
        }
      }

      // Support both lastUpdated and latestSavedAt (legacy)
      if ('latestSavedAt' in docStatus) {
        const latestSavedAt = (docStatus as any).latestSavedAt;
        if (latestSavedAt != null && latestSavedAt !== '') {
          if (!isValidISODate(latestSavedAt)) {
            console.error(`[isProject] Invalid documentStatus.${docType}.latestSavedAt:`, latestSavedAt);
            return false;
          }
        }
      }

      if (docStatus.count != null && typeof docStatus.count !== 'number') {
        console.error(`[isProject] Invalid documentStatus.${docType}.count:`, docStatus.count);
        return false;
      }
    }
  }

  return true;
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
