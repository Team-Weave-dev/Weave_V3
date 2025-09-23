'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Typography from '@/components/ui/typography';
import ProjectDetail from '@/components/projects/ProjectDetail';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { getProjectPageText, getProjectStatusText } from '@/config/brand';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import Pagination from '@/components/ui/pagination';

interface DetailViewProps {
  projects: ProjectTableRow[];
  selectedProjectId: string | null;
  loading?: boolean;
}

/**
 * DetailView Component
 *
 * Displays projects in Master-Detail layout:
 * - Left panel: Project list with selection
 * - Right panel: Selected project details using ProjectDetail component
 *
 * Features:
 * - Clickable project list
 * - Full project detail in right panel
 * - Responsive layout
 */
export default function DetailView({
  projects,
  selectedProjectId: initialSelectedId,
  loading = false
}: DetailViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialSelectedId || (projects.length > 0 ? projects[0].id : null)
  );

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // 페이지당 5개 프로젝트

  // 페이지네이션된 프로젝트 목록
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return projects.slice(startIndex, endIndex);
  }, [projects, currentPage, pageSize]);

  // 총 페이지 수
  const totalPages = useMemo(() => {
    return Math.ceil(projects.length / pageSize);
  }, [projects.length, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const selectedProject = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const statusVariantMap: Record<ProjectTableRow['status'], BadgeProps['variant']> = {
    completed: 'status-soft-completed',
    in_progress: 'status-soft-inprogress',
    review: 'status-soft-review',
    planning: 'status-soft-planning',
    on_hold: 'status-soft-onhold',
    cancelled: 'status-soft-cancelled'
  } as const;

  const getStatusVariant = (status: ProjectTableRow['status']) => statusVariantMap[status] || 'secondary';

  useEffect(() => {
    // Auto-select first project if none selected
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // 프로젝트 목록이 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border rounded animate-pulse">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel skeleton */}
        <div className="lg:col-span-2">
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project List (Left Panel) */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {getProjectPageText.projectList('ko')}
            </h3>
            <p className="text-sm text-muted-foreground">
              총 {projects.length}개 프로젝트
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
                {paginatedProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {project.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {project.no} • {project.client}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(project.status)} className="ml-2">
                          {getProjectStatusText(project.status, 'ko')}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">진행률</span>
                            <span className="font-medium">{project.progress || 0}%</span>
                          </div>
                          <ProjectProgress value={project.progress || 0} size="sm" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">결제</span>
                            <span className="font-medium">{project.paymentProgress || 0}%</span>
                          </div>
                          <ProjectProgress value={project.paymentProgress || 0} size="sm" />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        마감일: {new Date(project.dueDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
          </CardContent>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 pb-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                size="sm"
                showInfo={false}
                language="ko"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Project Details (Right Panel) */}
      <div className="lg:col-span-2">
        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            mode="compact"
          />
        ) : (
          <Card className="h-[calc(100vh-200px)]">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                {getProjectPageText.noProjectSelected('ko')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
