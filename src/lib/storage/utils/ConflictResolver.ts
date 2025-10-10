/**
 * Conflict Resolver - 충돌 감지 및 해결 시스템
 *
 * 동기화 중 발생하는 데이터 충돌을 감지하고 자동/수동 해결을 지원합니다.
 */

import type { JsonValue } from '../types/base'
import type {
  ConflictData,
  ConflictType,
  ConflictDetectionResult,
  FieldDifference,
  ResolutionStrategy,
  ConflictResolution,
  MergeStrategyFn,
  ConflictStats,
} from '../types/conflict'

export class ConflictResolver {
  private stats: ConflictStats = {
    totalConflicts: 0,
    resolvedConflicts: 0,
    autoResolved: 0,
    manualResolved: 0,
    strategyBreakdown: {
      keep_local: 0,
      keep_remote: 0,
      merge_auto: 0,
      merge_manual: 0,
      cancel: 0,
    },
    lastConflictAt: null,
    lastResolutionAt: null,
  }

  /**
   * 충돌 감지
   * @param key - 스토리지 키
   * @param local - 로컬 데이터
   * @param remote - 원격 데이터
   * @returns 충돌 감지 결과
   */
  detectConflict<T extends JsonValue>(
    key: string,
    local: T,
    remote: T
  ): ConflictDetectionResult<T> {
    // 1. 데이터가 동일하면 충돌 없음
    if (this.isEqual(local, remote)) {
      return {
        hasConflict: false,
        canAutoResolve: true,
      }
    }

    // 2. 타임스탬프 추출
    const localTimestamp = this.extractTimestamp(local)
    const remoteTimestamp = this.extractTimestamp(remote)

    // 3. 충돌 타입 판단
    const conflictType = this.determineConflictType(localTimestamp, remoteTimestamp)

    // 4. 필드별 차이 분석
    const differences = this.findDifferences(local, remote)

    // 5. 엔티티 및 ID 추출
    const { entity, id } = this.parseKey(key)

    // 6. 충돌 데이터 생성
    const conflict: ConflictData<T> = {
      key,
      entity,
      id,
      localVersion: local,
      remoteVersion: remote,
      localTimestamp,
      remoteTimestamp,
      localUpdatedAt: this.extractUpdatedAt(local),
      remoteUpdatedAt: this.extractUpdatedAt(remote),
      conflictType,
      differences,
      detectedAt: Date.now(),
    }

    // 7. 자동 해결 가능 여부 판단
    const canAutoResolve = conflictType !== 'both_modified' && conflictType !== 'unknown'

    // 8. 권장 전략
    let recommendedStrategy: ResolutionStrategy | undefined

    if (canAutoResolve) {
      if (conflictType === 'local_newer') {
        recommendedStrategy = 'keep_local'
      } else if (conflictType === 'remote_newer') {
        recommendedStrategy = 'keep_remote'
      }
    } else {
      // 복잡한 충돌은 필드별 병합 권장
      recommendedStrategy = 'merge_auto'
    }

    // 9. 통계 업데이트
    this.stats.totalConflicts++
    this.stats.lastConflictAt = conflict.detectedAt

    return {
      hasConflict: true,
      conflict,
      canAutoResolve,
      recommendedStrategy,
    }
  }

