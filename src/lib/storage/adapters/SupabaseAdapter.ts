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
  events: 'events',
  event: 'events',
  clients: 'clients',
  client: 'clients',
  documents: 'documents',
  document: 'documents',
  settings: 'user_settings',
  dashboard: 'user_settings', // dashboard는 user_settings.dashboard 컬럼에 저장
  user: 'users',
  users: 'users',
  todo_sections: 'todo_sections',
  activity_logs: 'activity_logs',  // ActivityLog 엔티티 매핑
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
   * Transform Supabase data (snake_case) to camelCase
   * @param entity - Entity type
   * @param data - Raw Supabase data
   * @returns Transformed data in camelCase
   */
  private transformFromSupabase(entity: string, data: any): any {
    if (!data) return data

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformFromSupabase(entity, item))
    }

    // Handle objects - transform based on entity type
    switch (entity) {
      case 'events':
      case 'event':
        return {
          id: data.id,
          userId: data.user_id,
          projectId: data.project_id,
          clientId: data.client_id,
          title: data.title,
          description: data.description,
          location: data.location,
          startDate: data.start_time,  // start_time → startDate
          endDate: data.end_time,      // end_time → endDate
          allDay: data.all_day,
          timezone: data.timezone,
          type: data.type,
          status: data.status,
          color: data.color,
          icon: data.icon,
          recurring: data.recurrence,
          recurrenceEnd: data.recurrence_end,
          recurrenceExceptions: data.recurrence_exceptions,
          reminders: data.reminders,
          attendees: data.attendees,
          metadata: data.metadata,
          tags: data.tags,
          isPrivate: data.is_private,
          isBusy: data.is_busy,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'projects':
      case 'project':
        return {
          id: data.id,
          userId: data.user_id,
          clientId: data.client_id,
          no: data.no,
          name: data.name,
          description: data.description,
          projectContent: data.project_content,
          status: data.status,
          progress: data.progress,
          paymentProgress: data.payment_progress,
          registrationDate: data.registration_date,
          modifiedDate: data.modified_date,
          endDate: data.end_date,
          startDate: data.start_date,
          settlementMethod: data.settlement_method,
          paymentStatus: data.payment_status,
          totalAmount: data.total_amount,
          currency: data.currency,
          wbsTasks: data.wbs_tasks,
          documentStatus: data.document_status,
          hasContract: data.has_contract,
          hasBilling: data.has_billing,
          hasDocuments: data.has_documents,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'tasks':
      case 'task':
        // Priority 변환: Supabase (urgent/high/medium/low) → TodoTask (p1/p2/p3/p4)
        const priorityMap: Record<string, string> = {
          'urgent': 'p1',
          'high': 'p2',
          'medium': 'p3',
          'low': 'p4'
        };

        // Tags에서 sectionId 추출
        let sectionId: string | undefined;
        const tags = data.tags || [];
        const filteredTags: string[] = [];

        console.log(`[SupabaseAdapter.transformFromSupabase] Task "${data.title}" tags:`, tags);

        for (const tag of tags) {
          if (typeof tag === 'string' && tag.startsWith('section:')) {
            sectionId = tag.substring(8);
            console.log(`[SupabaseAdapter.transformFromSupabase] Extracted sectionId: ${sectionId} from tag: ${tag}`);
          } else {
            filteredTags.push(tag);
          }
        }

        const transformedTask = {
          id: data.id,
          userId: data.user_id,
          projectId: data.project_id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: priorityMap[data.priority] || data.priority, // p1/p2/p3/p4로 변환
          dueDate: data.due_date,
          startDate: data.start_date,
          completedAt: data.completed_at,
          assigneeId: data.assignee_id,
          parentTaskId: data.parent_task_id,
          estimatedHours: data.estimated_hours,
          actualHours: data.actual_hours,
          tags: filteredTags, // section: 태그를 제외한 나머지 태그들
          sectionId: sectionId, // 추출한 sectionId 추가
          attachments: data.attachments,
          recurring: data.recurring,
          checklist: data.checklist,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        console.log(`[SupabaseAdapter.transformFromSupabase] Transformed task with sectionId:`, {
          title: transformedTask.title,
          sectionId: transformedTask.sectionId,
          status: transformedTask.status
        });

        return transformedTask;

      case 'clients':
      case 'client':
        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          address: data.address,
          contactPerson: data.contact_person,
          contactPhone: data.contact_phone,
          contactEmail: data.contact_email,
          businessNumber: data.business_number,
          businessType: data.business_type,
          industry: data.industry,
          notes: data.notes,
          tags: data.tags,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'documents':
      case 'document':
        return {
          id: data.id,
          userId: data.user_id,
          projectId: data.project_id,
          title: data.title,
          description: data.description,
          content: data.content,
          type: data.type,
          category: data.category,
          status: data.status,
          fileUrl: data.file_url,
          fileName: data.file_name,
          fileSize: data.file_size,
          fileType: data.file_type,
          templateId: data.template_id,
          templateName: data.template_name,
          version: data.version,
          parentDocumentId: data.parent_document_id,
          isLatest: data.is_latest,
          requiresSignature: data.requires_signature,
          signedAt: data.signed_at,
          signatureUrl: data.signature_url,
          metadata: data.metadata,
          tags: data.tags,
          issuedDate: data.issued_date,
          dueDate: data.due_date,
          expiryDate: data.expiry_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'users':
      case 'user':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          metadata: data.metadata,
          phone: data.phone,
          businessNumber: data.business_number,
          address: data.address,
          addressDetail: data.address_detail,
          businessType: data.business_type,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'settings':
        // Settings는 JSONB 필드로 저장되어 있어 이미 camelCase
        return data

      case 'todo_sections':
        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          orderIndex: data.order_index,
          isExpanded: data.is_expanded,
          color: data.color,
          icon: data.icon,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

      case 'activity_logs':
        // ActivityLog transformation: metadata에서 필드 추출
        return {
          id: data.id,
          userId: data.user_id,

          // Activity info - metadata에서 추출
          type: data.metadata?.type || 'create',
          action: data.action,

          // Entity info - resource_* → entity*
          entityType: data.resource_type,
          entityId: data.resource_id,
          entityName: data.resource_name,

          // User info - metadata에서 추출
          userName: data.metadata?.userName || 'Unknown',
          userInitials: data.metadata?.userInitials || 'U',

          // Additional info
          description: data.metadata?.description,
          metadata: data.metadata || {},
          changes: data.metadata?.changes,

          // Timestamp - metadata.timestamp 또는 created_at 사용
          timestamp: data.metadata?.timestamp || data.created_at,

          // Base entity fields
          createdAt: data.created_at,
          updatedAt: data.created_at, // activity_logs에는 updated_at이 없으므로 created_at 사용
        }

      default:
        // Unknown entity: return as-is
        console.warn(`Unknown entity type for transformation: ${entity}`)
        return data
    }
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
        // Special handling for users table (id = PRIMARY KEY, no user_id column)
        if (entity === 'users' || entity === 'user') {
          if (id) {
            const query = this.supabase
              .from(tableName)
              .select('*')
              .eq('id', id)
              .single()
            return await this.executeQuery<T>(query)
          } else {
            // users 배열 조회: 현재 사용자만 (id = userId)
            console.log(`[SupabaseAdapter.get] Fetching users for userId: ${this.userId}`)
            const query = this.supabase
              .from(tableName)
              .select('*')
              .eq('id', this.userId)
            return await this.executeQuery<T>(query)
          }
        }

        // Single entity query (other tables with user_id)
        if (id) {
          console.log(`[SupabaseAdapter.get] Fetching single ${entity} with id=${id}, user_id=${this.userId}`)
          const query = this.supabase
            .from(tableName)
            .select('*')
            .eq('user_id', this.userId)
            .eq('id', id)
            .single()
          return await this.executeQuery<T>(query)
        } else {
          console.log(`[SupabaseAdapter.get] Fetching all ${entity} for user_id=${this.userId} from table=${tableName}`)
          const query = this.supabase.from(tableName).select('*').eq('user_id', this.userId)
          const result = await this.executeQuery<T>(query)
          console.log(`[SupabaseAdapter.get] Query result for ${entity}:`, result)
          return result
        }
      })

      if (data === null) {
        return null
      }

      // Transform snake_case to camelCase
      const transformedData = this.transformFromSupabase(entity, data)

      // Validate type if type guard is provided
      if (typeGuard && !typeGuard(transformedData)) {
        throw new StorageError(
          `Type validation failed for key "${key}"`,
          'GET_ERROR',
          {
            key,
            severity: 'high',
          }
        )
      }

      return transformedData as T
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
          const updateData: any = {
            dashboard: value,
            updated_at: new Date().toISOString(),
          }

          // updated_by는 선택적 (컬럼이 존재하지 않을 수 있음)
          // Phase 10.1에서 마이그레이션으로 추가 예정
          // updateData.updated_by = this.userId

          const query = this.supabase
            .from('user_settings')
            .update(updateData)
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
        const dataToStore: any = {
          dashboard: userSettings.dashboard,
          calendar: userSettings.calendar,
          projects: userSettings.projects,
          notifications: userSettings.notifications,
          preferences: userSettings.preferences,
          user_id: this.userId,
          updated_at: new Date().toISOString(),
          // updated_by는 선택적 (컬럼이 존재하지 않을 수 있음)
          // updated_by: this.userId,
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
          // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
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

        // 🔍 디버깅: 받은 프로젝트 배열 정보 로깅
        console.log('[SupabaseAdapter] Projects set() called:', {
          projectsCount: projectsArray.length,
          userId: this.userId,
          firstProject: projectsArray[0] ? {
            id: projectsArray[0].id,
            no: projectsArray[0].no,
            name: projectsArray[0].name
          } : null
        })

        // 빈 배열이어도 DELETE 쿼리는 실행해야 함 (마지막 프로젝트 삭제 시)
        // dataToStore가 빈 배열이면 INSERT를 건너뛰도록 아래에서 처리

        const dataToStore = projectsArray.map((project: any) => ({
          // Identifiers
          id: this.isValidUUID(project.id) ? project.id : crypto.randomUUID(),
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
          // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
        }))

        await this.withRetry(async () => {
          // 삭제-삽입 전략: LocalStorage와 완전 동기화
          // 1. 기존 projects 모두 삭제
          console.log('[SupabaseAdapter] Projects DELETE 시작:', { userId: this.userId })

          const { error: deleteError } = await this.supabase
            .from(tableName)
            .delete()
            .eq('user_id', this.userId)

          if (deleteError) {
            console.error('[SupabaseAdapter] Projects delete error:', {
              code: deleteError.code,
              message: deleteError.message,
              details: deleteError.details,
              hint: deleteError.hint
            })
            throw deleteError
          }

          console.log('[SupabaseAdapter] Projects DELETE 성공')

          // 2. 새로운 projects 삽입 (배열이 비어있지 않을 때만)
          if (dataToStore.length > 0) {
            console.log('[SupabaseAdapter] Projects INSERT 시작:', {
              count: dataToStore.length,
              firstProject: {
                id: dataToStore[0].id,
                no: dataToStore[0].no,
                name: dataToStore[0].name,
                user_id: dataToStore[0].user_id
              }
            })

            const { error: insertError } = await this.supabase
              .from(tableName)
              .insert(dataToStore as any)

            if (insertError) {
              console.error('[SupabaseAdapter] Projects insert error:', {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint
              })
              throw insertError
            }

            console.log('[SupabaseAdapter] Projects INSERT 성공:', dataToStore.length)
          } else {
            console.log('[SupabaseAdapter] Projects INSERT 건너뜀 (빈 배열)')
          }
        })
        return
      }

      // Special handling for tasks (camelCase → snake_case)
      if (entity === 'tasks' && Array.isArray(value)) {
        const tasksArray = value as any[]

        // 빈 배열이어도 DELETE 쿼리는 실행해야 함 (마지막 태스크 삭제 시)
        // dataToStore가 빈 배열이면 INSERT를 건너뛰도록 아래에서 처리

        // 중복 ID 제거 (마지막 항목만 유지)
        const uniqueTasksArray = Array.from(
          new Map(tasksArray.map(task => [task.id, task])).values()
        )

        // Status 변환: Supabase CHECK 제약에 맞게 변환
        // Supabase tasks.status CHECK: ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'blocked']

        // Priority 변환: Supabase CHECK 제약에 맞게 변환
        // Supabase tasks.priority CHECK: ('low', 'medium', 'high', 'urgent')
        const validPriorities = ['low', 'medium', 'high', 'urgent']

        // TodoTask priority (p1/p2/p3/p4) → Supabase priority (urgent/high/medium/low) 매핑
        const todoPriorityMap: Record<string, string> = {
          'p1': 'urgent',
          'p2': 'high',
          'p3': 'medium',
          'p4': 'low'
        }

        const dataToStore = uniqueTasksArray.map((task: any) => {
          // Status 검증
          let taskStatus = task.status || 'pending'
          if (!validStatuses.includes(taskStatus)) {
            console.warn(`[SupabaseAdapter] Invalid task status "${taskStatus}", converting to "pending"`)
            taskStatus = 'pending'
          }

          // Priority 변환 및 검증
          let taskPriority = task.priority || 'medium'

          // p1/p2/p3/p4 형식을 urgent/high/medium/low로 변환
          if (todoPriorityMap[taskPriority]) {
            taskPriority = todoPriorityMap[taskPriority]
          }

          if (!validPriorities.includes(taskPriority)) {
            console.warn(`[SupabaseAdapter] Invalid task priority "${taskPriority}", converting to "medium"`)
            taskPriority = 'medium'
          }

          return {
            // Identifiers
            id: this.isValidUUID(task.id) ? task.id : crypto.randomUUID(),
            user_id: this.userId,
            project_id: this.isValidUUID(task.projectId) ? task.projectId : null,

            // Basic info
            title: task.title,
            description: task.description || null,

            // Status (검증된 값)
            status: taskStatus,
            priority: taskPriority,

            // Schedule (camelCase → snake_case)
            due_date: task.dueDate || null,
            start_date: task.startDate || null,
            completed_at: task.completedAt || null,

            // Relations (camelCase → snake_case)
            assignee_id: this.isValidUUID(task.assigneeId) ? task.assigneeId : null,
            parent_task_id: this.isValidUUID(task.parentTaskId) ? task.parentTaskId : null,

            // Tracking (camelCase → snake_case)
            estimated_hours: task.estimatedHours || null,
            actual_hours: task.actualHours || null,

            // Metadata (JSONB) - sectionId를 tags에 포함
            tags: (() => {
              const taskTags = task.tags || []
              // sectionId가 있으면 tags에 추가
              if (task.sectionId) {
                return [`section:${task.sectionId}`, ...taskTags]
              }
              return taskTags
            })(),
            attachments: task.attachments || [],
            recurring: task.recurring || null,
            checklist: task.checklist || [],

            // Timestamps (camelCase → snake_case)
            created_at: task.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
          }
        })

        // 디버깅: 전송할 데이터 로그
        if (dataToStore.length > 0) {
          console.log('[SupabaseAdapter] Tasks data to store (first item):', dataToStore[0])
        }

        await this.withRetry(async () => {
          // ⚠️ Tasks는 UPSERT 전략 사용 (Projects/Tasks에서 참조하므로 delete-insert 불가)
          // Foreign key constraint 위반 방지:
          // - tasks.parent_task_id → tasks.id (부모-자식 관계)
          // - projects에서 task 참조 가능
          if (dataToStore.length > 0) {
            console.log('[SupabaseAdapter] Tasks UPSERT 시작:', {
              count: dataToStore.length,
              firstTask: {
                id: dataToStore[0].id,
                title: dataToStore[0].title,
                parent_task_id: dataToStore[0].parent_task_id,
                user_id: dataToStore[0].user_id
              }
            })

            const { error: upsertError } = await this.supabase
              .from(tableName)
              .upsert(dataToStore as any)  // id 기반 UPSERT (새 태스크 추가 또는 기존 업데이트)

            if (upsertError) {
              console.error('[SupabaseAdapter] Tasks upsert error:', {
                code: upsertError.code,
                message: upsertError.message,
                details: upsertError.details,
                hint: upsertError.hint,
                fullError: JSON.stringify(upsertError, null, 2)
              })
              throw upsertError
            }

            console.log('[SupabaseAdapter] Tasks UPSERT 성공:', dataToStore.length)
          } else {
            console.log('[SupabaseAdapter] Tasks UPSERT 건너뜀 (빈 배열)')
          }
        })
        return
      }

      // Special handling for events (camelCase → snake_case)
      if (entity === 'events' && Array.isArray(value)) {
        const eventsArray = value as any[]

        if (eventsArray.length === 0) {
          console.warn(`No events found in events array`)
          return
        }

        const dataToStore = eventsArray.map((event: any) => {
          // Detect format: Dashboard has 'date' field, Storage has 'startDate' field
          const isDashboardFormat = event.date && !event.startDate

          let startTime: string
          let endTime: string

          if (isDashboardFormat) {
            // Convert Dashboard format: date + startTime/endTime → ISO timestamp
            const eventDate = new Date(event.date)

            // Validate date
            if (isNaN(eventDate.getTime())) {
              console.error(`Invalid date for event: ${event.date}`)
              // Use current date as fallback
              const now = new Date()
              startTime = now.toISOString()
              endTime = new Date(now.getTime() + 3600000).toISOString()
            } else {
              if (event.startTime) {
                const [hours, minutes] = event.startTime.split(':')
                const startDate = new Date(eventDate)
                startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
                startTime = startDate.toISOString()
              } else {
                // No startTime: use date at midnight
                startTime = eventDate.toISOString()
              }

              if (event.endTime) {
                const [hours, minutes] = event.endTime.split(':')
                const endDate = new Date(eventDate)
                endDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
                endTime = endDate.toISOString()
              } else {
                // No endTime: default to 1 hour after start
                endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString()
              }
            }
          } else {
            // Storage format: validate and use
            const startDate = new Date(event.startDate)
            const endDate = new Date(event.endDate)

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.error(`Invalid date for event: start=${event.startDate}, end=${event.endDate}`)
              // Use current date as fallback
              const now = new Date()
              startTime = now.toISOString()
              endTime = new Date(now.getTime() + 3600000).toISOString()
            } else {
              startTime = event.startDate
              endTime = event.endDate
            }
          }

          // Type 변환: Supabase CHECK 제약에 맞게 변환
          // Supabase events.type CHECK: ('event', 'meeting', 'task', 'milestone', 'reminder', 'holiday')
          const validTypes = ['event', 'meeting', 'task', 'milestone', 'reminder', 'holiday']
          let eventType = event.type || 'event'

          // 'other' → 'event'로 변환
          if (!validTypes.includes(eventType)) {
            console.warn(`[SupabaseAdapter] Invalid event type "${eventType}", converting to "event"`)
            eventType = 'event'
          }

          return {
            // Identifiers
            id: this.isValidUUID(event.id) ? event.id : crypto.randomUUID(),
            user_id: this.userId,
            project_id: this.isValidUUID(event.projectId) ? event.projectId : null,
            client_id: this.isValidUUID(event.clientId) ? event.clientId : null,

            // Basic info
            title: event.title,
            description: event.description || null,
            location: event.location || null,

            // Time (camelCase → snake_case) - NOW HANDLES BOTH FORMATS
            start_time: startTime,
            end_time: endTime,
            all_day: event.allDay || false,
            timezone: event.timezone || 'Asia/Seoul',

            // Type and status (검증된 type)
            type: eventType,
            status: event.status || 'confirmed',

            // Style
            color: event.color || '#3B82F6',
            icon: event.icon || null,

            // Recurrence (JSONB)
            recurrence: event.recurring || null,
            recurrence_end: event.recurring?.endDate || null,
            recurrence_exceptions: event.recurring?.exceptions || [],

            // Reminders (JSONB)
            reminders: event.reminders || [],

            // Attendees (JSONB)
            attendees: event.attendees || [],

            // Metadata (JSONB)
            metadata: event.metadata || {},
            tags: event.tags || [],
            is_private: event.isPrivate || false,
            is_busy: event.isBusy !== undefined ? event.isBusy : true,

            // Timestamps (camelCase → snake_case)
            created_at: event.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
          }
        })

        await this.withRetry(async () => {
          // 삭제-삽입 전략: LocalStorage와 완전 동기화
          // 1. 기존 events 모두 삭제
          const { error: deleteError } = await this.supabase
            .from(tableName)
            .delete()
            .eq('user_id', this.userId)

          if (deleteError) {
            console.error('[SupabaseAdapter] Events delete error:', {
              code: deleteError.code,
              message: deleteError.message,
              details: deleteError.details,
              hint: deleteError.hint
            })
            throw deleteError
          }

          // 2. 새로운 events 삽입 (배열이 비어있지 않을 때만)
          if (dataToStore.length > 0) {
            const { error: insertError } = await this.supabase
              .from(tableName)
              .insert(dataToStore as any)

            if (insertError) {
              console.error('[SupabaseAdapter] Events insert error:', {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                fullError: JSON.stringify(insertError, null, 2),
              })
              console.error('[SupabaseAdapter] Events data being inserted (first item):', dataToStore[0])
              throw insertError
            }
          }
        })
        return
      }

      // Special handling for clients (camelCase → snake_case)
      if (entity === 'clients' && Array.isArray(value)) {
        const clientsArray = value as any[]

        // 빈 배열이어도 DELETE 쿼리는 실행해야 함 (마지막 클라이언트 삭제 시)
        // dataToStore가 빈 배열이면 INSERT를 건너뛰도록 아래에서 처리

        const dataToStore = clientsArray.map((client: any) => ({
          // Identifiers
          id: this.isValidUUID(client.id) ? client.id : crypto.randomUUID(),
          user_id: this.userId,

          // Basic info
          name: client.name,
          company: client.company || null,
          email: client.email || null,
          phone: client.phone || null,
          address: typeof client.address === 'string' ? client.address :
                   (client.address ? JSON.stringify(client.address) : null),

          // Contact person (camelCase → snake_case)
          // contacts 배열의 첫 번째 항목을 개별 필드로 변환
          contact_person: client.contacts?.[0]?.name || null,
          contact_phone: client.contacts?.[0]?.phone || null,
          contact_email: client.contacts?.[0]?.email || null,

          // Business info (camelCase → snake_case)
          business_number: client.businessNumber || null,
          business_type: client.businessType || null,
          industry: client.industry || null,

          // Metadata
          notes: client.notes || null,
          tags: client.tags || [],
          status: client.status || 'active',

          // Timestamps (camelCase → snake_case)
          created_at: client.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
        }))

        await this.withRetry(async () => {
          // ⚠️ Clients는 UPSERT 전략 사용 (Projects에서 참조하므로 delete-insert 불가)
          // Foreign key constraint 위반 방지: projects.client_id → clients.id
          if (dataToStore.length > 0) {
            console.log('[SupabaseAdapter] Clients UPSERT 시작:', {
              count: dataToStore.length,
              firstClient: {
                id: dataToStore[0].id,
                name: dataToStore[0].name,
                user_id: dataToStore[0].user_id
              }
            })

            const { error: upsertError } = await this.supabase
              .from(tableName)
              .upsert(dataToStore as any)  // id 기반 UPSERT (새 클라이언트 추가 또는 기존 업데이트)

            if (upsertError) {
              console.error('[SupabaseAdapter] Clients upsert error:', {
                code: upsertError.code,
                message: upsertError.message,
                details: upsertError.details,
                hint: upsertError.hint
              })
              throw upsertError
            }

            console.log('[SupabaseAdapter] Clients UPSERT 성공:', dataToStore.length)
          } else {
            console.log('[SupabaseAdapter] Clients UPSERT 건너뜀 (빈 배열)')
          }
        })
        return
      }

      // Special handling for documents (camelCase → snake_case)
      if (entity === 'documents' && Array.isArray(value)) {
        const documentsArray = value as any[]

        // 빈 배열이어도 DELETE 쿼리는 실행해야 함 (마지막 문서 삭제 시)
        // dataToStore가 빈 배열이면 INSERT를 건너뛰도록 아래에서 처리

        const dataToStore = documentsArray.map((doc: any) => {
          // 디버깅: 원본 document 데이터 구조 확인
          console.log('[SupabaseAdapter] Processing document:', {
            id: doc.id,
            projectId: doc.projectId,
            project_id: doc.project_id,
            title: doc.name || doc.title,
            allKeys: Object.keys(doc)
          })

          // Status 매핑: Document 타입 → Supabase CHECK 제약
          // Document: 'draft' | 'sent' | 'approved' | 'completed' | 'archived'
          // Supabase: 'draft' | 'review' | 'approved' | 'sent' | 'signed' | 'archived'
          const statusMap: Record<string, string> = {
            'completed': 'signed',  // 'completed' → 'signed' 매핑
          }
          const docStatus = doc.status || 'draft'
          const mappedStatus = statusMap[docStatus] || docStatus

          // Type 검증: Supabase CHECK 제약
          const validTypes = ['contract', 'invoice', 'estimate', 'report', 'meeting_note', 'specification', 'proposal', 'other']
          let docType = doc.type || 'other'
          if (!validTypes.includes(docType)) {
            console.warn(`[SupabaseAdapter] Invalid document type "${docType}", converting to "other"`)
            docType = 'other'
          }

          // project_id 처리: projectId 또는 project_id 필드 모두 확인
          const projectIdValue = doc.projectId || doc.project_id || null
          const finalProjectId = this.isValidUUID(projectIdValue) ? projectIdValue : null

          // 디버깅: project_id 변환 결과
          console.log('[SupabaseAdapter] Document project_id mapping:', {
            title: doc.name || doc.title,
            original_projectId: doc.projectId,
            original_project_id: doc.project_id,
            combined: projectIdValue,
            isValid: this.isValidUUID(projectIdValue),
            final: finalProjectId
          })

          return {
            // Identifiers
            id: this.isValidUUID(doc.id) ? doc.id : crypto.randomUUID(),
            user_id: this.userId,
            project_id: finalProjectId,  // 변환된 project_id 사용

            // Basic info (name → title)
            title: doc.name || doc.title,
            description: doc.description || null,
            content: doc.content || null,

            // Type and category (검증된 값)
            type: docType,
            category: doc.category || 'etc',
            status: mappedStatus,

            // File info (camelCase → snake_case)
            file_url: doc.fileUrl || null,
            file_name: doc.fileName || null,
            file_size: doc.size || doc.fileSize || null,
            file_type: doc.fileType || null,

            // Template (camelCase → snake_case)
            template_id: doc.templateId || null,
            template_name: doc.templateName || null,

            // Version control (camelCase → snake_case)
            version: doc.version?.toString() || '1.0',
            parent_document_id: this.isValidUUID(doc.parentDocumentId) ? doc.parentDocumentId : null,
            is_latest: doc.isLatest !== undefined ? doc.isLatest : true,

            // Signature (camelCase → snake_case)
            requires_signature: doc.requiresSignature || false,
            signed_at: doc.signedAt || doc.signatures?.[0]?.signedAt || null,
            signature_url: doc.signatureUrl || null,

            // Metadata (JSONB)
            metadata: doc.metadata || {},
            tags: doc.tags || [],

            // Dates (camelCase → snake_case)
            issued_date: doc.issuedDate || null,
            due_date: doc.dueDate || null,
            expiry_date: doc.expiryDate || null,

            // Timestamps (camelCase → snake_case)
            created_at: doc.createdAt || doc.savedAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })

        await this.withRetry(async () => {
          // 삭제-삽입 전략: LocalStorage와 완전 동기화
          // 1. 기존 documents 모두 삭제
          const { error: deleteError } = await this.supabase
            .from(tableName)
            .delete()
            .eq('user_id', this.userId)

          if (deleteError) {
            console.error('[SupabaseAdapter] Documents delete error:', {
              code: deleteError.code,
              message: deleteError.message,
              details: deleteError.details,
              hint: deleteError.hint
            })
            throw deleteError
          }

          // 2. 새로운 documents 삽입 (배열이 비어있지 않을 때만)
          if (dataToStore.length > 0) {
            const { error: insertError } = await this.supabase
              .from(tableName)
              .insert(dataToStore as any)

            if (insertError) {
              console.error('[SupabaseAdapter] Documents insert error:', {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint
              })
              throw insertError
            }
          }
        })
        return
      }

      // Special handling for todo_sections (camelCase → snake_case)
      if (entity === 'todo_sections' && Array.isArray(value)) {
        const todoSectionsArray = value as any[]

        if (todoSectionsArray.length === 0) {
          console.warn(`No todo_sections found in array`)
          return
        }

        const dataToStore = todoSectionsArray.map((section: any) => ({
          // Identifiers
          id: this.isValidUUID(section.id) ? section.id : crypto.randomUUID(),
          user_id: this.userId,

          // Basic info
          name: section.name,
          order_index: section.orderIndex,
          is_expanded: section.isExpanded,

          // Optional styling
          color: section.color || null,
          icon: section.icon || null,

          // Timestamps (camelCase → snake_case)
          created_at: section.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        await this.withRetry(async () => {
          const query = this.supabase.from(tableName).upsert(dataToStore as any)
          const { error } = await query

          if (error) {
            console.error('[SupabaseAdapter] TodoSections sync error:', {
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

      // Special handling for activity_logs (camelCase → snake_case)
      if (entity === 'activity_logs' && Array.isArray(value)) {
        const activityLogsArray = value as any[]

        console.log('[SupabaseAdapter] Raw activity_logs array:', activityLogsArray)
        console.log('[SupabaseAdapter] First item:', activityLogsArray[0])

        if (activityLogsArray.length === 0) {
          console.warn(`No activity_logs found in array`)
          return
        }

        const dataToStore = activityLogsArray.map((log: any) => {
          console.log('[SupabaseAdapter] Mapping log:', log)
          return {
          // Identifiers
          id: this.isValidUUID(log.id) ? log.id : crypto.randomUUID(),
          user_id: this.userId,

          // Activity info - 데이터베이스 스키마에 맞게 매핑
          action: log.action,                      // action (TEXT)
          resource_type: log.entityType,           // entityType → resource_type
          resource_id: this.isValidUUID(log.entityId) ? log.entityId : null,  // entityId → resource_id (UUID)
          resource_name: log.entityName,           // entityName → resource_name

          // Additional info - metadata JSONB에 모든 추가 정보 저장
          metadata: {
            type: log.type,                        // ActivityType
            userName: log.userName,                // 사용자 이름
            userInitials: log.userInitials,        // 사용자 이니셜
            description: log.description,          // 추가 설명
            changes: log.changes || [],            // 변경 내역
            timestamp: log.timestamp,              // 원본 타임스탬프
            ...(log.metadata || {})                // 기존 메타데이터 병합
          },

          // Status (기본값: success)
          status: 'success',

          // Timestamps (camelCase → snake_case)
          created_at: log.createdAt || new Date().toISOString(),
        }
        })

        // 디버깅: 전송할 데이터 로그
        console.log('[SupabaseAdapter] ActivityLogs data to store (first item):', dataToStore[0])

        await this.withRetry(async () => {
          const query = this.supabase.from(tableName).upsert(dataToStore as any)
          const { error } = await query

          if (error) {
            console.error('[SupabaseAdapter] ActivityLogs sync error:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
              fullError: JSON.stringify(error, null, 2)
            })
            console.error('[SupabaseAdapter] ActivityLogs data being sent (first item):', dataToStore[0])
            throw error
          }
        })
        return
      }

      // Normal handling for other entities (fallback)
      const dataToStore = Array.isArray(value)
        ? value.map((item: any) => ({
            ...item,
            user_id: this.userId,
            updated_at: new Date().toISOString(),
            // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
          }))
        : {
            ...(value as any),
            user_id: this.userId,
            updated_at: new Date().toISOString(),
            // updated_by: this.userId,  // Phase 10.1: 마이그레이션 후 활성화
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
        // Special handling for users table (id = PRIMARY KEY, no user_id column)
        const query = this.supabase
          .from(tableName)
          .delete()
          .eq('id', id)

        // Other tables: add user_id filter
        if (entity !== 'users' && entity !== 'user') {
          query.eq('user_id', this.userId)
        }

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
          // Special handling for users table (id = PRIMARY KEY)
          if (table === 'users') {
            const query = this.supabase.from(table).delete().eq('id', this.userId)
            const { error } = await query

            if (error) {
              throw error
            }
          } else {
            const query = this.supabase.from(table).delete().eq('user_id', this.userId)
            const { error } = await query

            if (error) {
              throw error
            }
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
          // Special handling for users table (id = PRIMARY KEY)
          const query = this.supabase.from(table).select('id')

          if (table === 'users') {
            query.eq('id', this.userId)
          } else {
            query.eq('user_id', this.userId)
          }

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
        // Special handling for users table (id = PRIMARY KEY, no user_id column)
        const query = this.supabase
          .from(tableName)
          .select('id')
          .eq('id', id)

        // Other tables: add user_id filter
        if (entity !== 'users' && entity !== 'user') {
          query.eq('user_id', this.userId)
        }

        query.single()

        return await this.executeQuery(query)
      })

      return data !== null
    } catch (error) {
      console.error(`Error checking key "${key}" in Supabase:`, error)
      return false
    }
  }
}
