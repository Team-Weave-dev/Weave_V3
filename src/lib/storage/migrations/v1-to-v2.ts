/**
 * V1 to V2 Migration Script
 *
 * This migration transforms data from the old localStorage structure (V1)
 * to the new centralized storage system (V2).
 *
 * Key changes:
 * - Unified key prefix (weave_v2_)
 * - Structured data organization
 * - Type-safe entity schemas
 * - Centralized settings management
 */

import type { StorageAdapter, Migration } from '../types/base';
import { STORAGE_KEYS } from '../config';

/**
 * V1 to V2 key mapping table
 *
 * Maps old localStorage keys to new V2 keys
 */
const KEY_MAPPING: Record<string, string> = {
  // Projects
  'weave_custom_projects': STORAGE_KEYS.PROJECTS,
  'weave_projects': STORAGE_KEYS.PROJECTS,

  // Dashboard layout
  'weave-dashboard-layout': 'settings.dashboard.layout',
  'weave_dashboard_layout': 'settings.dashboard.layout',

  // User data
  'weave_user': STORAGE_KEYS.USER_CURRENT,
  'weave_current_user': STORAGE_KEYS.USER_CURRENT,

  // Tasks
  'weave_tasks': STORAGE_KEYS.TASKS,
  'weave_todo_items': STORAGE_KEYS.TASKS,

  // Clients
  'weave_clients': STORAGE_KEYS.CLIENTS,
  'weave_custom_clients': STORAGE_KEYS.CLIENTS,

  // Calendar events
  'weave_events': STORAGE_KEYS.EVENTS,
  'weave_calendar_events': STORAGE_KEYS.EVENTS,

  // Settings
  'weave_settings': STORAGE_KEYS.SETTINGS,
  'weave_user_settings': STORAGE_KEYS.SETTINGS,

  // Theme
  'weave_theme': 'settings.theme',
  'theme': 'settings.theme',
};

/**
 * Keys to delete during migration (deprecated or obsolete)
 */
const KEYS_TO_DELETE = [
  'weave_v1_version',
  'weave_old_data',
  'weave_temp',
  'weave_cache',
];

/**
 * Migration from V1 to V2
 */
