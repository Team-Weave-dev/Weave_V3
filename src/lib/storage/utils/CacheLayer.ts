/**
 * CacheLayer - Advanced Caching System with Statistics and Eviction Policies
 *
 * This class provides a high-performance caching layer with:
 * - Multiple eviction policies (LRU, LFU, TTL)
 * - Cache statistics tracking (hit rate, misses, evictions)
 * - Pattern-based invalidation
 * - Automatic memory management
 */

import type {
  CacheEntry,
  CacheStats,
  CacheOptions,
  EvictionPolicy,
  JsonValue,
  LRUCacheEntry,
  LFUCacheEntry,
} from '../types/base';

export class CacheLayer {
  /**
   * Internal cache storage
   */
  private cache: Map<string, CacheEntry<any>>;

  /**
   * Cache statistics
   */
  private stats: CacheStats;

  /**
   * Cache configuration options
   */
  private options: Required<CacheOptions>;

  /**
   * Default cache options
   */
  private static readonly DEFAULT_OPTIONS: Required<CacheOptions> = {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    evictionPolicy: 'lru',
    enableStats: true,
  };

  /**
   * Create a new CacheLayer instance
   *
   * @param options - Cache configuration options
   */
  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.options = { ...CacheLayer.DEFAULT_OPTIONS, ...options };
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      evictions: 0,
      totalRequests: 0,
    };
  }

  // ============================================================================
  // Core Cache Operations
  // ============================================================================

  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T extends JsonValue>(key: string): T | null {
    this.updateStats('request');

    const entry = this.cache.get(key);

    // Cache miss - entry doesn't exist
    if (!entry) {
      this.updateStats('miss');
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateStats('miss');
      this.updateStats('size');
      return null;
    }

    // Cache hit - update access metadata
    this.updateAccessMetadata(key, entry);
    this.updateStats('hit');

    return entry.value;
  }

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL override (milliseconds)
   */
  set<T extends JsonValue>(key: string, value: T, ttl?: number): void {
    // Check if cache is full and eviction is needed
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: ttl ?? this.options.defaultTTL,
      accessCount: 1,
      lastAccess: now,
    } as CacheEntry<T>;

    this.cache.set(key, entry);
    this.updateStats('size');
  }

  /**
   * Check if a key exists in cache (without affecting stats)
   *
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateStats('size');
      return false;
    }

    return true;
  }

  /**
   * Invalidate (remove) a single cache entry
   *
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats('size');
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - Key pattern (supports wildcards with *)
   * @returns Number of invalidated entries
   *
   * @example
   * ```typescript
   * cache.invalidatePattern('project:*') // Invalidates all project keys
   * cache.invalidatePattern('*:123') // Invalidates all keys ending with :123
   * ```
   */
  invalidatePattern(pattern: string): number {
    const regex = this.patternToRegex(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.updateStats('size');
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.updateStats('size');
  }

  // ============================================================================
  // Eviction Policies
  // ============================================================================

  /**
   * Evict entries based on the configured eviction policy
   *
   * This method is called automatically when the cache is full.
   */
  private evict(): void {
    const policy = this.options.evictionPolicy;

    switch (policy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'lfu':
        this.evictLFU();
        break;
      case 'ttl':
        this.evictTTL();
        break;
      default:
        this.evictLRU(); // Default to LRU
    }

    this.updateStats('eviction');
  }

  /**
   * Evict the Least Recently Used (LRU) entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = ('lastAccess' in entry ? entry.lastAccess : entry.timestamp);
      if (lastAccess < oldestTime) {
        oldestTime = lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.updateStats('size');
    }
  }

  /**
   * Evict the Least Frequently Used (LFU) entry
   */
  private evictLFU(): void {
    let lfuKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      const accessCount = ('accessCount' in entry ? entry.accessCount : 1);
      if (accessCount < minAccessCount) {
        minAccessCount = accessCount;
        lfuKey = key;
      }
    }

    if (lfuKey) {
      this.cache.delete(lfuKey);
      this.updateStats('size');
    }
  }

  /**
   * Evict entries with shortest remaining TTL
   */
  private evictTTL(): void {
    let shortestTTLKey: string | null = null;
    let shortestRemainingTime = Infinity;

    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const ttl = entry.ttl ?? this.options.defaultTTL;
      const elapsed = now - entry.timestamp;
      const remaining = ttl - elapsed;

      if (remaining < shortestRemainingTime) {
        shortestRemainingTime = remaining;
        shortestTTLKey = key;
      }
    }

    if (shortestTTLKey) {
      this.cache.delete(shortestTTLKey);
      this.updateStats('size');
    }
  }

  // ============================================================================
  // Statistics & Monitoring
  // ============================================================================

  /**
   * Get current cache statistics
   *
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: this.cache.size,
      evictions: 0,
      totalRequests: 0,
    };
  }

  /**
   * Update cache statistics
   *
   * @param type - Type of stat update
   */
  private updateStats(
    type: 'hit' | 'miss' | 'request' | 'eviction' | 'size'
  ): void {
    if (!this.options.enableStats) return;

    switch (type) {
      case 'hit':
        this.stats.hits++;
        break;
      case 'miss':
        this.stats.misses++;
        break;
      case 'request':
        this.stats.totalRequests++;
        break;
      case 'eviction':
        this.stats.evictions++;
        break;
      case 'size':
        this.stats.size = this.cache.size;
        break;
    }

    // Recalculate hit rate
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests;
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if a cache entry is expired
   *
   * @param entry - Cache entry to check
   * @returns True if entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.ttl) return false;

    const now = Date.now();
    const age = now - entry.timestamp;

    return age > entry.ttl;
  }

  /**
   * Update access metadata for LRU/LFU policies
   *
   * @param key - Cache key
   * @param entry - Cache entry
   */
  private updateAccessMetadata(key: string, entry: CacheEntry<any>): void {
    const now = Date.now();

    // Update access count for LFU
    if ('accessCount' in entry) {
      (entry as LFUCacheEntry<any>).accessCount = (entry.accessCount ?? 0) + 1;
    }

    // Update last access time for LRU
    if ('lastAccess' in entry) {
      (entry as LRUCacheEntry<any>).lastAccess = now;
    }

    // Re-set the entry to maintain reference
    this.cache.set(key, entry);
  }

  /**
   * Convert a wildcard pattern to a regular expression
   *
   * @param pattern - Pattern with wildcards (*)
   * @returns Regular expression
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

    // Replace * with .*
    const regexPattern = escaped.replace(/\*/g, '.*');

    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Get current cache size
   *
   * @returns Number of cached items
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   *
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Remove all expired entries
   *
   * @returns Number of removed entries
   */
  cleanupExpired(): number {
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.updateStats('size');
    }

    return count;
  }
}
