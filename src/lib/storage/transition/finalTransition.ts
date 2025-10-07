/**
 * Final Transition to Supabase
 *
 * This module handles the final transition from DualWrite mode to Supabase-only mode.
 * It includes comprehensive validation, safe transition mechanisms, and rollback capabilities.
 */

import { StorageManager } from '../core/StorageManager';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { SupabaseAdapter } from '../adapters/SupabaseAdapter';
import { DualWriteAdapter } from '../adapters/DualWriteAdapter';
import { createClient } from '@/lib/supabase/client';
import { validateDataIntegrity } from '../validation/dataIntegrityCheck';
import { StorageError } from '../types/base';

// Global storage manager instance tracking
let globalStorageManager: StorageManager | null = null;
let globalDualAdapter: DualWriteAdapter | null = null;

/**
 * Set global storage manager
 */
export function setGlobalStorageManager(manager: StorageManager) {
  globalStorageManager = manager;
}

/**
 * Get global storage manager
 */
export function getGlobalStorageManager(): StorageManager | null {
  return globalStorageManager;
}

/**
 * Set global DualWrite adapter
 */
export function setGlobalDualAdapter(adapter: DualWriteAdapter | null) {
  globalDualAdapter = adapter;
}

/**
 * Get global DualWrite adapter
 */
export function getGlobalDualAdapter(): DualWriteAdapter | null {
  return globalDualAdapter;
}

/**
 * Get current user ID from Supabase auth
 */
async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Transition result interface
 */
export interface TransitionResult {
  success: boolean;
  mode: 'supabase' | 'dualwrite' | 'localStorage';
  message: string;
  timestamp: string;
  validation?: {
    passed: boolean;
    details: Record<string, any>;
  };
  errors?: string[];
}

/**
 * Final data validation before transition
 */
export async function performFinalValidation(userId: string): Promise<{
  passed: boolean;
  details: Record<string, any>;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Create adapters for validation
    const localAdapter = new LocalStorageAdapter();
    const supabaseAdapter = new SupabaseAdapter({ userId });

    // Perform comprehensive validation
    const validationReport = await validateDataIntegrity(
      localAdapter,
      supabaseAdapter,
      {
        deepCheck: true,
        entities: ['projects', 'tasks', 'events', 'clients', 'documents', 'settings']
      }
    );

    // Check if all entities match
    const allMatch = validationReport.overallMatch;
    const matchDetails: Record<string, boolean> = {};

    validationReport.results.forEach(result => {
      matchDetails[result.entity] = result.match;
      if (!result.match) {
        errors.push(
          `${result.entity}: LocalStorage(${result.localCount}) vs Supabase(${result.supabaseCount})`
        );
        if (result.error) {
          errors.push(`  Error: ${result.error}`);
        }
        if (result.mismatches && result.mismatches.length > 0) {
          errors.push(`  Mismatches: ${result.mismatches.length} items`);
        }
      }
    });

    return {
      passed: allMatch,
      details: {
        ...validationReport.summary,
        entities: matchDetails,
        timestamp: validationReport.timestamp,
        duration: validationReport.duration
      },
      errors
    };

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      passed: false,
      details: {},
      errors
    };
  }
}

/**
 * Stop DualWrite sync worker
 */
export function stopDualWriteSync(): boolean {
  try {
    const dualAdapter = getGlobalDualAdapter();
    if (!dualAdapter) {
      console.warn('No DualWrite adapter found');
      return false;
    }

    // Stop sync worker
    dualAdapter.stopSyncWorker();

    // Get final sync stats
    const stats = dualAdapter.getSyncStats();
    console.log('DualWrite sync stopped. Final stats:', {
      totalAttempts: stats.totalAttempts,
      successCount: stats.successCount,
      failureCount: stats.failureCount,
      queueSize: stats.queueSize,
      successRate: ((stats.successCount / stats.totalAttempts) * 100).toFixed(1) + '%'
    });

    return true;
  } catch (error) {
    console.error('Failed to stop DualWrite sync:', error);
    return false;
  }
}

