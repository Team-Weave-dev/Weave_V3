/**
 * LocalStorageAdapter Unit Tests
 *
 * Tests for the browser localStorage adapter implementation
 */

import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'
import { StorageError } from '../types/base'

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Reset mock localStorage before each test
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

    // Create new adapter instance
    adapter = new LocalStorageAdapter({ prefix: 'test_' })
  })

  describe('constructor', () => {
    it('should create adapter with default prefix', () => {
      const defaultAdapter = new LocalStorageAdapter()
      expect(defaultAdapter).toBeInstanceOf(LocalStorageAdapter)
    })

    it('should create adapter with custom prefix', () => {
      const customAdapter = new LocalStorageAdapter({ prefix: 'custom_' })
      expect(customAdapter).toBeInstanceOf(LocalStorageAdapter)
    })

    it('should create adapter with compression enabled', () => {
      const compressedAdapter = new LocalStorageAdapter({
        enableCompression: true,
        compressionThreshold: 1024,
      })
      expect(compressedAdapter).toBeInstanceOf(LocalStorageAdapter)
    })
  })

  describe('set() and get()', () => {
    it('should store and retrieve a string value', async () => {
      const testValue = 'Hello, World!'
      await adapter.set('testKey', testValue)

      const retrieved = await adapter.get<string>('testKey')
      expect(retrieved).toBe(testValue)
    })

    it('should store and retrieve an object', async () => {
      const testObject = { name: 'John', age: 30, active: true }
      await adapter.set('user', testObject)

      const retrieved = await adapter.get<typeof testObject>('user')
      expect(retrieved).toEqual(testObject)
    })

    it('should store and retrieve an array', async () => {
      const testArray = [1, 2, 3, 4, 5]
      await adapter.set('numbers', testArray)

      const retrieved = await adapter.get<number[]>('numbers')
      expect(retrieved).toEqual(testArray)
    })

    it('should return null for non-existent key', async () => {
      const retrieved = await adapter.get('nonExistent')
      expect(retrieved).toBeNull()
    })

    it('should store null value', async () => {
      await adapter.set('nullKey', null)

      const retrieved = await adapter.get('nullKey')
      expect(retrieved).toBeNull()
    })

    it('should store undefined as null', async () => {
      await adapter.set('undefinedKey', undefined)

      const retrieved = await adapter.get('undefinedKey')
      // JSON.stringify(undefined) returns undefined, which becomes 'undefined' string
      // then JSON.parse('undefined') throws, so this should handle gracefully
      expect(retrieved).toBeNull()
    })

    it('should use key prefix', async () => {
      await adapter.set('myKey', 'myValue')

      // Check that the actual localStorage key has the prefix
      expect(mockLocalStorage['test_myKey']).toBeDefined()
    })

    it('should validate type with type guard', async () => {
      const testObject = { id: '123', name: 'Test' }
      await adapter.set('validated', testObject)

      // Type guard that checks for required properties
      const typeGuard = (value: unknown): value is { id: string; name: string } => {
        return (
          typeof value === 'object' &&
          value !== null &&
          'id' in value &&
          'name' in value &&
          typeof (value as any).id === 'string' &&
          typeof (value as any).name === 'string'
        )
      }

      const retrieved = await adapter.get('validated', typeGuard)
      expect(retrieved).toEqual(testObject)
    })

    it('should throw error if type guard fails', async () => {
      await adapter.set('wrongType', { id: 123 }) // id is number, not string

      const typeGuard = (value: unknown): value is { id: string } => {
        return (
          typeof value === 'object' &&
          value !== null &&
          'id' in value &&
          typeof (value as any).id === 'string'
        )
      }

      await expect(adapter.get('wrongType', typeGuard)).rejects.toThrow(StorageError)
    })

    it('should handle QuotaExceededError', async () => {
      // First call is for isAvailable check (should succeed)
      // Second call is for actual set (should throw QuotaExceededError)
      let callCount = 0
      ;(global.localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
        callCount++
        if (callCount === 1) {
          // First call is the availability check - should succeed
          mockLocalStorage[key] = value
        } else {
          // Second call is the actual set - should throw QuotaExceededError
          const error: any = new Error('QuotaExceededError')
          error.name = 'QuotaExceededError'
          throw error
        }
      })

      await expect(adapter.set('largeKey', 'x'.repeat(10000000))).rejects.toThrow(
        StorageError
      )
    })
  })

  describe('remove()', () => {
    it('should remove an existing key', async () => {
      await adapter.set('toRemove', 'value')
      expect(await adapter.get('toRemove')).toBe('value')

      await adapter.remove('toRemove')
      expect(await adapter.get('toRemove')).toBeNull()
    })

    it('should not throw when removing non-existent key', async () => {
      await expect(adapter.remove('nonExistent')).resolves.not.toThrow()
    })

    it('should use prefixed key for removal', async () => {
      await adapter.set('myKey', 'myValue')
      expect(mockLocalStorage['test_myKey']).toBeDefined()

      await adapter.remove('myKey')
      expect(mockLocalStorage['test_myKey']).toBeUndefined()
    })
  })

  describe('clear()', () => {
    it('should clear all keys with adapter prefix', async () => {
      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.set('key3', 'value3')

      // Add a key with different prefix (should not be removed)
      mockLocalStorage['other_key'] = 'other_value'

      await adapter.clear()

      expect(await adapter.get('key1')).toBeNull()
      expect(await adapter.get('key2')).toBeNull()
      expect(await adapter.get('key3')).toBeNull()
      expect(mockLocalStorage['other_key']).toBe('other_value')
    })

    it('should handle empty storage', async () => {
      await expect(adapter.clear()).resolves.not.toThrow()
    })
  })

  describe('keys()', () => {
    it('should return all keys without prefix', async () => {
      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.set('key3', 'value3')

      const keys = await adapter.keys()

      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('should return empty array when no keys exist', async () => {
      const keys = await adapter.keys()
      expect(keys).toEqual([])
    })

    it('should only return keys with adapter prefix', async () => {
      await adapter.set('myKey', 'myValue')
      mockLocalStorage['other_key'] = 'other_value'

      const keys = await adapter.keys()

      expect(keys).toHaveLength(1)
      expect(keys).toContain('myKey')
      expect(keys).not.toContain('other_key')
    })
  })

  describe('hasKey()', () => {
    it('should return true for existing key', async () => {
      await adapter.set('existingKey', 'value')

      const exists = await adapter.hasKey('existingKey')
      expect(exists).toBe(true)
    })

    it('should return false for non-existent key', async () => {
      const exists = await adapter.hasKey('nonExistent')
      expect(exists).toBe(false)
    })

    it('should use prefixed key for check', async () => {
      mockLocalStorage['test_myKey'] = JSON.stringify('value')

      const exists = await adapter.hasKey('myKey')
      expect(exists).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should throw StorageError when get() fails to parse JSON', async () => {
      // Manually set invalid JSON
      mockLocalStorage['test_invalid'] = 'invalid json {'

      await expect(adapter.get('invalid')).rejects.toThrow(StorageError)
    })

    it('should throw StorageError when localStorage is unavailable for get()', async () => {
      // Mock isAvailable to return false
      ;(global.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('localStorage not available')
      })

      const unavailableAdapter = new LocalStorageAdapter()
      await expect(unavailableAdapter.get('key')).rejects.toThrow()
    })

    it('should throw Error when localStorage is unavailable for set()', async () => {
      // Mock isAvailable to return false by making setItem throw on test check
      let callCount = 0
      ;(global.localStorage.setItem as jest.Mock).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call is the availability check
          throw new Error('localStorage not available')
        }
      })

      const unavailableAdapter = new LocalStorageAdapter()
      await expect(unavailableAdapter.set('key', 'value')).rejects.toThrow()
    })
  })

  describe('compression', () => {
    it('should get compression stats when compression is enabled', () => {
      const compressedAdapter = new LocalStorageAdapter({
        enableCompression: true,
      })

      const stats = compressedAdapter.getCompressionStats()
      expect(stats).toBeDefined()
    })

    it('should return null stats when compression is disabled', () => {
      const stats = adapter.getCompressionStats()
      expect(stats).toBeNull()
    })
  })
})
