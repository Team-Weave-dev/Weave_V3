/**
 * v2-to-Supabase Migration Script
 *
 * This migration transfers data from LocalStorage to Supabase database.
 * It's designed to run once per user after they authenticate.
 *
 * Features:
 * - Migrates 7 entity types (projects, tasks, events, clients, documents, settings, user)
 * - Preserves all data relationships and metadata
 * - Records migration status to prevent duplicate runs
 * - Provides progress tracking and error handling
 * - Supports dry-run mode for testing
 */

import type { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { SupabaseAdapter } from '../adapters/SupabaseAdapter';
import { createClient } from '../../supabase/client';

/**
 * Migration progress callback
 */
export type MigrationProgressCallback = (progress: MigrationProgress) => void;

/**
 * Migration progress information
 */
export interface MigrationProgress {
  /** Current entity being migrated */
  entity: string;
  /** Current item index */
  current: number;
  /** Total items for this entity */
  total: number;
  /** Overall progress percentage (0-100) */
  percentage: number;
  /** Migration status */
  status: 'in_progress' | 'completed' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  /** Migration success status */
  success: boolean;
  /** Migration statistics */
  stats: {
    projects: number;
    tasks: number;
    events: number;
    clients: number;
    documents: number;
    settings: boolean;
    user: boolean;
  };
  /** Error message if migration failed */
  error?: string;
  /** Total migration time in milliseconds */
  duration: number;
}

/**
 * Check if user data has already been migrated to Supabase
 *
 * @param userId - User ID
 * @returns True if already migrated
 */
export async function checkMigrationStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('migration_status')
      .select('*')
      .eq('user_id', userId)
      .eq('version', 'v2-to-supabase')
      .single();

    if (error) {
      // Not found is OK (not migrated yet)
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return data !== null;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Record migration status in Supabase
 *
 * @param userId - User ID
 * @param stats - Migration statistics
 */
async function recordMigrationStatus(
  userId: string,
  stats: MigrationResult['stats']
): Promise<void> {
  const supabase = createClient();

  await supabase.from('migration_status').insert({
    user_id: userId,
    version: 'v2-to-supabase',
    migrated_at: new Date().toISOString(),
    source_data: {
      projects_count: stats.projects,
      tasks_count: stats.tasks,
      events_count: stats.events,
      clients_count: stats.clients,
      documents_count: stats.documents,
    },
  });
}

/**
 * Migrate user data from LocalStorage to Supabase
 *
 * This function transfers all user data (projects, tasks, events, clients,
 * documents, settings) from LocalStorage to Supabase database.
 *
 * @param userId - User ID for Supabase RLS filtering
 * @param localAdapter - LocalStorage adapter
 * @param supabaseAdapter - Supabase adapter
 * @param options - Migration options
 * @returns Migration result
 */
export async function migrateUserDataToSupabase(
  userId: string,
  localAdapter: LocalStorageAdapter,
  supabaseAdapter: SupabaseAdapter,
  options?: {
    /** Dry run mode (don't actually write to Supabase) */
    dryRun?: boolean;
    /** Progress callback */
    onProgress?: MigrationProgressCallback;
  }
): Promise<MigrationResult> {
  const startTime = Date.now();
  const stats: MigrationResult['stats'] = {
    projects: 0,
    tasks: 0,
    events: 0,
    clients: 0,
    documents: 0,
    settings: false,
    user: false,
  };

  try {
    console.log('🚀 Starting v2-to-Supabase migration...');

    // Check if already migrated
    const alreadyMigrated = await checkMigrationStatus(userId);
    if (alreadyMigrated && !options?.dryRun) {
      console.log('⏭️ User data already migrated, skipping...');
      return {
        success: true,
        stats,
        duration: Date.now() - startTime,
      };
    }

    // Entity migration order (respects foreign key dependencies)
    const entitiesToMigrate = [
      { key: 'clients', statsKey: 'clients' as const },
      { key: 'projects', statsKey: 'projects' as const },
      { key: 'tasks', statsKey: 'tasks' as const },
      { key: 'events', statsKey: 'events' as const },
      { key: 'documents', statsKey: 'documents' as const },
      { key: 'settings', statsKey: 'settings' as const },
    ];

    let totalItems = 0;
    let completedItems = 0;

    // Calculate total items
    for (const entity of entitiesToMigrate) {
      const data = await localAdapter.get(entity.key);
      if (Array.isArray(data)) {
        totalItems += data.length;
      } else if (data !== null) {
        totalItems += 1;
      }
    }

    // Migrate each entity
    for (const entity of entitiesToMigrate) {
      console.log(`📦 Migrating ${entity.key}...`);

      try {
        const data = await localAdapter.get(entity.key);

        if (data === null || data === undefined) {
          console.log(`ℹ️ No ${entity.key} data to migrate`);
          continue;
        }

        // Type assertion: data is guaranteed to be JsonValue here
        const jsonData = data as import('../types/base').JsonValue;

        // Report progress
        if (options?.onProgress) {
          options.onProgress({
            entity: entity.key,
            current: 0,
            total: Array.isArray(jsonData) ? jsonData.length : 1,
            percentage: Math.round((completedItems / totalItems) * 100),
            status: 'in_progress',
          });
        }

        // Migrate data
        if (!options?.dryRun) {
          await supabaseAdapter.set(entity.key, jsonData);
        }

        // Update stats
        if (Array.isArray(jsonData)) {
          stats[entity.statsKey] = jsonData.length as never;
          completedItems += jsonData.length;
        } else {
          stats[entity.statsKey] = true as never;
          completedItems += 1;
        }

        console.log(`✅ Migrated ${entity.key} (${Array.isArray(jsonData) ? jsonData.length : 1} items)`);

        // Report progress
        if (options?.onProgress) {
          options.onProgress({
            entity: entity.key,
            current: Array.isArray(jsonData) ? jsonData.length : 1,
            total: Array.isArray(jsonData) ? jsonData.length : 1,
            percentage: Math.round((completedItems / totalItems) * 100),
            status: 'completed',
          });
        }

        // Add delay between entities to avoid overwhelming Supabase
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to migrate ${entity.key}:`, error);

        if (options?.onProgress) {
          options.onProgress({
            entity: entity.key,
            current: 0,
            total: 0,
            percentage: Math.round((completedItems / totalItems) * 100),
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          });
        }

        throw error;
      }
    }

    // Record migration status
    if (!options?.dryRun) {
      await recordMigrationStatus(userId, stats);
      console.log('📝 Migration status recorded in Supabase');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Migration completed successfully in ${(duration / 1000).toFixed(1)}s`);

    return {
      success: true,
      stats,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Migration failed:', error);

    return {
      success: false,
      stats,
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
}

/**
 * Trigger migration after user authentication
 *
 * This function should be called after successful login/signup to
 * migrate LocalStorage data to Supabase.
 *
 * @param userId - User ID
 * @param localAdapter - LocalStorage adapter
 * @param supabaseAdapter - Supabase adapter
 */
export async function triggerPostAuthMigration(
  userId: string,
  localAdapter: LocalStorageAdapter,
  supabaseAdapter: SupabaseAdapter
): Promise<void> {
  console.log('🔄 Checking if migration is needed...');

  const alreadyMigrated = await checkMigrationStatus(userId);

  if (alreadyMigrated) {
    console.log('✅ User data already migrated');
    return;
  }

  console.log('🚀 Starting automatic migration...');

  const result = await migrateUserDataToSupabase(userId, localAdapter, supabaseAdapter, {
    dryRun: false,
    onProgress: (progress) => {
      console.log(
        `📊 Migration progress: ${progress.entity} (${progress.current}/${progress.total}) - ${progress.percentage}%`
      );
    },
  });

  if (result.success) {
    console.log('✅ Automatic migration completed successfully');
    console.log('📊 Migration stats:', result.stats);
  } else {
    console.error('❌ Automatic migration failed:', result.error);
    throw new Error(`Migration failed: ${result.error}`);
  }
}
