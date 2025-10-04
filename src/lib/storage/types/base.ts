/**
 * Storage System Base Types
 *
 * This file contains the core type definitions for the storage system.
 * These types are designed to be storage-backend agnostic, allowing easy
 * switching between LocalStorage, Supabase, or other storage solutions.
 */

// ============================================================================
// JSON Type Definitions
// ============================================================================

/**
 * JSON primitive types that can be safely serialized
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON object type
 * Note: Using 'any' for index signature to allow nested objects of any shape
 * All objects are JSON-serializable as long as they don't contain functions or symbols
 */
export interface JsonObject {
  [key: string]: any;
}

/**
 * JSON array type
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * Union type representing all valid JSON values
 * Only these types can be safely stored and retrieved from storage
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// ============================================================================
// Storage Operation Types
// ============================================================================

/**
 * Storage operation types for event tracking
 */
export type StorageOperation = 'set' | 'remove' | 'clear' | 'batch' | 'rollback';

/**
 * Storage event emitted when data changes
 */
export interface StorageEvent<T extends JsonValue = JsonValue> {
  /** Storage key that changed */
  key: string;
  /** New value (undefined for remove/clear operations) */
  value?: T;
  /** Previous value before the change */
  oldValue?: T;
  /** Type of operation that triggered the event */
  operation: StorageOperation;
  /** Timestamp of the event */
  timestamp: number;
}

/**
 * Subscriber callback function for storage events
 */
export type Subscriber<T extends JsonValue = JsonValue> = (event: StorageEvent<T>) => void;

/**
 * Unsubscribe function returned by subscribe()
 */
export type Unsubscribe = () => void;

// ============================================================================
// Storage Adapter Interface
// ============================================================================

/**
 * Storage adapter interface - all storage backends must implement this
 *
 * This interface provides a consistent API for different storage solutions
 * (LocalStorage, Supabase, etc.) and supports async operations for flexibility.
 */
export interface StorageAdapter {
  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  get<T extends JsonValue>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key - Storage key
   * @param value - Value to store (must be JSON-serializable)
   */
  set<T extends JsonValue>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key - Storage key to remove
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage entries
   */
  clear(): Promise<void>;

  /**
   * Get all storage keys
   * @returns Array of all keys
   */
  keys(): Promise<string[]>;

  /**
   * Check if a key exists in storage
   * @param key - Storage key to check
   * @returns True if key exists
   */
  hasKey(key: string): Promise<boolean>;
}

// ============================================================================
// Transaction Support
// ============================================================================

/**
 * Transaction function signature
 *
 * Transaction functions receive a storage adapter and can perform multiple
 * operations. If the function throws, all operations should be rolled back.
 */
export type TransactionFunction = (adapter: StorageAdapter) => Promise<void>;

/**
 * Transaction context for rollback support
 */
export interface TransactionContext {
  /** Original values before transaction started (JSON-serializable values only) */
  snapshot: Map<string, JsonValue | null>;
  /** Keys that were modified during transaction */
  modifiedKeys: Set<string>;
  /** Transaction start timestamp */
  startedAt: number;
}

// ============================================================================
// Storage Configuration
// ============================================================================

/**
 * Storage system configuration
 */
export interface StorageConfig {
  /** Schema version number */
  version: number;

  /** Key prefix for all storage entries */
  prefix: string;

  /** Enable in-memory caching for better performance */
  enableCache?: boolean;

  /** Enable data compression for large values */
  enableCompression?: boolean;

