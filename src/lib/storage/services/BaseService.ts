/**
 * Base Service Abstract Class
 *
 * This file provides the foundation for all domain services.
 * Provides common CRUD operations and utility methods.
 */

import type { StorageManager } from '../core/StorageManager';
import type { JsonObject } from '../types/base';
import { getDeviceId } from '../utils/deviceId';

/**
 * Base entity interface
 * All entities must have these required fields
 */
export interface BaseEntity extends JsonObject {
  id: string;
  createdAt: string;
  updatedAt: string;
  device_id?: string;  // Optional device ID for audit trail
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
    const now = this.getCurrentTimestamp();

    // Check if data contains an id (TypeScript workaround for Omit)
    const dataWithId = data as any;
    const entityId = dataWithId.id || this.generateId();

    const entity: T = {
      ...data,
      id: entityId,
      createdAt: now,
      updatedAt: now,
      device_id: getDeviceId(),  // Track which device created this entity
    } as T;

    // Validate entity
    if (!this.isValidEntity(entity)) {
      console.error('[BaseService.create] Validation failed:', {
        entityKey: this.entityKey,
        entityId: entity.id,
        entityData: JSON.stringify(entity, null, 2),
        requiredFields: {
          id: { value: entity.id, type: typeof entity.id, valid: !!entity.id },
          createdAt: { value: entity.createdAt, type: typeof entity.createdAt, valid: !!(entity.createdAt && !isNaN(Date.parse(entity.createdAt))) },
          updatedAt: { value: entity.updatedAt, type: typeof entity.updatedAt, valid: !!(entity.updatedAt && !isNaN(Date.parse(entity.updatedAt))) }
        }
      });
      throw new Error(`Invalid entity data for ${this.entityKey}: Check console for details`);
    }

    // Get existing entities
    const entities = await this.getAll();

    // Check for duplicate ID to prevent duplicates in array
    const existingIndex = entities.findIndex(e => e.id === entityId);
    if (existingIndex !== -1) {
      // Replace existing entity instead of adding duplicate
      entities[existingIndex] = entity;
    } else {
      // Add new entity
      entities.push(entity);
    }

    // Save to storage
    await this.storage.set<T[]>(this.entityKey, entities);

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
    console.log(`[BaseService.getAll] 🔍 데이터 로드 시작:`, {
      entityKey: this.entityKey,
      storageMode: this.storage.constructor.name
    });

    const entities = await this.storage.get<T[]>(this.entityKey);

    console.log(`[BaseService.getAll] 📦 데이터 로드 완료:`, {
      entityKey: this.entityKey,
      count: entities?.length || 0,
      first: entities?.[0] ? { id: entities[0].id } : null
    });

