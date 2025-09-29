'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProjectDetail from '@/components/projects/ProjectDetail';
import type { ProjectTableRow, ProjectStatus, SettlementMethod, PaymentStatus } from '@/lib/types/project-table.types';
import { getProjectPageText } from '@/config/brand';
import ProjectCardCustom from '@/components/projects/shared/ProjectCardCustom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import Pagination from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronDown, ChevronUp, RotateCcw, AlertCircleIcon } from 'lucide-react';
import { SimpleViewModeSwitch, ViewMode } from '@/components/ui/view-mode-switch';
import { getViewModeText } from '@/config/brand';
import { layout } from '@/config/constants';
import { removeCustomProject, updateCustomProject } from '@/lib/mock/projects';
import { useToast } from '@/hooks/use-toast';

// 편집 가능한 프로젝트 데이터 인터페이스
interface EditableProjectData {
  name: string;
  client: string;
  status: ProjectStatus;
  dueDate: string;
  progress: number;
  projectContent?: string;
  totalAmount?: number;
  settlementMethod?: SettlementMethod;
  paymentStatus?: PaymentStatus;
}

// 편집 상태 인터페이스
interface ProjectEditState {
  isEditing: boolean;
  editingData: EditableProjectData;
  originalData: ProjectTableRow | null;
  errors: Record<string, string>;
  isLoading: boolean;
  isDirty: boolean;
}