export const v1ToV2Migration: Migration = {
  version: 2,
  name: 'v1-to-v2',

  /**
   * Upgrade from V1 to V2
   */
  async up(adapter: StorageAdapter): Promise<void> {
    console.log('Starting V1 to V2 migration...');

    // Step 1: Get all existing keys
    const allKeys = await getAllLocalStorageKeys();
    console.log(`Found ${allKeys.length} total keys in localStorage`);

    // Step 2: Identify V1 keys
    const v1Keys = allKeys.filter(
      (key) =>
        key.startsWith('weave') &&
        !key.startsWith('weave_v2_') &&
        !key.startsWith('_')
    );
    console.log(`Identified ${v1Keys.length} V1 keys to migrate`);

    // Step 3: Migrate each V1 key
    let migratedCount = 0;
    let skippedCount = 0;

    for (const oldKey of v1Keys) {
      // Check if we have a mapping for this key
      const newKey = KEY_MAPPING[oldKey];

      if (newKey) {
        try {
          // Get old value
          const oldValue = await getFromRawLocalStorage(oldKey);

          if (oldValue !== null) {
            // Transform and store with new key
            const transformedValue = await transformData(
              oldKey,
              oldValue
            );
            await adapter.set(newKey, transformedValue);

            console.log(`✓ Migrated: ${oldKey} → ${newKey}`);
            migratedCount++;
          } else {
            console.log(`⊘ Skipped: ${oldKey} (empty value)`);
            skippedCount++;
          }
        } catch (error) {
          console.error(`✗ Error migrating ${oldKey}:`, error);
          // Continue with other keys even if one fails
        }
      } else {
        console.log(`⊘ Skipped: ${oldKey} (no mapping defined)`);
        skippedCount++;
      }
    }

    // Step 4: Clean up deprecated keys
    for (const keyToDelete of KEYS_TO_DELETE) {
      try {
        await deleteFromRawLocalStorage(keyToDelete);
        console.log(`✓ Deleted deprecated key: ${keyToDelete}`);
      } catch (error) {
        console.error(`✗ Error deleting ${keyToDelete}:`, error);
      }
    }

    console.log(`Migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
  },

  /**
   * Rollback from V2 to V1
   *
   * Note: This is a best-effort rollback. Some data transformations may not be perfectly reversible.
   */
  async down(adapter: StorageAdapter): Promise<void> {
    console.log('Rolling back V2 to V1...');

    // Get all V2 keys
    const v2Keys = await adapter.keys();

    // Reverse migrate each key
    for (const newKey of v2Keys) {
      // Find old key for this new key
      const oldKey = Object.keys(KEY_MAPPING).find(
        (k) => KEY_MAPPING[k] === newKey
      );

      if (oldKey) {
        try {
          const value = await adapter.get(newKey);
          if (value !== null) {
            await setToRawLocalStorage(oldKey, value);
            console.log(`✓ Rolled back: ${newKey} → ${oldKey}`);
          }
        } catch (error) {
          console.error(`✗ Error rolling back ${newKey}:`, error);
        }
      }
    }

    console.log('Rollback completed');
  },
};

/**
 * Transform data from V1 format to V2 format
 *
 * This function handles any necessary data structure transformations
 * between V1 and V2 schemas.
 *
 * @param oldKey - Original V1 key
 * @param oldValue - Original V1 value
 * @returns Transformed V2 value
 */
async function transformData(
  oldKey: string,
  oldValue: any
): Promise<any> {
  // Handle dashboard layout transformation
  if (oldKey.includes('dashboard')) {
    return transformDashboardLayout(oldValue);
  }

  // Handle projects transformation
  if (oldKey.includes('project')) {
    return transformProjects(oldValue);
  }

  // Handle tasks transformation
  if (oldKey.includes('task') || oldKey.includes('todo')) {
    return transformTasks(oldValue);
  }

  // Default: return as-is
  return oldValue;
}

/**
 * Transform dashboard layout data
 */
function transformDashboardLayout(data: any): any {
  // If data is already in V2 format, return as-is
  if (data && typeof data === 'object' && 'version' in data) {
    return data;
  }

  // Transform V1 layout to V2 format
  return {
    version: 2,
    layout: data,
    lastModified: new Date().toISOString(),
  };
}

/**
 * Transform projects data
 */
function transformProjects(data: any): any {
  if (!Array.isArray(data)) {
    return data;
  }

  // Ensure each project has required V2 fields
  return data.map((project: any) => ({
    ...project,
    // Add default values for new V2 fields if missing
    documentStatus: project.documentStatus || {},
    wbsTasks: project.wbsTasks || [],
    settlementMethod: project.settlementMethod || 'lumpsum',
    paymentStatus: project.paymentStatus || 'pending',
  }));
}

/**
 * Transform tasks data
 */
function transformTasks(data: any): any {
  if (!Array.isArray(data)) {
    return data;
  }

  // Ensure each task has required V2 fields
  return data.map((task: any) => ({
    ...task,
    // Add default values for new V2 fields if missing
    priority: task.priority || 'medium',
    status: task.status || 'pending',
    createdAt: task.createdAt || new Date().toISOString(),
  }));
}

// ============================================================================
// Raw localStorage Access Utilities
// ============================================================================

/**
 * Get all keys from raw localStorage (without adapter)
 */
function getAllLocalStorageKeys(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Get value from raw localStorage (without adapter)
 */
function getFromRawLocalStorage(key: string): any {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set value in raw localStorage (without adapter)
 */
function setToRawLocalStorage(key: string, value: any): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * Delete value from raw localStorage (without adapter)
 */
function deleteFromRawLocalStorage(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting localStorage key "${key}":`, error);
  }
}
