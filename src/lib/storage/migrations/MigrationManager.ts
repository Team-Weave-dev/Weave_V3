/**
 * MigrationManager - Database Schema Migration Manager
 *
 * This class manages schema version migrations for the storage system.
 * It provides:
 * - Version tracking and management
 * - Sequential migration execution
 * - Migration history tracking
 * - Rollback support (if migration provides down function)
 */

import type {
  StorageAdapter,
  Migration,
  MigrationResult,
  SchemaVersion,
} from '../types/base';
import { STORAGE_KEYS, STORAGE_CONFIG } from '../config';

export class MigrationManager {
  /**
   * Storage adapter to use for migrations
   */
  private adapter: StorageAdapter;

  /**
   * Available migrations registry
   */
  private migrations: Map<number, Migration>;

  /**
   * Create a new MigrationManager
   *
   * @param adapter - Storage adapter to use
   */
  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
    this.migrations = new Map();
  }

  /**
   * Register a migration
   *
   * @param migration - Migration definition
   */
  register(migration: Migration): void {
    this.migrations.set(migration.version, migration);
  }

  /**
   * Register multiple migrations at once
   *
   * @param migrations - Array of migration definitions
   */
  registerAll(migrations: Migration[]): void {
    migrations.forEach((migration) => this.register(migration));
  }

  /**
   * Get current schema version from storage
   *
   * @returns Current schema version or null if not initialized
   */
  async getCurrentVersion(): Promise<number> {
    const schemaVersion = await this.adapter.get<SchemaVersion>(
      STORAGE_KEYS.VERSION
    );

    if (!schemaVersion) {
      return 0; // No version = fresh install
    }

    return schemaVersion.version;
  }

  /**
   * Get schema version metadata
   *
   * @returns Schema version metadata or null
   */
  async getSchemaVersion(): Promise<SchemaVersion | null> {
    return this.adapter.get<SchemaVersion>(STORAGE_KEYS.VERSION);
  }

  /**
   * Set schema version metadata
   *
   * @param version - Version number
   * @param migrations - Applied migration names
   */
  private async setSchemaVersion(
    version: number,
    migrations: string[]
  ): Promise<void> {
    const schemaVersion: SchemaVersion = {
      version,
      appliedAt: new Date().toISOString(),
      migrations,
    };

    await this.adapter.set(STORAGE_KEYS.VERSION, schemaVersion);
  }

  /**
   * Migrate to a specific version
   *
   * @param targetVersion - Target schema version (defaults to latest)
   * @returns Migration results
   */
  async migrate(targetVersion?: number): Promise<MigrationResult[]> {
    const currentVersion = await this.getCurrentVersion();

    // Determine target version (latest if not specified)
    const target =
      targetVersion ?? Math.max(...Array.from(this.migrations.keys()));

    // Validate target version
    if (target < currentVersion) {
      throw new Error(
        `Cannot migrate backwards from ${currentVersion} to ${target}. Use rollback() instead.`
      );
    }

    if (target === currentVersion) {
      console.log(`Already at version ${currentVersion}, no migration needed`);
      return [];
    }

    // Get migrations to apply (in order)
    const migrationsToApply = this.getMigrationsToApply(
      currentVersion,
      target
    );

    if (migrationsToApply.length === 0) {
      throw new Error(`No migrations available to reach version ${target}`);
    }

    console.log(
      `Migrating from version ${currentVersion} to ${target}...`
    );
    console.log(
      `Migrations to apply: ${migrationsToApply.map((m) => m.name).join(', ')}`
    );

    // Execute migrations sequentially
    const results: MigrationResult[] = [];
    let currentMigrationVersion = currentVersion;

    for (const migration of migrationsToApply) {
      const result = await this.executeMigration(migration);
      results.push(result);

      if (!result.success) {
        console.error(
          `Migration ${migration.name} failed:`,
          result.error
        );
        throw new Error(
          `Migration failed at version ${migration.version}: ${result.error?.message}`
        );
      }

      currentMigrationVersion = migration.version;

      // Update schema version after each successful migration
      const schemaVersion = await this.getSchemaVersion();
      const appliedMigrations = schemaVersion?.migrations || [];
      appliedMigrations.push(migration.name);

      await this.setSchemaVersion(
        migration.version,
        appliedMigrations
      );

      console.log(`✓ Migration ${migration.name} completed successfully`);
    }

    console.log(`Migration completed. Now at version ${target}`);
    return results;
  }

  /**
   * Rollback to a previous version
   *
   * @param targetVersion - Target version to rollback to
   * @returns Rollback results
   */
  async rollback(targetVersion: number): Promise<MigrationResult[]> {
    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      throw new Error(
        `Cannot rollback forwards from ${currentVersion} to ${targetVersion}`
      );
    }

    // Get migrations to rollback (in reverse order)
    const migrationsToRollback = this.getMigrationsToRollback(
      currentVersion,
      targetVersion
    );

    if (migrationsToRollback.length === 0) {
      throw new Error(
        `No rollback path available from ${currentVersion} to ${targetVersion}`
      );
    }

    console.log(
      `Rolling back from version ${currentVersion} to ${targetVersion}...`
    );

    // Execute rollbacks sequentially (in reverse)
    const results: MigrationResult[] = [];

    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        throw new Error(
          `Migration ${migration.name} does not support rollback`
        );
      }

      const result = await this.executeRollback(migration);
      results.push(result);

      if (!result.success) {
        console.error(
          `Rollback ${migration.name} failed:`,
          result.error
        );
        throw new Error(
          `Rollback failed at version ${migration.version}: ${result.error?.message}`
        );
      }

      // Update schema version after each successful rollback
      const schemaVersion = await this.getSchemaVersion();
      const appliedMigrations = schemaVersion?.migrations || [];
      const updatedMigrations = appliedMigrations.filter(
        (name) => name !== migration.name
      );

      await this.setSchemaVersion(
        targetVersion,
        updatedMigrations
      );

      console.log(`✓ Rollback ${migration.name} completed successfully`);
    }

    console.log(`Rollback completed. Now at version ${targetVersion}`);
    return results;
  }

  /**
   * Get migrations that need to be applied
   *
   * @param fromVersion - Current version
   * @param toVersion - Target version
   * @returns Ordered list of migrations to apply
   */
  private getMigrationsToApply(
    fromVersion: number,
    toVersion: number
  ): Migration[] {
    const migrations: Migration[] = [];

    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migration = this.migrations.get(version);
      if (migration) {
        migrations.push(migration);
      }
    }

    return migrations;
  }

  /**
   * Get migrations that need to be rolled back (in reverse order)
   *
   * @param fromVersion - Current version
   * @param toVersion - Target version
   * @returns Ordered list of migrations to rollback
   */
  private getMigrationsToRollback(
    fromVersion: number,
    toVersion: number
  ): Migration[] {
    const migrations: Migration[] = [];

    for (let version = fromVersion; version > toVersion; version--) {
      const migration = this.migrations.get(version);
      if (migration) {
        migrations.push(migration);
      }
    }

    return migrations;
  }

  /**
   * Execute a single migration
   *
   * @param migration - Migration to execute
   * @returns Migration result
   */
  private async executeMigration(
    migration: Migration
  ): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      await migration.up(this.adapter);

      return {
        version: migration.version,
        name: migration.name,
        success: true,
        executionTime: Date.now() - startTime,
        appliedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        version: migration.version,
        name: migration.name,
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        appliedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Execute a single rollback
   *
   * @param migration - Migration to rollback
   * @returns Rollback result
   */
  private async executeRollback(
    migration: Migration
  ): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      if (!migration.down) {
        throw new Error('Migration does not support rollback');
      }

      await migration.down(this.adapter);

      return {
        version: migration.version,
        name: migration.name,
        success: true,
        executionTime: Date.now() - startTime,
        appliedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        version: migration.version,
        name: migration.name,
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        appliedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Initialize storage with initial version
   *
   * Useful for fresh installs
   */
  async initialize(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();

    if (currentVersion > 0) {
      console.log(
        `Storage already initialized at version ${currentVersion}`
      );
      return;
    }

    // Set initial version
    await this.setSchemaVersion(STORAGE_CONFIG.version, []);
    console.log(
      `Storage initialized at version ${STORAGE_CONFIG.version}`
    );
  }

  /**
   * Get list of all registered migrations
   *
   * @returns Array of registered migrations
   */
  getRegisteredMigrations(): Migration[] {
    return Array.from(this.migrations.values()).sort(
      (a, b) => a.version - b.version
    );
  }

  /**
   * Check if a migration is registered for a specific version
   *
   * @param version - Version to check
   * @returns True if migration exists
   */
  hasMigration(version: number): boolean {
    return this.migrations.has(version);
  }
}
