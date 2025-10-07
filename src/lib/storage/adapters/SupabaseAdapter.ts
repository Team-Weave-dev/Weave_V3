/**
 * SupabaseAdapter - Supabase Database Implementation
 *
 * This adapter integrates Supabase as a storage backend, providing:
 * - StorageAdapter interface compliance
 * - User-scoped data isolation with RLS
 * - Entity-based table mapping
 * - Type-safe storage operations
 * - Network error handling and retry logic
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageAdapter, TypeGuard, JsonValue } from '../types/base'
import { StorageError } from '../types/base'
import { createClient } from '../../supabase/client'

/**
 * Configuration options for SupabaseAdapter
 */
export interface SupabaseAdapterConfig {
  /** User ID for RLS filtering */
  userId: string
  /** Custom Supabase client (optional, creates new if not provided) */
  client?: SupabaseClient
  /** Enable automatic retry on network errors */
  enableRetry?: boolean
  /** Maximum retry attempts */
  maxRetries?: number
  /** Delay between retries in milliseconds */
  retryDelay?: number
}

/**
 * Entity-to-table mapping
 */
const ENTITY_TABLE_MAP: Record<string, string> = {
  projects: 'projects',
  project: 'projects',
  tasks: 'tasks',
  task: 'tasks',
  events: 'calendar_events',
  event: 'calendar_events',
  clients: 'clients',
  client: 'clients',
  documents: 'documents',
  document: 'documents',
  settings: 'user_settings',
  user: 'users',
} as const

/**
 * Supabase adapter implementing the StorageAdapter interface
 *
 * Provides integration with Supabase database with user-scoped data isolation,
 * RLS policy support, and type-safe CRUD operations.
 */
export class SupabaseAdapter implements StorageAdapter {
  /**
   * Supabase client instance
   */
  private supabase: SupabaseClient

  /**
   * User ID for RLS filtering
   */
  private userId: string

  /**
   * Retry configuration
   */
  private enableRetry: boolean
  private maxRetries: number
  private retryDelay: number

  /**
   * Create a new SupabaseAdapter
   *
   * @param config - Configuration options
   */
  constructor(config: SupabaseAdapterConfig) {
    this.userId = config.userId
    this.supabase = config.client || createClient()
    this.enableRetry = config.enableRetry ?? true
    this.maxRetries = config.maxRetries ?? 3
    this.retryDelay = config.retryDelay ?? 1000
  }

  /**
   * Parse storage key into entity and parameters
   *
   * Key format: entity[:id[:subkey]]
   * Examples:
   *   'projects' → { entity: 'projects', id: null, subkey: null }
   *   'project:abc-123' → { entity: 'project', id: 'abc-123', subkey: null }
   *   'project:abc-123:wbs' → { entity: 'project', id: 'abc-123', subkey: 'wbs' }
   *
   * @param key - Storage key
   * @returns Parsed key components
   */
  private parseKey(key: string): { entity: string; id: string | null; subkey: string | null } {
    const parts = key.split(':')
    return {
      entity: parts[0] || '',
      id: parts[1] || null,
      subkey: parts[2] || null,
    }
  }

  /**
   * Get table name from entity
   *
   * @param entity - Entity name
   * @returns Supabase table name
   * @throws {StorageError} If entity is not mapped
   */
  private getTableName(entity: string): string {
    const tableName = ENTITY_TABLE_MAP[entity]
    if (!tableName) {
      throw new StorageError(
        `Unknown entity "${entity}"`,
        'ADAPTER_ERROR',
        {
          severity: 'high',
          userMessage: `알 수 없는 엔티티입니다: ${entity}`,
        }
      )
    }
    return tableName
  }

  /**
   * Execute a Supabase query with retry logic
   *
   * @param queryFn - Function that executes the query
   * @returns Query result
   */
  private async withRetry<T>(queryFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await queryFn()
      } catch (error) {
        lastError = error as Error

        // Check if error is retryable (network errors)
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('fetch'))

        if (!isNetworkError || !this.enableRetry) {
          throw error
        }

