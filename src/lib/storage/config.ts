/**
 * Storage System Configuration
 *
 * This file contains the central configuration for the storage system.
 * All storage-related settings should be defined here to maintain
 * a single source of truth.
 */

import type { StorageConfig, CacheOptions, BatchOptions } from './types/base';

/**
 * Default storage configuration
 *
 * - version: Schema version for migration tracking
 * - prefix: Key prefix to namespace all storage entries
 * - enableCache: Enable in-memory caching for better performance
 * - enableCompression: Enable LZ-String compression for large values
 * - compressionThreshold: Only compress values larger than this (bytes)
 * - cacheTTL: Cache time-to-live in milliseconds
 */
export const STORAGE_CONFIG: StorageConfig = {
  /** Current schema version */
  version: 2,

  /** Key prefix for all localStorage entries */
  prefix: 'weave_v2_',

  /** Enable in-memory caching for frequently accessed data */
  enableCache: true,

  /** Disable compression by default (can be enabled later if needed) */
  enableCompression: false,

  /** Compress values larger than 10KB */
  compressionThreshold: 10 * 1024, // 10KB

  /** Cache entries for 5 minutes */
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Advanced cache configuration options
 *
 * These options control the behavior of the CacheLayer system.
 */
export const CACHE_OPTIONS: CacheOptions = {
  /** Maximum number of items in cache (prevents memory overflow) */
  maxSize: 1000,

  /** Default TTL for cache entries (5 minutes) */
  defaultTTL: 5 * 60 * 1000,

  /** Use LRU (Least Recently Used) eviction policy */
  evictionPolicy: 'lru',

  /** Enable cache statistics tracking */
  enableStats: true,
};

/**
 * Batch operation configuration options
 *
 * These options control the behavior of batch processing operations.
 */
export const BATCH_OPTIONS: BatchOptions = {
  /** Process 50 items per chunk (optimal for localStorage) */
  chunkSize: 50,

  /** Allow up to 5 parallel operations */
  maxParallel: 5,

  /** Enable batch statistics tracking */
  enableStats: true,

  /** Retry failed operations once */
  retryOnError: true,

  /** Maximum retry attempts per operation */
  maxRetries: 1,

  /** Delay between retry attempts (100ms) */
  retryDelay: 100,

  /** Use exponential backoff for retries */
  retryBackoff: 'exponential',

  /** Overall batch operation timeout (30 seconds) */
  timeout: 30 * 1000,
};

/**
 * Storage key constants
 *
 * These constants define the standard keys used in localStorage.
 * Using constants prevents typos and makes refactoring easier.
 */
export const STORAGE_KEYS = {
  /** Current user data */
  USER_CURRENT: 'user:current',

  /** All users list (profiles) */
  USERS: 'users',

  /** All projects list */
  PROJECTS: 'projects',

  /** All clients list */
  CLIENTS: 'clients',

  /** All tasks list */
  TASKS: 'tasks',

  /** All calendar events list */
  EVENTS: 'events',

  /** All documents list */
  DOCUMENTS: 'documents',

  /** User settings */
  SETTINGS: 'settings',

  /** Dashboard layout and configuration */
  DASHBOARD: 'dashboard',

  /** Todo sections list */
  TODO_SECTIONS: 'todo_sections',

  /** Schema version metadata */
  VERSION: '_version',

  /** Last sync timestamp */
  LAST_SYNC: '_lastSync',

  /** Applied migrations list */
  MIGRATIONS: '_migrations',
} as const;

/**
 * Validate and sanitize ID for storage key
 * @param id - The ID to validate
 * @param context - Context for error message (e.g., 'project', 'client')
 * @throws {Error} If ID is invalid
 * @returns Sanitized ID
 */
export function validateId(id: string, context: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ${context} ID: must be a non-empty string`);
  }

  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error(`Invalid ${context} ID: cannot be empty or whitespace`);
  }

  // Encode URI component to prevent key injection attacks
  return encodeURIComponent(trimmed);
}

/**
 * Storage key builder functions
 *
 * These functions help build composite keys for related data.
 * All IDs are validated and sanitized to prevent key injection attacks.
 */
export const buildKey = {
  /** Build key for a specific user: user:{id} */
  user: (id: string) => `user:${validateId(id, 'user')}`,

  /** Build key for a specific project: project:{id} */
  project: (id: string) => `project:${validateId(id, 'project')}`,

  /** Build key for project documents: documents:project:{projectId} */
  projectDocuments: (projectId: string) => `documents:project:${validateId(projectId, 'project')}`,

  /** Build key for project tasks: tasks:project:{projectId} */
  projectTasks: (projectId: string) => `tasks:project:${validateId(projectId, 'project')}`,

  /** Build key for client events: events:client:{clientId} */
  clientEvents: (clientId: string) => `events:client:${validateId(clientId, 'client')}`,

  /** Build key for project events: events:project:{projectId} */
  projectEvents: (projectId: string) => `events:project:${validateId(projectId, 'project')}`,
} as const;

/**
 * Default cache TTL values for different entity types
 *
 * Frequently accessed data can have longer TTL,
 * while rarely accessed data should have shorter TTL.
 */
export const CACHE_TTL = {
  /** User data - rarely changes */
  USER: 30 * 60 * 1000, // 30 minutes

  /** Users list - rarely changes */
  USERS: 30 * 60 * 1000, // 30 minutes

  /** Projects - moderate change frequency */
  PROJECTS: 10 * 60 * 1000, // 10 minutes

  /** Tasks - frequent changes */
  TASKS: 5 * 60 * 1000, // 5 minutes

  /** Events - frequent changes */
  EVENTS: 5 * 60 * 1000, // 5 minutes

  /** Settings - rarely changes */
  SETTINGS: 30 * 60 * 1000, // 30 minutes

  /** Default TTL for uncategorized data */
  DEFAULT: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * LocalStorage size limits
 *
 * These constants help manage storage quota and prevent errors.
 */
export const STORAGE_LIMITS = {
  /** Maximum localStorage size (5MB for most browsers) */
  MAX_SIZE: 5 * 1024 * 1024, // 5MB

  /** Warning threshold (80% of max size) */
  WARNING_THRESHOLD: 4 * 1024 * 1024, // 4MB

  /** Maximum size for a single entry */
  MAX_ENTRY_SIZE: 1 * 1024 * 1024, // 1MB
} as const;

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * Validate storage configuration
 *
 * @param config - Storage configuration to validate
 * @throws {Error} If configuration is invalid
 * @returns true if configuration is valid
 *
 * @example
 * ```typescript
 * try {
 *   validateConfig(STORAGE_CONFIG);
 *   console.log('Configuration is valid');
 * } catch (error) {
 *   console.error('Invalid configuration:', error.message);
 * }
 * ```
 */
export function validateConfig(config: StorageConfig): boolean {
  // Validate version
  if (config.version < 1 || !Number.isInteger(config.version)) {
    throw new Error('Storage version must be a positive integer (>= 1)');
  }

  // Validate prefix
  if (!config.prefix || typeof config.prefix !== 'string') {
    throw new Error('Storage prefix must be a non-empty string');
  }

  // Validate compressionThreshold if provided
  if (config.compressionThreshold !== undefined) {
    if (config.compressionThreshold < 0) {
      throw new Error('Compression threshold must be non-negative');
    }
  }

  // Validate cacheTTL if provided
  if (config.cacheTTL !== undefined) {
    if (config.cacheTTL < 0) {
      throw new Error('Cache TTL must be non-negative');
    }
  }

  return true;
}

/**
 * Validate cache options
 *
 * @param options - Cache options to validate
 * @throws {Error} If options are invalid
 * @returns true if options are valid
 */
export function validateCacheOptions(options: CacheOptions): boolean {
  // Validate maxSize
  if (options.maxSize !== undefined) {
    if (options.maxSize <= 0 || !Number.isInteger(options.maxSize)) {
      throw new Error('Cache maxSize must be a positive integer');
    }
  }

  // Validate defaultTTL
  if (options.defaultTTL !== undefined) {
    if (options.defaultTTL < 0) {
      throw new Error('Cache defaultTTL must be non-negative');
    }
  }

  return true;
}

/**
 * Validate batch options
 *
 * @param options - Batch options to validate
 * @throws {Error} If options are invalid
 * @returns true if options are valid
 */
export function validateBatchOptions(options: BatchOptions): boolean {
  // Validate chunkSize
  if (options.chunkSize !== undefined) {
    if (options.chunkSize <= 0 || !Number.isInteger(options.chunkSize)) {
      throw new Error('Batch chunkSize must be a positive integer');
    }
  }

  // Validate maxParallel
  if (options.maxParallel !== undefined) {
    if (options.maxParallel <= 0 || !Number.isInteger(options.maxParallel)) {
      throw new Error('Batch maxParallel must be a positive integer');
    }
  }

  // Validate maxRetries
  if (options.maxRetries !== undefined) {
    if (options.maxRetries < 0 || !Number.isInteger(options.maxRetries)) {
      throw new Error('Batch maxRetries must be a non-negative integer');
    }
  }

  // Validate retryDelay
  if (options.retryDelay !== undefined) {
    if (options.retryDelay < 0) {
      throw new Error('Batch retryDelay must be non-negative');
    }
  }

  // Validate timeout
  if (options.timeout !== undefined) {
    if (options.timeout <= 0) {
      throw new Error('Batch timeout must be positive');
    }
  }

  return true;
}
