/**
 * IndexManager - Efficient Indexing System for Fast Lookups
 *
 * This class provides an in-memory indexing layer for frequently queried fields:
 * - Status-based indexes (project status, task status)
 * - Date-based indexes (events by date, tasks by due date)
 * - Relationship indexes (projects by client, tasks by project)
 * - Statistics tracking (hit rate, lookup time)
 */

import type { IndexDefinition, IndexStats } from '../types/base';

export class IndexManager {
  /**
   * Index storage: Map<indexName, Map<fieldValue, Set<id>>>
   */
  private indexes: Map<string, Map<string, Set<string>>>;

  /**
   * Index definitions
   */
  private definitions: Map<string, IndexDefinition>;

  /**
   * Index statistics
   */
  private stats: IndexStats;

  /**
   * Lookup times for calculating average
   */
  private lookupTimes: number[];

  /**
   * Maximum lookup times to keep for average calculation
   */
  private static readonly MAX_LOOKUP_TIMES = 100;

  /**
   * Create a new IndexManager instance
   */
  constructor() {
    this.indexes = new Map();
    this.definitions = new Map();
    this.lookupTimes = [];
    this.stats = {
      totalIndexes: 0,
      totalIndexedItems: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageLookupTime: 0,
    };
  }

  // ============================================================================
  // Index Management
  // ============================================================================

  /**
   * Create an index on a field
   *
   * @param definition - Index definition
   *
   * @example
   * ```typescript
   * indexManager.createIndex({
   *   name: 'project-by-status',
   *   field: 'status',
   *   type: 'single'
   * })
   * ```
   */
  createIndex(definition: IndexDefinition): void {
    if (this.definitions.has(definition.name)) {
      console.warn(`Index "${definition.name}" already exists`);
      return;
    }

    this.indexes.set(definition.name, new Map());
    this.definitions.set(definition.name, definition);
    this.stats.totalIndexes++;
  }

  /**
   * Add an item to indexes
   *
   * @param indexName - Index name
   * @param id - Item ID
   * @param value - Field value to index
   */
  addToIndex(indexName: string, id: string, value: string | string[]): void {
    const index = this.indexes.get(indexName);
    if (!index) {
      console.warn(`Index "${indexName}" does not exist`);
      return;
    }

    const definition = this.definitions.get(indexName);
    if (!definition) return;

    // Handle both single and multi-value indexes
    const values = Array.isArray(value) ? value : [value];

    let itemAdded = false;
    for (const val of values) {
      let ids = index.get(val);
      if (!ids) {
        ids = new Set();
        index.set(val, ids);
      }
      const sizeBefore = ids.size;
      ids.add(id);
      // Only count as added if this is a new ID
      if (ids.size > sizeBefore) {
        itemAdded = true;
      }
    }

    // Increment total count only if item was actually added
    if (itemAdded) {
      this.stats.totalIndexedItems++;
    }
  }

  /**
   * Remove an item from indexes
   *
   * @param indexName - Index name
   * @param id - Item ID
   * @param value - Field value (optional, if not provided, removes from all values)
   */
  removeFromIndex(
    indexName: string,
    id: string,
    value?: string | string[]
  ): void {
    const index = this.indexes.get(indexName);
    if (!index) return;

    let itemRemoved = false;

    if (value) {
      // Remove from specific value(s)
      const values = Array.isArray(value) ? value : [value];
      for (const val of values) {
        const ids = index.get(val);
        if (ids) {
          const sizeBefore = ids.size;
          ids.delete(id);
          if (ids.size < sizeBefore) {
            itemRemoved = true;
          }
          if (ids.size === 0) {
            index.delete(val);
          }
        }
      }
    } else {
      // Remove from all values
      for (const [key, ids] of index.entries()) {
        const sizeBefore = ids.size;
        ids.delete(id);
        if (ids.size < sizeBefore) {
          itemRemoved = true;
        }
        if (ids.size === 0) {
          index.delete(key);
        }
      }
    }

    // Decrement total count only if item was actually removed
    if (itemRemoved && this.stats.totalIndexedItems > 0) {
      this.stats.totalIndexedItems--;
    }
  }

  /**
   * Update an item in indexes
   *
   * @param indexName - Index name
   * @param id - Item ID
   * @param oldValue - Old field value
   * @param newValue - New field value
   */
  updateIndex(
    indexName: string,
    id: string,
    oldValue: string | string[],
    newValue: string | string[]
  ): void {
    this.removeFromIndex(indexName, id, oldValue);
    this.addToIndex(indexName, id, newValue);
  }

  /**
   * Clear an entire index
   *
   * @param indexName - Index name
   */
  clearIndex(indexName: string): void {
    const index = this.indexes.get(indexName);
    if (index) {
      index.clear();
      // Recalculate total count after clearing
      this.recalculateItemCount();
    }
  }

  /**
   * Clear all indexes
   */
  clearAllIndexes(): void {
    for (const index of this.indexes.values()) {
      index.clear();
    }
    // Reset to 0 since all indexes are cleared
    this.stats.totalIndexedItems = 0;
  }

  /**
   * Delete an index
   *
   * @param indexName - Index name
   */
  deleteIndex(indexName: string): void {
    this.indexes.delete(indexName);
    this.definitions.delete(indexName);
    this.stats.totalIndexes--;
    // Recalculate total count after deletion
    this.recalculateItemCount();
  }

  // ============================================================================
  // Index Lookups
  // ============================================================================

