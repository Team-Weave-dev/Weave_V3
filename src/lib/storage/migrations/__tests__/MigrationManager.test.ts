/**
 * MigrationManager Tests
 *
 * Tests for the migration execution engine
 */

import { MigrationManager } from '../MigrationManager'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { Migration, StorageAdapter } from '../../types/base'
import { STORAGE_KEYS } from '../../config'

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
  }
})()

global.localStorage = localStorageMock as any

describe('MigrationManager', () => {
  let adapter: StorageAdapter
  let manager: MigrationManager

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear()

    // Create fresh adapter and manager
    adapter = new LocalStorageAdapter()
    manager = new MigrationManager(adapter)
  })

  describe('constructor', () => {
    it('should create MigrationManager instance', () => {
      expect(manager).toBeInstanceOf(MigrationManager)
    })
  })

  describe('register', () => {
    it('should register a migration', () => {
      const migration: Migration = {
        version: 1,
        name: 'test-migration',
        up: async () => {},
      }

      manager.register(migration)

      expect(manager.hasMigration(1)).toBe(true)
      expect(manager.getRegisteredMigrations()).toHaveLength(1)
    })

    it('should register multiple migrations', () => {
      const migration1: Migration = {
        version: 1,
        name: 'migration-1',
        up: async () => {},
      }

      const migration2: Migration = {
        version: 2,
        name: 'migration-2',
        up: async () => {},
      }

      manager.register(migration1)
      manager.register(migration2)

      expect(manager.hasMigration(1)).toBe(true)
      expect(manager.hasMigration(2)).toBe(true)
      expect(manager.getRegisteredMigrations()).toHaveLength(2)
    })

    it('should overwrite existing migration with same version', () => {
      const migration1: Migration = {
        version: 1,
        name: 'old-migration',
        up: async () => {},
      }

      const migration2: Migration = {
        version: 1,
        name: 'new-migration',
        up: async () => {},
      }

      manager.register(migration1)
      manager.register(migration2)

      const registered = manager.getRegisteredMigrations()
      expect(registered).toHaveLength(1)
      expect(registered[0].name).toBe('new-migration')
    })
  })

  describe('registerAll', () => {
    it('should register multiple migrations at once', () => {
      const migrations: Migration[] = [
        {
          version: 1,
          name: 'migration-1',
          up: async () => {},
        },
        {
          version: 2,
          name: 'migration-2',
          up: async () => {},
        },
        {
          version: 3,
          name: 'migration-3',
          up: async () => {},
        },
      ]

      manager.registerAll(migrations)

      expect(manager.getRegisteredMigrations()).toHaveLength(3)
      expect(manager.hasMigration(1)).toBe(true)
      expect(manager.hasMigration(2)).toBe(true)
      expect(manager.hasMigration(3)).toBe(true)
    })
  })

  describe('getCurrentVersion', () => {
    it('should return 0 for fresh install', async () => {
      const version = await manager.getCurrentVersion()
      expect(version).toBe(0)
    })

    it('should return current version from storage', async () => {
      await adapter.set(STORAGE_KEYS.VERSION, {
        version: 2,
        appliedAt: new Date().toISOString(),
        migrations: ['migration-1', 'migration-2'],
      })

      const version = await manager.getCurrentVersion()
      expect(version).toBe(2)
    })
  })

  describe('getSchemaVersion', () => {
    it('should return null for fresh install', async () => {
      const schemaVersion = await manager.getSchemaVersion()
      expect(schemaVersion).toBeNull()
    })

    it('should return schema version metadata', async () => {
      const expectedVersion = {
        version: 2,
        appliedAt: new Date().toISOString(),
        migrations: ['migration-1', 'migration-2'],
      }

      await adapter.set(STORAGE_KEYS.VERSION, expectedVersion)

      const schemaVersion = await manager.getSchemaVersion()
      expect(schemaVersion).toEqual(expectedVersion)
    })
  })

  describe('initialize', () => {
    it('should initialize storage with initial version', async () => {
      await manager.initialize()

      const version = await manager.getCurrentVersion()
      expect(version).toBeGreaterThan(0)
    })

    it('should not reinitialize if already initialized', async () => {
      await adapter.set(STORAGE_KEYS.VERSION, {
        version: 2,
        appliedAt: new Date().toISOString(),
        migrations: [],
      })

      await manager.initialize()

      const version = await manager.getCurrentVersion()
      expect(version).toBe(2)
    })
  })

  describe('getRegisteredMigrations', () => {
    it('should return empty array when no migrations registered', () => {
      const migrations = manager.getRegisteredMigrations()
      expect(migrations).toEqual([])
    })

    it('should return registered migrations sorted by version', () => {
      manager.register({ version: 3, name: 'migration-3', up: async () => {} })
      manager.register({ version: 1, name: 'migration-1', up: async () => {} })
      manager.register({ version: 2, name: 'migration-2', up: async () => {} })

      const migrations = manager.getRegisteredMigrations()
      expect(migrations).toHaveLength(3)
      expect(migrations[0].version).toBe(1)
      expect(migrations[1].version).toBe(2)
      expect(migrations[2].version).toBe(3)
    })
  })

  describe('hasMigration', () => {
    it('should return false for unregistered migration', () => {
      expect(manager.hasMigration(1)).toBe(false)
    })

    it('should return true for registered migration', () => {
      manager.register({ version: 1, name: 'migration-1', up: async () => {} })
      expect(manager.hasMigration(1)).toBe(true)
    })
  })

  describe('migrate', () => {
    it('should migrate from v0 to v1', async () => {
      let migrationExecuted = false

      manager.register({
        version: 1,
        name: 'initial-migration',
        up: async () => {
          migrationExecuted = true
        },
      })

      const results = await manager.migrate(1)

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(results[0].version).toBe(1)
      expect(migrationExecuted).toBe(true)

      const currentVersion = await manager.getCurrentVersion()
      expect(currentVersion).toBe(1)
    })

    it('should migrate from v0 to v2 sequentially', async () => {
      const executionOrder: number[] = []

      manager.registerAll([
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

      const results = await manager.migrate(2)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(executionOrder).toEqual([1, 2])

      const currentVersion = await manager.getCurrentVersion()
      expect(currentVersion).toBe(2)
    })

    it('should migrate to latest version when no target specified', async () => {
      manager.registerAll([
        { version: 1, name: 'migration-1', up: async () => {} },
        { version: 2, name: 'migration-2', up: async () => {} },
        { version: 3, name: 'migration-3', up: async () => {} },
      ])

      const results = await manager.migrate()

      expect(results).toHaveLength(3)
      const currentVersion = await manager.getCurrentVersion()
      expect(currentVersion).toBe(3)
    })

    it('should skip migration if already at target version', async () => {
      await adapter.set(STORAGE_KEYS.VERSION, {
        version: 2,
        appliedAt: new Date().toISOString(),
        migrations: [],
      })

      manager.register({ version: 2, name: 'migration-2', up: async () => {} })

      const results = await manager.migrate(2)

      expect(results).toHaveLength(0)
    })

    it('should throw error when trying to migrate backwards', async () => {
      await adapter.set(STORAGE_KEYS.VERSION, {
        version: 2,
        appliedAt: new Date().toISOString(),
        migrations: [],
      })

      await expect(manager.migrate(1)).rejects.toThrow(
        'Cannot migrate backwards'
      )
    })

    it('should throw error if migration fails', async () => {
      manager.register({
        version: 1,
        name: 'failing-migration',
        up: async () => {
          throw new Error('Migration failed')
        },
      })

      await expect(manager.migrate(1)).rejects.toThrow('Migration failed')
    })

    it('should prevent concurrent migration execution', async () => {
      manager.register({
        version: 1,
        name: 'slow-migration',
        up: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
        },
      })

      const migration1 = manager.migrate(1)
      const migration2 = manager.migrate(1)

      await expect(migration2).rejects.toThrow('already in progress')
      await migration1
    })

    it('should update schema version metadata after migration', async () => {
      manager.register({
        version: 1,
        name: 'test-migration',
        up: async () => {},
      })

      await manager.migrate(1)

      const schemaVersion = await manager.getSchemaVersion()
      expect(schemaVersion).not.toBeNull()
      expect(schemaVersion!.version).toBe(1)
      expect(schemaVersion!.migrations).toContain('test-migration')
    })

    it('should throw error if no migrations available for target version', async () => {
      await expect(manager.migrate(5)).rejects.toThrow(
        'No migrations available'
      )
    })

    it('should execute migration with data transformation', async () => {
      await adapter.set('users', [{ name: 'Alice' }])

      manager.register({
        version: 1,
        name: 'add-email-field',
        up: async (adapter) => {
          const users = (await adapter.get('users')) as any[]
          const updatedUsers = users.map((user) => ({
            ...user,
            email: `${user.name.toLowerCase()}@example.com`,
          }))
          await adapter.set('users', updatedUsers)
        },
      })

      await manager.migrate(1)

      const users = (await adapter.get('users')) as any[]
      expect(users[0].email).toBe('alice@example.com')
    })
  })

  describe('rollback', () => {
    beforeEach(async () => {
      // Set up v2 with rollback support
      manager.registerAll([
        {
          version: 1,
          name: 'migration-1',
          up: async (adapter) => {
            await adapter.set('test-key-1', 'v1-data')
          },
          down: async (adapter) => {
            await adapter.remove('test-key-1')
          },
        },
        {
          version: 2,
          name: 'migration-2',
          up: async (adapter) => {
            await adapter.set('test-key-2', 'v2-data')
          },
          down: async (adapter) => {
            await adapter.remove('test-key-2')
          },
        },
      ])

      // Migrate to v2
      await manager.migrate(2)
    })

    it('should rollback from v2 to v1', async () => {
      const results = await manager.rollback(1)

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(results[0].name).toBe('migration-2')

      const currentVersion = await manager.getCurrentVersion()
      expect(currentVersion).toBe(1)

      const testKey2 = await adapter.get('test-key-2')
      expect(testKey2).toBeNull()
    })

    it('should rollback from v2 to v0', async () => {
      const results = await manager.rollback(0)

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('migration-2')
      expect(results[1].name).toBe('migration-1')

      const currentVersion = await manager.getCurrentVersion()
      expect(currentVersion).toBe(0)
    })

    it('should throw error when trying to rollback forwards', async () => {
      await expect(manager.rollback(3)).rejects.toThrow(
        'Cannot rollback forwards'
      )
    })

    it('should throw error if migration does not support rollback', async () => {
      manager.register({
        version: 3,
        name: 'no-rollback-migration',
        up: async () => {},
        // No down function
      })

      await manager.migrate(3)

      await expect(manager.rollback(2)).rejects.toThrow(
        'does not support rollback'
      )
    })

    it('should prevent concurrent rollback execution', async () => {
      const rollback1 = manager.rollback(0)
      const rollback2 = manager.rollback(0)

      await expect(rollback2).rejects.toThrow('already in progress')
      await rollback1
    })

    it('should update schema version metadata after rollback', async () => {
      await manager.rollback(1)

      const schemaVersion = await manager.getSchemaVersion()
      expect(schemaVersion).not.toBeNull()
      expect(schemaVersion!.version).toBe(1)
      expect(schemaVersion!.migrations).not.toContain('migration-2')
    })
  })

  describe('edge cases', () => {
    it('should handle empty migration up function', async () => {
      manager.register({
        version: 1,
        name: 'empty-migration',
        up: async () => {},
      })

      const results = await manager.migrate(1)
      expect(results[0].success).toBe(true)
    })

    it('should handle migration with description', async () => {
      const migration: Migration = {
        version: 1,
        name: 'migration-with-desc',
        description: 'This migration does something important',
        up: async () => {},
      }

      manager.register(migration)

      const registered = manager.getRegisteredMigrations()
      expect(registered[0].description).toBe(
        'This migration does something important'
      )
    })

    it('should track execution time for migrations', async () => {
      manager.register({
        version: 1,
        name: 'timed-migration',
        up: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
        },
      })

      const results = await manager.migrate(1)
      expect(results[0].executionTime).toBeGreaterThanOrEqual(50)
    })

    it('should include appliedAt timestamp in results', async () => {
      manager.register({
        version: 1,
        name: 'timestamped-migration',
        up: async () => {},
      })

      const results = await manager.migrate(1)
      expect(results[0].appliedAt).toBeDefined()
      expect(new Date(results[0].appliedAt!).getTime()).toBeLessThanOrEqual(
        Date.now()
      )
    })
  })
})