  /** Compression threshold in bytes (only compress if larger) */
  compressionThreshold?: number;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Batch operation for multiple set operations
 */
export interface BatchSetOperation {
  key: string;
  value: any;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: Array<{ key: string; error: Error }>;
  /** Execution time in milliseconds */
  executionTime?: number;
  /** Processing speed (items/second) */
  throughput?: number;
}

/**
 * Retry backoff strategy for batch operations
 */
export type RetryBackoffStrategy = 'linear' | 'exponential';

/**
 * Batch configuration options
 */
export interface BatchOptions {
  /** Size of each processing chunk */
  chunkSize?: number;
  /** Maximum number of parallel operations */
  maxParallel?: number;
  /** Enable batch statistics tracking */
  enableStats?: boolean;
  /** Retry failed operations */
  retryOnError?: boolean;
  /** Maximum retry attempts per operation */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  /** Backoff strategy for retries (linear or exponential) */
  retryBackoff?: RetryBackoffStrategy;
  /** Overall timeout for batch operation in milliseconds */
  timeout?: number;
}

// ============================================================================
// Compression
// ============================================================================

/**
 * Compression statistics for monitoring storage efficiency
 */
export interface CompressionStats {
  /** Total original size in bytes (before compression) */
  totalOriginalSize: number;
  /** Total compressed size in bytes (after compression) */
  totalCompressedSize: number;
  /** Total bytes saved through compression */
  totalSaved: number;
  /** Average compression ratio across all compressions */
  averageRatio: number;
  /** Number of times compression was applied */
  compressionCount: number;
  /** Number of times compression was skipped */
  skippedCount: number;
  /** Average compression time in milliseconds */
  averageCompressionTime: number;
}

/**
 * Compression configuration options
 */
export interface CompressionOptions {
  /** Enable compression */
  enabled?: boolean;
  /** Minimum size threshold for compression (bytes) */
  threshold?: number;
  /** Minimum compression ratio improvement to apply (0-1) */
  minRatio?: number;
  /** Enable compression statistics tracking */
  enableStats?: boolean;
  /** Adaptive threshold based on performance */
  adaptiveThreshold?: boolean;
}

// ============================================================================
// Cache Entry
// ============================================================================

/**
 * Base cache entry with TTL support
 */
export interface BaseCacheEntry<T extends JsonValue = JsonValue> {
  value: T;
  timestamp: number;
  ttl?: number;
}

/**
 * LRU cache entry (Least Recently Used)
 */
export interface LRUCacheEntry<T extends JsonValue = JsonValue> extends BaseCacheEntry<T> {
  /** Last access timestamp for LRU eviction policy (required for LRU) */
  lastAccess: number;
}

/**
 * LFU cache entry (Least Frequently Used)
 */
export interface LFUCacheEntry<T extends JsonValue = JsonValue> extends BaseCacheEntry<T> {
  /** Access count for LFU eviction policy (required for LFU) */
  accessCount: number;
}

/**
 * Cache entry type based on eviction policy
 * - LRU: requires lastAccess
 * - LFU: requires accessCount
 * - TTL: only requires basic fields
 */
export type CacheEntry<T extends JsonValue = JsonValue, P extends EvictionPolicy = EvictionPolicy> =
  P extends 'lru' ? LRUCacheEntry<T> :
  P extends 'lfu' ? LFUCacheEntry<T> :
  BaseCacheEntry<T>;

/**
 * Cache statistics for monitoring performance
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Cache hit rate (hits / total requests) */
  hitRate: number;
  /** Current number of cached items */
  size: number;
  /** Total number of evictions */
  evictions: number;
  /** Total requests (hits + misses) */
  totalRequests: number;
}

/**
 * Cache eviction policy
 */
export type EvictionPolicy = 'lru' | 'lfu' | 'ttl';

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Maximum number of items in cache */
  maxSize?: number;
  /** Default TTL in milliseconds */
  defaultTTL?: number;
  /** Eviction policy when cache is full */
  evictionPolicy?: EvictionPolicy;
  /** Enable cache statistics tracking */
  enableStats?: boolean;
}

// ============================================================================
// Indexing System
// ============================================================================

/**
 * Index definition for fast lookups
 */
export interface IndexDefinition {
  /** Index name */
  name: string;
  /** Field to index */
  field: string;
  /** Index type */
  type: 'single' | 'multi';
}

/**
 * Index statistics for monitoring performance
 */
export interface IndexStats {
  /** Total number of indexes */
  totalIndexes: number;
  /** Total indexed items across all indexes */
  totalIndexedItems: number;
  /** Index hit count */
  hits: number;
  /** Index miss count */
  misses: number;
  /** Index hit rate */
  hitRate: number;
  /** Average lookup time in milliseconds */
  averageLookupTime: number;
}

