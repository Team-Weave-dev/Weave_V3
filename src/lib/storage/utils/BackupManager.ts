/**
 * BackupManager - Storage Backup and Restore System
 *
 * This class provides backup and restore functionality for the storage system.
 * It allows:
 * - Creating full backups of all storage data
 * - Restoring from backups
 * - Exporting backups to downloadable files
 * - Importing backups from files
 *
 * Backups are particularly useful before running migrations to ensure
 * data can be recovered if something goes wrong.
 */

import type {
  StorageAdapter,
  BackupData,
  SchemaVersion,
} from '../types/base';
import { STORAGE_KEYS, STORAGE_CONFIG } from '../config';

export class BackupManager {
  /**
   * Storage adapter to backup/restore
   */
  private adapter: StorageAdapter;

  /**
   * Backup version number (increments with each backup format change)
   */
  private static readonly BACKUP_VERSION = 1;

  /**
   * Create a new BackupManager
   *
   * @param adapter - Storage adapter to use
   */
  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Create a full backup of all storage data
   *
   * @returns Backup data object
   */
  async createBackup(): Promise<BackupData> {
    console.log('Creating storage backup...');

    // Get current schema version
    const schemaVersion = await this.getSchemaVersion();

    // Get all storage keys
    const keys = await this.adapter.keys();
    console.log(`Backing up ${keys.length} keys...`);

    // Create backup data object
    const data: Record<string, any> = {};

    // Read all values
    for (const key of keys) {
      try {
        const value = await this.adapter.get(key);
        if (value !== null) {
          data[key] = value;
        }
      } catch (error) {
        console.error(`Error backing up key "${key}":`, error);
        // Continue with other keys even if one fails
      }
    }

    const backup: BackupData = {
      version: BackupManager.BACKUP_VERSION,
      timestamp: Date.now(),
      data,
      schemaVersion,
    };

    console.log(`Backup created: ${Object.keys(data).length} entries`);
    return backup;
  }

  /**
   * Restore storage from a backup
   *
   * WARNING: This will overwrite all current data!
   *
   * @param backup - Backup data to restore
   * @param clearFirst - Whether to clear existing data first (default: true)
   */
  async restoreBackup(
    backup: BackupData,
    clearFirst: boolean = true
  ): Promise<void> {
    console.log('Restoring from backup...');

    // Validate backup format
    if (!this.isValidBackup(backup)) {
      throw new Error('Invalid backup format');
    }

    // Warn about version mismatch
    if (backup.version !== BackupManager.BACKUP_VERSION) {
      console.warn(
        `Backup version mismatch: backup is v${backup.version}, current is v${BackupManager.BACKUP_VERSION}`
      );
    }

    // Clear existing data if requested
    if (clearFirst) {
      console.log('Clearing existing data...');
      await this.adapter.clear();
    }

    // Restore all data
    const entries = Object.entries(backup.data);
    console.log(`Restoring ${entries.length} entries...`);

    let successCount = 0;
    let errorCount = 0;

    for (const [key, value] of entries) {
      try {
        await this.adapter.set(key, value);
        successCount++;
      } catch (error) {
        console.error(`Error restoring key "${key}":`, error);
        errorCount++;
      }
    }

    // Restore schema version
    await this.adapter.set(
      STORAGE_KEYS.VERSION,
      backup.schemaVersion
    );

    console.log(
      `Restore completed: ${successCount} succeeded, ${errorCount} failed`
    );
  }

