/**
 * Storage Conflict Resolution Types
 *
 * 동기화 중 발생하는 충돌을 감지하고 해결하기 위한 타입 시스템
 */

import type { JsonValue } from './base'

/**
 * 충돌 유형
 */
export type ConflictType =
  | 'local_newer'      // 로컬 버전이 더 최신
  | 'remote_newer'     // 원격 버전이 더 최신
  | 'both_modified'    // 양쪽 모두 수정됨 (타임스탬프 동일하거나 교차)
  | 'unknown'          // 타임스탬프 없음 또는 판단 불가

/**
 * 충돌 해결 전략
 */
export type ResolutionStrategy =
  | 'keep_local'       // 로컬 버전 유지
  | 'keep_remote'      // 원격 버전 선택
  | 'merge_auto'       // 자동 병합 (필드별 최신 값)
  | 'merge_manual'     // 수동 병합 (사용자 선택)
  | 'cancel'           // 해결 취소 (현재 상태 유지)

/**
 * 필드별 차이점
 */
export interface FieldDifference {
  field: string
  localValue: JsonValue
  remoteValue: JsonValue
  hasConflict: boolean  // 값이 다른지 여부
  localTimestamp?: number
  remoteTimestamp?: number
}

/**
 * 충돌 데이터
 */
export interface ConflictData<T = JsonValue> {
  key: string
  entity: string
  id?: string

  // 버전 정보
  localVersion: T
  remoteVersion: T

  // 타임스탬프
  localTimestamp?: number
  remoteTimestamp?: number
  localUpdatedAt?: string  // ISO 8601
  remoteUpdatedAt?: string

  // 충돌 분석
  conflictType: ConflictType
  differences: FieldDifference[]

  // 메타데이터
  detectedAt: number  // 충돌 감지 시각
  userId?: string
}

/**
 * 충돌 해결 결과
 */
export interface ConflictResolution<T = JsonValue> {
  strategy: ResolutionStrategy
  resolvedData: T
  appliedAt: number
  manualChanges?: Partial<T>  // 수동 병합 시 사용자 변경 내역
}

/**
 * 충돌 해결 옵션
 */
export interface ConflictResolutionOptions {
  /**
   * 자동 해결 전략 (충돌 발생 시 자동 적용)
   * undefined: 항상 UI 표시
   */
  autoResolve?: ResolutionStrategy

  /**
   * 타임스탬프 우선순위 (자동 해결 시)
   * true: 최신 타임스탬프 우선
   * false: 로컬 우선
   */
  preferNewest?: boolean

  /**
   * 충돌 발생 시 콜백 (UI modal 트리거)
   * @returns 사용자가 선택한 해결 방법
   */
  onConflict?: (conflict: ConflictData) => ConflictResolution | Promise<ConflictResolution>

  /**
   * 해결 완료 시 콜백
   */
  onResolved?: (conflict: ConflictData, resolution: ConflictResolution) => void | Promise<void>

  /**
   * 에러 처리 콜백
   */
  onError?: (error: Error, conflict: ConflictData) => void | Promise<void>
}

/**
 * 충돌 감지 결과
 */
export interface ConflictDetectionResult<T = JsonValue> {
  hasConflict: boolean
  conflict?: ConflictData<T>
  canAutoResolve: boolean  // 자동 해결 가능 여부
  recommendedStrategy?: ResolutionStrategy
}

/**
 * 병합 전략 함수 타입
 */
export type MergeStrategyFn<T = JsonValue> = (
  local: T,
  remote: T,
  differences: FieldDifference[]
) => T

/**
 * 충돌 통계
 */
export interface ConflictStats {
  totalConflicts: number
  resolvedConflicts: number
  autoResolved: number
  manualResolved: number

  strategyBreakdown: Record<ResolutionStrategy, number>

  lastConflictAt: number | null
  lastResolutionAt: number | null
}

/**
 * 타입 가드: ConflictData 검증
 */
export function isConflictData(value: unknown): value is ConflictData {
  if (!value || typeof value !== 'object') return false

  const conflict = value as ConflictData

  return (
    typeof conflict.key === 'string' &&
    typeof conflict.entity === 'string' &&
    conflict.localVersion !== undefined &&
    conflict.remoteVersion !== undefined &&
    typeof conflict.conflictType === 'string' &&
    Array.isArray(conflict.differences) &&
    typeof conflict.detectedAt === 'number'
  )
}

/**
 * 타입 가드: ConflictResolution 검증
 */
export function isConflictResolution(value: unknown): value is ConflictResolution {
  if (!value || typeof value !== 'object') return false

  const resolution = value as ConflictResolution

  return (
    typeof resolution.strategy === 'string' &&
    resolution.resolvedData !== undefined &&
    typeof resolution.appliedAt === 'number'
  )
}
