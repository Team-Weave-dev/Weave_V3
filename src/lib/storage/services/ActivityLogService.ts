/**
 * ActivityLogService - 활동 로그 도메인 서비스
 *
 * 모든 사용자 활동을 추적하고 관리하는 서비스
 * - CRUD 작업 기록
 * - 실시간 활동 피드
 * - 필터링 및 검색
 */

import { BaseService } from './BaseService'
import type { StorageManager } from '../core/StorageManager'
import type {
  ActivityLog,
  CreateActivityLogInput,
  ActivityLogFilter,
  ActivityType,
  ActivityEntityType,
} from '../types/entities/activity-log'
import { isActivityLog } from '../types/entities/activity-log'

export class ActivityLogService extends BaseService<ActivityLog> {
  protected entityKey = 'activity_logs'

  constructor(storage: StorageManager) {
    super(storage)
  }

  protected isValidEntity(data: unknown): data is ActivityLog {
    return isActivityLog(data)
  }

  /**
   * 활동 로그 생성
   */
  async createLog(input: CreateActivityLogInput): Promise<ActivityLog> {
    const now = new Date().toISOString()

    const activityLog: Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'> & { timestamp: string } = {
      ...input,
      timestamp: now,
    }

    return this.create(activityLog)
  }

  /**
   * 최근 활동 조회 (기본: 최근 50개)
   */
  async getRecent(limit: number = 50): Promise<ActivityLog[]> {
    const all = await this.getAll()

    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * 필터링된 활동 조회
   */
  async getFiltered(filter: ActivityLogFilter): Promise<ActivityLog[]> {
    let activities = await this.getAll()

    // 타입 필터
    if (filter.types && filter.types.length > 0) {
      activities = activities.filter((log) => filter.types!.includes(log.type))
    }

    // 엔티티 타입 필터
    if (filter.entityTypes && filter.entityTypes.length > 0) {
      activities = activities.filter((log) =>
        filter.entityTypes!.includes(log.entityType)
      )
    }

    // 사용자 필터
    if (filter.userId) {
      activities = activities.filter((log) => log.userId === filter.userId)
    }

    // 엔티티 ID 필터
    if (filter.entityId) {
      activities = activities.filter((log) => log.entityId === filter.entityId)
    }

    // 시간 범위 필터
    if (filter.startDate) {
      const startTime = new Date(filter.startDate).getTime()
      activities = activities.filter(
        (log) => new Date(log.timestamp).getTime() >= startTime
      )
    }

    if (filter.endDate) {
      const endTime = new Date(filter.endDate).getTime()
      activities = activities.filter(
        (log) => new Date(log.timestamp).getTime() <= endTime
      )
    }

    // 정렬
    const sortBy = filter.sortBy || 'timestamp'
    const sortOrder = filter.sortOrder || 'desc'

    activities.sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortBy === 'timestamp') {
        aVal = new Date(a.timestamp).getTime()
        bVal = new Date(b.timestamp).getTime()
      } else {
        aVal = a[sortBy]
        bVal = b[sortBy]
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // 페이지네이션
    const offset = filter.offset || 0
    const limit = filter.limit || 50

    return activities.slice(offset, offset + limit)
  }

  /**
   * 특정 엔티티의 활동 히스토리 조회
   */
  async getEntityHistory(
    entityType: ActivityEntityType,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    return this.getFiltered({
      entityTypes: [entityType],
      entityId,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })
  }

  /**
   * 특정 사용자의 활동 조회
   */
  async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    return this.getFiltered({
      userId,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })
  }

  /**
   * 활동 타입별 통계
   */
  async getActivityStats(
    startDate?: string,
    endDate?: string
  ): Promise<Record<ActivityType, number>> {
    const filter: ActivityLogFilter = {}
    if (startDate) filter.startDate = startDate
    if (endDate) filter.endDate = endDate

    const activities = await this.getFiltered(filter)

    const stats: Record<string, number> = {}

    activities.forEach((log) => {
      stats[log.type] = (stats[log.type] || 0) + 1
    })

    return stats as Record<ActivityType, number>
  }

  /**
   * 오래된 활동 로그 정리 (30일 이상)
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    const all = await this.getAll()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffTime = cutoffDate.getTime()

    const toKeep = all.filter(
      (log) => new Date(log.timestamp).getTime() >= cutoffTime
    )

    const deletedCount = all.length - toKeep.length

    if (deletedCount > 0) {
      await this.storage.set(this.entityKey, toKeep)
    }

    return deletedCount
  }

}
