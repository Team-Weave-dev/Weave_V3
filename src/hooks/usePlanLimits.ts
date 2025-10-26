/**
 * Plan Limits Hook
 *
 * 요금제 제한 체크를 위한 React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { userService, projectService, dashboardService } from '@/lib/storage';
import { checkProjectLimit, checkWidgetLimit, checkLimitExceeded } from '@/lib/storage/utils/planLimits';
import type { PlanType } from '@/lib/storage/types/entities/user';
import { useStorageInitStore } from '@/lib/stores/useStorageInitStore';

interface UsageLimits {
  projects: {
    current: number;
    limit: number;
    allowed: boolean;
  };
  widgets: {
    current: number;
    limit: number;
    allowed: boolean;
  };
}

export function usePlanLimits() {
  const storageInitialized = useStorageInitStore((state) => state.isInitialized);
  const [plan, setPlan] = useState<PlanType>('free');
  const [usage, setUsage] = useState<UsageLimits>({
    projects: { current: 0, limit: 2, allowed: true },
    widgets: { current: 0, limit: 3, allowed: true }
  });
  const [loading, setLoading] = useState(true);

  // 사용량 및 요금제 정보 로드
  const loadUsage = useCallback(async () => {
    // Storage가 초기화될 때까지 기다림
    if (!storageInitialized) {
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setPlan('free');
        return;
      }

      // 현재 요금제 가져오기
      const userPlan = await userService.getPlan(authUser.id);
      setPlan(userPlan || 'free');

      // 현재 사용량 가져오기
      const projects = await projectService.getAll();
      const dashboardData = await dashboardService.load();
      const widgetCount = dashboardData?.widgets.length || 0;

      // 제한 체크
      const projectCheck = checkProjectLimit(userPlan || 'free', projects.length);
      const widgetCheck = checkWidgetLimit(userPlan || 'free', widgetCount);

      setUsage({
        projects: projectCheck,
        widgets: widgetCheck
      });
    } catch (error) {
      console.error('Failed to load usage:', error);
      setPlan('free');
    } finally {
      setLoading(false);
    }
  }, [storageInitialized]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // 프로젝트 생성 가능 여부 체크
  const canCreateProject = useCallback(() => {
    const result = checkLimitExceeded(plan, 'projects', usage.projects.current);
    return {
      allowed: !result.exceeded,
      message: result.message
    };
  }, [plan, usage.projects.current]);

  // 위젯 추가 가능 여부 체크
  const canAddWidget = useCallback(() => {
    const result = checkLimitExceeded(plan, 'widgets', usage.widgets.current);
    return {
      allowed: !result.exceeded,
      message: result.message
    };
  }, [plan, usage.widgets.current]);

  // 사용량 새로고침
  const refresh = useCallback(() => {
    loadUsage();
  }, [loadUsage]);

  return {
    plan,
    usage,
    loading,
    canCreateProject,
    canAddWidget,
    refresh
  };
}
