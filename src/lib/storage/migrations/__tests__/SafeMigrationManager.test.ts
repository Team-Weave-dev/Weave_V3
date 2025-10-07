/**
 * SafeMigrationManager Tests
 *
 * Tests for the safe migration system with automatic backup/restore
 */

import { SafeMigrationManager } from '../SafeMigrationManager'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { StorageAdapter, Migration } from '../../types/base'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

global.localStorage = localStorageMock as any

describe('SafeMigrationManager', () => {
  let adapter: StorageAdapter
  let safeMigrationManager: SafeMigrationManager

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear()

    // Create fresh adapter and safe migration manager
    adapter = new LocalStorageAdapter()
    safeMigrationManager = new SafeMigrationManager(adapter)

    // Initialize with some test data
    await adapter.set('test-data', { value: 'original-value' })
  })

  describe('constructor', () => {
    it('should create SafeMigrationManager instance', () => {
      expect(safeMigrationManager).toBeInstanceOf(SafeMigrationManager)
    })

    it('should initialize internal managers', () => {
      const migrationManager = safeMigrationManager.getMigrationManager()
      const backupManager = safeMigrationManager.getBackupManager()

      expect(migrationManager).toBeDefined()
      expect(backupManager).toBeDefined()
    })
  })

  describe('getMigrationManager', () => {
    it('should return the internal MigrationManager', () => {
      const manager = safeMigrationManager.getMigrationManager()
      expect(manager).toBeDefined()
      expect(manager.getCurrentVersion).toBeDefined()
    })

    it('should allow registering migrations through manager', () => {
      const manager = safeMigrationManager.getMigrationManager()

      const migration: Migration = {
        version: 1,
        name: 'test-migration',
        up: async () => {},
      }

      manager.register(migration)
      expect(manager.hasMigration(1)).toBe(true)
    })
  })

  describe('getBackupManager', () => {
    it('should return the internal BackupManager', () => {
      const manager = safeMigrationManager.getBackupManager()
      expect(manager).toBeDefined()
      expect(manager.createBackup).toBeDefined()
    })
  })

  describe('migrateWithBackup - success', () => {
    it('should create backup, migrate, and return success', async () => {
      // Register a successful migration
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'successful-migration',
        up: async (adapter) => {
          await adapter.set('migrated-data', { value: 'new-value' })
        },
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.success).toBe(true)
      expect(result.backup).toBeDefined()
      expect(result.backup.data).toBeDefined()
      expect(result.migrationResults).toHaveLength(1)
      expect(result.migrationResults![0].success).toBe(true)
      expect(result.restoreResult).toBeUndefined()
      expect(result.error).toBeUndefined()

      // Verify migration was applied
      const migratedData = await adapter.get('migrated-data')
      expect(migratedData).toEqual({ value: 'new-value' })
    })

    it('should preserve original data in backup', async () => {
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'data-preserving-migration',
        up: async () => {},
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.backup.data['test-data']).toEqual({ value: 'original-value' })
    })

    it('should include schema version in backup', async () => {
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'schema-tracking-migration',
        up: async () => {},
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.backup.schemaVersion).toBeDefined()
    })
  })

  describe('migrateWithBackup - failure and restore', () => {
    it('should restore from backup when migration fails', async () => {
      // Register a failing migration
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'failing-migration',
        up: async (adapter) => {
          // Make a change
          await adapter.set('test-data', { value: 'corrupted-value' })
          // Then fail
          throw new Error('Migration failed intentionally')
        },
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.message).toContain('Migration failed intentionally')
      expect(result.restoreResult).toBeDefined()
      expect(result.restoreResult!.success).toBe(true)

      // Verify data was restored to original state
      const testData = await adapter.get('test-data')
      expect(testData).toEqual({ value: 'original-value' })
    })

    it('should include restore count in result', async () => {
      await adapter.set('data-1', { value: 'value-1' })
      await adapter.set('data-2', { value: 'value-2' })

      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'multi-data-migration',
        up: async () => {
          throw new Error('Fail after setup')
        },
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.restoreResult).toBeDefined()
      expect(result.restoreResult!.restoredCount).toBeGreaterThan(0)
    })
  })

  describe('migrateWithBackup - critical errors', () => {
    it('should throw error if both migration and restore fail', async () => {
      // Set up a migration that fails
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'critical-migration',
        up: async () => {
          throw new Error('Migration failed')
        },
      })

      // Mock BackupManager to make restore fail
      const originalRestore = safeMigrationManager.getBackupManager().restoreBackup
      jest
        .spyOn(safeMigrationManager.getBackupManager(), 'restoreBackup')
        .mockRejectedValueOnce(new Error('Restore failed'))

      await expect(safeMigrationManager.migrateWithBackup(1)).rejects.toThrow(
        /Migration failed and restore also failed/
      )
    })
  })

  describe('migrateWithDownloadableBackup', () => {
    it('should create downloadable backup before migrating', async () => {
      // Mock downloadBackup to avoid actual file download
      const downloadSpy = jest
        .spyOn(safeMigrationManager.getBackupManager(), 'downloadBackup')
        .mockResolvedValueOnce()

      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'downloadable-migration',
        up: async () => {},
      })

      const result = await safeMigrationManager.migrateWithDownloadableBackup(1)

      expect(downloadSpy).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })
  })

  describe('complex migration scenarios', () => {
    it('should handle sequential migrations with backup', async () => {
      const executionOrder: number[] = []

      safeMigrationManager.getMigrationManager().registerAll([
        {
          version: 1,
          name: 'migration-1',
          up: async () => {
            executionOrder.push(1)
          },
        },
        {
          version: 2,
          name: 'migration-2',
          up: async () => {
            executionOrder.push(2)
          },
        },
      ])

      const result = await safeMigrationManager.migrateWithBackup(2)

      expect(result.success).toBe(true)
      expect(result.migrationResults).toHaveLength(2)
      expect(executionOrder).toEqual([1, 2])
    })

    it('should restore to original state if second migration fails', async () => {
      await adapter.set('counter', 0)

      safeMigrationManager.getMigrationManager().registerAll([
        {
          version: 1,
          name: 'increment-1',
          up: async (adapter) => {
            const count = (await adapter.get<number>('counter')) || 0
            await adapter.set('counter', count + 1)
          },
        },
        {
          version: 2,
          name: 'increment-2-fail',
          up: async (adapter) => {
            const count = (await adapter.get<number>('counter')) || 0
            await adapter.set('counter', count + 1)
            throw new Error('Second migration failed')
          },
        },
      ])

      const result = await safeMigrationManager.migrateWithBackup(2)

      expect(result.success).toBe(false)
      const counter = await adapter.get<number>('counter')
      expect(counter).toBe(0) // Restored to original
    })
  })

  describe('backup integrity', () => {
    it('should create backup with all current data', async () => {
      await adapter.set('data-1', 'value-1')
      await adapter.set('data-2', 'value-2')
      await adapter.set('data-3', 'value-3')

      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'integrity-test',
        up: async () => {},
      })

      const result = await safeMigrationManager.migrateWithBackup(1)

      expect(result.backup.data).toHaveProperty('data-1')
      expect(result.backup.data).toHaveProperty('data-2')
      expect(result.backup.data).toHaveProperty('data-3')
    })

    it('should include backup timestamp', async () => {
      safeMigrationManager.getMigrationManager().register({
        version: 1,
        name: 'timestamp-test',
        up: async () => {},
      })

      const beforeMigration = Date.now()
      const result = await safeMigrationManager.migrateWithBackup(1)
      const afterMigration = Date.now()

      expect(result.backup.timestamp).toBeGreaterThanOrEqual(beforeMigration)
      expect(result.backup.timestamp).toBeLessThanOrEqual(afterMigration)
    })
  })
})
