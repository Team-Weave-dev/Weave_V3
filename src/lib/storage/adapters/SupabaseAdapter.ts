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
  dashboard: 'user_settings', // dashboard는 user_settings.dashboard 컬럼에 저장
  user: 'users',
  users: 'users',
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
   * Validate UUID format
   *
   * @param value - Value to validate
   * @returns True if value is a valid UUID
   */
  private isValidUUID(value: any): boolean {
    if (typeof value !== 'string') return false

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
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

      // Special handling for dashboard (fetch from user_settings.dashboard column)
      if (entity === 'dashboard') {
        const data = await this.withRetry(async () => {
          const query = this.supabase
            .from('user_settings')
            .select('dashboard')
            .eq('user_id', this.userId)
            .single()
          return await this.executeQuery<any>(query)
        })

        if (data === null || !data.dashboard) {
          return null
        }

        // Return dashboard column value
        const dashboardData = data.dashboard as T

        // Validate type if type guard is provided
        if (typeGuard && !typeGuard(dashboardData)) {
          throw new StorageError(
            `Type validation failed for key "${key}"`,
            'GET_ERROR',
            {
              key,
              severity: 'high',
            }
          )
        }

        return dashboardData
      }

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

      // Special handling for dashboard (store in user_settings.dashboard column)
      if (entity === 'dashboard') {
        await this.withRetry(async () => {
          // Update only the dashboard column in user_settings table
          const query = this.supabase
            .from('user_settings')
            .update({
              dashboard: value,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', this.userId)

          const { error } = await query

          if (error) {
            throw error
          }
        })
        return
      }

      // Special handling for settings (Record<userId, Settings> → single Settings)
      if (entity === 'settings' && !Array.isArray(value)) {
        const settingsRecord = value as Record<string, any>
        const userSettings = settingsRecord[this.userId]

        if (!userSettings) {
          // No settings for current user, skip sync (not an error)
          console.warn(`No settings found for user ${this.userId} in settings record`)
          return
        }

        // Extract user's settings and add user_id
        const dataToStore = {
          dashboard: userSettings.dashboard,
          calendar: userSettings.calendar,
          projects: userSettings.projects,
          notifications: userSettings.notifications,
          preferences: userSettings.preferences,
          user_id: this.userId,
          updated_at: new Date().toISOString(),
        }

        await this.withRetry(async () => {
          // user_id를 기준으로 upsert (id 자동 생성 또는 재사용)
          const query = this.supabase
            .from(tableName)
            .upsert(dataToStore as any, {
              onConflict: 'user_id'  // user_id conflict 시 기존 row 업데이트
            })
          const { error } = await query

          if (error) {
            throw error
          }
        })
        return
      }

      // Special handling for users (User[] → single User for current user_id)
      // users 테이블은 id가 PRIMARY KEY이며 user_id 컬럼이 없음 (auth.users와 1:1 매핑)
      if (entity === 'users' && Array.isArray(value)) {
        const usersArray = value as any[]

        if (usersArray.length === 0) {
          // No users to sync, skip (not an error)
          console.warn(`No users found in users array`)
          return
        }

        // Find user matching current userId, or use first user
        const userData = usersArray.find((user: any) => user.id === this.userId) || usersArray[0]

        // Prepare data for Supabase with snake_case column names
        const dataToStore = {
          id: this.userId,  // id = auth.uid() (PRIMARY KEY)
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          metadata: userData.metadata,
          // Profile fields (camelCase → snake_case)
          phone: userData.phone,
          business_number: userData.businessNumber,
          address: userData.address,
          address_detail: userData.addressDetail,
          business_type: userData.businessType,
          // Timestamps (camelCase → snake_case)
          created_at: userData.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        await this.withRetry(async () => {
          // id를 기준으로 upsert (PRIMARY KEY conflict 시 업데이트)
          const query = this.supabase
            .from(tableName)
            .upsert(dataToStore as any)  // id가 PRIMARY KEY이므로 자동으로 conflict 해결
          const { error } = await query

          if (error) {
            console.error('[SupabaseAdapter] Supabase error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            throw error
          }
        })
        return
      }

      // Special handling for projects (camelCase → snake_case)
      if (entity === 'projects' && Array.isArray(value)) {
        const projectsArray = value as any[]

        if (projectsArray.length === 0) {
          console.warn(`No projects found in projects array`)
          return
        }

        const dataToStore = projectsArray.map((project: any) => ({
          // Identifiers
          id: project.id,
          user_id: this.userId,
          // client_id must be UUID, not client name - set to null if not UUID format
          client_id: this.isValidUUID(project.clientId) ? project.clientId : null,
          no: project.no,
          name: project.name,
          description: project.description,
          project_content: project.projectContent,

          // Status
          status: project.status,
          progress: project.progress,
          payment_progress: project.paymentProgress,

          // Schedule (camelCase → snake_case)
          registration_date: project.registrationDate,
          modified_date: project.modifiedDate,
          end_date: project.endDate || null,
          start_date: project.startDate || null,

          // Payment
          settlement_method: project.settlementMethod,
          payment_status: project.paymentStatus,
          total_amount: project.totalAmount,
          currency: project.currency,

          // WBS (JSONB)
          wbs_tasks: project.wbsTasks || [],

          // Document status (JSONB) - Supabase stores documents info here
          document_status: project.documentStatus || {
            contract: { exists: false, status: 'none' },
            invoice: { exists: false, status: 'none' },
            report: { exists: false, status: 'none' },
            estimate: { exists: false, status: 'none' },
            etc: { exists: false, status: 'none' }
          },

          // Document flags (boolean)
          has_contract: project.hasContract || false,
          has_billing: project.hasBilling || false,
          has_documents: project.hasDocuments || false,

          // Timestamps (camelCase → snake_case)
          created_at: project.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        await this.withRetry(async () => {
          const query = this.supabase.from(tableName).upsert(dataToStore as any)
          const { error } = await query

          if (error) {
            console.error('[SupabaseAdapter] Projects sync error:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            throw error
          }
        })
        return
      }

      // Normal handling for other entities (tasks, events, clients, documents)
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
