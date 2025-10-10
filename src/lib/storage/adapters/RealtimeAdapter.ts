/**
 * RealtimeAdapter
 *
 * Supabase Realtime을 사용하여 실시간 동기화를 제공하는 어댑터
 *
 * 기능:
 * - Realtime 채널 구독 (7개 테이블)
 * - INSERT/UPDATE/DELETE 이벤트 핸들링
 * - LocalStorage 자동 업데이트
 * - WebSocket 연결 상태 모니터링
 * - 재연결 로직
 *
 * @example
 * ```typescript
 * const realtimeAdapter = new RealtimeAdapter({
 *   supabase,
 *   userId: 'user-123',
 *   localAdapter,
 *   onConnectionChange: (status) => console.log('Connection:', status),
 *   onError: (error) => console.error('Realtime error:', error)
 * })
 *
 * // 모든 테이블 구독 시작
 * await realtimeAdapter.subscribeAll()
 *
 * // 연결 상태 확인
 * const status = realtimeAdapter.getConnectionStatus()
 *
 * // 구독 해제
 * await realtimeAdapter.unsubscribeAll()
 * ```
 */

import type {
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import type { StorageAdapter } from '../types/base'
import { StorageError } from '../types/base'

// =========================================================
// 타입 정의
// =========================================================

/**
 * Realtime 이벤트 타입
 */
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

/**
 * 연결 상태
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * 엔티티-테이블 매핑
 */
const ENTITY_TABLE_MAP: Record<string, string> = {
  projects: 'projects',
  tasks: 'tasks',
  events: 'calendar_events',
  clients: 'clients',
  documents: 'documents',
  settings: 'user_settings',
  user: 'users',
}

/**
 * RealtimeAdapter 설정
 */
export interface RealtimeAdapterConfig {
  /** Supabase 클라이언트 */
  supabase: SupabaseClient
  /** 사용자 ID (필터링용) */
  userId: string
  /** LocalStorage 업데이트를 위한 어댑터 */
  localAdapter: StorageAdapter
  /** 연결 상태 변경 콜백 */
  onConnectionChange?: (status: ConnectionStatus) => void
  /** 에러 핸들러 */
  onError?: (error: Error) => void
}

// =========================================================
// RealtimeAdapter 클래스
// =========================================================

export class RealtimeAdapter {
  private supabase: SupabaseClient
  private userId: string
  private localAdapter: StorageAdapter
  private channels: Map<string, RealtimeChannel> = new Map()
  private connectionStatus: ConnectionStatus = 'disconnected'
  private onConnectionChange?: (status: ConnectionStatus) => void
  private onError?: (error: Error) => void

  constructor(config: RealtimeAdapterConfig) {
    this.supabase = config.supabase
    this.userId = config.userId
    this.localAdapter = config.localAdapter
    this.onConnectionChange = config.onConnectionChange
    this.onError = config.onError

    console.log('[RealtimeAdapter] Initialized for user:', this.userId)
  }

  // =========================================================
  // Phase 4.2: 채널 구독 관리
  // =========================================================

  /**
   * 모든 엔티티의 Realtime 채널 구독 시작
   */
  async subscribeAll(): Promise<void> {
    console.log('[RealtimeAdapter] Subscribing to all channels...')

    this.setConnectionStatus('connecting')

    try {
      const entities = Object.keys(ENTITY_TABLE_MAP)

      for (const entity of entities) {
        await this.subscribe(entity)
      }

      this.setConnectionStatus('connected')
      console.log('[RealtimeAdapter] All channels subscribed successfully')
    } catch (error) {
      this.setConnectionStatus('error')
      this.handleError(error, 'Failed to subscribe to all channels')
      throw error
    }
  }

  /**
   * 특정 엔티티의 Realtime 채널 구독
   * @param entity - 엔티티 이름 (예: 'projects')
   */
  private async subscribe(entity: string): Promise<void> {
    const tableName = ENTITY_TABLE_MAP[entity]

    if (!tableName) {
      throw new StorageError(
        `Unknown entity: ${entity}`,
        'ADAPTER_ERROR',
        { severity: 'medium' }
      )
    }

    // 기존 채널 정리
    const existingChannel = this.channels.get(entity)
    if (existingChannel) {
      await this.supabase.removeChannel(existingChannel)
    }

    console.log(`[RealtimeAdapter] Subscribing to ${entity} (table: ${tableName})`)

    // 채널 이름 생성 (사용자별 고유)
    const channelName = `${entity}_changes_${this.userId}`

    // Realtime 채널 생성 및 이벤트 리스너 등록
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 수신
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${this.userId}`, // 사용자별 필터링
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // 이벤트 타입별 핸들러 호출
          if (payload.eventType === 'INSERT') {
            this.handleInsert(payload).catch(error => {
              this.handleError(error, `INSERT event handler failed for ${entity}`)
            })
          } else if (payload.eventType === 'UPDATE') {
            this.handleUpdate(payload).catch(error => {
              this.handleError(error, `UPDATE event handler failed for ${entity}`)
            })
          } else if (payload.eventType === 'DELETE') {
            this.handleDelete(payload).catch(error => {
              this.handleError(error, `DELETE event handler failed for ${entity}`)
            })
          }
        }
      )
      .subscribe(status => {
        console.log(`[RealtimeAdapter] Channel ${entity} subscription status:`, status)

        // 구독 실패 시 에러 상태 설정
        if (status === 'CHANNEL_ERROR') {
          this.setConnectionStatus('error')
        } else if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeAdapter] Successfully subscribed to ${entity}`)
        }
      })

    // 채널 Map에 저장
    this.channels.set(entity, channel)
  }

  /**
   * 모든 채널 구독 해제
   */
  async unsubscribeAll(): Promise<void> {
    console.log('[RealtimeAdapter] Unsubscribing from all channels...')

    try {
      for (const [entity, channel] of this.channels.entries()) {
        await this.supabase.removeChannel(channel)
        console.log(`[RealtimeAdapter] Unsubscribed from ${entity}`)
      }

      this.channels.clear()
      this.setConnectionStatus('disconnected')
      console.log('[RealtimeAdapter] All channels unsubscribed')
    } catch (error) {
      this.handleError(error, 'Failed to unsubscribe from all channels')
      throw error
    }
  }

  // =========================================================
  // Phase 4.3: 이벤트 핸들러
  // =========================================================

  /**
   * INSERT 이벤트 핸들러
   * @param payload - Realtime 이벤트 페이로드
   */
  private async handleInsert(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    try {
      const entity = this.getEntityFromTable(payload.table)
      const newRecord = payload.new

      console.log(`[RealtimeAdapter] INSERT: ${entity}`, newRecord)

      if (!newRecord || typeof newRecord !== 'object' || !('id' in newRecord)) {
        console.warn(`[RealtimeAdapter] INSERT event missing id for ${entity}`)
        return
      }

      // LocalStorage 업데이트 (새 레코드 추가)
      await this.updateLocalStorage(entity, (newRecord as any).id, newRecord)
    } catch (error) {
      this.handleError(error, 'Failed to handle INSERT event')
      throw error
    }
  }

  /**
   * UPDATE 이벤트 핸들러
   * @param payload - Realtime 이벤트 페이로드
   */
  private async handleUpdate(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    try {
      const entity = this.getEntityFromTable(payload.table)
      const updatedRecord = payload.new

      console.log(`[RealtimeAdapter] UPDATE: ${entity}`, updatedRecord)

      if (!updatedRecord || typeof updatedRecord !== 'object' || !('id' in updatedRecord)) {
        console.warn(`[RealtimeAdapter] UPDATE event missing id for ${entity}`)
        return
      }

      // LocalStorage 업데이트 (기존 레코드 수정)
      await this.updateLocalStorage(entity, (updatedRecord as any).id, updatedRecord)
    } catch (error) {
      this.handleError(error, 'Failed to handle UPDATE event')
      throw error
    }
  }

  /**
   * DELETE 이벤트 핸들러
   * @param payload - Realtime 이벤트 페이로드
   */
  private async handleDelete(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    try {
      const entity = this.getEntityFromTable(payload.table)
      const deletedRecord = payload.old

      console.log(`[RealtimeAdapter] DELETE: ${entity}`, deletedRecord)

      if (!deletedRecord || typeof deletedRecord !== 'object' || !('id' in deletedRecord)) {
        console.warn(`[RealtimeAdapter] DELETE event missing id for ${entity}`)
        return
      }

      // LocalStorage 업데이트 (레코드 삭제)
      await this.updateLocalStorage(entity, (deletedRecord as any).id, null)
    } catch (error) {
      this.handleError(error, 'Failed to handle DELETE event')
      throw error
    }
  }

  // =========================================================
  // Phase 4.4: LocalStorage 동기화
  // =========================================================

  /**
   * LocalStorage에 변경사항 반영
   * @param entity - 엔티티 이름
   * @param id - 레코드 ID
   * @param data - 업데이트할 데이터 (null이면 삭제)
   */
  private async updateLocalStorage(
    entity: string,
    id: string,
    data: any | null
  ): Promise<void> {
    try {
      console.log(`[RealtimeAdapter] Updating LocalStorage: ${entity}:${id}`)

      // 1. 현재 배열 조회
      const currentArray = (await this.localAdapter.get(entity)) || []

      if (!Array.isArray(currentArray)) {
        throw new Error(`LocalStorage data for ${entity} is not an array`)
      }

      let updatedArray: any[]

      if (data === null) {
        // 2. 삭제: ID와 일치하는 레코드 제거
        updatedArray = currentArray.filter((item: any) => item.id !== id)
        console.log(`[RealtimeAdapter] Deleted ${entity}:${id} from LocalStorage`)
      } else {
        // 3. 추가/수정: ID로 기존 레코드 찾기
        const existingIndex = currentArray.findIndex((item: any) => item.id === id)

        if (existingIndex >= 0) {
          // 수정: 기존 레코드 교체
          updatedArray = [...currentArray]
          updatedArray[existingIndex] = data
          console.log(`[RealtimeAdapter] Updated ${entity}:${id} in LocalStorage`)
        } else {
          // 추가: 새 레코드 추가
          updatedArray = [...currentArray, data]
          console.log(`[RealtimeAdapter] Added ${entity}:${id} to LocalStorage`)
        }
      }

      // 4. LocalStorage 저장
      await this.localAdapter.set(entity, updatedArray)

      console.log(`[RealtimeAdapter] LocalStorage update complete for ${entity}:${id}`)
    } catch (error) {
      this.handleError(error, `Failed to update LocalStorage for ${entity}:${id}`)
      throw error
    }
  }

  // =========================================================
  // Phase 4.5: 연결 상태 모니터링
  // =========================================================

  /**
   * 연결 상태 업데이트
   * @param status - 새로운 연결 상태
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus === status) return

    this.connectionStatus = status
    console.log(`[RealtimeAdapter] Connection status changed: ${status}`)

    this.onConnectionChange?.(status)
  }

  /**
   * 현재 연결 상태 조회
   * @returns 현재 연결 상태
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  // =========================================================
  // Phase 4.6: 재연결 로직
  // =========================================================

  /**
   * 재연결 시도
   */
  async reconnect(): Promise<void> {
    console.log('[RealtimeAdapter] Attempting to reconnect...')

    try {
      // 기존 채널 정리
      await this.unsubscribeAll()

      // 재구독
      await this.subscribeAll()

      console.log('[RealtimeAdapter] Reconnected successfully')
    } catch (error) {
      this.handleError(error, 'Reconnection failed')
      throw error
    }
  }

  // =========================================================
  // 유틸리티 메서드
  // =========================================================

  /**
   * 에러 처리
   * @param error - 에러 객체
   * @param message - 에러 메시지
   */
  private handleError(error: unknown, message: string): void {
    const errorObj =
      error instanceof Error ? error : new Error(message + ': ' + String(error))

    console.error(`[RealtimeAdapter] ${message}:`, errorObj)

    this.onError?.(errorObj)
  }

  /**
   * 엔티티 이름에서 테이블 이름 조회
   * @param entity - 엔티티 이름
   * @returns 테이블 이름
   */
  private getTableName(entity: string): string {
    const tableName = ENTITY_TABLE_MAP[entity]

    if (!tableName) {
      throw new StorageError(
        `Unknown entity: ${entity}`,
        'ADAPTER_ERROR',
        { severity: 'medium' }
      )
    }

    return tableName
  }

  /**
   * 테이블 이름에서 엔티티 이름 조회 (역방향)
   * @param table - 테이블 이름
   * @returns 엔티티 이름
   */
  private getEntityFromTable(table: string): string {
    // ENTITY_TABLE_MAP의 역방향 조회
    for (const [entity, tableName] of Object.entries(ENTITY_TABLE_MAP)) {
      if (tableName === table) {
        return entity
      }
    }

    throw new StorageError(
      `Unknown table: ${table}`,
      'ADAPTER_ERROR',
      { severity: 'medium' }
    )
  }
}
