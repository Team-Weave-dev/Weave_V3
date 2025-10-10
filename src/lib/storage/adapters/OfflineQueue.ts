/**
 * OfflineQueue
 *
 * 오프라인 상태에서 작업을 큐에 저장하고 온라인 복귀 시 처리하는 시스템
 *
 * 기능:
 * - 오프라인 작업 큐잉 (INSERT/UPDATE/DELETE)
 * - LocalStorage 지속성
 * - 작업 순서 보장 (FIFO)
 * - 중복 작업 제거 (동일 엔티티/ID)
 * - 재시도 메커니즘
 *
 * @example
 * ```typescript
 * const queue = new OfflineQueue({
 *   storageKey: 'offline_queue',
 *   maxSize: 1000,
 *   onQueueChange: (size) => console.log('Queue size:', size)
 * })
 *
 * // 오프라인 작업 추가
 * await queue.enqueue({
 *   type: 'INSERT',
 *   entity: 'projects',
 *   id: 'proj-123',
 *   data: { name: 'New Project' },
 *   timestamp: Date.now()
 * })
 *
 * // 온라인 복귀 시 큐 처리
 * await queue.processAll(async (operation) => {
 *   // Supabase에 작업 전송
 *   await supabase.from(operation.entity).upsert(operation.data)
 * })
 * ```
 */

import { StorageError } from '../types/base'

// =========================================================
// 타입 정의
// =========================================================

/**
 * 큐에 저장되는 작업 타입
 */
export type QueueOperationType = 'INSERT' | 'UPDATE' | 'DELETE'

/**
 * 큐 작업 인터페이스
 */
export interface QueueOperation {
  /** 작업 ID (고유 식별자) */
  operationId: string
  /** 작업 타입 */
  type: QueueOperationType
  /** 엔티티 이름 (예: 'projects', 'tasks') */
  entity: string
  /** 레코드 ID */
  id: string
  /** 작업 데이터 (DELETE의 경우 null) */
  data: any | null
  /** 작업 생성 시각 (타임스탬프) */
  timestamp: number
  /** 재시도 횟수 */
  retryCount?: number
  /** 에러 메시지 (실패 시) */
  error?: string
}

/**
 * OfflineQueue 설정
 */
export interface OfflineQueueConfig {
  /** LocalStorage 저장 키 */
  storageKey?: string
  /** 큐 최대 크기 (기본: 1000) */
  maxSize?: number
  /** 최대 재시도 횟수 (기본: 3) */
  maxRetries?: number
  /** 큐 변경 콜백 */
  onQueueChange?: (size: number) => void
  /** 에러 핸들러 */
  onError?: (error: Error, operation?: QueueOperation) => void
}

// =========================================================
// OfflineQueue 클래스
// =========================================================

export class OfflineQueue {
  private queue: QueueOperation[] = []
  private storageKey: string
  private maxSize: number
  private maxRetries: number
  private onQueueChange?: (size: number) => void
  private onError?: (error: Error, operation?: QueueOperation) => void
  private isProcessing = false

  constructor(config: OfflineQueueConfig = {}) {
    this.storageKey = config.storageKey || 'weave_offline_queue'
    this.maxSize = config.maxSize || 1000
    this.maxRetries = config.maxRetries || 3
    this.onQueueChange = config.onQueueChange
    this.onError = config.onError

    // LocalStorage에서 기존 큐 로드
    this.loadFromStorage()

    console.log('[OfflineQueue] Initialized with', {
      storageKey: this.storageKey,
      maxSize: this.maxSize,
      queueSize: this.queue.length,
    })
  }

  // =========================================================
  // Phase 5.1: 큐 기본 연산
  // =========================================================

  /**
   * 작업을 큐에 추가
   * @param operation - 추가할 작업
   */
  async enqueue(
    operation: Omit<QueueOperation, 'operationId' | 'retryCount'>
  ): Promise<void> {
    try {
      // 큐 크기 제한 확인
      if (this.queue.length >= this.maxSize) {
        throw new StorageError(
          `Queue is full (max: ${this.maxSize})`,
          'ADAPTER_ERROR',
          { severity: 'high' }
        )
      }

      // 작업 ID 생성
      const operationId = this.generateOperationId()

      // 중복 작업 제거 (동일 엔티티/ID의 작업)
      this.removeDuplicates(operation.entity, operation.id)

      // 큐에 추가
      const queueOperation: QueueOperation = {
        ...operation,
        operationId,
        retryCount: 0,
      }

      this.queue.push(queueOperation)

      console.log(`[OfflineQueue] Enqueued ${operation.type} ${operation.entity}:${operation.id}`)

      // LocalStorage에 저장
      await this.saveToStorage()

      // 큐 변경 콜백 호출
      this.onQueueChange?.(this.queue.length)
    } catch (error) {
      this.handleError(error, 'Failed to enqueue operation')
      throw error
    }
  }

  /**
   * 큐에서 다음 작업 가져오기 (제거하지 않음)
   * @returns 다음 작업 또는 null
   */
  peek(): QueueOperation | null {
    return this.queue.length > 0 ? this.queue[0] : null
  }

