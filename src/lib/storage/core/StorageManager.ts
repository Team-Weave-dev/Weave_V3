/**
 * StorageManager - Core Storage Management System
 *
 * This class provides a high-level API for managing application data storage.
 * It wraps a StorageAdapter (LocalStorage, Supabase, etc.) and provides:
 * - Type-safe CRUD operations
 * - Event-based subscription system
 * - Batch operations for efficiency
 * - Transaction support with rollback
 * - In-memory caching for performance
 */

import type {
  StorageAdapter,
  StorageEvent,
  Subscriber,
  Unsubscribe,
  TransactionFunction,
  TransactionContext,
  CacheStats,
  BatchOperationResult,
  BatchOptions,
  SetOptions,
} from '../types/base';
import { StorageError, STORAGE_CONSTANTS } from '../types/base';
import { STORAGE_CONFIG, CACHE_OPTIONS, BATCH_OPTIONS } from '../config';
import { CacheLayer } from '../utils/CacheLayer';
import { processBatch, processMapBatch } from '../utils/batch';

export class StorageManager {
  /**
   * The underlying storage adapter (LocalStorage, Supabase, etc.)
   */
  private adapter: StorageAdapter;

  /**
   * Event subscribers organized by key
   * Map<key, Set<subscriber>>
   */
  private subscribers: Map<string, Set<Subscriber>>;

  /**
   * Advanced cache layer for frequently accessed data
   * Only used if enableCache is true in config
   */
  private cacheLayer: CacheLayer;

  /**
   * Configuration for this storage instance
   */
  private config: typeof STORAGE_CONFIG;

  /**
   * Batch operation configuration
   */
  private batchOptions: Required<BatchOptions>;

  /**
   * Create a new StorageManager instance
   *
   * @param adapter - The storage adapter to use
   * @param config - Optional configuration overrides
   * @param batchOptions - Optional batch operation overrides
   */
  constructor(
    adapter: StorageAdapter,
    config: Partial<typeof STORAGE_CONFIG> = {},
    batchOptions: BatchOptions = {}
  ) {
    this.adapter = adapter;
    this.subscribers = new Map();
    this.config = { ...STORAGE_CONFIG, ...config };
    this.batchOptions = { ...BATCH_OPTIONS, ...batchOptions } as Required<BatchOptions>;

    // Initialize cache layer with configuration
    this.cacheLayer = new CacheLayer({
      ...CACHE_OPTIONS,
      defaultTTL: this.config.cacheTTL,
    });
  }

  // ============================================================================
  // CRUD Operations (to be implemented in Phase 1.2)
  // ============================================================================

  /**
   * Get a value from storage
   *
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    // Check cache first
    const cached = this.getCached<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Get from adapter
    const value = await this.adapter.get<T>(key);

    // Update cache if value exists
    if (value !== null) {
      this.setCached(key, value);
    }

    return value;
  }

  /**
   * Set a value in storage
   *
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Optional set configuration
   */
  async set<T>(key: string, value: T, options?: SetOptions): Promise<void> {
    try {
      let oldValue: T | undefined;

      // Only read oldValue if needed for notification
      // This prevents race condition and improves performance
      const needsOldValue =
        options?.notifyOldValue ||
        this.subscribers.has(key) ||
        this.subscribers.has(STORAGE_CONSTANTS.WILDCARD_KEY);

      if (needsOldValue) {
        oldValue = (await this.adapter.get<T>(key)) || undefined;
      }

      // Set value in adapter
      await this.adapter.set(key, value);

      // Update cache (unless skipCache option is set)
      if (!options?.skipCache) {
        this.setCached(key, value, options?.cacheTTL);
      }

      // Notify subscribers
      this.notify(key, value, oldValue, 'set');
    } catch (error) {
      throw new StorageError(
        `Failed to set key "${key}"`,
        'SET_ERROR',
        key,
        error as Error
      );
    }
  }

