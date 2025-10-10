/**
 * BidirectionalSyncAdapter - 양방향 동기화 어댑터
 *
 * LocalStorage와 Supabase 간 양방향 동기화를 제공합니다.
 * - Supabase → LocalStorage (Pull)
 * - LocalStorage → Supabase (Push)
 * - 주기적 자동 동기화 (기본 10초)
 * - TimestampSyncAdapter 기반 충돌 해결
 *
 * @example
 * ```typescript
 * const syncAdapter = new BidirectionalSyncAdapter({
 *   localAdapter: new LocalStorageAdapter(),
 *   supabaseAdapter: new SupabaseAdapter({ userId: 'user-123' }),
 *   syncInterval: 10000,
 *   enableAutoSync: true
 * })
 *
 * // 수동 동기화
 * await syncAdapter.sync()
 *
 * // 상태 조회
 * const status = syncAdapter.getSyncStatus()
 * console.log(`Last sync: ${new Date(status.lastSyncAt)}`)
 * ```
 */

import type { StorageAdapter, JsonValue } from '../types/base'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { SupabaseAdapter } from './SupabaseAdapter'
import { TimestampSyncAdapter } from './TimestampSyncAdapter'
import { StorageError } from '../types/base'
import { OfflineQueue, type QueueOperation } from './OfflineQueue'

/**
 * 동기화 상태 정보
 */
export interface SyncStatus {
  /** 마지막 동기화 시각 (Unix timestamp) */
  lastSyncAt: number | null
  /** 동기화 진행 중 여부 */
  isRunning: boolean
  /** 대기 중인 변경사항 수 */
  pendingChanges: number
  /** 동기화 에러 목록 */
  errors: SyncError[]
  /** 성공한 동기화 횟수 */
  successCount: number
  /** 실패한 동기화 횟수 */
  failureCount: number
  /** 온라인 상태 (Phase 5.2) */
  isOnline: boolean
  /** 오프라인 큐 크기 (Phase 5.2) */
  offlineQueueSize: number
}

/**
 * 동기화 에러 정보
 */
export interface SyncError {
  /** 에러 발생 시각 */
  timestamp: number
  /** 에러 메시지 */
  message: string
  /** 에러 발생 키 */
  key?: string
  /** 동기화 방향 */
  direction: 'pull' | 'push'
  /** 재시도 횟수 */
  retryCount: number
}

/**
 * BidirectionalSyncAdapter 생성 옵션
 */
export interface BidirectionalSyncOptions {
  /** LocalStorage 어댑터 */
  localAdapter: LocalStorageAdapter
  /** Supabase 어댑터 */
  supabaseAdapter: SupabaseAdapter
  /** 동기화 주기 (밀리초, 기본 10000) */
  syncInterval?: number
  /** 자동 동기화 활성화 여부 (기본 true) */
  enableAutoSync?: boolean
  /** 최대 재시도 횟수 (기본 3) */
  maxRetries?: number
  /** 재시도 지연 시간 (밀리초, 기본 1000) */
  retryDelay?: number
}

/**
 * 양방향 동기화 어댑터
 *
 * LocalStorage와 Supabase 간 양방향 동기화를 담당합니다.
 * TimestampSyncAdapter를 활용하여 충돌을 해결합니다.
 */
