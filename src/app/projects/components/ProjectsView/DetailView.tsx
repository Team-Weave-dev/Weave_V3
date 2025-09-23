'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Typography from '@/components/ui/typography';
import ProjectDetail from '@/components/projects/ProjectDetail';
import type { ProjectTableRow, ProjectStatus } from '@/lib/types/project-table.types';
import { getProjectPageText, getProjectStatusText } from '@/config/brand';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import Pagination from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { layout } from '@/config/constants';

interface DetailViewProps {
  projects: ProjectTableRow[];
  selectedProjectId: string | null;
  loading?: boolean;
  showColumnSettings?: boolean; // 컬럼 설정 버튼 표시 여부
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
  loading = false,
  showColumnSettings = false // 기본값은 false (DetailView에서는 숨김)
}: DetailViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialSelectedId || (projects.length > 0 ? projects[0].id : null)
  );

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // 검색어 필터
      const searchMatch = searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase());

      // 상태 필터
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;

      // 클라이언트 필터
      const clientMatch = clientFilter === 'all' || project.client === clientFilter;

      return searchMatch && statusMatch && clientMatch;
    });
  }, [projects, searchQuery, statusFilter, clientFilter]);

  // 페이지네이션된 프로젝트 목록
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage, pageSize]);

  // 총 페이지 수
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProjects.length / pageSize);
  }, [filteredProjects.length, pageSize]);

  // 사용 가능한 클라이언트 목록
  const availableClients = useMemo(() => {
    const clients = Array.from(new Set(projects.map(p => p.client)));
    return clients.sort();
  }, [projects]);

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

  // 필터가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, clientFilter]);

  // 프로젝트 목록이 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setClientFilter('all');
    setCurrentPage(1);
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
    <>
      {/* Filter Bar */}
      <div className="mb-6 p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder={getProjectPageText.searchPlaceholder('ko')}
            className="flex-1"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className={`flex items-center ${layout.page.header.actions}`}>
            {/* 필터 버튼 */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="gap-2"
            >
              <Filter className={layout.heights.icon} />
              {getProjectPageText.filterButton('ko')}
              {isFilterOpen ? (
                <ChevronUp className={layout.heights.icon} />
              ) : (
                <ChevronDown className={layout.heights.icon} />
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-background border border-border rounded-md space-y-4">
            <h3 className="text-sm font-medium">{getProjectPageText.filterButton('ko')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 상태 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterStatusLabel('ko')}
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as ProjectStatus | 'all');
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterStatusAll('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getProjectPageText.filterStatusAll('ko')}</SelectItem>
                    <SelectItem value="in_progress">{getProjectPageText.filterStatusInProgress('ko')}</SelectItem>
                    <SelectItem value="review">{getProjectPageText.filterStatusReview('ko')}</SelectItem>
                    <SelectItem value="completed">{getProjectPageText.filterStatusCompleted('ko')}</SelectItem>
                    <SelectItem value="on_hold">{getProjectPageText.filterStatusOnHold('ko')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 클라이언트 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterClientLabel('ko')}
                </label>
                <Select
                  value={clientFilter}
                  onValueChange={(value) => {
                    setClientFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterClientAll('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getProjectPageText.filterClientAll('ko')}</SelectItem>
                    {availableClients.map((client) => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 페이지 개수 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterPageCountLabel('ko')}
                </label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterPageCount10('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">{getProjectPageText.filterPageCount5('ko')}</SelectItem>
                    <SelectItem value="10">{getProjectPageText.filterPageCount10('ko')}</SelectItem>
                    <SelectItem value="20">{getProjectPageText.filterPageCount20('ko')}</SelectItem>
                    <SelectItem value="50">{getProjectPageText.filterPageCount50('ko')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Reset Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <RotateCcw className={layout.heights.icon} />
                {getProjectPageText.resetFilters('ko')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List (Left Panel) */}
        <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {getProjectPageText.projectList('ko')}
            </h3>
            <p className="text-sm text-muted-foreground">
              총 {filteredProjects.length}개 프로젝트 {searchQuery || statusFilter !== 'all' || clientFilter !== 'all' ? `(전체 ${projects.length}개 중)` : ''}
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
    </>
  );
}
