/**
 * useRecentActivity Hook
 *
 * ProjectService, TaskService, DocumentService에서 데이터를 집계하여
 * 최근 활동 내역을 생성하고 RecentActivityWidget에서 사용
 */

'use client';

import { useEffect, useState } from 'react';
import { projectService, taskService, documentService } from '@/lib/storage';
import type { Project } from '@/lib/storage/types/entities/project';
import type { Task } from '@/lib/storage/types/entities/task';
import type { Document } from '@/lib/storage/types/entities/document';
import type { ActivityItem, ActivityType } from '@/types/dashboard';

interface UseRecentActivityReturn {
  activities: ActivityItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// 현재 사용자 정보 (실제로는 인증 시스템에서 가져옴)
const currentUser = { id: 'current-user', name: '나', initials: '나' };

/**
 * 프로젝트 엔티티를 활동 아이템으로 변환
 */
function projectToActivities(projects: Project[]): ActivityItem[] {
  const activities: ActivityItem[] = [];

  projects.forEach((project) => {
    // 프로젝트 생성 활동
    activities.push({
      id: `project-create-${project.id}`,
      type: 'create' as ActivityType,
      user: currentUser,
      action: '프로젝트를 생성했습니다',
      target: project.name,
      timestamp: new Date(project.registrationDate),
      description: project.clientName ? `클라이언트: ${project.clientName}` : undefined,
    });

    // 프로젝트 완료 활동 (completed 상태인 경우)
    if (project.status === 'completed' && project.completedAt) {
      activities.push({
        id: `project-complete-${project.id}`,
        type: 'complete' as ActivityType,
        user: currentUser,
        action: '프로젝트를 완료했습니다',
        target: project.name,
        timestamp: new Date(project.completedAt),
      });
    }
  });

  return activities;
}

/**
 * 작업 엔티티를 활동 아이템으로 변환
 */
function taskToActivities(tasks: Task[]): ActivityItem[] {
  const activities: ActivityItem[] = [];

  tasks.forEach((task) => {
    // 작업 생성 활동
    activities.push({
      id: `task-create-${task.id}`,
      type: 'create' as ActivityType,
      user: currentUser,
      action: '작업을 생성했습니다',
      target: task.title,
      timestamp: new Date(task.createdAt),
    });

    // 작업 완료 활동 (completed 상태인 경우)
    if (task.status === 'completed' && task.completedAt) {
      activities.push({
        id: `task-complete-${task.id}`,
        type: 'complete' as ActivityType,
        user: currentUser,
        action: '작업을 완료했습니다',
        target: task.title,
        timestamp: new Date(task.completedAt),
      });
    }
  });

  return activities;
}

/**
 * 문서 엔티티를 활동 아이템으로 변환
 */
function documentToActivities(documents: Document[]): ActivityItem[] {
  const activities: ActivityItem[] = [];

  documents.forEach((doc) => {
    // 문서 업로드 활동
    activities.push({
      id: `document-create-${doc.id}`,
      type: 'document' as ActivityType,
      user: currentUser,
      action: '문서를 업로드했습니다',
      target: doc.title || doc.fileName,
      timestamp: new Date(doc.uploadedAt),
      description: doc.type ? `문서 유형: ${doc.type}` : undefined,
    });
  });

  return activities;
}

/**
 * 모든 서비스에서 활동 데이터 집계
 */
async function aggregateActivities(): Promise<ActivityItem[]> {
  // 모든 서비스에서 데이터 가져오기
  const [projects, tasks, documents] = await Promise.all([
    projectService.getAll(),
    taskService.getAll(),
    documentService.getAll(),
  ]);

  // 각 엔티티를 활동으로 변환
  const projectActivities = projectToActivities(projects);
  const taskActivities = taskToActivities(tasks);
  const documentActivities = documentToActivities(documents);

  // 모든 활동 합치기
  const allActivities = [
    ...projectActivities,
    ...taskActivities,
    ...documentActivities,
  ];

  // 시간순으로 정렬 (최신순)
  allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return allActivities;
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

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const aggregated = await aggregateActivities();
      setActivities(aggregated);
    } catch (err) {
      console.error('Failed to load recent activities:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    // Storage 구독 (프로젝트, 작업, 문서 변경 시 자동 리로드)
    const unsubscribeProjects = projectService['storage'].subscribe(
      'projects',
      loadActivities
    );
    const unsubscribeTasks = taskService['storage'].subscribe(
      'tasks',
      loadActivities
    );
    const unsubscribeDocuments = documentService['storage'].subscribe(
      'documents',
      loadActivities
    );

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
      unsubscribeDocuments();
    };
  }, []);

  return {
    activities,
    loading,
    error,
    refresh: loadActivities,
  };
}
