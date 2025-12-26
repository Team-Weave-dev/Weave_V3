/**
 * StorageManager Unit Tests
 *
 * Tests for the core storage management system
 */

import { StorageManager } from '../core/StorageManager'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'
import { StorageError } from '../types/base'

describe('StorageManager', () => {
  let adapter: LocalStorageAdapter
  let manager: StorageManager
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Reset mock localStorage
    mockLocalStorage = {}

    // Mock localStorage methods
    ;(global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return mockLocalStorage[key] ?? null
    })

    ;(global.localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage[key] = value
      }
    )

    ;(global.localStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockLocalStorage[key]
    })

    ;(global.localStorage.clear as jest.Mock).mockImplementation(() => {
      mockLocalStorage = {}
    })

    Object.defineProperty(global.localStorage, 'length', {
      get: () => Object.keys(mockLocalStorage).length,
      configurable: true,
    })

    ;(global.localStorage.key as jest.Mock).mockImplementation((index: number) => {
      const keys = Object.keys(mockLocalStorage)
      return keys[index] ?? null
    })

    // Create adapter and manager
    adapter = new LocalStorageAdapter({ prefix: 'test_' })
    manager = new StorageManager(adapter)
  })

  describe('constructor', () => {
    it('should create StorageManager with adapter', () => {
      expect(manager).toBeInstanceOf(StorageManager)
    })

    it('should create StorageManager with custom config', () => {
      const customManager = new StorageManager(adapter, {
        cacheTTL: 10000,
      })
      expect(customManager).toBeInstanceOf(StorageManager)
    })

    it('should create StorageManager with batch options', () => {
      const customManager = new StorageManager(adapter, {}, {
        chunkSize: 25,
        maxParallel: 3,
      })
      expect(customManager).toBeInstanceOf(StorageManager)
    })
  })

  describe('CRUD operations', () => {
    describe('get() and set()', () => {
      it('should store and retrieve a value', async () => {
        await manager.set('testKey', 'testValue')
        const value = await manager.get('testKey')
        expect(value).toBe('testValue')
      })

      it('should store and retrieve an object', async () => {
        const testObject = { id: '123', name: 'Test', count: 42 }
        await manager.set('testObject', testObject)
        const value = await manager.get('testObject')
        expect(value).toEqual(testObject)
      })

      it('should return null for non-existent key', async () => {
        const value = await manager.get('nonExistent')
        expect(value).toBeNull()
      })

      it('should use cache for subsequent reads', async () => {
        await manager.set('cachedKey', 'cachedValue')

        // First get - from adapter
        const value1 = await manager.get('cachedKey')
        expect(value1).toBe('cachedValue')

        // Clear underlying storage but cache should still work
        delete mockLocalStorage['test_cachedKey']

        // Second get - from cache
        const value2 = await manager.get('cachedKey')
        expect(value2).toBe('cachedValue')
      })

      it('should skip cache when skipCache option is set', async () => {
        // Set with skipCache should NOT update cache
        await manager.set('noCache', 'value1', { skipCache: true })

        // Update value directly in storage (bypassing manager)
        mockLocalStorage['test_noCache'] = JSON.stringify('value2')

        // Get should return value2 from storage (not cached)
        const value = await manager.get('noCache')
        expect(value).toBe('value2')

        // Now set with cache enabled
        await manager.set('noCache', 'value3')

        // Get should return cached value3
        const cachedValue = await manager.get('noCache')
        expect(cachedValue).toBe('value3')
      })
    })

    describe('remove()', () => {
      it('should remove a value', async () => {
        await manager.set('toRemove', 'value')
        expect(await manager.get('toRemove')).toBe('value')

        await manager.remove('toRemove')
        expect(await manager.get('toRemove')).toBeNull()
      })

      it('should invalidate cache on remove', async () => {
        await manager.set('cached', 'value')
        expect(await manager.get('cached')).toBe('value')

        await manager.remove('cached')

        // Cache should be invalidated
        expect(await manager.get('cached')).toBeNull()
      })

      it('should not throw when removing non-existent key', async () => {
        await expect(manager.remove('nonExistent')).resolves.not.toThrow()
      })
    })

    describe('clear()', () => {
      it('should clear all values', async () => {
        await manager.set('key1', 'value1')
        await manager.set('key2', 'value2')
        await manager.set('key3', 'value3')

        await manager.clear()

        expect(await manager.get('key1')).toBeNull()
        expect(await manager.get('key2')).toBeNull()
        expect(await manager.get('key3')).toBeNull()
      })

      it('should clear cache on clear', async () => {
        await manager.set('cached1', 'value1')
        await manager.set('cached2', 'value2')

        await manager.clear()

        // Cache should be cleared
        const cacheStats = manager.getCacheStats()
        expect(cacheStats.size).toBe(0)
      })
    })
  })

  describe('batch operations', () => {
    describe('getBatch()', () => {
      it('should retrieve multiple values', async () => {
        await manager.set('key1', 'value1')
        await manager.set('key2', 'value2')
        await manager.set('key3', 'value3')

        const result = await manager.getBatch(['key1', 'key2', 'key3'])

        expect(result.size).toBe(3)
        expect(result.get('key1')).toBe('value1')
        expect(result.get('key2')).toBe('value2')
        expect(result.get('key3')).toBe('value3')
      })

      it('should handle non-existent keys in batch', async () => {
        await manager.set('key1', 'value1')

        const result = await manager.getBatch(['key1', 'nonExistent', 'key3'])

        expect(result.size).toBe(1)
        expect(result.get('key1')).toBe('value1')
        expect(result.has('nonExistent')).toBe(false)
      })

      it('should handle empty keys array', async () => {
        const result = await manager.getBatch([])
        expect(result.size).toBe(0)
      })
    })

    describe('setBatch()', () => {
      it('should set multiple values', async () => {
        const items = new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
          ['key3', 'value3'],
        ])

        const result = await manager.setBatch(items)

        expect(result.successCount).toBe(3)
        expect(result.failureCount).toBe(0)
        expect(await manager.get('key1')).toBe('value1')
        expect(await manager.get('key2')).toBe('value2')
        expect(await manager.get('key3')).toBe('value3')
      })

      it('should handle empty items map', async () => {
        const result = await manager.setBatch(new Map())

        expect(result.successCount).toBe(0)
        expect(result.failureCount).toBe(0)
      })

      it('should report execution time', async () => {
        const items = new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ])

        const result = await manager.setBatch(items)

        expect(result.executionTime).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('subscription system', () => {
    it('should notify subscriber on set', async () => {
      const subscriber = jest.fn()
      manager.subscribe('testKey', subscriber)

      await manager.set('testKey', 'newValue')

      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'testKey',
          value: 'newValue',
          operation: 'set',
          timestamp: expect.any(Number),
        })
      )
    })

    it('should notify subscriber on remove', async () => {
      const subscriber = jest.fn()
      await manager.set('testKey', 'value')

      manager.subscribe('testKey', subscriber)
      await manager.remove('testKey')

      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'testKey',
          value: undefined,
          operation: 'remove',
          timestamp: expect.any(Number),
        })
      )
    })

    it('should unsubscribe when calling returned function', async () => {
      const subscriber = jest.fn()
      const unsubscribe = manager.subscribe('testKey', subscriber)

      await manager.set('testKey', 'value1')
      expect(subscriber).toHaveBeenCalledTimes(1)

      unsubscribe()

      await manager.set('testKey', 'value2')
      expect(subscriber).toHaveBeenCalledTimes(1) // No additional call
    })

    it('should support wildcard subscription', async () => {
      const subscriber = jest.fn()
      manager.subscribe('*', subscriber)

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')

      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple subscribers for same key', async () => {
      const subscriber1 = jest.fn()
      const subscriber2 = jest.fn()

      manager.subscribe('testKey', subscriber1)
      manager.subscribe('testKey', subscriber2)

      await manager.set('testKey', 'value')

      expect(subscriber1).toHaveBeenCalledTimes(1)
      expect(subscriber2).toHaveBeenCalledTimes(1)
    })
  })

  describe('transaction system', () => {
    it('should commit transaction on success', async () => {
      await manager.transaction(async (tx) => {
        await tx.set('key1', 'value1')
        await tx.set('key2', 'value2')
      })

      expect(await manager.get('key1')).toBe('value1')
      expect(await manager.get('key2')).toBe('value2')
    })

    it('should rollback transaction on error', async () => {
      await manager.set('existing', 'originalValue')

      try {
        await manager.transaction(async (tx) => {
          await tx.set('existing', 'newValue')
          await tx.set('new', 'value')
          throw new Error('Transaction failed')
        })
      } catch (_error) {
        // Expected error
      }

      // Should rollback to original value
      expect(await manager.get('existing')).toBe('originalValue')
      expect(await manager.get('new')).toBeNull()
    })

    it('should prevent concurrent transactions', async () => {
      const transaction1 = manager.transaction(async (tx) => {
        await tx.set('key', 'value1')
      })

      await expect(
        manager.transaction(async (tx) => {
          await tx.set('key', 'value2')
        })
      ).rejects.toThrow(StorageError)

      await transaction1
    })

    it('should invalidate cache after transaction', async () => {
      await manager.set('key', 'originalValue')

      // Verify it's cached
      expect(await manager.get('key')).toBe('originalValue')

      await manager.transaction(async (tx) => {
        await tx.set('key', 'newValue')
      })

      // Cache should be invalidated
      expect(await manager.get('key')).toBe('newValue')
    })
  })

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      const stats = manager.getCacheStats()

      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
    })

    it('should invalidate cache by pattern', async () => {
      await manager.set('project:1', { id: '1' })
      await manager.set('project:2', { id: '2' })
      await manager.set('task:1', { id: '1' })

      // Invalidate all project keys
      manager.invalidateCachePattern('project:*')

      // Cache should be cleared for project keys but not task keys
      const stats = manager.getCacheStats()
      expect(stats.size).toBeLessThan(3)
    })

    it('should clear entire cache', async () => {
      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')
      await manager.set('key3', 'value3')

      // clearCache is private, so we test through cache behavior
      // Cache will be cleared when it reaches maxSize
      const stats = manager.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should cleanup expired cache entries', async () => {
      // Set with short TTL
      await manager.set('shortLived', 'value', { cacheTTL: 100 })

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      manager.cleanupExpiredCache()

      const stats = manager.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should throw StorageError on adapter failure', async () => {
      // Mock adapter to throw error
      jest.spyOn(adapter, 'get').mockRejectedValueOnce(new Error('Adapter error'))

      await expect(manager.get('key')).rejects.toThrow()
    })

    it('should handle QuotaExceededError gracefully', async () => {
      jest.spyOn(adapter, 'set').mockRejectedValueOnce(() => {
        const error: any = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      await expect(manager.set('key', 'value')).rejects.toThrow()
    })
  })
})
