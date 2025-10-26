/**
 * Plan Entity Type Definitions
 *
 * This file defines the Plan entity schema and related types.
 * Designed for Supabase compatibility and localStorage storage.
 */

import { isValidISODate } from '../validators';

/**
 * Plan type
 */
export type PlanType = 'free' | 'basic' | 'pro';

/**
 * Plan limits
 */
export interface PlanLimits {
  projects: number; // -1 = unlimited
  widgets: number; // -1 = unlimited
  storage: number; // MB
  aiService: boolean;
}

/**
 * Plan entity representing subscription plans
 */
export interface Plan {
  /** Plan identifier (free, basic, pro) */
  id: PlanType;

  /** Plan name */
  name: string;

  /** Monthly price in KRW */
  price: number;

  /** Plan limits */
  limits: PlanLimits;

  /** Feature list */
  features: string[];

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * Type guard to check if data is a valid Plan
 *
 * @param data - Unknown data to validate
 * @returns True if data conforms to Plan interface
 */
export function isPlan(data: unknown): data is Plan {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Plan;

  // Required fields validation
  if (
    p.id !== 'free' &&
    p.id !== 'basic' &&
    p.id !== 'pro'
  ) {
    return false;
  }
  if (!p.name || typeof p.name !== 'string') return false;
  if (typeof p.price !== 'number' || p.price < 0) return false;
  if (!isValidISODate(p.createdAt)) return false;
  if (!isValidISODate(p.updatedAt)) return false;

  // Limits validation
  if (!p.limits || typeof p.limits !== 'object') return false;
  if (typeof p.limits.projects !== 'number') return false;
  if (typeof p.limits.widgets !== 'number') return false;
  if (typeof p.limits.storage !== 'number' || p.limits.storage <= 0) return false;
  if (typeof p.limits.aiService !== 'boolean') return false;

  // Features validation
  if (!Array.isArray(p.features)) return false;
  if (!p.features.every(f => typeof f === 'string')) return false;

  return true;
}

/**
 * Type guard for PlanLimits
 */
export function isPlanLimits(data: unknown): data is PlanLimits {
  if (typeof data !== 'object' || data === null) return false;

  const limits = data as PlanLimits;

  if (typeof limits.projects !== 'number') return false;
  if (typeof limits.widgets !== 'number') return false;
  if (typeof limits.storage !== 'number' || limits.storage <= 0) return false;
  if (typeof limits.aiService !== 'boolean') return false;

  return true;
}

/**
 * Partial plan type for updates
 */
export type PlanUpdate = Partial<Omit<Plan, 'id' | 'createdAt'>>;

/**
 * Plan creation payload (without auto-generated fields)
 */
export type PlanCreate = Omit<Plan, 'createdAt' | 'updatedAt'>;