/**
 * Switch to Supabase-only mode
 */
export async function switchToSupabaseOnly(): Promise<TransitionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Get user ID
    const userId = await getUserId();
    if (!userId) {
      return {
        success: false,
        mode: 'localStorage',
        message: 'User not authenticated. Cannot switch to Supabase mode.',
        timestamp,
        errors: ['No authenticated user']
      };
    }

    // 2. Perform final validation
    console.log('Performing final data validation...');
    const validation = await performFinalValidation(userId);

    if (!validation.passed) {
      return {
        success: false,
        mode: 'dualwrite',
        message: 'Data validation failed. Cannot proceed with transition.',
        timestamp,
        validation,
        errors: validation.errors
      };
    }

    console.log('✅ Data validation passed');

    // 3. Stop DualWrite sync
    console.log('Stopping DualWrite sync worker...');
    const syncStopped = stopDualWriteSync();
    if (!syncStopped) {
      console.warn('DualWrite sync may not have stopped properly');
    }

    // 4. Create Supabase-only adapter
    console.log('Creating Supabase-only adapter...');
    const supabaseAdapter = new SupabaseAdapter({ userId });
    const newStorageManager = new StorageManager(supabaseAdapter);

    // 5. Update global storage manager
    setGlobalStorageManager(newStorageManager);
    setGlobalDualAdapter(null); // Clear DualWrite adapter reference

    // 6. Record transition in database
    const supabase = createClient();
    await supabase
      .from('migration_status')
      .insert({
        user_id: userId,
        version: 'supabase-only',
        migrated_at: timestamp,
        source_data: {
          mode: 'supabase',
          validation: validation.details,
          previousMode: 'dualwrite'
        }
      });

    console.log('✅ Successfully switched to Supabase-only mode');

    return {
      success: true,
      mode: 'supabase',
      message: 'Successfully transitioned to Supabase-only mode',
      timestamp,
      validation: {
        passed: true,
        details: validation.details
      }
    };

  } catch (error) {
    console.error('Transition failed:', error);
    return {
      success: false,
      mode: 'dualwrite',
      message: 'Failed to transition to Supabase-only mode',
      timestamp,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Clear LocalStorage data (optional cleanup)
 */
export async function clearLocalStorageData(confirm: boolean = false): Promise<{
  cleared: boolean;
  message: string;
}> {
  if (!confirm) {
    return {
      cleared: false,
      message: 'Confirmation required to clear LocalStorage data'
    };
  }

  try {
    const localAdapter = new LocalStorageAdapter();

    // Get all keys before clearing (for logging)
    const keys = ['projects', 'tasks', 'events', 'clients', 'documents', 'settings'];
    const dataSizes: Record<string, number> = {};

    for (const key of keys) {
      const data = await localAdapter.get(key);
      if (data) {
        const size = JSON.stringify(data).length;
        dataSizes[key] = size;
      }
    }

    // Clear all data
    await localAdapter.clear();

    console.log('LocalStorage cleared. Previous data sizes:', dataSizes);

    return {
      cleared: true,
      message: `LocalStorage cleared successfully. Cleared ${Object.keys(dataSizes).length} entities.`
    };

  } catch (error) {
    return {
      cleared: false,
      message: `Failed to clear LocalStorage: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Emergency rollback to DualWrite mode
 */
export async function rollbackToDualWrite(): Promise<TransitionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Get user ID
    const userId = await getUserId();
    if (!userId) {
      return {
        success: false,
        mode: 'localStorage',
        message: 'User not authenticated. Using LocalStorage mode.',
        timestamp,
        errors: ['No authenticated user']
      };
    }

    // 2. Create DualWrite adapter
    console.log('Creating DualWrite adapter...');
    const localAdapter = new LocalStorageAdapter();
    const supabaseAdapter = new SupabaseAdapter({ userId });

    const dualAdapter = new DualWriteAdapter({
      local: localAdapter,
      supabase: supabaseAdapter,
      syncInterval: 5000,
      enableSyncWorker: true,
      enableVerification: false
    });

    // 3. Create new storage manager with DualWrite
    const newStorageManager = new StorageManager(dualAdapter);

    // 4. Update global references
    setGlobalStorageManager(newStorageManager);
    setGlobalDualAdapter(dualAdapter);

    // 5. Record rollback in database
    const supabase = createClient();
    await supabase
      .from('migration_status')
      .insert({
        user_id: userId,
        version: 'rollback-to-dualwrite',
        migrated_at: timestamp,
        source_data: {
          mode: 'dualwrite',
          reason: 'Manual rollback',
          previousMode: 'supabase'
        }
      });

    console.log('✅ Successfully rolled back to DualWrite mode');

    return {
      success: true,
      mode: 'dualwrite',
      message: 'Successfully rolled back to DualWrite mode',
      timestamp
    };

  } catch (error) {
    console.error('Rollback failed:', error);
    return {
      success: false,
      mode: 'supabase',
      message: 'Failed to rollback to DualWrite mode',
      timestamp,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Emergency fallback to LocalStorage-only mode
 */
export async function emergencyFallbackToLocalStorage(): Promise<TransitionResult> {
  const timestamp = new Date().toISOString();

  try {
    console.log('🚨 Emergency fallback to LocalStorage-only mode');

    // 1. Try to copy Supabase data to LocalStorage
    const userId = await getUserId();
    if (userId) {
      try {
        console.log('Attempting to copy Supabase data to LocalStorage...');
        const supabaseAdapter = new SupabaseAdapter({ userId });
        const localAdapter = new LocalStorageAdapter();

        const entities = ['projects', 'tasks', 'events', 'clients', 'documents', 'settings'];

        for (const entity of entities) {
          const data = await supabaseAdapter.get(entity);
          if (data) {
            await localAdapter.set(entity, data);
            console.log(`✅ Copied ${entity} to LocalStorage`);
          }
        }
      } catch (copyError) {
        console.error('Failed to copy data from Supabase:', copyError);
      }
    }

    // 2. Stop any DualWrite sync
    const dualAdapter = getGlobalDualAdapter();
    if (dualAdapter) {
      dualAdapter.stopSyncWorker();
    }

    // 3. Create LocalStorage-only adapter
    const localAdapter = new LocalStorageAdapter();
    const newStorageManager = new StorageManager(localAdapter);

    // 4. Update global references
    setGlobalStorageManager(newStorageManager);
    setGlobalDualAdapter(null);

    console.log('✅ Emergency fallback complete. Using LocalStorage-only mode.');

    return {
      success: true,
      mode: 'localStorage',
      message: 'Emergency fallback to LocalStorage-only mode complete',
      timestamp
    };

  } catch (error) {
    console.error('Emergency fallback failed:', error);
    return {
      success: false,
      mode: 'localStorage',
      message: 'Emergency fallback encountered errors but LocalStorage mode may be active',
      timestamp,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Get current storage mode
 */
export function getCurrentStorageMode(): {
  mode: 'localStorage' | 'dualwrite' | 'supabase' | 'unknown';
  details: Record<string, any>;
} {
  const storageManager = getGlobalStorageManager();
  const dualAdapter = getGlobalDualAdapter();

  if (!storageManager) {
    return {
      mode: 'unknown',
      details: { message: 'No storage manager initialized' }
    };
  }

  if (dualAdapter) {
    const stats = dualAdapter.getSyncStats();
    return {
      mode: 'dualwrite',
      details: {
        syncEnabled: true,
        ...stats
      }
    };
  }

  // Try to determine mode by checking adapter type
  const adapter = (storageManager as any).adapter;

  if (adapter instanceof LocalStorageAdapter) {
    return {
      mode: 'localStorage',
      details: { message: 'Using LocalStorage adapter' }
    };
  }

  if (adapter instanceof SupabaseAdapter) {
    return {
      mode: 'supabase',
      details: { message: 'Using Supabase adapter' }
    };
  }

  return {
    mode: 'unknown',
    details: { message: 'Could not determine storage mode' }
  };
}