interface DetailViewProps {
  projects: ProjectTableRow[];
  selectedProjectId: string | null;
  loading?: boolean;
  showColumnSettings?: boolean; // 컬럼 설정 버튼 표시 여부
  onProjectsChange?: () => void; // 프로젝트 목록 변경 시 호출되는 콜백
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
  showColumnSettings = false, // 기본값은 false (DetailView에서는 숨김)
  onProjectsChange,
  viewMode,
  onViewModeChange
}: DetailViewProps) {
  const { toast } = useToast();
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

  // 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const lang = 'ko';

  // 편집 모드 상태
  const [editState, setEditState] = useState<ProjectEditState>({
    isEditing: false,
    editingData: {
      name: '',
      client: '',
      status: 'planning',
      dueDate: '',
      progress: 0,
      projectContent: '',
      totalAmount: undefined,
      settlementMethod: undefined,
      paymentStatus: undefined
    },
    originalData: null,
    errors: {},
    isLoading: false,
    isDirty: false
  });

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

  const selectProjectById = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);

    const indexInFiltered = filteredProjects.findIndex(project => project.id === projectId);
    if (indexInFiltered !== -1) {
      const newPage = Math.floor(indexInFiltered / pageSize) + 1;
      setCurrentPage(prev => (prev === newPage ? prev : newPage));
    }
  }, [filteredProjects, pageSize]);

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

  const navigationProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => a.no.localeCompare(b.no));
  }, [filteredProjects]);

  const selectedProject = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const navigationIndex = useMemo(() => {
    if (!selectedProject) {
      return -1;
    }
    return navigationProjects.findIndex(project => project.id === selectedProject.id);
  }, [navigationProjects, selectedProject]);

  const canNavigatePrevious = navigationIndex > 0;
  const canNavigateNext = navigationIndex !== -1 && navigationIndex < navigationProjects.length - 1;

  const handleNavigatePrevious = useCallback(() => {
    if (!canNavigatePrevious) {
      return;
    }

    const previousProject = navigationProjects[navigationIndex - 1];
    if (previousProject) {
      selectProjectById(previousProject.id);
    }
  }, [canNavigatePrevious, navigationProjects, navigationIndex, selectProjectById]);

  const handleNavigateNext = useCallback(() => {
    if (!canNavigateNext) {
      return;
    }

    const nextProject = navigationProjects[navigationIndex + 1];
    if (nextProject) {
      selectProjectById(nextProject.id);
    }
  }, [canNavigateNext, navigationProjects, navigationIndex, selectProjectById]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


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
    selectProjectById(projectId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setClientFilter('all');
    setCurrentPage(1);
  };

  // 편집 상태 초기화
  const resetEditState = () => {
    setEditState({
      isEditing: false,
      editingData: {
        name: '',
        client: '',
        status: 'planning',
        dueDate: '',
        progress: 0,
        projectContent: '',
        totalAmount: undefined,
        settlementMethod: undefined,
        paymentStatus: undefined
      },
      originalData: null,
      errors: {},
      isLoading: false,
      isDirty: false
    });
    setShowCancelConfirm(false);
  };

  // 편집 모드 시작
  const enterEditMode = (project: ProjectTableRow) => {
    console.log('📝 편집 모드 시작:', project.name);
    setEditState({
      isEditing: true,
      editingData: {
        name: project.name,
        client: project.client,
        status: project.status,
        dueDate: project.dueDate,
        progress: project.progress,
        projectContent: project.projectContent || '',
        totalAmount: project.totalAmount,
        settlementMethod: project.settlementMethod,
        paymentStatus: project.paymentStatus
      },
      originalData: project,
      errors: {},
      isLoading: false,
      isDirty: false
    });
  };

  // 편집 필드 업데이트
  const updateField = (field: keyof EditableProjectData, value: string | number) => {
    setEditState(prev => {
      const newData = {
        ...prev.editingData,
        [field]: value
      };

      // isDirty 체크 - 원본 데이터와 비교
      const isDirty = prev.originalData ?
        JSON.stringify(newData) !== JSON.stringify({
          name: prev.originalData.name,
          client: prev.originalData.client,
          status: prev.originalData.status,
          dueDate: prev.originalData.dueDate,
          progress: prev.originalData.progress,
          projectContent: prev.originalData.projectContent || '',
          totalAmount: prev.originalData.totalAmount,
          settlementMethod: prev.originalData.settlementMethod,
          paymentStatus: prev.originalData.paymentStatus
        }) : false;

      return {
        ...prev,
        editingData: newData,
        isDirty
      };
    });
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!editState.editingData.name.trim()) {
      newErrors.name = '프로젝트명은 필수입니다';
    }

    if (!editState.editingData.client.trim()) {
      newErrors.client = '클라이언트명은 필수입니다';
    }

    // 진행률 검증
    const progress = Number(editState.editingData.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      newErrors.progress = '진행률은 0-100% 사이여야 합니다';
    }

    // 금액 검증
    if (editState.editingData.totalAmount !== undefined && editState.editingData.totalAmount < 0) {
      newErrors.totalAmount = '금액은 0 이상이어야 합니다';
    }

    // 마감일 검증
    const dueDate = new Date(editState.editingData.dueDate);
    if (isNaN(dueDate.getTime())) {
      newErrors.dueDate = '유효한 날짜를 입력해주세요';
    }

    setEditState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // 편집 취소
  const cancelEdit = () => {
    if (editState.isDirty) {
      setShowCancelConfirm(true);
    } else {
      resetEditState();
    }
  };

  // 편집 저장
  const saveEdit = async () => {
    const currentProject = selectedProject;
    if (!currentProject || !validateForm()) return;

    console.log('💾 편집 내용 저장 시작:', editState.editingData);
    setEditState(prev => ({ ...prev, isLoading: true }));

    try {
      const success = updateCustomProject(currentProject.no, editState.editingData);

      if (success) {
        console.log('✅ 프로젝트 편집 성공:', {
          id: currentProject.id,
          no: currentProject.no,
          changes: editState.editingData
        });

        toast({
          title: "프로젝트 수정 완료",
          description: "프로젝트 정보가 성공적으로 업데이트되었습니다.",
        });

        resetEditState();
        // 부모 컴포넌트에 변경사항 알림
        if (onProjectsChange) {
          onProjectsChange();
        }
      } else {
        throw new Error('프로젝트 업데이트 실패');
      }
    } catch (error) {
      console.error('❌ 프로젝트 편집 중 오류 발생:', error);

      toast({
        title: "수정 실패",
        description: "프로젝트 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setEditState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 취소 확인 처리
  const handleCancelConfirm = () => {
    resetEditState();
  };

  const handleEditProject = (projectId?: string) => {
    const projectToEdit = projectId ? projects.find(p => p.id === projectId) : selectedProject;
    if (!projectToEdit) return;

    enterEditMode(projectToEdit);
  };

  const handleDeleteProject = (projectId?: string) => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject) {
      console.log('⚠️ 삭제할 프로젝트를 찾을 수 없음:', selectedProjectId);
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      // localStorage에서 프로젝트 삭제
      const deleted = removeCustomProject(selectedProject.no);

      if (deleted) {
        console.log('✅ DetailView 프로젝트 삭제 성공:', {
          id: selectedProject.id,
          no: selectedProject.no,
          name: selectedProject.name
        });

        // 성공 토스트 표시
        toast({
          title: "프로젝트 삭제 완료",
          description: `${selectedProject.name} 프로젝트가 성공적으로 삭제되었습니다.`,
        });

        // 부모 컴포넌트에 변경사항 알림
        if (onProjectsChange) {
          onProjectsChange();
        }

        // 선택된 프로젝트 초기화 (다른 프로젝트 자동 선택)
        const remainingProjects = projects.filter(p => p.id !== selectedProject.id);
        if (remainingProjects.length > 0) {
          setSelectedProjectId(remainingProjects[0].id);
        } else {
          setSelectedProjectId(null);
        }

        setIsDeleteModalOpen(false);
      } else {
        console.log('⚠️ DetailView 프로젝트 삭제 실패: 프로젝트를 찾을 수 없음', selectedProject.no);

        // 실패 토스트 표시
        toast({
          title: "삭제 실패",
          description: "프로젝트를 찾을 수 없거나 삭제할 수 없습니다.",
          variant: "destructive",
        });

        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('❌ DetailView 프로젝트 삭제 중 오류 발생:', error);

      // 오류 토스트 표시
      toast({
        title: "삭제 오류",
        description: "프로젝트 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });

      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
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
          <SimpleViewModeSwitch
            mode={viewMode}
            onModeChange={onViewModeChange}
            labels={{
              list: getViewModeText.listView('ko'),
              detail: getViewModeText.detailView('ko')
            }}
            ariaLabel={getViewModeText.title('ko')}
          />
          <Input
            type="text"
            placeholder={getProjectPageText.searchPlaceholder('ko')}
            className="flex-1 min-w-64"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className={`flex items-center ${layout.page.header.actions} flex-shrink-0`}>
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
                  <ProjectCardCustom
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onClick={() => handleProjectClick(project.id)}
                    lang="ko"
                  />
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
            editState={editState}
            onEdit={() => handleEditProject(selectedProject.id)}
            onUpdateField={updateField}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onDelete={() => handleDeleteProject(selectedProject.id)}
            onNavigatePrevious={handleNavigatePrevious}
            onNavigateNext={handleNavigateNext}
            canNavigatePrevious={canNavigatePrevious}
            canNavigateNext={canNavigateNext}
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

      <DeleteDialog
        open={isDeleteModalOpen}
        title={getProjectPageText.deleteModalTitle(lang)}
        description={getProjectPageText.deleteModalMessage(lang)}
        confirmLabel={getProjectPageText.deleteModalConfirm(lang)}
        cancelLabel={getProjectPageText.deleteModalCancel(lang)}
        icon={<AlertCircleIcon className="h-8 w-8 text-destructive" />}
        borderClassName="border-2 border-primary"
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* 편집 취소 확인 다이얼로그 */}
      <DeleteDialog
        open={showCancelConfirm}
        title={getProjectPageText.confirmCancelTitle(lang)}
        description={getProjectPageText.confirmCancelMessage(lang)}
        confirmLabel={getProjectPageText.confirmCancelButton(lang)}
        cancelLabel={getProjectPageText.continueEditing(lang)}
        icon={<AlertCircleIcon className="h-8 w-8 text-destructive" />}
        borderClassName="border-2 border-primary"
        onOpenChange={setShowCancelConfirm}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