/**
 * Index lookup result
 */
export interface IndexLookupResult<T> {
  /** Found items */
  items: T[];
  /** Whether result came from index */
  fromIndex: boolean;
  /** Lookup time in milliseconds */
  lookupTime: number;
}

// ============================================================================
// Schema Version & Migration
// ============================================================================

/**
 * Schema version metadata
 */
export interface SchemaVersion extends JsonObject {
  version: number;
  appliedAt: string;
  migrations: string[];
}

/**
 * Migration definition
 */
export interface Migration {
  /** Migration version (target version) */
  version: number;
  /** Migration name (short identifier) */
  name: string;
  /** Human-readable description of what this migration does */
  description?: string;
  /** Migration function to apply changes */
  up: (adapter: StorageAdapter) => Promise<void>;
  /** Optional rollback function to revert changes */
  down?: (adapter: StorageAdapter) => Promise<void>;
  /** Optional validation function to verify migration success */
  validate?: (adapter: StorageAdapter) => Promise<boolean>;
}

/**
 * Migration result
 */
export interface MigrationResult {
  /** Migration version */
  version: number;
  /** Migration name */
  name: string;
  /** Success status */
  success: boolean;
  /** Error if failed */
  error?: Error;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Applied at timestamp */
  appliedAt: string;
}

/**
 * Backup data structure
 */
export interface BackupData {
  /** Backup version */
  version: number;
  /** Backup timestamp */
  timestamp: number;
  /** All storage data (JSON-serializable values only) */
  data: Record<string, JsonValue>;
  /** Schema version at backup time */
  schemaVersion: SchemaVersion;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid StorageEvent
 */
export function isStorageEvent(value: unknown): value is StorageEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'operation' in value &&
    'timestamp' in value
  );
}

/**
 * Check if a value is a valid SchemaVersion
 */
export function isSchemaVersion(value: unknown): value is SchemaVersion {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'appliedAt' in value &&
    'migrations' in value
  );
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Storage error codes for categorizing errors
 */
export type StorageErrorCode =
  | 'GET_ERROR'
  | 'SET_ERROR'
  | 'REMOVE_ERROR'
  | 'CLEAR_ERROR'
  | 'TRANSACTION_ERROR'
  | 'ADAPTER_ERROR'
  | 'CACHE_ERROR'
  | 'ROLLBACK_ERROR';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  /** Error severity level */
  public readonly severity: ErrorSeverity;
  /** User-friendly error message for display */
  public readonly userMessage?: string;

  constructor(
    message: string,
    public readonly code: StorageErrorCode,
    options?: {
      key?: string;
      cause?: Error;
      severity?: ErrorSeverity;
      userMessage?: string;
    }
  ) {
    super(message);
    this.name = 'StorageError';
    this.severity = options?.severity ?? 'medium';
    this.userMessage = options?.userMessage;

    // Make key and cause accessible as properties
    Object.defineProperty(this, 'key', {
      value: options?.key,
      enumerable: true,
      writable: false,
    });

    Object.defineProperty(this, 'cause', {
      value: options?.cause,
      enumerable: true,
      writable: false,
    });

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  /** Storage key that caused the error (if applicable) */
  public readonly key?: string;
  /** Original error that caused this error (if applicable) */
  public readonly cause?: Error;
}

// ============================================================================
// Operation Options
// ============================================================================

/**
 * Options for set operations
 */
export interface SetOptions {
  /** Whether to read and notify old value to subscribers */
  notifyOldValue?: boolean;
  /** Custom TTL for cache (milliseconds) */
  cacheTTL?: number;
  /** Skip cache update */
  skipCache?: boolean;
}

// ============================================================================
// Storage Constants
// ============================================================================

/**
 * Constants used throughout the storage system
 */
export const STORAGE_CONSTANTS = {
  /** Wildcard key for subscribing to all changes */
  WILDCARD_KEY: '*',
} as const;
