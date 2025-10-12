/**
 * TaxSchedule Entity Type Definitions
 *
 * This file defines the TaxSchedule entity schema and related types.
 * Supports public tax schedules viewable by all users.
 */

import type { JsonObject } from '../base';
import { isValidISODate } from '../validators';

/**
 * Tax category types
 */
export type TaxCategory =
  | 'vat'                     // 부가가치세
  | 'income_tax'              // 종합소득세
  | 'corporate_tax'           // 법인세
  | 'withholding_tax'         // 원천세
  | 'year_end_settlement'     // 연말정산
  | 'other';                  // 기타

/**
 * Tax schedule type
 */
export type TaxScheduleType =
  | 'filing'                  // 신고
  | 'payment'                 // 납부
  | 'report'                  // 보고
  | 'other';                  // 기타

/**
 * TaxSchedule entity
 */
export interface TaxSchedule extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Tax schedule title */
  title: string;

  /** Tax schedule description (optional) */
  description?: string;

  // ========================================
  // Date
  // ========================================

  /** Tax date (ISO 8601 date format: YYYY-MM-DD) */
  taxDate: string;

  // ========================================
  // Classification
  // ========================================

  /** Tax category */
  category: TaxCategory;

  /** Tax schedule type */
  type: TaxScheduleType;

  // ========================================
  // Recurring Configuration
  // ========================================

  /** Recurring yearly flag */
  recurring: boolean;

  // ========================================
  // Display Options
  // ========================================

  /** Display color (hex format, optional) */
  color?: string;

  // ========================================
  // Metadata
  // ========================================

  /** Additional metadata (JSON object, optional) */
  metadata?: JsonObject;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for TaxCategory
 */
export function isTaxCategory(value: unknown): value is TaxCategory {
  return (
    typeof value === 'string' &&
    [
      'vat',
      'income_tax',
      'corporate_tax',
      'withholding_tax',
      'year_end_settlement',
      'other',
    ].includes(value)
  );
}

/**
 * Type guard for TaxScheduleType
 */
export function isTaxScheduleType(value: unknown): value is TaxScheduleType {
  return (
    typeof value === 'string' &&
    ['filing', 'payment', 'report', 'other'].includes(value)
  );
}

/**
 * Type guard for TaxSchedule
 */
export function isTaxSchedule(data: unknown): data is TaxSchedule {
  if (typeof data !== 'object' || data === null) return false;

  const t = data as TaxSchedule;

  // Required fields
  if (!t.id || typeof t.id !== 'string') return false;
  if (!t.title || typeof t.title !== 'string') return false;
  if (!t.taxDate || typeof t.taxDate !== 'string') return false;
  if (!isTaxCategory(t.category)) return false;
  if (!isTaxScheduleType(t.type)) return false;
  if (typeof t.recurring !== 'boolean') return false;
  if (!isValidISODate(t.createdAt)) return false;
  if (!isValidISODate(t.updatedAt)) return false;

  // Optional fields
  if (t.description !== undefined && typeof t.description !== 'string') return false;
  if (t.color !== undefined && typeof t.color !== 'string') return false;
  if (t.metadata !== undefined) {
    if (typeof t.metadata !== 'object' || Array.isArray(t.metadata)) return false;
  }

  // Validate taxDate format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(t.taxDate)) return false;

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial tax schedule type for updates
 */
export type TaxScheduleUpdate = Partial<
  Omit<TaxSchedule, 'id' | 'createdAt'>
>;

/**
 * Tax schedule creation payload (without auto-generated fields)
 */
export type TaxScheduleCreate = Omit<
  TaxSchedule,
  'id' | 'createdAt' | 'updatedAt'
>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Korean category name
 */
export function getTaxCategoryName(category: TaxCategory, lang: 'ko' | 'en' = 'ko'): string {
  const names = {
    vat: { ko: '부가가치세', en: 'VAT' },
    income_tax: { ko: '종합소득세', en: 'Income Tax' },
    corporate_tax: { ko: '법인세', en: 'Corporate Tax' },
    withholding_tax: { ko: '원천세', en: 'Withholding Tax' },
    year_end_settlement: { ko: '연말정산', en: 'Year-End Tax Settlement' },
    other: { ko: '기타', en: 'Other' },
  };

  return names[category][lang];
}

/**
 * Get Korean type name
 */
export function getTaxTypeName(type: TaxScheduleType, lang: 'ko' | 'en' = 'ko'): string {
  const names = {
    filing: { ko: '신고', en: 'Filing' },
    payment: { ko: '납부', en: 'Payment' },
    report: { ko: '보고', en: 'Report' },
    other: { ko: '기타', en: 'Other' },
  };

  return names[type][lang];
}

/**
 * Get category color
 */
export function getTaxCategoryColor(category: TaxCategory): string {
  const colors = {
    vat: '#F97316',                    // Orange
    income_tax: '#059669',             // Green
    corporate_tax: '#EF4444',          // Red
    withholding_tax: '#8B5CF6',        // Purple
    year_end_settlement: '#3B82F6',    // Blue
    other: '#10B981',                  // Emerald
  };

  return colors[category];
}
