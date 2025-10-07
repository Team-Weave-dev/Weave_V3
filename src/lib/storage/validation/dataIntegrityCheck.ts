/**
 * Data Integrity Check System
 *
 * This module validates data consistency between LocalStorage and Supabase.
 * It compares entity counts and performs deep equality checks to ensure
 * data integrity during DualWrite mode operation.
 *
 * Features:
 * - Entity-by-entity comparison
 * - Deep equality validation
 * - Mismatch detection and reporting
 * - Comprehensive validation reports
 */

import type { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { SupabaseAdapter } from '../adapters/SupabaseAdapter';

/**
 * Result of integrity check for a single entity
 */
export interface IntegrityCheckResult {
  /** Entity name (e.g., 'projects', 'tasks') */
  entity: string;
  /** Whether data matches between sources */
  match: boolean;
  /** Number of items in LocalStorage */
  localCount: number;
  /** Number of items in Supabase */
  supabaseCount: number;
  /** Detailed mismatches if found */
  mismatches?: Array<{
    id: string;
    field: string;
    localValue: unknown;
    supabaseValue: unknown;
  }>;
  /** Any errors encountered during check */
  error?: string;
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  /** When validation was performed */
  timestamp: string;
  /** Overall data integrity status */
  overallMatch: boolean;
  /** Individual entity results */
  results: IntegrityCheckResult[];
  /** Summary statistics */
  summary: {
    totalEntities: number;
    matchedEntities: number;
    failedEntities: number;
    erroredEntities: number;
  };
  /** Total validation duration */
  duration: number;
}

/**
 * Deep equality comparison function
 * Compares two objects recursively, ignoring certain metadata fields
 */
function deepEqual(obj1: unknown, obj2: unknown, ignoreFields: string[] = []): boolean {
  // Primitive comparison
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1 as Record<string, unknown>).filter(k => !ignoreFields.includes(k));
  const keys2 = Object.keys(obj2 as Record<string, unknown>).filter(k => !ignoreFields.includes(k));

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;

    const val1 = (obj1 as Record<string, unknown>)[key];
    const val2 = (obj2 as Record<string, unknown>)[key];

    if (!deepEqual(val1, val2, ignoreFields)) return false;
  }

  return true;
}

/**
 * Find mismatches between two objects
 */
function findMismatches(
  id: string,
  local: Record<string, unknown>,
  supabase: Record<string, unknown>,
  ignoreFields: string[] = []
): Array<{ id: string; field: string; localValue: unknown; supabaseValue: unknown }> {
  const mismatches: Array<{ id: string; field: string; localValue: unknown; supabaseValue: unknown }> = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(supabase)]);

  for (const key of allKeys) {
    if (ignoreFields.includes(key)) continue;

    const localValue = local[key];
    const supabaseValue = supabase[key];

    if (!deepEqual(localValue, supabaseValue, ignoreFields)) {
      mismatches.push({
        id,
        field: key,
        localValue,
        supabaseValue,
      });
    }
  }

  return mismatches;
}

/**
 * Check integrity for a single entity
 *
 * @param entity - Entity key (e.g., 'projects', 'tasks')
 * @param localAdapter - LocalStorage adapter
 * @param supabaseAdapter - Supabase adapter
 * @param options - Check options
 * @returns Integrity check result
 */