  /**
   * Export backup to a downloadable file (Blob)
   *
   * @param backup - Backup data to export (if not provided, creates new backup)
   * @param filename - Optional filename (defaults to timestamped name)
   * @returns Blob containing backup data
   */
  async exportToFile(
    backup?: BackupData,
    filename?: string
  ): Promise<{ blob: Blob; filename: string }> {
    // Create backup if not provided
    const backupData = backup || (await this.createBackup());

    // Generate filename if not provided
    const timestamp = new Date(backupData.timestamp).toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `weave-backup-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    // Create JSON string with pretty formatting
    const json = JSON.stringify(backupData, null, 2);

    // Create Blob
    const blob = new Blob([json], { type: 'application/json' });

    console.log(
      `Backup exported to file: ${finalFilename} (${(blob.size / 1024).toFixed(2)} KB)`
    );

    return { blob, filename: finalFilename };
  }

  /**
   * Import backup from a file
   *
   * @param file - File object or JSON string
   * @returns Parsed backup data
   */
  async importFromFile(
    file: File | string
  ): Promise<BackupData> {
    console.log('Importing backup from file...');

    let json: string;

    // Read file content
    if (typeof file === 'string') {
      json = file;
    } else {
      json = await this.readFileAsText(file);
    }

    // Parse JSON
    let backup: BackupData;
    try {
      backup = JSON.parse(json);
    } catch (error) {
      throw new Error('Failed to parse backup file: invalid JSON');
    }

    // Validate backup
    if (!this.isValidBackup(backup)) {
      throw new Error('Invalid backup file format');
    }

    console.log(
      `Backup imported: ${Object.keys(backup.data).length} entries`
    );
    return backup;
  }

  /**
   * Download backup file to user's computer
   *
   * This creates a download link and triggers it automatically.
   *
   * @param backup - Backup data to download (if not provided, creates new backup)
   * @param filename - Optional filename
   */
  async downloadBackup(
    backup?: BackupData,
    filename?: string
  ): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('downloadBackup can only be used in browser environment');
    }

    const { blob, filename: finalFilename } = await this.exportToFile(
      backup,
      filename
    );

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Backup downloaded: ${finalFilename}`);
  }

  /**
   * Get current schema version
   */
  private async getSchemaVersion(): Promise<SchemaVersion> {
    const version = await this.adapter.get<SchemaVersion>(
      STORAGE_KEYS.VERSION
    );

    return (
      version || {
        version: STORAGE_CONFIG.version,
        appliedAt: new Date().toISOString(),
        migrations: [],
      }
    );
  }

  /**
   * Validate backup data format
   *
   * @param backup - Backup data to validate
   * @returns True if valid
   */
  private isValidBackup(backup: unknown): backup is BackupData {
    if (typeof backup !== 'object' || backup === null) {
      return false;
    }

    const b = backup as Record<string, unknown>;

    return (
      typeof b.version === 'number' &&
      typeof b.timestamp === 'number' &&
      typeof b.data === 'object' &&
      b.data !== null &&
      typeof b.schemaVersion === 'object' &&
      b.schemaVersion !== null
    );
  }

  /**
   * Read file as text
   *
   * @param file - File object
   * @returns File content as string
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Calculate backup size in bytes
   *
   * @param backup - Backup data
   * @returns Size in bytes
   */
  getBackupSize(backup: BackupData): number {
    const json = JSON.stringify(backup);
    return new Blob([json]).size;
  }

  /**
   * Get backup statistics
   *
   * @param backup - Backup data
   * @returns Backup statistics
   */
  getBackupStats(backup: BackupData): {
    version: number;
    timestamp: Date;
    entryCount: number;
    sizeBytes: number;
    sizeKB: number;
    sizeMB: number;
    schemaVersion: number;
  } {
    const sizeBytes = this.getBackupSize(backup);

    return {
      version: backup.version,
      timestamp: new Date(backup.timestamp),
      entryCount: Object.keys(backup.data).length,
      sizeBytes,
      sizeKB: sizeBytes / 1024,
      sizeMB: sizeBytes / (1024 * 1024),
      schemaVersion: backup.schemaVersion.version,
    };
  }

  /**
   * List all keys in a backup
   *
   * @param backup - Backup data
   * @returns Array of keys
   */
  listBackupKeys(backup: BackupData): string[] {
    return Object.keys(backup.data);
  }

  /**
   * Get a specific value from backup without restoring
   *
   * @param backup - Backup data
   * @param key - Key to retrieve
   * @returns Value or null
   */
  getFromBackup<T>(backup: BackupData, key: string): T | null {
    return backup.data[key] || null;
  }

  /**
   * Compare two backups and find differences
   *
   * @param backup1 - First backup
   * @param backup2 - Second backup
   * @returns Difference report
   */
  compareBackups(
    backup1: BackupData,
    backup2: BackupData
  ): {
    addedKeys: string[];
    removedKeys: string[];
    modifiedKeys: string[];
    unchangedKeys: string[];
  } {
    const keys1 = new Set(Object.keys(backup1.data));
    const keys2 = new Set(Object.keys(backup2.data));

    const addedKeys: string[] = [];
    const removedKeys: string[] = [];
    const modifiedKeys: string[] = [];
    const unchangedKeys: string[] = [];

    // Check keys in backup2
    for (const key of keys2) {
      if (!keys1.has(key)) {
        addedKeys.push(key);
      } else {
        // Compare values
        const value1 = JSON.stringify(backup1.data[key]);
        const value2 = JSON.stringify(backup2.data[key]);

        if (value1 !== value2) {
          modifiedKeys.push(key);
        } else {
          unchangedKeys.push(key);
        }
      }
    }

    // Check keys removed from backup1
    for (const key of keys1) {
      if (!keys2.has(key)) {
        removedKeys.push(key);
      }
    }

    return {
      addedKeys,
      removedKeys,
      modifiedKeys,
      unchangedKeys,
    };
  }
}
