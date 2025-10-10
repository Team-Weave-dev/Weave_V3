/**
 * DualWriteAdapter - Dual-Write Storage Adapter
 *
 * This adapter implements a dual-write strategy for migrating from LocalStorage to Supabase:
 * - Writes go to LocalStorage first (fast response)
 * - Writes are synchronized to Supabase in the background
 * - Reads come from LocalStorage (single source of truth)
 * - Failed Supabase writes are queued for retry
 * - Periodic background sync worker
 */

import type { StorageAdapter, JsonValue, TypeGuard } from '../types/base'
import { StorageError } from '../types/base'
import type { LocalStorageAdapter } from './LocalStorageAdapter'
import type { SupabaseAdapter } from './SupabaseAdapter'

/**
 * Configuration options for DualWriteAdapter
 */
export interface DualWriteAdapterConfig {
  /** LocalStorage adapter (primary) */
  local: LocalStorageAdapter
  /** Supabase adapter (secondary) */
  supabase: SupabaseAdapter
  /** Sync interval in milliseconds (default: 5000 = 5 seconds) */
  syncInterval?: number
  /** Enable automatic background sync worker */
  enableSyncWorker?: boolean
  /** Enable background verification (compare Local vs Supabase) */
  enableVerification?: boolean
  /** Maximum retry attempts for failed syncs */
  maxRetries?: number
  /** Maximum queue size (default: 1000) - prevents unbounded growth */
  maxQueueSize?: number
}

/**
 * Sync queue entry
 */
interface SyncQueueEntry {
  key: string
  value: JsonValue
  operation: 'set' | 'remove'
  timestamp: number
  retryCount: number
}

/**
 * Sync statistics
 */
export interface SyncStats {
  /** Total sync attempts */
  totalAttempts: number
  /** Successful syncs */
  successCount: number
  /** Failed syncs */
  failureCount: number
  /** Current queue size */
  queueSize: number
  /** Pending syncs */
  pendingCount: number
  /** Last sync timestamp */
  lastSyncAt: number | null
}

/**
 * Dual-write adapter for LocalStorage → Supabase migration
 *
 * Implements a safe migration strategy with LocalStorage as the primary source
 * and Supabase as the secondary target for background synchronization.
 */
export class DualWriteAdapter implements StorageAdapter {
  /**
   * LocalStorage adapter (primary, source of truth)
   */
  private local: LocalStorageAdapter

  /**
   * Supabase adapter (secondary, background sync target)
   */
  private supabase: SupabaseAdapter

  /**
   * Sync queue for failed operations
   */
  private syncQueue: Map<string, SyncQueueEntry> = new Map()

  /**
   * Set of keys currently being synchronized
   */
  private pendingSync: Set<string> = new Set()

  /**
   * Sync worker interval ID
   */
  private syncWorkerInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Sync configuration
   */
  private syncInterval: number
  private enableSyncWorker: boolean
  private enableVerification: boolean
  private maxRetries: number
  private maxQueueSize: number

  /**
   * Sync statistics
   */
  private stats: SyncStats = {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    queueSize: 0,
    pendingCount: 0,
    lastSyncAt: null,
  }

  /**
   * Create a new DualWriteAdapter
   *
   * @param config - Configuration options
   */
  constructor(config: DualWriteAdapterConfig) {
    this.local = config.local
    this.supabase = config.supabase
    this.syncInterval = config.syncInterval ?? 5000
    this.enableSyncWorker = config.enableSyncWorker ?? true
    this.enableVerification = config.enableVerification ?? false
    this.maxRetries = config.maxRetries ?? 3
    this.maxQueueSize = config.maxQueueSize ?? 1000

    // Start sync worker
    if (this.enableSyncWorker) {
      this.startSyncWorker()
    }

    // Load persisted queue from localStorage
    this.loadSyncQueue()
  }

  /**
   * Get a value from LocalStorage (primary source)
   *
   * @param key - Storage key
   * @param typeGuard - Optional type guard function
   * @returns The stored value or null
   */
  async get<T extends JsonValue>(key: string, typeGuard?: TypeGuard<T>): Promise<T | null> {
    try {
      // Read from LocalStorage (fast, primary source)
      const data = await this.local.get<T>(key, typeGuard)

      // Background verification (optional)
      if (this.enableVerification && data !== null) {
        this.verifyDataInBackground(key, data)
      }

      return data
    } catch (error) {
      throw new StorageError('Failed to get from DualWriteAdapter', 'GET_ERROR', {
        key,
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      })
    }
  }