export async function checkEntityIntegrity(
  entity: string,
  localAdapter: LocalStorageAdapter,
  supabaseAdapter: SupabaseAdapter,
  options?: {
    /** Fields to ignore during comparison (e.g., timestamps) */
    ignoreFields?: string[];
    /** Whether to perform deep equality check */
    deepCheck?: boolean;
  }
): Promise<IntegrityCheckResult> {
  const ignoreFields = options?.ignoreFields || ['updated_at', 'modified_date'];
  const deepCheck = options?.deepCheck !== false;

  try {
    // Fetch data from both sources
    const localData = await localAdapter.get(entity);
    const supabaseData = await supabaseAdapter.get(entity);

    // Handle null data
    if (localData === null && supabaseData === null) {
      return {
        entity,
        match: true,
        localCount: 0,
        supabaseCount: 0,
      };
    }

    if (localData === null || supabaseData === null) {
      return {
        entity,
        match: false,
        localCount: Array.isArray(localData) ? localData.length : localData ? 1 : 0,
        supabaseCount: Array.isArray(supabaseData) ? supabaseData.length : supabaseData ? 1 : 0,
        error: 'One source has no data',
      };
    }

    // Handle non-array data (single objects like settings)
    if (!Array.isArray(localData) || !Array.isArray(supabaseData)) {
      const match = deepEqual(localData, supabaseData, ignoreFields);
      const mismatches = match
        ? undefined
        : findMismatches('single', localData as Record<string, unknown>, supabaseData as Record<string, unknown>, ignoreFields);

      return {
        entity,
        match,
        localCount: 1,
        supabaseCount: 1,
        mismatches,
      };
    }

    // Array data comparison
    const localCount = localData.length;
    const supabaseCount = supabaseData.length;

    // Count mismatch
    if (localCount !== supabaseCount) {
      return {
        entity,
        match: false,
        localCount,
        supabaseCount,
        error: `Count mismatch: ${localCount} vs ${supabaseCount}`,
      };
    }

    // Deep check if requested
    if (deepCheck) {
      const allMismatches: Array<{ id: string; field: string; localValue: unknown; supabaseValue: unknown }> = [];

      for (const localItem of localData) {
        const localRecord = localItem as Record<string, unknown>;
        const itemId = localRecord.id as string;

        const supabaseItem = supabaseData.find(
          (item) => (item as Record<string, unknown>).id === itemId
        );

        if (!supabaseItem) {
          allMismatches.push({
            id: itemId,
            field: '__missing__',
            localValue: 'exists',
            supabaseValue: 'missing',
          });
          continue;
        }

        const itemMismatches = findMismatches(
          itemId,
          localRecord,
          supabaseItem as Record<string, unknown>,
          ignoreFields
        );

        allMismatches.push(...itemMismatches);
      }

      const match = allMismatches.length === 0;

      return {
        entity,
        match,
        localCount,
        supabaseCount,
        mismatches: match ? undefined : allMismatches.slice(0, 10), // Limit to first 10
      };
    }

    // Basic count match (no deep check)
    return {
      entity,
      match: true,
      localCount,
      supabaseCount,
    };
  } catch (error) {
    return {
      entity,
      match: false,
      localCount: 0,
      supabaseCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Validate data integrity across all entities
 *
 * @param localAdapter - LocalStorage adapter
 * @param supabaseAdapter - Supabase adapter
 * @param options - Validation options
 * @returns Complete validation report
 */
export async function validateDataIntegrity(
  localAdapter: LocalStorageAdapter,
  supabaseAdapter: SupabaseAdapter,
  options?: {
    /** Entities to check (defaults to all) */
    entities?: string[];
    /** Fields to ignore during comparison */
    ignoreFields?: string[];
    /** Whether to perform deep equality check */
    deepCheck?: boolean;
  }
): Promise<ValidationReport> {
  const startTime = Date.now();

  // Default entities to check
  const entitiesToCheck = options?.entities || [
    'projects',
    'tasks',
    'events',
    'clients',
    'documents',
    'settings',
  ];

  // Check each entity
  const results: IntegrityCheckResult[] = [];

  for (const entity of entitiesToCheck) {
    const result = await checkEntityIntegrity(entity, localAdapter, supabaseAdapter, {
      ignoreFields: options?.ignoreFields,
      deepCheck: options?.deepCheck,
    });
    results.push(result);
  }

  // Calculate summary
  const matchedEntities = results.filter((r) => r.match).length;
  const failedEntities = results.filter((r) => !r.match && !r.error).length;
  const erroredEntities = results.filter((r) => r.error).length;
  const overallMatch = matchedEntities === results.length;

  const duration = Date.now() - startTime;

  return {
    timestamp: new Date().toISOString(),
    overallMatch,
    results,
    summary: {
      totalEntities: results.length,
      matchedEntities,
      failedEntities,
      erroredEntities,
    },
    duration,
  };
}

/**
 * Generate human-readable validation report
 *
 * @param report - Validation report
 * @returns Formatted report string
 */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('Data Integrity Validation Report');
  lines.push('='.repeat(60));
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Duration: ${report.duration}ms`);
  lines.push(`Overall Status: ${report.overallMatch ? '✅ PASS' : '❌ FAIL'}`);
  lines.push('');
  lines.push('Summary:');
  lines.push(`  Total Entities: ${report.summary.totalEntities}`);
  lines.push(`  Matched: ${report.summary.matchedEntities}`);
  lines.push(`  Failed: ${report.summary.failedEntities}`);
  lines.push(`  Errors: ${report.summary.erroredEntities}`);
  lines.push('');
  lines.push('Entity Details:');
  lines.push('-'.repeat(60));

  for (const result of report.results) {
    const status = result.match ? '✅' : result.error ? '⚠️' : '❌';
    lines.push(`${status} ${result.entity}`);
    lines.push(`   Local: ${result.localCount} items`);
    lines.push(`   Supabase: ${result.supabaseCount} items`);

    if (result.error) {
      lines.push(`   Error: ${result.error}`);
    }

    if (result.mismatches && result.mismatches.length > 0) {
      lines.push(`   Mismatches: ${result.mismatches.length}`);
      for (const mismatch of result.mismatches.slice(0, 3)) {
        lines.push(`     - ${mismatch.id}.${mismatch.field}`);
      }
      if (result.mismatches.length > 3) {
        lines.push(`     ... and ${result.mismatches.length - 3} more`);
      }
    }

    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}
