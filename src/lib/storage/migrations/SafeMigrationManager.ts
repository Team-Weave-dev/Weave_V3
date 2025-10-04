/**
 * SafeMigrationManager - Enhanced Migration Manager with Automatic Backup
 *
 * This class wraps MigrationManager and BackupManager to provide:
 * - Automatic backup before migration
 * - Automatic restore on migration failure
 * - Comprehensive error handling and reporting
 *
 * This is the recommended way to run migrations in production.
 */

import type {
  StorageAdapter,
  MigrationResult,
  BackupData,
  RestoreResult,
} from '../types/base';
import { MigrationManager } from './MigrationManager';
import { BackupManager } from '../utils/BackupManager';

/**
 * Result of a safe migration operation
 */
export interface SafeMigrationResult {
  /** Whether the migration was successful */
  success: boolean;
  /** Backup created before migration */
  backup: BackupData;
  /** Migration results (if migration was attempted) */
  migrationResults?: MigrationResult[];
  /** Restore result (if rollback was performed) */
  restoreResult?: RestoreResult;
  /** Error that caused migration to fail */
  error?: Error;
}

export class SafeMigrationManager {
  /**
   * Migration manager instance
   */
  private migrationManager: MigrationManager;

  /**
   * Backup manager instance
   */
  private backupManager: BackupManager;

  /**
   * Storage adapter
   */
  private adapter: StorageAdapter;

  /**
   * Create a new SafeMigrationManager
   *
   * @param adapter - Storage adapter to use
   */
  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
    this.migrationManager = new MigrationManager(adapter);
    this.backupManager = new BackupManager(adapter);
  }

  /**
   * Get the underlying MigrationManager (for registration, etc.)
   */
  getMigrationManager(): MigrationManager {
    return this.migrationManager;
  }

  /**
   * Get the underlying BackupManager
   */
  getBackupManager(): BackupManager {
    return this.backupManager;
  }

  /**
   * Migrate to a specific version with automatic backup and rollback
   *
   * This method:
   * 1. Creates a backup of current state
   * 2. Executes migration
   * 3. If migration fails, automatically restores from backup
   *
   * @param targetVersion - Target schema version (defaults to latest)
   * @returns Safe migration result with backup and migration details
   */
  async migrateWithBackup(
    targetVersion?: number
  ): Promise<SafeMigrationResult> {
    console.log('='.repeat(60));
    console.log('Starting Safe Migration with Automatic Backup');
    console.log('='.repeat(60));

    // Step 1: Create backup
    console.log('\n[1/3] Creating backup...');
    const backup = await this.backupManager.createBackup();
    const backupStats = this.backupManager.getBackupStats(backup);

    console.log(
      `Backup created: ${backupStats.entryCount} entries, ${backupStats.sizeKB.toFixed(2)} KB`
    );

    // Step 2: Execute migration
    console.log('\n[2/3] Executing migration...');

    try {
      const migrationResults = await this.migrationManager.migrate(
        targetVersion
      );

      console.log('\n[3/3] Migration completed successfully!');
      console.log('='.repeat(60));

      return {
        success: true,
        backup,
        migrationResults,
      };
    } catch (error) {
      // Step 3: Restore from backup on failure
      console.error('\n[3/3] Migration failed! Rolling back...');
      console.error('Error:', error);

      try {
        console.log('Restoring from backup...');
        const restoreResult = await this.backupManager.restoreBackup(backup, {
          clearFirst: true,
          validateFirst: true,
        });

        console.log(
          `Restore completed: ${restoreResult.restoredCount} entries restored`
        );
        console.log('='.repeat(60));

        return {
          success: false,
          backup,
          restoreResult,
          error: error as Error,
        };
      } catch (restoreError) {
        // Critical: Both migration and restore failed
        console.error('CRITICAL: Restore also failed!');
        console.error('Restore error:', restoreError);
        console.log('='.repeat(60));

        throw new Error(
          `Migration failed and restore also failed. Original error: ${(error as Error).message}. Restore error: ${(restoreError as Error).message}`
        );
      }
    }
  }

  /**
   * Download a backup before migrating (for extra safety)
   *
   * @param targetVersion - Target version for migration
   * @returns Safe migration result
   */
  async migrateWithDownloadableBackup(
    targetVersion?: number
  ): Promise<SafeMigrationResult> {
    console.log('Creating downloadable backup...');

    // Create backup
    const backup = await this.backupManager.createBackup();

    // Download backup file
    await this.backupManager.downloadBackup(backup);

    console.log('Backup downloaded. Proceeding with migration...');

    // Proceed with normal safe migration
    return this.migrateWithBackup(targetVersion);
  }
}
