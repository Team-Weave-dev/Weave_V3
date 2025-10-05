/**
 * useProjectSummary Hook
 *
 * Project Storage에서 프로젝트 목록을 로드하고,
 * ProjectReview 타입으로 변환하여 ProjectSummaryWidget에서 사용
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { projectService } from '@/lib/storage';
import type { Project } from '@/lib/storage/types/entities/project';
import type { ProjectReview } from '@/types/dashboard';
import { getWidgetText } from '@/config/brand';

/**
 * Project → ProjectReview 변환 함수
 * Storage의 Project 타입을 Dashboard의 ProjectReview 타입으로 매핑
 */
function convertProjectToReview(project: Project): ProjectReview {
  // 상태 매핑: Storage → Dashboard
  const statusMap: Record<Project['status'], ProjectReview['status']> = {
    'planning': 'normal',
    'in_progress': 'normal',
    'review': 'normal',
    'completed': 'completed',
    'on_hold': 'warning',
    'cancelled': 'critical',
  };

  const statusLabelMap: Record<Project['status'], string> = {
    'planning': getWidgetText.hooks.projectStatus.planning('ko'),
    'in_progress': getWidgetText.hooks.projectStatus.inProgress('ko'),
    'review': getWidgetText.hooks.projectStatus.review('ko'),
    'completed': getWidgetText.hooks.projectStatus.completed('ko'),
    'on_hold': getWidgetText.hooks.projectStatus.onHold('ko'),
    'cancelled': getWidgetText.hooks.projectStatus.cancelled('ko'),
  };

  // 마감일 계산 (endDate가 없으면 등록일 기준)
  const deadline = project.endDate
    ? new Date(project.endDate)
    : new Date(project.registrationDate);

  // D-day 계산
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 예산 정보 (totalAmount 기준)
  const totalBudget = project.totalAmount || project.budget || 0;
  const spentBudget = project.actualCost || 0;
  const currency = project.currency || 'KRW';

  // 현재 상태 메시지 (WBS 작업 기반)
  const currentStatus = project.wbsTasks.length > 0
    ? `${getWidgetText.hooks.fallback.tasksInProgress('ko')}: ${project.wbsTasks.filter(t => t.status === 'in_progress').length}${getWidgetText.hooks.fallback.tasksCount('ko')}`
    : getWidgetText.hooks.fallback.noTasks('ko');

  return {
    id: project.id,
    projectId: project.no,
    projectName: project.name,
    client: project.clientId || getWidgetText.hooks.fallback.noClient('ko'),  // TODO: ClientService 통합
    pm: project.userId,  // TODO: UserService 통합하여 이름 가져오기
    status: statusMap[project.status],
    statusLabel: statusLabelMap[project.status],
    progress: Math.round(project.progress),
    deadline,
    daysRemaining,
    budget: {
      total: totalBudget,
      spent: spentBudget,
      currency,
    },
    currentStatus,
  };
}

/**
 * useProjectSummary Hook
 *
 * @returns 프로젝트 목록, 로딩 상태, 에러, 새로고침 함수
 */
export function useProjectSummary() {
  const [projects, setProjects] = useState<ProjectReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ProjectService에서 모든 프로젝트 조회
      const allProjects = await projectService.getAll();

      // Project → ProjectReview 변환
      const reviews = allProjects.map(convertProjectToReview);

      setProjects(reviews);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();

    // Storage 구독 (프로젝트 변경 시 자동 리로드)
    const unsubscribe = projectService['storage'].subscribe('projects', loadProjects);

    return () => {
      unsubscribe();
    };
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    refresh: loadProjects,
  };
}
