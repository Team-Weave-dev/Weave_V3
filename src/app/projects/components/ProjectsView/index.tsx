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
import { getButtonText, getLoadingText } from '@/config/brand';
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner';
import { fetchMockProjects, addCustomProject } from '@/lib/mock/projects';
import { addProjectDocument } from '@/lib/mock/documents';
import type { DocumentInfo } from '@/lib/types/project-table.types';
import type { GeneratedDocument, ProjectDocumentCategory } from '@/lib/document-generator/templates';
import { withMinimumDuration, getActualProjectStatus } from '@/lib/utils';

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 프로젝트 데이터 새로고침 함수
  const refreshProjectData = useCallback(async () => {
    console.log('🔄 ProjectsView: 프로젝트 데이터 새로고침 시작');
    setLoading(true);

    // 다음 렌더링 사이클까지 대기 (loading UI가 실제로 표시되도록)
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    try {
      // 최소 300ms 로딩 시간 보장하여 UI 깜빡임 방지
      const data = await withMinimumDuration(fetchMockProjects(), 300);
      setRawProjectData(data);
      console.log('✅ ProjectsView: 프로젝트 데이터 새로고침 완료', data.length, '개 프로젝트');

      // useProjectTable의 useEffect가 initialData 변경을 감지하여 자동 동기화됨
    } catch (error) {
      console.error('❌ ProjectsView: 프로젝트 데이터 새로고침 실패', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // useProjectTable 훅으로부터 모든 필요한 값들 가져오기
  const {
    data: sortedProjectData,
    updateData,
    // 테이블 설정
    config,
    updateConfig,
    resetColumnConfig,
    resetFilters,
    updatePageSize,
    // 페이지네이션
    paginatedData,
    filteredCount,
    totalCount,
    totalPages,
    updatePage,
    canGoToPreviousPage,
    canGoToNextPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    // 삭제 모드
    isDeleteMode,
    selectedItems,
    toggleDeleteMode,
    handleItemSelect,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected,
    // 기타
    availableClients
  } = useProjectTable(rawProjectData, refreshProjectData);

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

  const handleViewModeChange = useCallback(async (newMode: ViewMode) => {
    // 전환 애니메이션 시작
    setIsTransitioning(true);

    // 150ms 페이드아웃 대기
    await new Promise(resolve => setTimeout(resolve, 150));

    // 뷰 모드 변경
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

    // 페이드인 대기 후 전환 종료
    await new Promise(resolve => setTimeout(resolve, 50));
    setIsTransitioning(false);
  }, [pathname, router, searchParams, sortedProjectData]);

  const handleProjectSelect = useCallback((projectNo: string) => {
    router.push(`/projects/${projectNo}`);
  }, [router]);

  const handleCreateProject = useCallback(() => {
    console.log('📝 ProjectsView: 새 프로젝트 버튼 클릭됨!');
    setIsCreateModalOpen(true);
  }, []);

  // GeneratedDocument를 DocumentInfo로 변환하는 헬퍼 함수
  const convertGeneratedDocumentToDocumentInfo = useCallback((doc: GeneratedDocument): DocumentInfo => {
    // category를 type으로 매핑 (others → etc)
    const typeMapping: Record<ProjectDocumentCategory, DocumentInfo['type']> = {
      'contract': 'contract',
      'invoice': 'invoice',
      'report': 'report',
      'estimate': 'estimate',
      'others': 'etc'
    }

    return {
      id: doc.id,
      type: typeMapping[doc.category],
      name: doc.title,
      createdAt: doc.createdAt.toISOString(),
      status: 'draft', // 새로 생성된 문서는 초안 상태
      content: doc.content,
      templateId: doc.templateId,
      source: 'generated' // 템플릿에서 생성됨
    }
  }, [])

  // WEAVE_num 프로젝트 번호에서 다음 사용 가능한 번호를 찾는 헬퍼 함수
  const getNextProjectNumber = useCallback((existingProjects: ProjectTableRow[]): string => {
    // 기존 프로젝트들의 WEAVE_xxx 번호에서 xxx 부분을 추출하여 숫자로 변환
    const existingNumbers = existingProjects
      .map(p => p.no)
      .filter(no => no.startsWith('WEAVE_'))
      .map(no => {
        const match = no.match(/^WEAVE_(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    console.log('📊 기존 WEAVE 번호들:', existingNumbers);

    // 최대값 찾기 (없으면 0)
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;

    console.log('🔢 다음 프로젝트 번호:', `WEAVE_${String(nextNumber).padStart(3, '0')}`);
    return `WEAVE_${String(nextNumber).padStart(3, '0')}`;
  }, []);

  const handleProjectCreate = useCallback(async (newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => {
    console.log('🚀 ProjectsView: handleProjectCreate 호출됨!', newProject);
    try {
      // 새 프로젝트 ID 및 번호 생성
      const timestamp = Date.now();
      const projectId = `project-${timestamp}`;
      const projectNo = getNextProjectNumber(rawProjectData);

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

      // 생성된 문서들이 있으면 로컬스토리지에 저장
      if (newProject.generatedDocuments && newProject.generatedDocuments.length > 0) {
        console.log('📄 생성된 문서들을 로컬스토리지에 저장:', newProject.generatedDocuments);
        newProject.generatedDocuments.forEach(generatedDoc => {
          const documentInfo = convertGeneratedDocumentToDocumentInfo(generatedDoc);
          console.log('💾 문서 저장:', documentInfo);
          addProjectDocument(projectNo, documentInfo);
        });
        console.log('✅ 모든 생성 문서가 로컬스토리지에 저장 완료');
      }

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
  }, [rawProjectData, viewMode, searchParams, pathname, router, updateData, getNextProjectNumber]);

  const stats = useMemo(() => {
    if (loading || rawProjectData.length === 0) {
      return {
        totalCount: 0,
        planning: 0,
        review: 0,
        inProgress: 0,
        onHold: 0,
        cancelled: 0,
        completed: 0
      };
    }

    // 🎯 자동 결정 로직을 사용하여 실제 표시 상태로 카운트
    // getActualProjectStatus를 사용하여 UI와 일관된 상태 계산
    return {
      totalCount: rawProjectData.length,
      planning: rawProjectData.filter(p => getActualProjectStatus(p) === 'planning').length,
      review: rawProjectData.filter(p => getActualProjectStatus(p) === 'review').length,
      inProgress: rawProjectData.filter(p => getActualProjectStatus(p) === 'in_progress').length,
      onHold: rawProjectData.filter(p => getActualProjectStatus(p) === 'on_hold').length,
      cancelled: rawProjectData.filter(p => getActualProjectStatus(p) === 'cancelled').length,
      completed: rawProjectData.filter(p => getActualProjectStatus(p) === 'completed').length
    };
  }, [rawProjectData, loading]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 중앙화된 mock 데이터 사용 + 최소 로딩 시간 보장
      const data = await withMinimumDuration(fetchMockProjects(), 300);
      setRawProjectData(data);
      setLoading(false);
    };

    loadData();
  }, []);

  // Storage 이벤트로 다른 탭의 localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 프로젝트 관련 localStorage 키가 변경되었을 때만 리프레시
      if (e.key === 'weave_custom_projects' || e.key === 'weave_project_documents') {
        console.log('📦 Storage 변경 감지 - 다른 탭에서 데이터 업데이트됨:', e.key);
        refreshProjectData();
      }
    };

    // Storage 이벤트: 다른 탭/윈도우에서 localStorage 변경 시에만 감지
    // 장점: 실제 데이터 변경만 감지, 단순 포커스 이동으로는 리프레시 안 됨
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshProjectData]);

  // Clean Slate: 복잡한 병합 로직 제거됨

  // 초기화 중이거나 로딩 중일 때 전체 페이지 스피너 표시
  if (!isInitialized || loading) {
    return <FullPageLoadingSpinner text={getLoadingText.data('ko')} />;
  }

  return (
    <div className="container mx-auto p-6">
      <ProjectHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onCreateProject={handleCreateProject}
        stats={stats}
        projects={rawProjectData}
        loading={false}
      />

      <div
        className="transition-all duration-200 ease-in-out"
        style={{
          opacity: isTransitioning ? 0.5 : 1,
          transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)'
        }}
      >
        {viewMode === 'list' ? (
          <ListView
            projects={sortedProjectData}
            onProjectClick={handleProjectSelect}
            loading={false}
            showColumnSettings={true}
            onProjectsChange={refreshProjectData}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            // useProjectTable 상태를 ListView에 전달
            config={config}
            updateConfig={updateConfig}
            resetColumnConfig={resetColumnConfig}
            resetFilters={resetFilters}
            updatePageSize={updatePageSize}
            paginatedData={paginatedData}
            filteredCount={filteredCount}
            totalCount={totalCount}
            totalPages={totalPages}
            updatePage={updatePage}
            canGoToPreviousPage={canGoToPreviousPage}
            canGoToNextPage={canGoToNextPage}
            goToFirstPage={goToFirstPage}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            goToLastPage={goToLastPage}
            isDeleteMode={isDeleteMode}
            selectedItems={selectedItems}
            toggleDeleteMode={toggleDeleteMode}
            handleItemSelect={handleItemSelect}
            handleSelectAll={handleSelectAll}
            handleDeselectAll={handleDeselectAll}
            handleDeleteSelected={handleDeleteSelected}
            availableClients={availableClients}
          />
        ) : (
          <DetailView
            projects={sortedProjectData}
            selectedProjectId={selectedProjectId}
            loading={false}
            showColumnSettings={false}
            onProjectsChange={refreshProjectData}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </div>
  );
}
