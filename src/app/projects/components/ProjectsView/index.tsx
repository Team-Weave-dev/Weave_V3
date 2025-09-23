'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ViewMode } from '@/components/ui/view-mode-switch';
import ProjectHeader from '../ProjectHeader';
import ListView from './ListView';
import DetailView from './DetailView';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { useProjectTable } from '@/lib/hooks/useProjectTable';
import { getButtonText } from '@/config/brand';
import { fetchMockProjects } from '@/lib/mock/projects';

export default function ProjectsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlViewMode = searchParams.get('view') as ViewMode | null;
  const selectedProjectId = searchParams.get('selected');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isInitialized, setIsInitialized] = useState(false);
  const [rawProjectData, setRawProjectData] = useState<ProjectTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: sortedProjectData } = useProjectTable(rawProjectData);

  useEffect(() => {
    if (!isInitialized) {
      if (urlViewMode === 'list' || urlViewMode === 'detail') {
        setViewMode(urlViewMode);
      } else {
        const savedMode = localStorage.getItem('preferredViewMode') as ViewMode | null;
        if (savedMode === 'list' || savedMode === 'detail') {
          setViewMode(savedMode);
        }
      }
      setIsInitialized(true);
    }
  }, [urlViewMode, isInitialized]);

  useEffect(() => {
    const currentUrlViewMode = searchParams.get('view') as ViewMode | null;
    if (
      isInitialized &&
      viewMode === 'detail' &&
      currentUrlViewMode === 'detail' &&
      !selectedProjectId &&
      sortedProjectData.length > 0 &&
      !loading
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('selected', sortedProjectData[0].no);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isInitialized, viewMode, selectedProjectId, sortedProjectData, loading, pathname, router, searchParams]);

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
    localStorage.setItem('preferredViewMode', newMode);

    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newMode);

    if (newMode === 'list') {
      params.delete('selected');
    } else if (newMode === 'detail' && !params.has('selected') && sortedProjectData.length > 0) {
      params.set('selected', sortedProjectData[0].no);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, sortedProjectData]);

  const handleProjectSelect = useCallback((projectNo: string) => {
    router.push(`/projects/${projectNo}`);
  }, [router]);

  const handleCreateProject = useCallback(() => {
    console.log('Create new project');
  }, []);

  const stats = useMemo(() => {
    if (loading || rawProjectData.length === 0) {
      return {
        totalCount: 0,
        inProgress: 0,
        completed: 0,
        review: 0
      };
    }

    return {
      totalCount: rawProjectData.length,
      inProgress: rawProjectData.filter(p => p.status === 'in_progress').length,
      completed: rawProjectData.filter(p => p.status === 'completed').length,
      review: rawProjectData.filter(p => p.status === 'review').length
    };
  }, [rawProjectData, loading]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 중앙화된 mock 데이터 사용
      const data = await fetchMockProjects();
      setRawProjectData(data);
      setLoading(false);
    };

    loadData();
  }, []);

  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{getButtonText.loading('ko')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ProjectHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onCreateProject={handleCreateProject}
        stats={stats}
        loading={loading}
      />

      {viewMode === 'list' ? (
        <ListView
          projects={sortedProjectData}
          onProjectClick={handleProjectSelect}
          loading={loading}
        />
      ) : (
        <DetailView
          projects={sortedProjectData}
          selectedProjectId={selectedProjectId}
          loading={loading}
        />
      )}
    </div>
  );
}