  /**
   * Remove a value from storage
   *
   * @param key - Storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      // Get old value for event notification
      const oldValue = await this.adapter.get(key);

      // Remove from adapter
      await this.adapter.remove(key);

      // Invalidate cache
      this.invalidateCache(key);

      // Notify subscribers
      this.notify(key, undefined, oldValue || undefined, 'remove');
    } catch (error) {
      throw new StorageError(
        `Failed to remove key "${key}"`,
        'REMOVE_ERROR',
        key,
        error as Error
      );
    }
  }

  /**
   * Clear all storage entries
   */
  async clear(): Promise<void> {
    try {
      // Clear adapter
      await this.adapter.clear();

      // Clear cache
      this.clearCache();

      // Notify subscribers
      this.notify(STORAGE_CONSTANTS.WILDCARD_KEY, undefined, undefined, 'clear');
    } catch (error) {
      throw new StorageError(
        'Failed to clear storage',
        'CLEAR_ERROR',
        undefined,
        error as Error
      );
    }
  }

  // ============================================================================
  // Subscription System (to be implemented in Phase 1.3)
  // ============================================================================

  /**
   * Subscribe to changes for a specific key
   *
   * @param key - Storage key to watch (use '*' to watch all keys)
   * @param callback - Function to call when key changes
   * @returns Unsubscribe function
   */
  subscribe(key: string, callback: Subscriber): Unsubscribe {
    // Get or create subscriber set for this key
    let keySubscribers = this.subscribers.get(key);
    if (!keySubscribers) {
      keySubscribers = new Set();
      this.subscribers.set(key, keySubscribers);
    }

    // Add callback to set
    keySubscribers.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        // Clean up empty sets
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a change
   *
   * @param key - Storage key that changed
   * @param value - New value
   * @param oldValue - Previous value
   * @param operation - Type of operation
   */
  private notify<T>(
    key: string,
    value: T | undefined,
    oldValue: T | undefined,
    operation: StorageEvent['operation']
  ): void {
    // Create storage event
    const event: StorageEvent<T> = {
      key,
      value,
      oldValue,
      operation,
      timestamp: Date.now(),
    };

    // Notify key-specific subscribers
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in storage subscriber for key "${key}":`, error);
        }
      });
    }

    // Notify wildcard subscribers (subscribed to all changes)
    const wildcardSubscribers = this.subscribers.get(STORAGE_CONSTANTS.WILDCARD_KEY);
    if (wildcardSubscribers && key !== STORAGE_CONSTANTS.WILDCARD_KEY) {
      wildcardSubscribers.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in wildcard storage subscriber:`, error);
        }
      });
    }
  }

  // ============================================================================
  // Batch Operations (Optimized in Phase 8.2)
  // ============================================================================

  /**
   * Get multiple values at once with optimized batch processing
   *
   * @param keys - Array of storage keys
   * @param options - Optional batch operation overrides
   * @returns Map of key-value pairs (only includes existing keys)
   *
   * @example
   * ```typescript
   * const result = await storage.getBatch<Project>(['project:1', 'project:2'])
   * // Map { 'project:1' => {...}, 'project:2' => {...} }
   * ```
   */
  async getBatch<T>(
    keys: string[],
    options?: BatchOptions
  ): Promise<Map<string, T>> {
    const batchOpts = { ...this.batchOptions, ...options };

    const result = await processBatch(
      keys,
      async (key) => {
        const value = await this.get<T>(key);
        return { key, value };
      },
      batchOpts
    );

    // Convert results array back to Map (filter out null values)
    const resultMap = new Map<string, T>();
    for (const item of result.results) {
      if (item.value !== null) {
        resultMap.set(item.key, item.value);
      }
    }

    return resultMap;
  }

  /**
   * Set multiple values at once with optimized batch processing
   *
   * @param items - Map of key-value pairs to store
   * @param options - Optional batch operation overrides
   * @returns Batch operation result with statistics
   *
   * @example
   * ```typescript
   * const items = new Map([
   *   ['project:1', projectData1],
   *   ['project:2', projectData2]
   * ])
   * const result = await storage.setBatch(items)
   * // { success: true, successCount: 2, failureCount: 0, executionTime: 45 }
   * ```
   */
  async setBatch<T = any>(
    items: Map<string, T>,
    options?: BatchOptions & { notifyOldValues?: boolean }
  ): Promise<BatchOperationResult> {
    try {
      const batchOpts = { ...this.batchOptions, ...options };

      // Read old values in batch if needed (performance optimization)
      const oldValues = new Map<string, T>();
      if (options?.notifyOldValues) {
        const keys = Array.from(items.keys());
        const values = await this.getBatch<T>(keys);
        values.forEach((value, key) => oldValues.set(key, value));
      }

      const result = await processMapBatch(
        items,
        async (key, value) => {
          // Set value in adapter
          await this.adapter.set(key, value);

          // Update cache
          this.setCached(key, value);

          // Notify subscribers for each key
          this.notify(key, value, oldValues.get(key), 'batch');

          return true;
        },
        batchOpts
      );

      // Return batch operation result without the results map
      return {
        success: result.success,
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors,
        executionTime: result.executionTime,
        throughput: result.throughput,
      };
    } catch (error) {
      throw new StorageError(
        'Failed to set batch items',
        'SET_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Get batch operation configuration
   *
   * @returns Current batch options
   */
  getBatchOptions(): BatchOptions {
    return { ...this.batchOptions };
  }

  /**
   * Update batch operation configuration
   *
   * @param options - New batch options
   */
  setBatchOptions(options: BatchOptions): void {
    this.batchOptions = { ...this.batchOptions, ...options } as Required<BatchOptions>;
  }

  // ============================================================================
  // Transaction Support (to be implemented in Phase 1.5)
  // ============================================================================

  /**
   * Execute operations in a transaction
   *
   * If the transaction function throws, all changes are rolled back.
   *
   * @param fn - Transaction function
   */
  async transaction(fn: TransactionFunction): Promise<void> {
    try {
      // Get all current keys for snapshot
      const keys = await this.adapter.keys();

      // Create snapshot of current state
      const context = await this.createSnapshot(keys);

      try {
        // Execute transaction function
        await fn(this.adapter);

        // Transaction succeeded - invalidate cache for changed keys
        // This ensures cache consistency after successful transaction
        const currentKeys = await this.adapter.keys();
        const changedKeys = await this.detectChangedKeys(context.snapshot, currentKeys);

        // Invalidate cache for all changed keys
        changedKeys.forEach((key) => this.invalidateCache(key));
      } catch (error) {
        // Transaction failed - rollback to snapshot
        await this.rollback(context);

        // Re-throw error for caller to handle
        throw new StorageError(
          'Transaction failed and was rolled back',
          'TRANSACTION_ERROR',
          undefined,
          error as Error
        );
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        'Transaction initialization failed',
        'TRANSACTION_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Create a snapshot of current storage state
   *
   * @param keys - Keys to include in snapshot
   * @returns Transaction context with snapshot
   */
  private async createSnapshot(keys: string[]): Promise<TransactionContext> {
    const snapshot = new Map<string, any>();

    // Capture current values for all keys
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.adapter.get(key);
        if (value !== null) {
          snapshot.set(key, value);
        }
      })
    );

    return {
      snapshot,
      modifiedKeys: new Set<string>(),
      startedAt: Date.now(),
    };
  }

  /**
   * Detect which keys have changed since the snapshot
   *
   * @param snapshot - Original snapshot
   * @param currentKeys - Current keys in storage
   * @returns Array of changed key names
   */
  private async detectChangedKeys(
    snapshot: Map<string, any>,
    currentKeys: string[]
  ): Promise<string[]> {
    const changed: string[] = [];

    // Check all current keys for changes
    for (const key of currentKeys) {
      const oldValue = snapshot.get(key);
      const newValue = await this.adapter.get(key);

      // Key was added or value changed
      if (oldValue === undefined || JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changed.push(key);
      }
    }

    // Check for deleted keys
    const currentKeySet = new Set(currentKeys);
    for (const key of snapshot.keys()) {
      if (!currentKeySet.has(key)) {
        changed.push(key);
      }
    }

    return changed;
  }

  /**
   * Rollback to a previous snapshot
   *
   * @param context - Transaction context with snapshot
   */
  private async rollback(context: TransactionContext): Promise<void> {
    try {
      // Get all current keys
      const currentKeys = await this.adapter.keys();

      // Restore snapshot values
      await Promise.all(
        Array.from(context.snapshot.entries()).map(async ([key, value]) => {
          await this.adapter.set(key, value);
          this.setCached(key, value);
          // Notify subscribers about rollback
          this.notify(key, value, undefined, 'rollback');
        })
      );

      // Remove keys that didn't exist in snapshot
      const snapshotKeys = new Set(context.snapshot.keys());
      await Promise.all(
        currentKeys
          .filter((key) => !snapshotKeys.has(key))
          .map(async (key) => {
            await this.adapter.remove(key);
            this.invalidateCache(key);
            // Notify subscribers about rollback
            this.notify(key, undefined, undefined, 'rollback');
          })
      );
    } catch (error) {
      throw new StorageError(
        'Rollback failed',
        'ROLLBACK_ERROR',
        undefined,
        error as Error
      );
    }
  }

  // ============================================================================
  // Cache Management (Internal & Public)
  // ============================================================================

  /**
   * Get value from cache if available and not expired
   *
   * @param key - Storage key
   * @returns Cached value or null
   */
  private getCached<T>(key: string): T | null {
    if (!this.config.enableCache) return null;
    return this.cacheLayer.get<T>(key);
  }

  /**
   * Store value in cache
   *
   * @param key - Storage key
   * @param value - Value to cache
   * @param ttl - Optional TTL override
   */
  private setCached<T>(key: string, value: T, ttl?: number): void {
    if (!this.config.enableCache) return;
    this.cacheLayer.set(key, value, ttl);
  }

  /**
   * Invalidate cache entry
   *
   * @param key - Storage key to invalidate
   */
  private invalidateCache(key: string): void {
    this.cacheLayer.invalidate(key);
  }

  /**
   * Clear all cache entries
   */
  private clearCache(): void {
    this.cacheLayer.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache performance statistics
   */
  getCacheStats(): CacheStats {
    if (!this.config.enableCache) {
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        evictions: 0,
        totalRequests: 0,
      };
    }
    return this.cacheLayer.getStats();
  }

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - Key pattern (supports wildcards with *)
   * @returns Number of invalidated entries
   *
   * @example
   * ```typescript
   * storage.invalidateCachePattern('project:*') // Invalidates all project caches
   * ```
   */
  invalidateCachePattern(pattern: string): number {
    if (!this.config.enableCache) return 0;
    return this.cacheLayer.invalidatePattern(pattern);
  }

  /**
   * Remove all expired cache entries
   *
   * @returns Number of removed entries
   */
  cleanupExpiredCache(): number {
    if (!this.config.enableCache) return 0;
    return this.cacheLayer.cleanupExpired();
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    if (!this.config.enableCache) return;
    this.cacheLayer.resetStats();
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get all storage keys
   *
   * @returns Array of all keys
   */
  async keys(): Promise<string[]> {
    return this.adapter.keys();
  }

  /**
   * Check if a key exists in storage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    return this.adapter.hasKey(key);
  }

  /**
   * Get current configuration
   *
   * @returns Current storage configuration
   */
  getConfig(): typeof STORAGE_CONFIG {
    return { ...this.config };
  }
}