  /**
   * 큐에서 작업 제거
   * @param operationId - 제거할 작업 ID
   */
  async dequeue(operationId: string): Promise<void> {
    try {
      const index = this.queue.findIndex(op => op.operationId === operationId)

      if (index === -1) {
        console.warn(`[OfflineQueue] Operation ${operationId} not found in queue`)
        return
      }

      const operation = this.queue[index]
      this.queue.splice(index, 1)

      console.log(
        `[OfflineQueue] Dequeued ${operation.type} ${operation.entity}:${operation.id}`
      )

      // LocalStorage에 저장
      await this.saveToStorage()

      // 큐 변경 콜백 호출
      this.onQueueChange?.(this.queue.length)
    } catch (error) {
      this.handleError(error, 'Failed to dequeue operation')
      throw error
    }
  }

  /**
   * 큐 비우기
   */
  async clear(): Promise<void> {
    try {
      this.queue = []

      console.log('[OfflineQueue] Queue cleared')

      // LocalStorage에 저장
      await this.saveToStorage()

      // 큐 변경 콜백 호출
      this.onQueueChange?.(0)
    } catch (error) {
      this.handleError(error, 'Failed to clear queue')
      throw error
    }
  }

  /**
   * 큐 크기 조회
   * @returns 큐에 있는 작업 개수
   */
  size(): number {
    return this.queue.length
  }

  /**
   * 큐가 비어있는지 확인
   * @returns 큐가 비어있으면 true
   */
  isEmpty(): boolean {
    return this.queue.length === 0
  }

  /**
   * 큐의 모든 작업 조회
   * @returns 큐 작업 배열 (복사본)
   */
  getAll(): QueueOperation[] {
    return [...this.queue]
  }

  // =========================================================
  // Phase 5.4: 큐 처리 로직
  // =========================================================

  /**
   * 큐의 모든 작업 처리
   * @param processor - 작업 처리 함수
   * @returns 처리된 작업 수
   */
  async processAll(
    processor: (operation: QueueOperation) => Promise<void>
  ): Promise<number> {
    if (this.isProcessing) {
      console.warn('[OfflineQueue] Already processing queue')
      return 0
    }

    this.isProcessing = true
    let processedCount = 0

    try {
      console.log(`[OfflineQueue] Processing ${this.queue.length} operations...`)

      // 큐가 빌 때까지 처리
      while (this.queue.length > 0) {
        const operation = this.queue[0]

        try {
          // 작업 처리
          await processor(operation)

          // 성공 시 큐에서 제거
          await this.dequeue(operation.operationId)
          processedCount++

          console.log(
            `[OfflineQueue] Processed ${operation.type} ${operation.entity}:${operation.id}`
          )
        } catch (error) {
          // 실패 시 재시도 횟수 증가
          operation.retryCount = (operation.retryCount || 0) + 1
          operation.error = error instanceof Error ? error.message : String(error)

          console.error(
            `[OfflineQueue] Failed to process ${operation.type} ${operation.entity}:${operation.id}`,
            error
          )

          // 최대 재시도 횟수 초과 시 큐에서 제거
          if (operation.retryCount >= this.maxRetries) {
            console.error(
              `[OfflineQueue] Max retries exceeded for ${operation.operationId}, removing from queue`
            )

            await this.dequeue(operation.operationId)
            this.onError?.(
              new Error(`Max retries exceeded: ${operation.error}`),
              operation
            )
          } else {
            // 재시도 가능하면 큐 끝으로 이동
            this.queue.shift()
            this.queue.push(operation)

            await this.saveToStorage()

            console.log(
              `[OfflineQueue] Retry ${operation.retryCount}/${this.maxRetries} for ${operation.operationId}`
            )
          }
        }
      }

      console.log(`[OfflineQueue] Processing complete: ${processedCount} operations processed`)

      return processedCount
    } catch (error) {
      this.handleError(error, 'Failed to process queue')
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  // =========================================================
  // Phase 5.1: LocalStorage 지속성
  // =========================================================

  /**
   * LocalStorage에서 큐 로드
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)

      if (stored) {
        const parsed = JSON.parse(stored)

        if (Array.isArray(parsed)) {
          this.queue = parsed
          console.log(`[OfflineQueue] Loaded ${this.queue.length} operations from storage`)
        }
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load from storage:', error)
      this.queue = []
    }
  }

  /**
   * LocalStorage에 큐 저장
   */
  private async saveToStorage(): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
    } catch (error) {
      this.handleError(error, 'Failed to save queue to storage')
      throw error
    }
  }

  // =========================================================
  // 유틸리티 메서드
  // =========================================================

  /**
   * 작업 ID 생성
   * @returns 고유 작업 ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 중복 작업 제거
   * @param entity - 엔티티 이름
   * @param id - 레코드 ID
   */
  private removeDuplicates(entity: string, id: string): void {
    const duplicates = this.queue.filter(
      op => op.entity === entity && op.id === id
    )

    if (duplicates.length > 0) {
      console.log(
        `[OfflineQueue] Removing ${duplicates.length} duplicate operations for ${entity}:${id}`
      )

      this.queue = this.queue.filter(
        op => !(op.entity === entity && op.id === id)
      )
    }
  }

  /**
   * 에러 처리
   * @param error - 에러 객체
   * @param message - 에러 메시지
   * @param operation - 관련 작업 (선택)
   */
  private handleError(error: unknown, message: string, operation?: QueueOperation): void {
    const errorObj =
      error instanceof Error ? error : new Error(message + ': ' + String(error))

    console.error(`[OfflineQueue] ${message}:`, errorObj)

    this.onError?.(errorObj, operation)
  }
}
