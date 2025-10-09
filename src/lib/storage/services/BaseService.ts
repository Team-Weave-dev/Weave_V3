/**
 * Base Service Abstract Class
 *
 * This file provides the foundation for all domain services.
 * Provides common CRUD operations and utility methods.
 */

import type { StorageManager } from '../core/StorageManager';
import type { JsonObject } from '../types/base';

/**
 * Base entity interface
 * All entities must have these required fields
 */
export interface BaseEntity extends JsonObject {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Abstract base service for domain entities
 * Provides common CRUD operations
 *
 * @template T - Entity type extending BaseEntity
 */
export abstract class BaseService<T extends BaseEntity> {
  /**
   * Storage manager instance
   */
  protected storage: StorageManager;

  /**
   * Entity storage key (must be implemented by child classes)
   */
  protected abstract entityKey: string;

  /**
   * Entity type guard (must be implemented by child classes)
   */
  protected abstract isValidEntity(data: unknown): data is T;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  /**
   * Create a new entity
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    console.log(`[BaseService.create] Creating entity for key: "${this.entityKey}"`)
    console.log(`[BaseService.create] Input data:`, data)

    const now = this.getCurrentTimestamp();

    // Check if data contains an id (TypeScript workaround for Omit)
    const dataWithId = data as any;
    const entityId = dataWithId.id || this.generateId();

    console.log(`[BaseService.create] Using ID:`, entityId, dataWithId.id ? '(from input)' : '(generated)')

    const entity: T = {
      ...data,
      id: entityId,
      createdAt: now,
      updatedAt: now,
    } as T;

    console.log(`[BaseService.create] Generated entity:`, entity)

    // Validate entity
    if (!this.isValidEntity(entity)) {
      throw new Error(`Invalid entity data for ${this.entityKey}`);
    }

    console.log(`[BaseService.create] Validation passed`)

    // Get existing entities
    const entities = await this.getAll();
    console.log(`[BaseService.create] Existing entities count: ${entities.length}`)

    // Add new entity
    entities.push(entity);
    console.log(`[BaseService.create] New entities array (length: ${entities.length}):`, entities)

    // Save to storage
    console.log(`[BaseService.create] Calling storage.set("${this.entityKey}", array of ${entities.length} items)`)
    await this.storage.set<T[]>(this.entityKey, entities);
    console.log(`[BaseService.create] storage.set() completed successfully`)

    return entity;
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    const entities = await this.getAll();
    return entities.find((entity) => entity.id === id) || null;
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    console.log(`[BaseService.getAll] Fetching key: "${this.entityKey}"`)
    const entities = await this.storage.get<T[]>(this.entityKey);
    console.log(`[BaseService.getAll] Result for "${this.entityKey}":`, entities)
    console.log(`[BaseService.getAll] Returning:`, entities || [])
    return entities || [];
  }

  /**
   * Update an existing entity
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const entities = await this.getAll();
    const index = entities.findIndex((entity) => entity.id === id);

    if (index === -1) {
      return null;
    }

    // Merge updates
    const updatedEntity: T = {
      ...entities[index],
      ...updates,
      id, // Preserve ID
      createdAt: entities[index].createdAt, // Preserve creation timestamp
      updatedAt: this.getCurrentTimestamp(),
    } as T;

    // Validate updated entity
    if (!this.isValidEntity(updatedEntity)) {
      throw new Error(`Invalid entity data for ${this.entityKey}`);
    }

    // Update in array
    entities[index] = updatedEntity;

    // Save to storage
    await this.storage.set<T[]>(this.entityKey, entities);

    return updatedEntity;
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string): Promise<boolean> {
    const entities = await this.getAll();
    const initialLength = entities.length;
    const filtered = entities.filter((entity) => entity.id !== id);

    if (filtered.length === initialLength) {
      return false; // Entity not found
    }

    await this.storage.set<T[]>(this.entityKey, filtered);
    return true;
  }

  /**
   * Delete multiple entities by IDs
   */
  async deleteMany(ids: string[]): Promise<number> {
    const entities = await this.getAll();
    const idSet = new Set(ids);
    const filtered = entities.filter((entity) => !idSet.has(entity.id));
    const deletedCount = entities.length - filtered.length;

    if (deletedCount > 0) {
      await this.storage.set<T[]>(this.entityKey, filtered);
    }

    return deletedCount;
  }

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.getById(id);
    return entity !== null;
  }

