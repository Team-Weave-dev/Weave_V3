/**
 * ActivityLog Entity Type Definition
 *
 * 모든 사용자 활동을 추적하는 범용 로그 시스템
 * - 프로젝트, 태스크, 캘린더, 문서 등의 CRUD 작업 기록
 * - 실시간 활동 피드 제공
 * - 필터링 및 검색 기능 지원
 */

import type { BaseEntity } from '../base'

/**
 * 활동 타입 정의
 * - create: 생성
 * - update: 수정
 * - delete: 삭제
 * - complete: 완료
 * - comment: 댓글 (향후 구현)
 * - document: 문서 관련
 * - view: 조회 (선택사항)
 * - export: 내보내기 (선택사항)
 * - share: 공유 (선택사항)
 */
export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'complete'
  | 'comment'
  | 'document'
  | 'view'
  | 'export'
  | 'share'

/**
 * 활동 대상 엔티티 타입
 * - project: 프로젝트
 * - task: 할일/태스크
 * - event: 캘린더 일정
 * - document: 문서
 * - client: 클라이언트
 * - settings: 설정
 */
export type ActivityEntityType =
  | 'project'
  | 'task'
  | 'event'
  | 'document'
  | 'client'
  | 'settings'

/**
 * ActivityLog 엔티티 인터페이스
 */
export interface ActivityLog extends BaseEntity {
  // 활동 정보
  type: ActivityType
  action: string                    // 활동 설명 (예: "프로젝트 생성", "문서 업로드")

  // 대상 정보
  entityType: ActivityEntityType     // 대상 엔티티 타입
  entityId: string                   // 대상 엔티티 ID
  entityName: string                 // 대상 이름 (표시용)

  // 사용자 정보
  userId: string                     // 활동 수행 사용자 ID
  userName: string                   // 사용자 이름 (캐시)
  userInitials: string               // 사용자 이니셜 (UI용)

  // 추가 정보
  description?: string               // 추가 설명
  metadata?: Record<string, any>     // 추가 메타데이터

  // 변경 내역 (선택사항)
  changes?: {
    field: string                    // 변경된 필드
    oldValue?: any                   // 이전 값
    newValue?: any                   // 새 값
  }[]

  // 타임스탬프
  timestamp: string                  // ISO 8601 형식
}

/**
 * ActivityLog 생성 입력 타입
 */
export interface CreateActivityLogInput {
  type: ActivityType
  action: string
  entityType: ActivityEntityType
  entityId: string
  entityName: string
  userId: string
  userName: string
  userInitials: string
  description?: string
  metadata?: Record<string, any>
  changes?: {
    field: string
    oldValue?: any
    newValue?: any
  }[]
}

/**
 * ActivityLog 필터 옵션
 */
export interface ActivityLogFilter {
  // 타입 필터
  types?: ActivityType[]
  entityTypes?: ActivityEntityType[]

  // 사용자 필터
  userId?: string

  // 엔티티 필터
  entityId?: string

  // 시간 범위 필터
  startDate?: string
  endDate?: string

  // 페이지네이션
  limit?: number
  offset?: number

  // 정렬
  sortBy?: 'timestamp' | 'type' | 'entityType'
  sortOrder?: 'asc' | 'desc'
}

/**
 * ActivityLog 타입 가드
 */
export function isActivityLog(value: unknown): value is ActivityLog {
  if (typeof value !== 'object' || value === null) return false

  const log = value as ActivityLog

  return (
    typeof log.id === 'string' &&
    typeof log.type === 'string' &&
    typeof log.action === 'string' &&
    typeof log.entityType === 'string' &&
    typeof log.entityId === 'string' &&
    typeof log.entityName === 'string' &&
    typeof log.userId === 'string' &&
    typeof log.userName === 'string' &&
    typeof log.userInitials === 'string' &&
    typeof log.timestamp === 'string' &&
    typeof log.createdAt === 'string' &&
    typeof log.updatedAt === 'string'
  )
}

/**
 * ActivityLog 배열 타입 가드
 */
export function isActivityLogArray(value: unknown): value is ActivityLog[] {
  return Array.isArray(value) && value.every(isActivityLog)
}
