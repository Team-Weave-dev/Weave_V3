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

  /** Maximum retry attempts */
  maxRetries: 1,
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

  /** All projects list */
  PROJECTS: 'projects',

  /** All clients list */
  CLIENTS: 'clients',

  /** All tasks list */
  TASKS: 'tasks',

  /** All calendar events list */
  EVENTS: 'events',

  /** User settings */
  SETTINGS: 'settings',

  /** Dashboard layout and configuration */
  DASHBOARD: 'dashboard',

  /** Schema version metadata */
  VERSION: '_version',

  /** Last sync timestamp */
  LAST_SYNC: '_lastSync',

  /** Applied migrations list */
  MIGRATIONS: '_migrations',
} as const;

/**
 * Storage key builder functions
 *
 * These functions help build composite keys for related data.
 */
export const buildKey = {
  /** Build key for a specific project: project:{id} */
  project: (id: string) => `project:${id}`,

  /** Build key for project documents: documents:project:{projectId} */
  projectDocuments: (projectId: string) => `documents:project:${projectId}`,

  /** Build key for project tasks: tasks:project:{projectId} */
  projectTasks: (projectId: string) => `tasks:project:${projectId}`,

  /** Build key for client events: events:client:{clientId} */
  clientEvents: (clientId: string) => `events:client:${clientId}`,

  /** Build key for project events: events:project:{projectId} */
  projectEvents: (projectId: string) => `events:project:${projectId}`,
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