export class BidirectionalSyncAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter
  private timestampSync: TimestampSyncAdapter

  private syncInterval: number
  private enableAutoSync: boolean
  private maxRetries: number
  private retryDelay: number

  private syncWorkerInterval: ReturnType<typeof setInterval> | null = null
  private syncStatus: SyncStatus = {
    lastSyncAt: null,
    isRunning: false,
    pendingChanges: 0,
    errors: [],
    successCount: 0,
    failureCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    offlineQueueSize: 0,
  }

  // 동기화 대기 큐 (키 → 값 맵)
  private pendingQueue = new Map<string, JsonValue>()

  // Phase 5: Offline 큐 및 온라인 상태 관리
  private offlineQueue: OfflineQueue
  private onlineHandler: () => void
  private offlineHandler: () => void

  constructor(options: BidirectionalSyncOptions) {
    this.local = options.localAdapter
    this.supabase = options.supabaseAdapter

    // TimestampSyncAdapter 인스턴스 생성
    // 충돌 해결용 (resolveConflict 메서드 사용)
    this.timestampSync = new TimestampSyncAdapter()

    this.syncInterval = options.syncInterval ?? 10000 // 기본 10초
    this.enableAutoSync = options.enableAutoSync ?? true
    this.maxRetries = options.maxRetries ?? 3
    this.retryDelay = options.retryDelay ?? 1000

    // Phase 5.1: OfflineQueue 초기화
    this.offlineQueue = new OfflineQueue({
      storageKey: 'weave_offline_queue',
      maxSize: 1000,
      maxRetries: this.maxRetries,
      onQueueChange: (size) => {
        this.syncStatus.offlineQueueSize = size
        console.log(`[BidirectionalSyncAdapter] Offline queue size: ${size}`)
      },
      onError: (error, operation) => {
        console.error('[BidirectionalSyncAdapter] Offline queue error:', error, operation)
      },
    })

    // Phase 5.2: 온라인/오프라인 이벤트 리스너 등록
    this.onlineHandler = () => this.handleOnline()
    this.offlineHandler = () => this.handleOffline()

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)
      console.log('[BidirectionalSyncAdapter] Online/offline event listeners registered')
    }

    // 자동 동기화 시작
    if (this.enableAutoSync) {
      this.startSyncWorker()
    }
  }

  // ==========================================
  // StorageAdapter 인터페이스 구현
  // ==========================================

  /**
   * 데이터 조회 (LocalStorage 우선)
   */
  async get<T extends JsonValue>(
    key: string,
    typeGuard?: (data: unknown) => data is T
  ): Promise<T | null> {
    try {
      // LocalStorage를 단일 진실 공급원으로 사용
      return await this.local.get<T>(key, typeGuard)
    } catch (error) {
      throw new StorageError(
        `Failed to get key "${key}" from BidirectionalSyncAdapter`,
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
   * 데이터 저장 (LocalStorage 즉시 + Supabase 백그라운드)
   *
   * Phase 5.3: 오프라인 모드 지원
   * - 온라인: LocalStorage + Supabase 동기화
   * - 오프라인: LocalStorage + OfflineQueue에 추가
   */
  async set<T extends JsonValue>(key: string, value: T): Promise<void> {
    try {
      // 1. LocalStorage에 즉시 저장 (온라인/오프라인 상관없이 항상)
      await this.local.set(key, value)

      // 2. 온라인 상태 확인
      if (this.syncStatus.isOnline) {
        // 온라인: 동기화 큐에 추가
        this.pendingQueue.set(key, value)
        this.syncStatus.pendingChanges = this.pendingQueue.size

        // Supabase 동기화 시도 (비차단)
        this.pushToSupabase(key, value).catch(error => {
          this.addSyncError({
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : String(error),
            key,
            direction: 'push',
            retryCount: 0,
          })
        })
      } else {
        // 오프라인: OfflineQueue에 추가
        console.log(`[BidirectionalSyncAdapter] Offline mode: Adding ${key} to offline queue`)

        await this.offlineQueue.enqueue({
          type: 'UPDATE', // set은 UPDATE로 간주
          entity: key,
          id: key, // 엔티티 키를 ID로 사용
          data: value,
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      throw new StorageError(
        `Failed to set key "${key}" in BidirectionalSyncAdapter`,
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
   * 데이터 삭제 (양쪽에서 모두 삭제)
   */
  async remove(key: string): Promise<void> {
    try {
      // LocalStorage에서 즉시 삭제
      await this.local.remove(key)

      // 큐에서 제거
      this.pendingQueue.delete(key)
      this.syncStatus.pendingChanges = this.pendingQueue.size

      // Supabase에서 삭제 시도 (에러 무시)
      await this.supabase.remove(key).catch(error => {
        console.warn(`Failed to remove key "${key}" from Supabase:`, error)
      })
    } catch (error) {
      throw new StorageError(
        `Failed to remove key "${key}" from BidirectionalSyncAdapter`,
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
   * 모든 데이터 삭제
   */
  async clear(): Promise<void> {
    try {
      // LocalStorage 클리어
      await this.local.clear()

      // 큐 클리어
      this.pendingQueue.clear()
      this.syncStatus.pendingChanges = 0

      // Supabase 클리어 시도 (에러 무시)
      await this.supabase.clear().catch(error => {
        console.warn('Failed to clear Supabase:', error)
      })
    } catch (error) {
      throw new StorageError('Failed to clear BidirectionalSyncAdapter', 'CLEAR_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      })
    }
  }

  /**
   * 모든 키 조회
   */
  async keys(): Promise<string[]> {
    try {
      return await this.local.keys()
    } catch (error) {
      throw new StorageError('Failed to get keys from BidirectionalSyncAdapter', 'ADAPTER_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'medium',
      })
    }
  }

  /**
   * 키 존재 여부 확인
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      return await this.local.hasKey(key)
    } catch (error) {
      console.error(`Error checking key "${key}" in BidirectionalSyncAdapter:`, error)
      return false
    }
  }

  // ==========================================
  // 동기화 메서드 (Phase 3.2-3.3에서 구현 예정)
  // ==========================================

  /**
   * Supabase → LocalStorage 동기화 (Pull)
   *
   * Supabase에서 모든 데이터를 가져와 LocalStorage와 비교하고,
   * TimestampSyncAdapter를 사용하여 충돌을 해결한 후 LocalStorage를 업데이트합니다.
   *
   * Phase 3.2 구현 완료
   */
  async pullFromSupabase(): Promise<void> {
    try {
      console.log('[BidirectionalSyncAdapter] Starting pull from Supabase...')

      // 동기화할 엔티티 키 목록
      const entityKeys = [
        'users',
        'projects',
        'tasks',
        'events',
        'clients',
        'documents',
        'settings',
      ]

      let updatedCount = 0
      let conflictCount = 0

      // 각 엔티티에 대해 동기화 수행
      for (const entityKey of entityKeys) {
        try {
          // 1. Supabase에서 데이터 가져오기
          const remoteData = await this.supabase.get<JsonValue>(entityKey)

          // 2. LocalStorage에서 데이터 가져오기
          const localData = await this.local.get<JsonValue>(entityKey)

          // 3. 데이터가 배열인 경우 (users, projects, tasks 등)
          if (Array.isArray(remoteData) || Array.isArray(localData)) {
            const remoteArray = (remoteData as any[]) || []
            const localArray = (localData as any[]) || []

            // ID로 매핑 (충돌 해결을 위해)
            const remoteMap = new Map(remoteArray.map((item: any) => [item.id, item]))
            const localMap = new Map(localArray.map((item: any) => [item.id, item]))

            // 모든 ID 수집 (local + remote)
            const allIds = new Set([...remoteMap.keys(), ...localMap.keys()])

            const mergedArray: any[] = []

            // 각 ID에 대해 충돌 해결
            for (const id of allIds) {
              const remoteItem = remoteMap.get(id)
              const localItem = localMap.get(id)

              // TimestampSyncAdapter로 충돌 해결
              const resolution = this.timestampSync.resolveConflict(
                localItem || null,
                remoteItem || null,
                entityKey
              )

              if (resolution.resolved) {
                mergedArray.push(resolution.resolved)

                // 충돌 발생 시 카운트
                if (resolution.winner === 'remote' && localItem) {
                  conflictCount++
                  updatedCount++
                }
              }
            }

            // LocalStorage 업데이트 (변경사항이 있는 경우만)
            if (mergedArray.length > 0 || localArray.length > 0) {
              await this.local.set(entityKey, mergedArray)
            }
          }
          // 4. 단일 객체인 경우 (settings)
          else if (
            (remoteData && typeof remoteData === 'object') ||
            (localData && typeof localData === 'object')
          ) {
            // 단일 객체도 TimestampSyncAdapter로 충돌 해결 가능
            // (updated_at, updated_by 필드가 있는 경우)
            const resolution = this.timestampSync.resolveConflict(
              localData as any,
              remoteData as any,
              entityKey
            )

            if (resolution.resolved && resolution.winner === 'remote') {
              await this.local.set(entityKey, resolution.resolved)
              updatedCount++
            }
          }
          // 5. remoteData만 존재하는 경우 (신규 데이터)
          else if (remoteData && !localData) {
            await this.local.set(entityKey, remoteData)
            updatedCount++
          }
        } catch (error) {
          // 개별 엔티티 동기화 실패 시 에러 로깅 후 계속 진행
          this.addSyncError({
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : String(error),
            key: entityKey,
            direction: 'pull',
            retryCount: 0,
          })

          console.warn(
            `[BidirectionalSyncAdapter] Failed to sync entity "${entityKey}":`,
            error
          )
        }
      }

      console.log(
        `[BidirectionalSyncAdapter] Pull completed: ${updatedCount} updates, ${conflictCount} conflicts resolved`
      )
    } catch (error) {
      // 전체 동기화 실패 시 에러 throw
      throw new StorageError(
        'Failed to pull from Supabase',
        'ADAPTER_ERROR',
        {
          cause: error instanceof Error ? error : new Error(String(error)),
          severity: 'high',
        }
      )
    }
  }

  /**
   * LocalStorage → Supabase 동기화 (Push)
   *
   * LocalStorage의 데이터를 Supabase로 동기화합니다.
   * key가 제공되면 해당 키만, 없으면 pendingQueue 전체를 동기화합니다.
   *
   * Phase 3.3 구현 완료
   *
   * @param key - 동기화할 키 (생략 시 대기 큐 전체)
   * @param value - 동기화할 값
   */
  async pushToSupabase(key?: string, value?: JsonValue): Promise<void> {
    try {
      console.log('[BidirectionalSyncAdapter] Starting push to Supabase...')

      let syncedCount = 0
      let errorCount = 0

      // 1. 특정 키가 제공된 경우 (단일 키 동기화)
      if (key) {
        try {
          const dataToSync = value ?? (await this.local.get<JsonValue>(key))

          if (dataToSync !== null) {
            // Supabase에 저장
            await this.supabase.set(key, dataToSync)

            // 성공 시 큐에서 제거
            this.pendingQueue.delete(key)
            this.syncStatus.pendingChanges = this.pendingQueue.size
            syncedCount++
          }
        } catch (error) {
          // 개별 키 동기화 실패 시 에러 로깅
          this.addSyncError({
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : String(error),
            key,
            direction: 'push',
            retryCount: 0,
          })
          errorCount++
          console.warn(`[BidirectionalSyncAdapter] Failed to push key "${key}":`, error)
        }
      }
      // 2. 키가 없으면 대기 큐 전체 동기화
      else {
        const queueEntries = Array.from(this.pendingQueue.entries())

        console.log(
          `[BidirectionalSyncAdapter] Processing ${queueEntries.length} pending items...`
        )

        for (const [queueKey, queueValue] of queueEntries) {
          try {
            // LocalStorage에서 최신 데이터 읽기 (변경되었을 수 있음)
            const currentData = await this.local.get<JsonValue>(queueKey)

            if (currentData !== null) {
              // Supabase에 저장
              await this.supabase.set(queueKey, currentData)

              // 성공 시 큐에서 제거
              this.pendingQueue.delete(queueKey)
              syncedCount++
            } else {
              // LocalStorage에 데이터 없음 → 큐에서도 제거
              this.pendingQueue.delete(queueKey)
            }
          } catch (error) {
            // 재시도 가능한 에러인 경우 큐에 유지
            const currentRetry = this.getSyncErrorRetryCount(queueKey)

            if (currentRetry < this.maxRetries) {
              // 재시도 횟수 증가
              this.addSyncError({
                timestamp: Date.now(),
                message: error instanceof Error ? error.message : String(error),
                key: queueKey,
                direction: 'push',
                retryCount: currentRetry + 1,
              })
              errorCount++
            } else {
              // 최대 재시도 초과 → 큐에서 제거
              this.pendingQueue.delete(queueKey)
              this.addSyncError({
                timestamp: Date.now(),
                message: `Max retries exceeded: ${error instanceof Error ? error.message : String(error)}`,
                key: queueKey,
                direction: 'push',
                retryCount: currentRetry,
              })
              errorCount++
            }

            console.warn(
              `[BidirectionalSyncAdapter] Failed to push key "${queueKey}" (retry ${currentRetry}/${this.maxRetries}):`,
              error
            )
          }
        }

        // 큐 크기 업데이트
        this.syncStatus.pendingChanges = this.pendingQueue.size
      }

      console.log(
        `[BidirectionalSyncAdapter] Push completed: ${syncedCount} synced, ${errorCount} errors, ${this.pendingQueue.size} pending`
      )
    } catch (error) {
      // 전체 동기화 실패 시 에러 throw
      throw new StorageError('Failed to push to Supabase', 'ADAPTER_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      })
    }
  }

  /**
   * 양방향 동기화 (Pull + Push)
   *
   * Supabase와 LocalStorage 간 완전한 양방향 동기화를 수행합니다.
   * 1. Supabase → LocalStorage (Pull): 원격 변경사항 가져오기
   * 2. LocalStorage → Supabase (Push): 로컬 변경사항 업로드
   *
   * Phase 3.4 구현 완료
   * Phase 5.3: 오프라인 모드 지원 추가
   */
  async sync(): Promise<void> {
    // Phase 5.3: 오프라인 체크
    if (!this.syncStatus.isOnline) {
      console.log('[BidirectionalSyncAdapter] Offline mode: Skipping sync')
      return
    }

    if (this.syncStatus.isRunning) {
      console.log('[BidirectionalSyncAdapter] Sync already running, skipping...')
      return
    }

    this.syncStatus.isRunning = true
    const startTime = Date.now()

    try {
      console.log('[BidirectionalSyncAdapter] Starting bidirectional sync...')

      // 1. Pull: Supabase → LocalStorage (원격 변경사항 먼저 가져오기)
      await this.pullFromSupabase()

      // 2. Push: LocalStorage → Supabase (로컬 변경사항 업로드)
      await this.pushToSupabase()

      // 3. 성공 통계 업데이트
      this.syncStatus.lastSyncAt = Date.now()
      this.syncStatus.successCount++

      const duration = Date.now() - startTime
      console.log(`[BidirectionalSyncAdapter] Sync completed successfully in ${duration}ms`)
    } catch (error) {
      // 4. 실패 통계 업데이트
      this.syncStatus.failureCount++

      // 에러 로깅
      this.addSyncError({
        timestamp: Date.now(),
        message: error instanceof Error ? error.message : String(error),
        direction: 'push', // 일반적으로 push에서 실패 가능성이 높음
        retryCount: 0,
      })

      console.error('[BidirectionalSyncAdapter] Sync failed:', error)

      // 에러 재전파 (호출자가 처리할 수 있도록)
      throw error
    } finally {
      this.syncStatus.isRunning = false
    }
  }

  // ==========================================
  // 동기화 워커 관리 (Phase 3.5에서 구현 예정)
  // ==========================================

  /**
   * 주기적 동기화 워커 시작
   *
   * 지정된 간격으로 자동 동기화를 실행합니다.
   * enableAutoSync가 true일 때 생성자에서 자동 시작됩니다.
   *
   * Phase 3.5 구현 완료
   */
  private startSyncWorker(): void {
    if (this.syncWorkerInterval) {
      console.warn('[BidirectionalSyncAdapter] Sync worker already running')
      return
    }

    console.log(
      `[BidirectionalSyncAdapter] Starting sync worker (interval: ${this.syncInterval}ms)`
    )

    // 주기적 동기화 워커 시작
    this.syncWorkerInterval = setInterval(() => {
      this.sync().catch(error => {
        console.error('[BidirectionalSyncAdapter] Sync worker error:', error)
        // 워커는 계속 실행됨 (에러가 발생해도 다음 주기에 재시도)
      })
    }, this.syncInterval)
  }

  /**
   * 동기화 워커 중지
   */
  stopSyncWorker(): void {
    if (this.syncWorkerInterval) {
      clearInterval(this.syncWorkerInterval)
      this.syncWorkerInterval = null
      console.log('[BidirectionalSyncAdapter] Sync worker stopped')
    }
  }

  /**
   * 동기화 워커 재시작
   */
  restartSyncWorker(): void {
    this.stopSyncWorker()
    this.startSyncWorker()
  }

  // ==========================================
  // 상태 관리
  // ==========================================

  /**
   * 현재 동기화 상태 조회
   */
  getSyncStatus(): SyncStatus {
    return {
      ...this.syncStatus,
      errors: [...this.syncStatus.errors], // 복사본 반환
    }
  }

  /**
   * 동기화 에러 추가
   */
  private addSyncError(error: SyncError): void {
    this.syncStatus.errors.push(error)

    // 최대 100개까지만 유지 (메모리 관리)
    if (this.syncStatus.errors.length > 100) {
      this.syncStatus.errors.shift()
    }

    // 개발 환경에서 콘솔 로그
    if (process.env.NODE_ENV === 'development') {
      console.error('[BidirectionalSyncAdapter] Sync error:', error)
    }
  }

  /**
   * 특정 키의 재시도 횟수 조회
   * @param key - 조회할 키
   * @returns 해당 키의 최신 재시도 횟수 (없으면 0)
   */
  private getSyncErrorRetryCount(key: string): number {
    // 역순으로 순회하여 가장 최근 에러의 retryCount 반환
    for (let i = this.syncStatus.errors.length - 1; i >= 0; i--) {
      const error = this.syncStatus.errors[i]
      if (error.key === key && error.direction === 'push') {
        return error.retryCount
      }
    }
    return 0
  }

  /**
   * 동기화 에러 목록 초기화
   */
  clearSyncErrors(): void {
    this.syncStatus.errors = []
  }

  /**
   * 대기 큐 강제 동기화
   *
   * 대기 중인 모든 변경사항을 즉시 Supabase로 동기화합니다.
   * 워커가 처리하기 전에 수동으로 동기화를 트리거할 때 사용합니다.
   *
   * Phase 3.4 구현 완료
   */
  async forceSyncQueue(): Promise<void> {
    console.log('[BidirectionalSyncAdapter] Force syncing queue...')

    try {
      // pendingQueue 전체를 pushToSupabase로 처리
      await this.pushToSupabase()

      console.log('[BidirectionalSyncAdapter] Force sync completed')
    } catch (error) {
      console.error('[BidirectionalSyncAdapter] Force sync failed:', error)
      throw error
    }
  }

  // ==========================================
  // Phase 5.2-5.4: Offline 모드 관리
  // ==========================================

  /**
   * 오프라인 모드 진입 핸들러 (Phase 5.3)
   *
   * 네트워크 연결이 끊겼을 때 호출됩니다.
   * - 동기화 워커는 계속 실행 (네트워크 복구 시 자동 재개)
   * - 이후 쓰기 작업은 OfflineQueue에 추가
   */
  private handleOffline(): void {
    console.warn('[BidirectionalSyncAdapter] Network offline detected')

    this.syncStatus.isOnline = false

    // 동기화 워커는 계속 실행하되, sync() 내부에서 온라인 체크
    // 오프라인 상태에서는 LocalStorage만 업데이트
  }

  /**
   * 온라인 모드 복귀 핸들러 (Phase 5.4)
   *
   * 네트워크 연결이 복구되었을 때 호출됩니다.
   * - OfflineQueue에 쌓인 작업들을 처리
   * - 양방향 동기화 재개
   */
  private async handleOnline(): Promise<void> {
    console.log('[BidirectionalSyncAdapter] Network online detected')

    this.syncStatus.isOnline = true

    try {
      // 1. OfflineQueue 처리
      if (!this.offlineQueue.isEmpty()) {
        console.log(
          `[BidirectionalSyncAdapter] Processing ${this.offlineQueue.size()} offline operations...`
        )

        const processedCount = await this.offlineQueue.processAll(async (operation) => {
          // 큐의 각 작업을 Supabase로 동기화
          await this.pushToSupabase(operation.entity, operation.data)
        })

        console.log(
          `[BidirectionalSyncAdapter] Processed ${processedCount} offline operations`
        )
      }

      // 2. 양방향 동기화 재개
      await this.sync()

      console.log('[BidirectionalSyncAdapter] Online recovery complete')
    } catch (error) {
      console.error('[BidirectionalSyncAdapter] Failed to process offline queue:', error)

      this.addSyncError({
        timestamp: Date.now(),
        message: error instanceof Error ? error.message : String(error),
        direction: 'push',
        retryCount: 0,
      })
    }
  }

  /**
   * 온라인 상태 확인
   * @returns 온라인 상태
   */
  isOnline(): boolean {
    return this.syncStatus.isOnline
  }

  /**
   * 오프라인 큐 크기 조회
   * @returns 큐에 있는 작업 개수
   */
  getOfflineQueueSize(): number {
    return this.offlineQueue.size()
  }

  // ==========================================
  // 정리
  // ==========================================

  /**
   * 리소스 정리 (워커 중지, 큐 클리어)
   */
  dispose(): void {
    // 이벤트 리스너 제거
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler)
      window.removeEventListener('offline', this.offlineHandler)
    }

    this.stopSyncWorker()
    this.pendingQueue.clear()
    this.syncStatus.pendingChanges = 0
    console.log('[BidirectionalSyncAdapter] Disposed')
  }
}