  /**
   * Set a value in both LocalStorage and Supabase
   *
   * Writes to LocalStorage immediately, then queues for Supabase sync.
   *
   * @param key - Storage key
   * @param value - Value to store
   */
  async set<T extends JsonValue>(key: string, value: T): Promise<void> {
    try {
      // 1. Write to LocalStorage first (fast, blocking)
      await this.local.set(key, value)

      // 2. Add to sync queue
      this.addToSyncQueue(key, value, 'set')

      // 3. Try immediate sync (non-blocking)
      this.syncToSupabase(key, value, 'set').catch((error) => {
        console.warn(`Background sync failed for "${key}":`, error)
        // Already in queue, will retry later
      })
    } catch (error) {
      throw new StorageError('Failed to set in DualWriteAdapter', 'SET_ERROR', {
        key,
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      })
    }
  }

  /**
   * Remove a value from both LocalStorage and Supabase
   *
   * @param key - Storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      // 1. Remove from LocalStorage first
      await this.local.remove(key)

      // 2. Add to sync queue
      this.addToSyncQueue(key, null as any, 'remove')

      // 3. Try immediate sync (non-blocking)
      this.syncToSupabase(key, null as any, 'remove').catch((error) => {
        console.warn(`Background sync failed for "${key}":`, error)
      })
    } catch (error) {
      throw new StorageError('Failed to remove from DualWriteAdapter', 'REMOVE_ERROR', {
        key,
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'medium',
      })
    }
  }

  /**
   * Clear all data from both adapters
   */
  async clear(): Promise<void> {
    try {
      // 1. Clear LocalStorage
      await this.local.clear()

      // 2. Clear Supabase (non-blocking)
      this.supabase.clear().catch((error) => {
        console.error('Failed to clear Supabase:', error)
      })

      // 3. Clear sync queue
      this.syncQueue.clear()
      this.pendingSync.clear()
      this.persistSyncQueue()
    } catch (error) {
      throw new StorageError('Failed to clear DualWriteAdapter', 'CLEAR_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'critical',
      })
    }
  }

  /**
   * Get all keys from LocalStorage
   *
   * @returns Array of all keys
   */
  async keys(): Promise<string[]> {
    return await this.local.keys()
  }

  /**
   * Check if a key exists in LocalStorage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    return await this.local.hasKey(key)
  }

  /**
   * Add operation to sync queue
   *
   * @param key - Storage key
   * @param value - Value to sync
   * @param operation - Operation type
   */
  private addToSyncQueue(key: string, value: JsonValue, operation: 'set' | 'remove'): void {
    // Check queue size limit
    if (this.syncQueue.size >= this.maxQueueSize && !this.syncQueue.has(key)) {
      console.warn(
        `Sync queue limit reached (${this.maxQueueSize}). Removing oldest entry.`
      )
      // Remove oldest entry (first entry in insertion order)
      const firstKey = this.syncQueue.keys().next().value
      if (firstKey) {
        this.syncQueue.delete(firstKey)
        console.warn(`Removed oldest queue entry: "${firstKey}"`)
      }
    }

    const entry: SyncQueueEntry = {
      key,
      value,
      operation,
      timestamp: Date.now(),
      retryCount: 0,
    }

    this.syncQueue.set(key, entry)
    this.stats.queueSize = this.syncQueue.size
    this.persistSyncQueue()
  }

  /**
   * Calculate exponential backoff delay
   *
   * @param retryCount - Current retry attempt (0-based)
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    const baseDelay = 1000 // 1 second
    return baseDelay * Math.pow(2, retryCount)
  }

  /**
   * Synchronize a single operation to Supabase
   *
   * @param key - Storage key
   * @param value - Value to sync
   * @param operation - Operation type
   */
  private async syncToSupabase(
    key: string,
    value: JsonValue,
    operation: 'set' | 'remove'
  ): Promise<void> {
    // Skip if already pending
    if (this.pendingSync.has(key)) {
      return
    }

    this.pendingSync.add(key)
    this.stats.pendingCount = this.pendingSync.size
    this.stats.totalAttempts++

    try {
      if (operation === 'set') {
        await this.supabase.set(key, value)
      } else {
        await this.supabase.remove(key)
      }

      // Success: remove from queue
      this.syncQueue.delete(key)
      this.stats.successCount++
      this.stats.queueSize = this.syncQueue.size
      this.stats.lastSyncAt = Date.now()
      this.persistSyncQueue()
    } catch (error) {
      // Failure: increment retry count
      const entry = this.syncQueue.get(key)
      if (entry) {
        entry.retryCount++

        // Remove if max retries exceeded
        if (entry.retryCount >= this.maxRetries) {
          console.error(`Max retries exceeded for "${key}", removing from queue`)
          this.syncQueue.delete(key)
          this.stats.queueSize = this.syncQueue.size
        } else {
          // Calculate exponential backoff delay for next retry
          const backoffDelay = this.calculateBackoffDelay(entry.retryCount - 1)
          console.warn(
            `Sync failed for "${key}" (attempt ${entry.retryCount}/${this.maxRetries}). Next retry in ${backoffDelay}ms`
          )
        }
      }

      this.stats.failureCount++
      console.error(`Supabase sync failed for "${key}":`, error)
      throw error
    } finally {
      this.pendingSync.delete(key)
      this.stats.pendingCount = this.pendingSync.size
    }
  }

  /**
   * Process entire sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.size === 0) {
      return
    }

    console.log(`Processing sync queue (${this.syncQueue.size} items)...`)

    const entries = Array.from(this.syncQueue.values())

    for (const entry of entries) {
      try {
        // Apply exponential backoff delay before retry
        if (entry.retryCount > 0) {
          const backoffDelay = this.calculateBackoffDelay(entry.retryCount - 1)
          await new Promise((resolve) => setTimeout(resolve, backoffDelay))
        }

        await this.syncToSupabase(entry.key, entry.value, entry.operation)
      } catch (error) {
        // Error already logged in syncToSupabase
        // Continue with next item
      }

      // Add small delay between syncs to avoid overwhelming Supabase
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  /**
   * Start background sync worker
   */
  private startSyncWorker(): void {
    if (this.syncWorkerInterval !== null) {
      return // Already running
    }

    console.log(`Starting DualWrite sync worker (interval: ${this.syncInterval}ms)`)

    this.syncWorkerInterval = setInterval(() => {
      this.processSyncQueue().catch((error) => {
        console.error('Sync worker error:', error)
      })
    }, this.syncInterval)
  }

  /**
   * Stop background sync worker
   */
  stopSyncWorker(): void {
    if (this.syncWorkerInterval !== null) {
      clearInterval(this.syncWorkerInterval)
      this.syncWorkerInterval = null
      console.log('DualWrite sync worker stopped')
    }
  }

  /**
   * Verify data consistency between LocalStorage and Supabase
   *
   * @param key - Storage key
   * @param localData - Data from LocalStorage
   */
  private verifyDataInBackground(key: string, localData: JsonValue): void {
    // Non-blocking background verification
    this.supabase
      .get(key)
      .then((supabaseData) => {
        if (JSON.stringify(localData) !== JSON.stringify(supabaseData)) {
          console.warn(`Data mismatch for "${key}": Local !== Supabase`)
          // Could trigger re-sync here
        }
      })
      .catch((error) => {
        console.warn(`Verification failed for "${key}":`, error)
      })
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('__dual_write_sync_queue__')
      if (stored) {
        const entries = JSON.parse(stored) as SyncQueueEntry[]
        entries.forEach((entry) => {
          this.syncQueue.set(entry.key, entry)
        })
        this.stats.queueSize = this.syncQueue.size
        console.log(`Loaded ${this.syncQueue.size} items from sync queue`)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
    }
  }

  /**
   * Persist sync queue to localStorage
   */
  private persistSyncQueue(): void {
    try {
      const entries = Array.from(this.syncQueue.values())
      localStorage.setItem('__dual_write_sync_queue__', JSON.stringify(entries))
    } catch (error) {
      console.error('Failed to persist sync queue:', error)
    }
  }

  /**
   * Get sync statistics
   *
   * @returns Sync statistics object
   */
  getSyncStats(): SyncStats {
    return { ...this.stats }
  }

  /**
   * Force immediate sync of all queued items
   */
  async forceSyncAll(): Promise<void> {
    console.log('Forcing immediate sync of all queued items...')
    await this.processSyncQueue()
  }

  /**
   * Clear sync queue without syncing
   */
  clearSyncQueue(): void {
    this.syncQueue.clear()
    this.pendingSync.clear()
    this.stats.queueSize = 0
    this.stats.pendingCount = 0
    this.persistSyncQueue()
    console.log('Sync queue cleared')
  }
}