  /**
   * 충돌 해결
   * @param conflict - 충돌 데이터
   * @param strategy - 해결 전략
   * @param manualData - 수동 병합 데이터 (선택)
   * @returns 해결 결과
   */
  resolve<T extends JsonValue>(
    conflict: ConflictData<T>,
    strategy: ResolutionStrategy,
    manualData?: Partial<T>
  ): ConflictResolution<T> {
    let resolvedData: T

    switch (strategy) {
      case 'keep_local':
        resolvedData = conflict.localVersion
        break

      case 'keep_remote':
        resolvedData = conflict.remoteVersion
        break

      case 'merge_auto':
        resolvedData = this.autoMerge(
          conflict.localVersion,
          conflict.remoteVersion,
          conflict.differences
        )
        break

      case 'merge_manual':
        if (!manualData) {
          throw new Error('Manual merge requires manualData parameter')
        }
        resolvedData = this.manualMerge(
          conflict.localVersion,
          conflict.remoteVersion,
          manualData
        )
        break

      case 'cancel':
        // 현재 로컬 상태 유지
        resolvedData = conflict.localVersion
        break

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`)
    }

    // 통계 업데이트
    this.stats.resolvedConflicts++
    this.stats.strategyBreakdown[strategy]++
    this.stats.lastResolutionAt = Date.now()

    if (strategy === 'merge_auto' || strategy === 'keep_local' || strategy === 'keep_remote') {
      this.stats.autoResolved++
    } else {
      this.stats.manualResolved++
    }

    return {
      strategy,
      resolvedData,
      appliedAt: Date.now(),
      manualChanges: strategy === 'merge_manual' ? manualData : undefined,
    }
  }

  /**
   * 자동 병합 (필드별 최신 값 선택)
   */
  private autoMerge<T extends JsonValue>(
    local: T,
    remote: T,
    differences: FieldDifference[]
  ): T {
    // 배열이나 원시값은 타임스탬프 기반 선택
    if (!this.isObject(local) || !this.isObject(remote)) {
      const localTimestamp = this.extractTimestamp(local)
      const remoteTimestamp = this.extractTimestamp(remote)

      return (remoteTimestamp && localTimestamp && remoteTimestamp > localTimestamp)
        ? remote
        : local
    }

    // 객체는 필드별 병합
    // 타입 가드: spread 연산자는 객체에만 사용 가능
    if (typeof local !== 'object' || local === null || Array.isArray(local)) {
      // 이 시점에는 도달하지 않아야 하지만 타입 안전성을 위해 처리
      return local
    }

    // TypeScript를 위한 명시적 타입 캐스팅
    const localObject = local as Record<string, JsonValue>
    const merged = { ...localObject }

    for (const diff of differences) {
      if (diff.hasConflict) {
        // 각 필드의 타임스탬프 비교 (있을 경우)
        if (diff.remoteTimestamp && diff.localTimestamp) {
          if (diff.remoteTimestamp > diff.localTimestamp) {
            merged[diff.field] = diff.remoteValue
          }
          // localTimestamp가 더 크거나 같으면 로컬 유지 (이미 merged에 포함)
        } else {
          // 타임스탬프 없으면 원격 우선
          merged[diff.field] = diff.remoteValue
        }
      }
    }

    // updatedAt 필드를 최신 타임스탬프로 설정
    const localUpdatedAt = this.extractTimestamp(local)
    const remoteUpdatedAt = this.extractTimestamp(remote)

    if (localUpdatedAt && remoteUpdatedAt) {
      merged.updatedAt = new Date(Math.max(localUpdatedAt, remoteUpdatedAt)).toISOString()
    }

    return merged as T
  }

  /**
   * 수동 병합 (사용자 선택 적용)
   */
  private manualMerge<T extends JsonValue>(
    local: T,
    remote: T,
    manualData: Partial<T>
  ): T {
    // 타입 가드: spread 연산자는 객체에만 사용 가능
    if (typeof local !== 'object' || local === null || Array.isArray(local)) {
      // 원시값이나 배열인 경우 manualData만 반환
      return manualData as T
    }

    // 로컬 베이스에 수동 변경사항 적용
    return {
      ...local,
      ...manualData,
      updatedAt: new Date().toISOString(),
    } as T
  }

  /**
   * 커스텀 병합 전략 적용
   */
  applyCustomStrategy<T extends JsonValue>(
    local: T,
    remote: T,
    strategyFn: MergeStrategyFn<T>,
    differences: FieldDifference[]
  ): T {
    return strategyFn(local, remote, differences)
  }

  /**
   * 충돌 타입 판단
   */
  private determineConflictType(
    localTimestamp?: number,
    remoteTimestamp?: number
  ): ConflictType {
    if (!localTimestamp || !remoteTimestamp) {
      return 'unknown'
    }

    const timeDiff = localTimestamp - remoteTimestamp

    // Phase 5.7 개선: 15초 이내 차이는 동시 수정으로 간주
    // (기존 5초는 5초 동기화 주기와 겹쳐서 오판 가능)
    const SIMULTANEOUS_THRESHOLD = 15000 // 15초로 증가
    if (Math.abs(timeDiff) <= SIMULTANEOUS_THRESHOLD) {
      return 'both_modified'
    }

    return timeDiff > 0 ? 'local_newer' : 'remote_newer'
  }

  /**
   * 필드별 차이 찾기
   */
  private findDifferences(local: JsonValue, remote: JsonValue): FieldDifference[] {
    const differences: FieldDifference[] = []

    // 원시값이나 배열은 전체를 하나의 필드로 간주
    if (!this.isObject(local) || !this.isObject(remote)) {
      differences.push({
        field: '__root__',
        localValue: local,
        remoteValue: remote,
        hasConflict: !this.isEqual(local, remote),
      })
      return differences
    }

    // 모든 키 수집 (로컬 + 원격)
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])

    for (const key of allKeys) {
      const localValue = local[key]
      const remoteValue = remote[key]

      differences.push({
        field: key,
        localValue,
        remoteValue,
        hasConflict: !this.isEqual(localValue, remoteValue),
      })
    }

    return differences
  }

  /**
   * 타임스탬프 추출 (updatedAt, modifiedDate, timestamp 등)
   */
  private extractTimestamp(data: JsonValue): number | undefined {
    if (!this.isObject(data)) return undefined

    // 우선순위: updatedAt > modifiedDate > timestamp > createdAt
    const timestampFields = ['updatedAt', 'modifiedDate', 'timestamp', 'updated_at', 'createdAt']

    for (const field of timestampFields) {
      const value = data[field]

      if (typeof value === 'string') {
        const timestamp = new Date(value).getTime()
        if (!isNaN(timestamp)) return timestamp
      }

      if (typeof value === 'number' && value > 0) {
        return value
      }
    }

    return undefined
  }

  /**
   * updatedAt 문자열 추출
   */
  private extractUpdatedAt(data: JsonValue): string | undefined {
    if (!this.isObject(data)) return undefined

    const value = data.updatedAt || data.modifiedDate || data.updated_at
    return typeof value === 'string' ? value : undefined
  }

  /**
   * 키 파싱 (entity:id 형식)
   */
  private parseKey(key: string): { entity: string; id?: string } {
    const parts = key.split(':')
    return {
      entity: parts[0],
      id: parts[1],
    }
  }

  /**
   * 객체 여부 확인
   */
  private isObject(value: JsonValue): value is Record<string, JsonValue> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  /**
   * 깊은 동등성 비교
   */
  private isEqual(a: JsonValue, b: JsonValue): boolean {
    if (a === b) return true

    if (typeof a !== typeof b) return false

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => this.isEqual(item, b[index]))
    }

    if (this.isObject(a) && this.isObject(b)) {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      if (keysA.length !== keysB.length) return false

      return keysA.every(key => this.isEqual(a[key], b[key]))
    }

    return false
  }

  /**
   * 통계 조회
   */
  getStats(): Readonly<ConflictStats> {
    return { ...this.stats }
  }

  /**
   * 통계 초기화
   */
  resetStats(): void {
    this.stats = {
      totalConflicts: 0,
      resolvedConflicts: 0,
      autoResolved: 0,
      manualResolved: 0,
      strategyBreakdown: {
        keep_local: 0,
        keep_remote: 0,
        merge_auto: 0,
        merge_manual: 0,
        cancel: 0,
      },
      lastConflictAt: null,
      lastResolutionAt: null,
    }
  }
}

// 싱글톤 인스턴스
export const conflictResolver = new ConflictResolver()