        // Wait before retry with exponential backoff
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  /**
   * Execute Supabase query and handle result
   *
   * @param query - Supabase query builder
   * @returns Query data
   */
  private async executeQuery<T>(query: any): Promise<T | null> {
    const { data, error } = await query

    if (error) {
      // Not found is not an error
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as T
  }

  /**
   * Get a value from Supabase
   *
   * @param key - Storage key
   * @param typeGuard - Optional type guard function for runtime validation
   * @returns The stored value or null if not found
   * @throws {StorageError} If query fails or type validation fails
   */
  async get<T extends JsonValue>(key: string, typeGuard?: TypeGuard<T>): Promise<T | null> {
    try {
      const { entity, id } = this.parseKey(key)
      const tableName = this.getTableName(entity)

      const data = await this.withRetry(async () => {
        // Single entity query
        if (id) {
          const query = this.supabase
            .from(tableName)
            .select('*')
            .eq('user_id', this.userId)
            .eq('id', id)
            .single()
          return await this.executeQuery<T>(query)
        } else {
          const query = this.supabase.from(tableName).select('*').eq('user_id', this.userId)
          return await this.executeQuery<T>(query)
        }
      })

      if (data === null) {
        return null
      }

      // Validate type if type guard is provided
      if (typeGuard && !typeGuard(data)) {
        throw new StorageError(
          `Type validation failed for key "${key}"`,
          'GET_ERROR',
          {
            key,
            severity: 'high',
          }
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        `Failed to get key "${key}" from Supabase`,
        'GET_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'high',
        }
      )
    }
  }

  /**
   * Set a value in Supabase
   *
   * Uses UPSERT to insert or update data based on primary key.
   *
   * @param key - Storage key
   * @param value - Value to store
   * @throws {StorageError} If query fails
   */
  async set<T extends JsonValue>(key: string, value: T): Promise<void> {
    try {
      const { entity, id } = this.parseKey(key)
      const tableName = this.getTableName(entity)

      // Prepare data with user_id
      const dataToStore = Array.isArray(value)
        ? value.map((item: any) => ({
            ...item,
            user_id: this.userId,
            updated_at: new Date().toISOString(),
          }))
        : {
            ...(value as any),
            user_id: this.userId,
            updated_at: new Date().toISOString(),
          }

      await this.withRetry(async () => {
        const query = this.supabase.from(tableName).upsert(dataToStore as any)
        const { error } = await query

        if (error) {
          throw error
        }
      })
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        `Failed to set key "${key}" in Supabase`,
        'SET_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'high',
        }
      )
    }
  }

  /**
   * Remove a value from Supabase
   *
   * @param key - Storage key to remove
   * @throws {StorageError} If query fails
   */
  async remove(key: string): Promise<void> {
    try {
      const { entity, id } = this.parseKey(key)
      const tableName = this.getTableName(entity)

      if (!id) {
        throw new StorageError(
          `Cannot remove without ID: "${key}"`,
          'REMOVE_ERROR',
          {
            key,
            severity: 'medium',
            userMessage: 'ID가 필요합니다.',
          }
        )
      }

      await this.withRetry(async () => {
        const query = this.supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .eq('user_id', this.userId)

        const { error } = await query

        if (error) {
          throw error
        }
      })
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        `Failed to remove key "${key}" from Supabase`,
        'REMOVE_ERROR',
        {
          key,
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'medium',
        }
      )
    }
  }

  /**
   * Clear all storage entries for the current user
   *
   * **WARNING**: This deletes ALL user data from ALL tables.
   * Use with extreme caution.
   *
   * @throws {StorageError} If any deletion fails
   */
  async clear(): Promise<void> {
    try {
      const tables = Object.values(ENTITY_TABLE_MAP).filter(
        (table, index, self) => self.indexOf(table) === index
      )

      for (const table of tables) {
        await this.withRetry(async () => {
          const query = this.supabase.from(table).delete().eq('user_id', this.userId)
          const { error } = await query

          if (error) {
            throw error
          }
        })
      }
    } catch (error) {
      throw new StorageError(
        'Failed to clear Supabase data',
        'CLEAR_ERROR',
        {
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'critical',
          userMessage: '데이터 삭제 중 오류가 발생했습니다.',
        }
      )
    }
  }

  /**
   * Get all storage keys for the current user
   *
   * Returns keys in the format: entity:id
   *
   * @returns Array of all keys
   */
  async keys(): Promise<string[]> {
    try {
      const keys: string[] = []

      // Get IDs from each table
      const tables = Object.values(ENTITY_TABLE_MAP).filter(
        (table, index, self) => self.indexOf(table) === index
      )

      for (const table of tables) {
        await this.withRetry(async () => {
          const query = this.supabase
            .from(table)
            .select('id')
            .eq('user_id', this.userId)

          const { data, error } = await query

          if (error) {
            throw error
          }

          if (data) {
            // Find entity name for this table
            const entity = Object.entries(ENTITY_TABLE_MAP).find(
              ([_, tableName]) => tableName === table
            )?.[0]

            data.forEach((row: any) => {
              if (row.id && entity) {
                keys.push(`${entity}:${row.id}`)
              }
            })
          }
        })
      }

      return keys
    } catch (error) {
      console.error('Error getting keys from Supabase:', error)
      return []
    }
  }

  /**
   * Check if a key exists in storage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const { entity, id } = this.parseKey(key)
      const tableName = this.getTableName(entity)

      if (!id) {
        return false
      }

      const data = await this.withRetry(async () => {
        const query = this.supabase
          .from(tableName)
          .select('id')
          .eq('id', id)
          .eq('user_id', this.userId)
          .single()

        return await this.executeQuery(query)
      })

      return data !== null
    } catch (error) {
      console.error(`Error checking key "${key}" in Supabase:`, error)
      return false
    }
  }
}
