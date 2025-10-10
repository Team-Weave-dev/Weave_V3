/**
 * TodoSection Entity Type Definitions
 *
 * This file defines the TodoSection entity schema and related types.
 * TodoSections act as folders/categories for organizing tasks.
 */

import type { JsonObject } from '../base';
import { isValidISODate } from '../validators';

/**
 * TodoSection entity
 */
export interface TodoSection extends JsonObject {
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

  /** Section name */
  name: string;

  /** Display order (0-based index) */
  orderIndex: number;

  /** Whether the section is expanded in UI */
  isExpanded: boolean;

  // ========================================
  // Styling (Optional)
  // ========================================

  /** Section color (hex, optional) */
  color?: string;

  /** Section icon (emoji or icon name, optional) */
  icon?: string;

  // ========================================
  // Metadata
  // ========================================

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for TodoSection
 */
export function isTodoSection(data: unknown): data is TodoSection {
  if (typeof data !== 'object' || data === null) return false;

  const section = data as TodoSection;

  // Required fields
  if (!section.id || typeof section.id !== 'string') return false;
  if (!section.userId || typeof section.userId !== 'string') return false;
  if (!section.name || typeof section.name !== 'string') return false;
  if (typeof section.orderIndex !== 'number') return false;
  if (typeof section.isExpanded !== 'boolean') return false;
  if (!isValidISODate(section.createdAt)) return false;
  if (!isValidISODate(section.updatedAt)) return false;

  // Optional fields
  if (section.color !== undefined && typeof section.color !== 'string') return false;
  if (section.icon !== undefined && typeof section.icon !== 'string') return false;

  // Validation: orderIndex must be non-negative
  if (section.orderIndex < 0) return false;

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial TodoSection type for updates
 */
export type TodoSectionUpdate = Partial<Omit<TodoSection, 'id' | 'userId' | 'createdAt'>>;

/**
 * TodoSection creation payload (without auto-generated fields)
 */
export type TodoSectionCreate = Omit<TodoSection, 'id' | 'createdAt' | 'updatedAt'>;
