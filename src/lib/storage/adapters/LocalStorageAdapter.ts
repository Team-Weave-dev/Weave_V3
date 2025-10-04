/**
 * LocalStorageAdapter - Browser LocalStorage Implementation
 *
 * This adapter wraps the browser's localStorage API and provides:
 * - StorageAdapter interface compliance
 * - JSON serialization/deserialization
 * - Key prefix management
 * - Error handling and fallback support
 * - Type-safe storage operations
 */

import type { StorageAdapter, TypeGuard } from '../types/base';
import { StorageError } from '../types/base';
import { STORAGE_CONFIG, validateId } from '../config';
import { CompressionManager, decompressData, hasEnoughSpace, getStorageUsage } from '../utils/compression';

/**
 * Configuration options for LocalStorageAdapter
 */
export interface LocalStorageConfig {
  /** Key prefix for all localStorage entries */
  prefix?: string;
  /** Whether to enable compression for large values */
  enableCompression?: boolean;
  /** Compression threshold in bytes */
  compressionThreshold?: number;
}

/**
 * LocalStorage adapter implementing the StorageAdapter interface
 *
 * Provides a type-safe, async-compatible wrapper around browser's localStorage.
 * Handles JSON serialization, key prefixing, and error management.
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Compression prefix for identifying compressed data
   */
  private static readonly COMPRESSION_PREFIX = '__COMPRESSED__:';

  /**
   * Key prefix for all localStorage entries
   * Prevents key collisions with other applications
   */
  private prefix: string;

  /**
   * Compression manager for advanced compression with statistics
   */
  private compressionManager?: CompressionManager;

  /**
   * Create a new LocalStorageAdapter
   *
   * @param config - Optional configuration overrides
   */
  constructor(config?: LocalStorageConfig) {
    this.prefix = config?.prefix ?? STORAGE_CONFIG.prefix;
    const enableCompression = config?.enableCompression ?? STORAGE_CONFIG.enableCompression ?? false;

    // Initialize CompressionManager if compression is enabled
    if (enableCompression) {
      this.compressionManager = new CompressionManager({
        enabled: true,
        threshold: config?.compressionThreshold ?? STORAGE_CONFIG.compressionThreshold ?? 10 * 1024,
        minRatio: 0.9, // Apply compression only if it reduces size by at least 10%
        enableStats: true,
        adaptiveThreshold: true, // Enable adaptive threshold optimization
      });
    }
  }

  /**
   * Build full key with prefix
   *
   * Validates and sanitizes the key to prevent injection attacks.
   *
   * @param key - Storage key
   * @returns Prefixed key for localStorage
   * @throws {Error} If key is invalid
   */
  private buildKey(key: string): string {
    const safeKey = validateId(key, 'storage key');
    return `${this.prefix}${safeKey}`;
  }

  /**
   * Remove prefix from key
   *
   * @param fullKey - Prefixed key from localStorage
   * @returns Original key without prefix
   */
  private stripPrefix(fullKey: string): string {
    return fullKey.startsWith(this.prefix)
      ? fullKey.substring(this.prefix.length)
      : fullKey;
  }

  /**
   * Check if localStorage is available
   *
   * @returns True if localStorage is available and functional
   */
  private isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a value from localStorage
   *
   * @param key - Storage key
   * @param typeGuard - Optional type guard function for runtime validation
   * @returns The stored value or null if not found
   * @throws {StorageError} If localStorage is unavailable, operation fails, or type validation fails
   */
  async get<T>(key: string, typeGuard?: TypeGuard<T>): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage is not available', 'ADAPTER_ERROR', {
        key,
        severity: 'critical',
      });
    }

    try {
      const fullKey = this.buildKey(key);
      const value = localStorage.getItem(fullKey);

      if (value === null) {
        return null;
      }

      // Check if data is compressed
      let jsonString = value;

      if (value.startsWith(LocalStorageAdapter.COMPRESSION_PREFIX)) {
        // Extract and decompress data
        const compressedData = value.substring(LocalStorageAdapter.COMPRESSION_PREFIX.length);
        jsonString = this.compressionManager
          ? this.compressionManager.decompress(compressedData)
          : decompressData(compressedData);
      }

      // Parse JSON value
      const parsed = JSON.parse(jsonString);

      // Validate type if type guard is provided
      if (typeGuard && !typeGuard(parsed)) {
        throw new StorageError(`Type validation failed for key "${key}"`, 'GET_ERROR', {
          key,
          severity: 'high',
        });
      }

      return parsed as T;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to get key "${key}" from localStorage`,
        'GET_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'high',
        }
      );
    }
  }

  /**
   * Set a value in localStorage
   *
   * @param key - Storage key
   * @param value - Value to store
   */
  async set<T>(key: string, value: T): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('localStorage is not available');
    }

    try {
      const fullKey = this.buildKey(key);
      const serialized = JSON.stringify(value);

      // Apply compression if enabled and data is large enough
      let dataToStore = serialized;

      if (this.compressionManager) {
        const compressionResult = this.compressionManager.compress(serialized);

        if (compressionResult.compressed) {
          // Use compressed version if it's actually smaller
          dataToStore = LocalStorageAdapter.COMPRESSION_PREFIX + compressionResult.data;
        }
      }

      localStorage.setItem(fullKey, dataToStore);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Provide storage usage information
        const usage = getStorageUsage();
        throw new StorageError(
          `localStorage quota exceeded. Used: ${usage.percentage.toFixed(1)}% (${usage.used}/${usage.total} bytes)`,
          'SET_ERROR',
          {
            key,
            cause: error,
            severity: 'critical',
            userMessage: '저장 공간이 부족합니다. 불필요한 데이터를 삭제해주세요.',
          }
        );
      }
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to set key "${key}" in localStorage`,
        'SET_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'high',
        }
      );
    }
  }

  /**
   * Remove a value from localStorage
   *
   * @param key - Storage key to remove
   * @throws {StorageError} If localStorage is unavailable or operation fails
   */
  async remove(key: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage is not available', 'ADAPTER_ERROR', {
        key,
        severity: 'critical',
      });
    }

    try {
      const fullKey = this.buildKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to remove key "${key}" from localStorage`,
        'REMOVE_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'medium',
        }
      );
    }
  }

  /**
   * Clear all storage entries with this adapter's prefix
   *
   * @throws {StorageError} If localStorage is unavailable or operation fails
   */
  async clear(): Promise<void> {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage is not available', 'ADAPTER_ERROR', {
        severity: 'critical',
      });
    }

    try {
      // Get all keys with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey && fullKey.startsWith(this.prefix)) {
          keysToRemove.push(fullKey);
        }
      }

      // Remove all matching keys
      keysToRemove.forEach((fullKey) => {
        localStorage.removeItem(fullKey);
      });
    } catch (error) {
      throw new StorageError('Failed to clear localStorage', 'CLEAR_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      });
    }
  }

  /**
   * Get all storage keys (without prefix)
   *
   * @returns Array of all keys managed by this adapter
   */
  async keys(): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey && fullKey.startsWith(this.prefix)) {
          keys.push(this.stripPrefix(fullKey));
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in storage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error(`Error checking key "${key}" in localStorage:`, error);
      return false;
    }
  }

  /**
   * Get compression statistics
   *
   * Returns compression statistics if CompressionManager is enabled,
   * otherwise returns null.
   *
   * @returns Compression statistics or null
   */
  getCompressionStats() {
    return this.compressionManager?.getStats() ?? null;
  }
}
