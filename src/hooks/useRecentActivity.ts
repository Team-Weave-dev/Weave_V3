/**
 * useRecentActivity Hook
 *
 * ActivityLogService에서 활동 로그 데이터를 로드하여
 * RecentActivityWidget에서 사용하는 Self-Loading Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { activityLogService } from '@/lib/storage';
import type { ActivityLog } from '@/lib/storage/types/entities/activity-log';
import type { ActivityItem, ActivityType, ActivityUser } from '@/types/dashboard';

interface UseRecentActivityReturn {
  activities: ActivityItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * ActivityLog 엔티티를 ActivityItem 위젯 타입으로 변환
 */
function activityLogToActivityItem(log: ActivityLog): ActivityItem {
  // ActivityLog의 타입을 ActivityItem의 타입으로 매핑
  const typeMapping: Record<string, ActivityType> = {
    'create': 'create',
    'update': 'update',
    'delete': 'delete',
    'complete': 'complete',
    'comment': 'comment',
    'document': 'document',
    // view, export, share는 매핑 안 됨
  };

  const mappedType = typeMapping[log.type] || 'create';

  // ActivityUser 객체 생성
  const user: ActivityUser = {
    id: log.userId,
    name: log.userName,
    initials: log.userInitials,
    // avatar는 향후 User 엔티티에서 가져올 수 있음
  };

  return {
    id: log.id,
    type: mappedType,
    user,
    action: log.action,
    target: log.entityName,
    timestamp: new Date(log.timestamp), // ISO string to Date
    description: log.description,
    metadata: log.metadata,
  };
}

/**
 * useRecentActivity Hook
 *
 * @returns 최근 활동 내역, 로딩 상태, 에러, 새로고침 함수
 */
export function useRecentActivity(): UseRecentActivityReturn {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ActivityLogService에서 최근 50개 활동 로드
      const logs = await activityLogService.getRecent(50);

      // ActivityLog를 ActivityItem으로 변환
      const converted = logs.map(activityLogToActivityItem);

      setActivities(converted);
    } catch (err) {
      console.error('Failed to load recent activities:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();

    // Storage 구독: activity_logs 키 변경 시 자동 리로드
    const unsubscribe = activityLogService['storage'].subscribe(
      'activity_logs',
      loadActivities
    );

    return () => unsubscribe();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    refresh: loadActivities,
  };
}