    return entities || [];
  }

  /**
   * Normalize date string to ISO format
   */
  protected normalizeDateString(dateStr: string | undefined): string | undefined {
    if (!dateStr) return undefined;

    try {
      // Parse and re-format to ensure consistent ISO format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch {
      // If parsing fails, return original
    }

    return dateStr;
  }

  /**
   * Normalize entity dates for consistency
   */
  protected normalizeEntityDates(entity: any): any {
    const normalized = { ...entity };

    // Normalize common date fields
    if (normalized.createdAt) {
      normalized.createdAt = this.normalizeDateString(normalized.createdAt);
    }
    if (normalized.updatedAt) {
      normalized.updatedAt = this.normalizeDateString(normalized.updatedAt);
    }
    if (normalized.startDate) {
      normalized.startDate = this.normalizeDateString(normalized.startDate);
    }
    if (normalized.endDate) {
      normalized.endDate = this.normalizeDateString(normalized.endDate);
    }

    return normalized;
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
      device_id: getDeviceId(),  // Track which device updated this entity
    } as T;

    // Normalize dates for consistency
    const normalizedEntity = this.normalizeEntityDates(updatedEntity) as T;

    // Validate updated entity
    if (!this.isValidEntity(normalizedEntity)) {
      console.error('[BaseService.update] Validation failed:', {
        entityKey: this.entityKey,
        entityId: normalizedEntity.id,
        entityData: JSON.stringify(normalizedEntity, null, 2),
        requiredFields: {
          id: { value: normalizedEntity.id, type: typeof normalizedEntity.id, valid: !!normalizedEntity.id },
          createdAt: { value: normalizedEntity.createdAt, type: typeof normalizedEntity.createdAt, valid: !!(normalizedEntity.createdAt && !isNaN(Date.parse(normalizedEntity.createdAt))) },
          updatedAt: { value: normalizedEntity.updatedAt, type: typeof normalizedEntity.updatedAt, valid: !!(normalizedEntity.updatedAt && !isNaN(Date.parse(normalizedEntity.updatedAt))) }
        }
      });

      // Provide entity-specific debugging information
      if (this.entityKey === 'events') {
        const eventEntity = normalizedEntity as any;
        console.error('[BaseService.update] Event-specific validation:', {
          userId: { value: eventEntity.userId, type: typeof eventEntity.userId, valid: !!eventEntity.userId },
          title: { value: eventEntity.title, type: typeof eventEntity.title, valid: !!eventEntity.title },
          startDate: { value: eventEntity.startDate, type: typeof eventEntity.startDate, valid: !!(eventEntity.startDate && !isNaN(Date.parse(eventEntity.startDate))) },
          endDate: { value: eventEntity.endDate, type: typeof eventEntity.endDate, valid: !!(eventEntity.endDate && !isNaN(Date.parse(eventEntity.endDate))) },
          type: { value: eventEntity.type, type: typeof eventEntity.type, valid: !!eventEntity.type },
          status: { value: eventEntity.status, type: typeof eventEntity.status, valid: !!eventEntity.status }
        });
      }

      throw new Error(`Invalid entity data for ${this.entityKey}: Check console for details`);
    }

    // Update in array
    entities[index] = normalizedEntity;

    // Save to storage
    await this.storage.set<T[]>(this.entityKey, entities);

    return normalizedEntity;
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string): Promise<boolean> {
    // Get all entities
    const entities = await this.getAll();
    const index = entities.findIndex((entity) => entity.id === id);

    if (index === -1) {
      return false; // Entity not found
    }

    console.log(`[BaseService.delete] 🗑️ 삭제 시작:`, {
      entityKey: this.entityKey,
      id
    });

    // Remove from array
    entities.splice(index, 1);

    // Save updated array to storage (this will also handle Supabase soft delete)
    await this.storage.set<T[]>(this.entityKey, entities);

    console.log(`[BaseService.delete] ✅ 삭제 완료 (배열에서 제거 + 저장)`);
    return true;
  }

  /**
   * Delete multiple entities by IDs
   */
  async deleteMany(ids: string[]): Promise<number> {
    // Supabase-only mode: Delete each entity individually from database
    // Remove each entity individually to trigger Supabase DELETE operations
    const removalPromises = ids.map(async (id) => {
      const individualKey = `${this.entityKey}:${id}`;
      try {
        await this.storage.remove(individualKey);
        return true;
      } catch (error) {
        // Log warning but don't fail the entire operation
        console.warn(`Failed to remove individual entity ${individualKey}:`, error);
        return false;
      }
    });

    // Wait for all removals to complete
    const results = await Promise.all(removalPromises);

    // Count successful deletions
    const deletedCount = results.filter(success => success).length;
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
    const deviceId = getDeviceId();
    const newEntities: T[] = dataArray.map((data) => ({
      ...data,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      device_id: deviceId,  // Track which device created these entities
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
    const deviceId = getDeviceId();

    for (let i = 0; i < entities.length; i++) {
      const updateData = updateMap.get(entities[i].id);
      if (updateData) {
        const updatedEntity: T = {
          ...entities[i],
          ...updateData,
          id: entities[i].id,
          createdAt: entities[i].createdAt,
          updatedAt: now,
          device_id: deviceId,  // Track which device updated these entities
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
