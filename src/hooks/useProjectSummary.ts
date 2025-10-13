/**
 * useProjectSummary Hook
 *
 * Project Storage에서 프로젝트 목록을 로드하고,
 * ProjectReview 타입으로 변환하여 ProjectSummaryWidget에서 사용
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { projectService, clientService } from '@/lib/storage';
import type { Project, WBSTask } from '@/lib/storage/types/entities/project';
import type { ProjectReview } from '@/types/dashboard';
import { getWidgetText } from '@/config/brand';

/**
 * Project → ProjectReview 변환 함수
 * Storage의 Project 타입을 Dashboard의 ProjectReview 타입으로 매핑
 */
async function convertProjectToReview(project: Project): Promise<ProjectReview> {
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

  // 클라이언트 정보 조회
  let clientName = getWidgetText.hooks.fallback.noClient('ko');
  if (project.clientId) {
    try {
      const client = await clientService.getById(project.clientId);
      if (client) {
        // 회사명이 있으면 회사명, 없으면 담당자명 사용
        clientName = client.company || client.name;
      }
    } catch (error) {
      console.error('Failed to load client:', error);
      // 에러 시 fallback 사용
    }
  }

  // 프로젝트의 WBS 작업 필터링 및 최신 작업 찾기
  const wbsTasks = project.wbsTasks || [];
  const pendingTasks = wbsTasks.filter(t => t.status === 'pending');
  const inProgressTasks = wbsTasks.filter(t => t.status === 'in_progress');
  const completedTasks = wbsTasks.filter(t => t.status === 'completed');

  // 최신 작업 (createdAt 기준)
  const latestTask = wbsTasks.length > 0
    ? [...wbsTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  // WBS 작업 상태 레이블 매핑
  const wbsTaskStatusLabelMap: Record<WBSTask['status'], string> = {
    'pending': '예정',
    'in_progress': '진행중',
    'completed': '완료',
  };

  // 현재 상태 메시지 (진행 중인 작업 개수 + 최신 작업)
  let currentStatus = '';
  if (inProgressTasks.length > 0) {
    currentStatus = `${getWidgetText.hooks.fallback.tasksInProgress('ko')}: ${inProgressTasks.length}${getWidgetText.hooks.fallback.tasksCount('ko')}`;

    // 최신 작업 정보 추가
    if (latestTask) {
      const statusLabel = wbsTaskStatusLabelMap[latestTask.status] || latestTask.status;
      currentStatus += ` | ${statusLabel}: ${latestTask.name}`;
    }
  } else if (latestTask) {
    // 진행 중인 작업이 없지만 최신 작업이 있는 경우
    const statusLabel = wbsTaskStatusLabelMap[latestTask.status] || latestTask.status;
    currentStatus = `${statusLabel}: ${latestTask.name}`;
  } else {
    currentStatus = getWidgetText.hooks.fallback.noTasks('ko');
  }

  return {
    id: project.id,
    projectId: project.no,
    projectName: project.name,
    client: clientName,
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
    // 구조화된 작업 데이터 (Badge UI용)
    taskSummary: wbsTasks.length > 0 ? {
      totalCount: wbsTasks.length,
      pendingCount: pendingTasks.length,
      inProgressCount: inProgressTasks.length,
      completedCount: completedTasks.length,
      latestTask: latestTask ? {
        name: latestTask.name,
        status: latestTask.status
      } : undefined
    } : undefined,
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

      // ProjectService에서 데이터 조회 (WBS Tasks 포함)
      const allProjects = await projectService.getAll();

      // Project → ProjectReview 변환 (WBS tasks 포함) - 병렬 처리
      const reviews = await Promise.all(
        allProjects.map(project => convertProjectToReview(project))
      );

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
    const unsubscribeProjects = projectService['storage'].subscribe('projects', loadProjects);

    return () => {
      unsubscribeProjects();
    };
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    refresh: loadProjects,
  };
}
