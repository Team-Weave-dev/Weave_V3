'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ViewMode } from '@/components/ui/view-mode-switch';
import ProjectHeader from '../ProjectHeader';
import ListView from './ListView';
import DetailView from './DetailView';
import ProjectCreateModal from '../ProjectCreateModal';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { useProjectTable } from '@/lib/hooks/useProjectTable';
import { getButtonText } from '@/config/brand';
import { fetchMockProjects, addCustomProject } from '@/lib/mock/projects';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 프로젝트 데이터 새로고침 함수
  const refreshProjectData = useCallback(async () => {
    console.log('🔄 ProjectsView: 프로젝트 데이터 새로고침 시작');
    setLoading(true);

    try {
      const data = await fetchMockProjects();
      setRawProjectData(data);
      console.log('✅ ProjectsView: 프로젝트 데이터 새로고침 완료', data.length, '개 프로젝트');

      // useProjectTable의 useEffect가 initialData 변경을 감지하여 자동 동기화됨
    } catch (error) {
      console.error('❌ ProjectsView: 프로젝트 데이터 새로고침 실패', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const { data: sortedProjectData, updateData } = useProjectTable(rawProjectData, refreshProjectData);

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
    console.log('📝 ProjectsView: 새 프로젝트 버튼 클릭됨!');
    setIsCreateModalOpen(true);
  }, []);

  const handleProjectCreate = useCallback(async (newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => {
    console.log('🚀 ProjectsView: handleProjectCreate 호출됨!', newProject);
    try {
      // 새 프로젝트 ID 및 번호 생성
      const timestamp = Date.now();
      const projectId = `project-${timestamp}`;
      const projectNo = `WEAVE_${String(rawProjectData.length + 1).padStart(3, '0')}`;

      const projectWithId: ProjectTableRow = {
        ...newProject,
        id: projectId,
        no: projectNo,
        modifiedDate: new Date().toISOString().split('T')[0],
        // 누락된 필드 추가
        documents: [],
        documentStatus: {
          contract: { exists: false, status: 'none', count: 0 },
          invoice: { exists: false, status: 'none', count: 0 },
          report: { exists: false, status: 'none', count: 0 },
          estimate: { exists: false, status: 'none', count: 0 },
          etc: { exists: false, status: 'none', count: 0 }
        }
      };

      console.log('💾 생성된 프로젝트:', projectWithId);

      // localStorage에 새 프로젝트 저장
      addCustomProject(projectWithId);

      // 현재 상태에 직접 새 프로젝트 추가 (맨 앞에 배치)
      const updatedData = [projectWithId, ...rawProjectData];
      console.log('📊 업데이트된 데이터 길이:', updatedData.length);

      setRawProjectData(updatedData);
      updateData(updatedData);

      // 모달 닫기
      setIsCreateModalOpen(false);

      // 성공 메시지
      console.log('✅ 프로젝트 생성 완료:', projectWithId.name);

      // Detail 뷰에서 새 프로젝트로 이동
      if (viewMode === 'detail') {
        const params = new URLSearchParams(searchParams.toString());
        params.set('selected', projectNo);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } catch (error) {
      console.error('❌ 프로젝트 생성 실패:', error);
    }
  }, [rawProjectData, viewMode, searchParams, pathname, router, updateData]);

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

  // Clean Slate: 복잡한 병합 로직 제거됨

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
          showColumnSettings={true}
          onProjectsChange={refreshProjectData}
        />
      ) : (
        <DetailView
          projects={sortedProjectData}
          selectedProjectId={selectedProjectId}
          loading={loading}
          showColumnSettings={false}
          onProjectsChange={refreshProjectData}
        />
      )}

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </div>
  );
}
