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

import type { StorageAdapter } from '../types/base';
import { STORAGE_CONFIG } from '../config';
import { compressData, decompressData, hasEnoughSpace, getStorageUsage } from '../utils/compression';

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
   * Key prefix for all localStorage entries
   * Prevents key collisions with other applications
   */
  private prefix: string;

  /**
   * Compression settings
   */
  private enableCompression: boolean;
  private compressionThreshold: number;

  /**
   * Create a new LocalStorageAdapter
   *
   * @param config - Optional configuration overrides
   */
  constructor(config?: LocalStorageConfig) {
    this.prefix = config?.prefix ?? STORAGE_CONFIG.prefix;
    this.enableCompression = config?.enableCompression ?? STORAGE_CONFIG.enableCompression ?? false;
    this.compressionThreshold = config?.compressionThreshold ?? STORAGE_CONFIG.compressionThreshold ?? 10 * 1024;
  }

  /**
   * Build full key with prefix
   *
   * @param key - Storage key
   * @returns Prefixed key for localStorage
   */
  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
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
   * @returns The stored value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      const fullKey = this.buildKey(key);
      const value = localStorage.getItem(fullKey);

      if (value === null) {
        return null;
      }

      // Check if data is compressed
      const COMPRESSION_PREFIX = '__COMPRESSED__:';
      let jsonString = value;

      if (value.startsWith(COMPRESSION_PREFIX)) {
        // Extract and decompress data
        const compressedData = value.substring(COMPRESSION_PREFIX.length);
        jsonString = decompressData(compressedData);
      }

      // Parse JSON value
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Error getting key "${key}" from localStorage:`, error);
      return null;
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
      const COMPRESSION_PREFIX = '__COMPRESSED__:';

      if (this.enableCompression) {
        const compressionResult = compressData(serialized, this.compressionThreshold);

        if (compressionResult.compressed) {
          // Use compressed version if it's actually smaller
          dataToStore = COMPRESSION_PREFIX + compressionResult.data;
        }
      }

      localStorage.setItem(fullKey, dataToStore);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Provide storage usage information
        const usage = getStorageUsage();
        throw new Error(
          `localStorage quota exceeded. Used: ${usage.percentage.toFixed(1)}% (${usage.used}/${usage.total} bytes)`
        );
      }
      throw error;
    }
  }

  /**
   * Remove a value from localStorage
   *
   * @param key - Storage key to remove
   */
  async remove(key: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      const fullKey = this.buildKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error removing key "${key}" from localStorage:`, error);
    }
  }

  /**
   * Clear all storage entries with this adapter's prefix
   */
  async clear(): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
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
      console.error('Error clearing localStorage:', error);
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
}