  /**
   * Lookup items by indexed field value
   *
   * @param indexName - Index name
   * @param value - Field value to lookup
   * @returns Set of item IDs
   *
   * @example
   * ```typescript
   * const projectIds = indexManager.lookup('project-by-status', 'active')
   * // Set { 'proj1', 'proj2', 'proj3' }
   * ```
   */
  lookup(indexName: string, value: string): Set<string> {
    const startTime = performance.now();

    const index = this.indexes.get(indexName);
    if (!index) {
      this.updateStats('miss', performance.now() - startTime);
      return new Set();
    }

    const ids = index.get(value);
    const lookupTime = performance.now() - startTime;

    if (ids && ids.size > 0) {
      this.updateStats('hit', lookupTime);
      return new Set(ids); // Return a copy
    } else {
      this.updateStats('miss', lookupTime);
      return new Set();
    }
  }

  /**
   * Lookup items by multiple values (OR operation)
   *
   * @param indexName - Index name
   * @param values - Array of values to lookup
   * @returns Set of item IDs matching any value
   */
  lookupMultiple(indexName: string, values: string[]): Set<string> {
    const result = new Set<string>();

    for (const value of values) {
      const ids = this.lookup(indexName, value);
      for (const id of ids) {
        result.add(id);
      }
    }

    return result;
  }

  /**
   * Check if an index contains a value
   *
   * @param indexName - Index name
   * @param value - Field value
   * @returns True if index contains the value
   */
  has(indexName: string, value: string): boolean {
    const index = this.indexes.get(indexName);
    if (!index) return false;

    const ids = index.get(value);
    return ids !== undefined && ids.size > 0;
  }

  /**
   * Get all values in an index
   *
   * @param indexName - Index name
   * @returns Array of all indexed values
   */
  getIndexValues(indexName: string): string[] {
    const index = this.indexes.get(indexName);
    if (!index) return [];

    return Array.from(index.keys());
  }

  /**
   * Get count of items for a specific value
   *
   * @param indexName - Index name
   * @param value - Field value
   * @returns Number of items with this value
   */
  getCount(indexName: string, value: string): number {
    const index = this.indexes.get(indexName);
    if (!index) return 0;

    const ids = index.get(value);
    return ids ? ids.size : 0;
  }

  // ============================================================================
  // Statistics & Monitoring
  // ============================================================================

  /**
   * Get index statistics
   *
   * @returns Index statistics object
   */
  getStats(): IndexStats {
    return { ...this.stats };
  }

  /**
   * Reset index statistics
   */
  resetStats(): void {
    this.stats = {
      totalIndexes: this.stats.totalIndexes,
      totalIndexedItems: this.stats.totalIndexedItems,
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageLookupTime: 0,
    };
    this.lookupTimes = [];
  }

  /**
   * Update index statistics
   *
   * @param type - Type of stat update
   * @param lookupTime - Lookup time in milliseconds
   */
  private updateStats(type: 'hit' | 'miss', lookupTime: number): void {
    if (type === 'hit') {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    // Update average lookup time
    this.lookupTimes.push(lookupTime);
    if (this.lookupTimes.length > IndexManager.MAX_LOOKUP_TIMES) {
      this.lookupTimes.shift();
    }

    const sum = this.lookupTimes.reduce((a, b) => a + b, 0);
    this.stats.averageLookupTime = sum / this.lookupTimes.length;
  }

  /**
   * Recalculate total indexed items count
   *
   * This is an expensive operation (O(n*m)) that should only be called
   * when necessary (e.g., after clearing or deleting indexes).
   * For add/remove operations, use incremental updates instead.
   */
  private recalculateItemCount(): void {
    let total = 0;

    for (const index of this.indexes.values()) {
      const allIds = new Set<string>();
      for (const ids of index.values()) {
        for (const id of ids) {
          allIds.add(id);
        }
      }
      total += allIds.size;
    }

    this.stats.totalIndexedItems = total;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get all index names
   *
   * @returns Array of index names
   */
  getIndexNames(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Get index definition
   *
   * @param indexName - Index name
   * @returns Index definition or undefined
   */
  getIndexDefinition(indexName: string): IndexDefinition | undefined {
    return this.definitions.get(indexName);
  }

  /**
   * Check if an index exists
   *
   * @param indexName - Index name
   * @returns True if index exists
   */
  hasIndex(indexName: string): boolean {
    return this.definitions.has(indexName);
  }

  /**
   * Get index size (number of unique values)
   *
   * @param indexName - Index name
   * @returns Number of unique values in index
   */
  getIndexSize(indexName: string): number {
    const index = this.indexes.get(indexName);
    return index ? index.size : 0;
  }

  /**
   * Rebuild an index from scratch
   *
   * @param indexName - Index name
   * @param items - Items to re-index (must have an 'id' field)
   * @param extractor - Function to extract field value from item
   *
   * @example
   * ```typescript
   * interface Project { id: string; status: string; }
   * const projects: Project[] = [...];
   * indexManager.rebuildIndex('project-by-status', projects, (p) => p.status);
   * ```
   */
  rebuildIndex<T extends { id: string }>(
    indexName: string,
    items: T[],
    extractor: (item: T, id: string) => string | string[]
  ): void {
    this.clearIndex(indexName);

    for (const item of items) {
      // Type-safe access to id field
      const id = item.id;
      if (!id || typeof id !== 'string') {
        console.warn(`Skipping item with invalid id:`, item);
        continue;
      }

      const value = extractor(item, id);
      this.addToIndex(indexName, id, value);
    }
  }
}