  /**
   * Count total entities
   */
  async count(): Promise<number> {
    const entities = await this.getAll();
    return entities.length;
  }

  /**
   * Clear all entities (dangerous!)
   */
  async clear(): Promise<void> {
    await this.storage.set<T[]>(this.entityKey, []);
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * Get multiple entities by IDs
   */
  async getByIds(ids: string[]): Promise<T[]> {
    const entities = await this.getAll();
    const idSet = new Set(ids);
    return entities.filter((entity) => idSet.has(entity.id));
  }

  /**
   * Create multiple entities at once
   */
  async createMany(dataArray: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const now = this.getCurrentTimestamp();
    const newEntities: T[] = dataArray.map((data) => ({
      ...data,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    })) as T[];

    // Validate all entities
    for (const entity of newEntities) {
      if (!this.isValidEntity(entity)) {
        throw new Error(`Invalid entity data for ${this.entityKey}`);
      }
    }

    // Get existing entities
    const entities = await this.getAll();

    // Add new entities
    entities.push(...newEntities);

    // Save to storage
    await this.storage.set<T[]>(this.entityKey, entities);

    return newEntities;
  }

  /**
   * Update multiple entities at once
   */
  async updateMany(updates: Array<{ id: string; data: Partial<Omit<T, 'id' | 'createdAt'>> }>): Promise<T[]> {
    const entities = await this.getAll();
    const updateMap = new Map(updates.map((u) => [u.id, u.data]));
    const updatedEntities: T[] = [];
    const now = this.getCurrentTimestamp();

    for (let i = 0; i < entities.length; i++) {
      const updateData = updateMap.get(entities[i].id);
      if (updateData) {
        const updatedEntity: T = {
          ...entities[i],
          ...updateData,
          id: entities[i].id,
          createdAt: entities[i].createdAt,
          updatedAt: now,
        } as T;

        if (!this.isValidEntity(updatedEntity)) {
          throw new Error(`Invalid entity data for ${this.entityKey}`);
        }

        entities[i] = updatedEntity;
        updatedEntities.push(updatedEntity);
      }
    }

    if (updatedEntities.length > 0) {
      await this.storage.set<T[]>(this.entityKey, entities);
    }

    return updatedEntities;
  }

  // ============================================================================
  // Query Helpers
  // ============================================================================

  /**
   * Find entities matching a predicate
   */
  async find(predicate: (entity: T) => boolean): Promise<T[]> {
    const entities = await this.getAll();
    return entities.filter(predicate);
  }

  /**
   * Find first entity matching a predicate
   */
  async findOne(predicate: (entity: T) => boolean): Promise<T | null> {
    const entities = await this.getAll();
    return entities.find(predicate) || null;
  }

  /**
   * Sort entities
   */
  async getAll_sorted(compareFn: (a: T, b: T) => number): Promise<T[]> {
    const entities = await this.getAll();
    return entities.sort(compareFn);
  }

  /**
   * Paginate entities
   */
  async paginate(page: number, pageSize: number): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
    const entities = await this.getAll();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = entities.slice(start, end);

    return {
      data,
      total: entities.length,
      page,
      pageSize,
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Generate unique ID (UUID v4)
   * Uses crypto.randomUUID() if available, falls back to custom implementation
   */
  protected generateId(): string {
    // Use native crypto.randomUUID() if available (Node.js 14.17+ and modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Subscribe to entity changes
   */
  subscribe(callback: (entities: T[]) => void): () => void {
    return this.storage.subscribe(this.entityKey, (event) => {
      if (event.value) {
        callback(event.value as T[]);
      }
    });
  }
}
