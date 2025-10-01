'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import ProjectCreateModal from '@/app/projects/components/ProjectCreateModal';
import { AlertCircleIcon } from 'lucide-react';
import { getProjectPageText, getLoadingText } from '@/config/brand';
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner';
import type { ProjectTableRow, ProjectStatus, SettlementMethod, PaymentStatus, Currency } from '@/lib/types/project-table.types';
import { fetchMockProjects, fetchMockProject, removeCustomProject, addCustomProject, updateCustomProject } from '@/lib/mock/projects';
import { addProjectDocument, getProjectDocuments } from '@/lib/mock/documents';
import type { DocumentInfo } from '@/lib/types/project-table.types';
import type { ProjectDocumentCategory } from '@/lib/document-generator/templates';
import { useToast } from '@/hooks/use-toast';

// 🔄 카테고리를 DocumentInfo 타입으로 매핑하는 헬퍼 함수 (ProjectDetail과 동일한 로직)
const mapCategoryToDocumentType = (category: ProjectDocumentCategory): DocumentInfo['type'] => {
  switch (category) {
    case 'contract':
      return 'contract';
    case 'invoice':
      return 'invoice';
    case 'estimate':
      return 'estimate';
    case 'report':
      return 'report';
    case 'others':
      return 'etc';
    default:
      return 'etc';
  }
};

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
  currency?: Currency;
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

interface ProjectDetailClientProps {
  projectId: string;
}

/**
 * Client Component Wrapper for ProjectDetail
 * Handles client-side interactions and navigation with localStorage support
 */
export default function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectList, setProjectList] = useState<ProjectTableRow[]>([]);
  const [project, setProject] = useState<ProjectTableRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleClose = () => {
    // Navigate back to projects list
    router.push('/projects');
  };

  const handleCreateProject = () => {
    console.log('📝 새 프로젝트 생성 모달 열기');
    setIsCreateModalOpen(true);
  };

  const handleProjectCreate = useCallback(async (newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => {
    try {
      // 새 프로젝트 ID와 번호 생성
      const timestamp = Date.now();
      const projectWithId: ProjectTableRow = {
        ...newProject,
        id: `project-${timestamp}`,
        no: `WEAVE_${String(projectList.length + 1).padStart(3, '0')}`,
        modifiedDate: new Date().toISOString()
      };

      // localStorage에 프로젝트 추가
      addCustomProject(projectWithId);

      // 🎯 생성된 문서들을 개별 프로젝트와 동일한 방식으로 저장 (성공하는 플로우 적용)
      if (newProject.generatedDocuments && newProject.generatedDocuments.length > 0) {
        try {
          console.log(`📄 프로젝트 ${projectWithId.no}에 ${newProject.generatedDocuments.length}개의 문서를 개별 저장 방식으로 저장 시작`);

          // 🔄 각 문서를 개별적으로 저장하고 검증까지 완료
          for (const [index, genDoc] of newProject.generatedDocuments.entries()) {
            const newDocument: DocumentInfo = {
              id: `${genDoc.templateId}-${Date.now()}-${index}`, // 고유성 보장을 위해 index 추가
              type: mapCategoryToDocumentType(genDoc.category),
              name: genDoc.title,
              createdAt: new Date().toISOString(),
              status: 'draft',
              content: genDoc.content,
              templateId: genDoc.templateId,
              source: 'generated'
            };

            // 개별 문서 저장 (커스텀 이벤트 자동 발생)
            addProjectDocument(projectWithId.no, newDocument);

            // 🚀 실제 저장 검증: localStorage에서 문서가 실제로 저장되었는지 확인
            let verificationAttempts = 0;
            const maxAttempts = 10;

            while (verificationAttempts < maxAttempts) {
              const storedDocs = getProjectDocuments(projectWithId.no);
              const isDocumentSaved = storedDocs.some(doc => doc.id === newDocument.id);

              if (isDocumentSaved) {
                console.log(`✅ 문서 저장 및 검증 완료 (${verificationAttempts + 1}회 시도): ${newDocument.name} (${newDocument.type})`);
                break;
              }

              verificationAttempts++;
              console.log(`⏳ 문서 저장 검증 중... (${verificationAttempts}/${maxAttempts}): ${newDocument.name}`);
              await new Promise(resolve => setTimeout(resolve, 50));
            }

            if (verificationAttempts >= maxAttempts) {
              console.error(`❌ 문서 저장 검증 실패: ${newDocument.name}`);
              throw new Error(`문서 저장 실패: ${newDocument.name}`);
            }
          }

          // 🔍 최종 검증: 모든 문서가 실제로 저장되었는지 확인
          const finalStoredDocs = getProjectDocuments(projectWithId.no);
          console.log(`🔍 최종 검증: localStorage에 ${finalStoredDocs.length}개 문서 저장됨 (예상: ${newProject.generatedDocuments.length}개)`);

          if (finalStoredDocs.length !== newProject.generatedDocuments.length) {
            throw new Error(`문서 개수 불일치: 저장됨 ${finalStoredDocs.length}개, 예상 ${newProject.generatedDocuments.length}개`);
          }

          console.log(`🎉 프로젝트 ${projectWithId.no}에 ${newProject.generatedDocuments.length}개의 문서 저장 및 검증 완료!`);
        } catch (error) {
          console.error('❌ 생성된 문서 저장 중 오류:', error);
        }
      }

      console.log('✅ 새 프로젝트 생성 성공:', {
        id: projectWithId.id,
        no: projectWithId.no,
        name: projectWithId.name,
        documentsCount: newProject.generatedDocuments?.length || 0
      });

      // 성공 토스트 표시
      toast({
        title: "프로젝트 생성 완료",
        description: `${projectWithId.name} 프로젝트가 성공적으로 생성되었습니다.`,
      });

      // ⏱️ localStorage 저장 완료 확인 후 페이지 이동 (브라우저 캐싱 문제 해결)
      setIsCreateModalOpen(false);

      // 🔍 페이지 이동 전 최종 상태 확인 및 추가 동기화 시간
      console.log('🔄 페이지 이동 전 최종 상태 확인...');
      const finalVerificationDocs = getProjectDocuments(projectWithId.no);
      console.log(`📊 최종 확인: 프로젝트 ${projectWithId.no}에 ${finalVerificationDocs.length}개 문서 저장 확인`);

      // 더 안전한 동기화 대기 시간 (localStorage 완전 동기화)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🚀 페이지 이동 시작 (검증 완료 후)
      console.log('🚀 페이지 이동 시작 (문서 저장 검증 완료):', `/projects/${projectWithId.no}`);

      // 방법 1: 타임스탬프를 추가하여 캐시 무효화
      const refreshTimestamp = Date.now();
      const urlWithCacheBuster = `/projects/${projectWithId.no}?refresh=${refreshTimestamp}`;

      // 방법 2: replace 사용하여 히스토리 스택 정리
      router.replace(urlWithCacheBuster);

      // 방법 3: 추가 안전장치 - 페이지 로드 후 localStorage 상태 체크를 위한 이벤트 발생
      if (typeof window !== 'undefined') {
        // 새 페이지에서 문서 새로고침을 강제하는 커스텀 이벤트 발생
        const refreshEvent = new CustomEvent('weave-force-documents-refresh', {
          detail: {
            projectNo: projectWithId.no,
            timestamp: refreshTimestamp,
            documentCount: newProject.generatedDocuments?.length || 0
          }
        });
        window.dispatchEvent(refreshEvent);
        console.log('🔔 [FORCE REFRESH EVENT] 강제 문서 새로고침 이벤트 발생');
      }
    } catch (error) {
      console.error('❌ 프로젝트 생성 중 오류 발생:', error);

      // 오류 토스트 표시
      toast({
        title: "생성 오류",
        description: "프로젝트 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  }, [projectList.length, toast, router]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 프로젝트 데이터와 프로젝트 목록을 병렬로 로딩
        const [projectData, projectsData] = await Promise.all([
          fetchMockProject(projectId),
          fetchMockProjects()
        ]);

        if (mounted) {
          if (projectData) {
            setProject(projectData);
            setProjectList(projectsData);
            console.log('✅ 개별 프로젝트 페이지: 데이터 로딩 성공', {
              id: projectData.id,
              no: projectData.no,
              name: projectData.name,
              client: projectData.client
            });
          } else {
            setError('프로젝트를 찾을 수 없습니다');
            console.log('❌ 개별 프로젝트 페이지: 프로젝트 데이터 없음', projectId);
          }
        }
      } catch (error) {
        console.error('Failed to load project data', error);
        if (mounted) {
          setError('프로젝트 데이터를 불러오는데 실패했습니다');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  // 프로젝트 데이터 새로고침 함수
  const refreshProjectData = useCallback(async () => {
    if (!projectId) return;

    try {
      const updatedProject = await fetchMockProject(projectId);
      if (updatedProject) {
        setProject(updatedProject);
        console.log('✅ 프로젝트 데이터 새로고침 완료:', {
          id: updatedProject.id,
          no: updatedProject.no,
          name: updatedProject.name
        });
      }
    } catch (error) {
      console.error('❌ 프로젝트 데이터 새로고침 실패:', error);
    }
  }, [projectId]);

  const combinedProjects = useMemo(() => {
    if (!project) return projectList;

    const map = new Map<string, ProjectTableRow>();
    projectList.forEach((item) => {
      map.set(item.no, item);
    });
    map.set(project.no, project);
    return Array.from(map.values());
  }, [project, projectList]);

  const sortedProjects = useMemo(() => {
    return [...combinedProjects].sort((a, b) => a.no.localeCompare(b.no));
  }, [combinedProjects]);

  const currentIndex = useMemo(() => {
    if (!project) return -1;
    return sortedProjects.findIndex((item) => item.no === project.no);
  }, [sortedProjects, project]);

  const canNavigatePrevious = currentIndex > 0;
  const canNavigateNext = currentIndex !== -1 && currentIndex < sortedProjects.length - 1;

  const handleNavigatePrevious = useCallback(() => {
    if (!canNavigatePrevious) {
      return;
    }

    const previousProject = sortedProjects[currentIndex - 1];
    if (previousProject) {
      router.push(`/projects/${previousProject.no}`);
    }
  }, [canNavigatePrevious, currentIndex, sortedProjects, router]);

  const handleNavigateNext = useCallback(() => {
    if (!canNavigateNext) {
      return;
    }

    const nextProject = sortedProjects[currentIndex + 1];
    if (nextProject) {
      router.push(`/projects/${nextProject.no}`);
    }
  }, [canNavigateNext, currentIndex, sortedProjects, router]);

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

      // 수금 상태가 잔금 완료로 변경되면 프로젝트 상태도 완료로 자동 변경
      if (field === 'paymentStatus' && value === 'final_completed') {
        newData.status = 'completed';
      }

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
    if (!project || !validateForm()) return;

    console.log('💾 편집 내용 저장 시작:', editState.editingData);
    setEditState(prev => ({ ...prev, isLoading: true }));

    try {
      const success = updateCustomProject(project.no, editState.editingData);

      if (success) {
        console.log('✅ 프로젝트 편집 성공:', {
          id: project.id,
          no: project.no,
          changes: editState.editingData
        });

        toast({
          title: "프로젝트 수정 완료",
          description: "프로젝트 정보가 성공적으로 업데이트되었습니다.",
        });

        resetEditState();
        refreshProjectData();
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

  // 편집 시작 핸들러 (기존 handleEdit 대체)
  const handleEdit = () => {
    if (!project) return;
    enterEditMode(project);
  };

  const handleDelete = () => {
    if (!project) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!project) return;

    try {
      // localStorage에서 프로젝트 삭제
      const deleted = removeCustomProject(project.no);

      if (deleted) {
        console.log('✅ 프로젝트 삭제 성공:', { id: project.id, no: project.no, name: project.name });

        // 성공 토스트 표시
        toast({
          title: "프로젝트 삭제 완료",
          description: `${project.name} 프로젝트가 성공적으로 삭제되었습니다.`,
        });

        // 모달 닫기 및 프로젝트 목록으로 이동
        setIsDeleteModalOpen(false);
        router.push('/projects');
      } else {
        console.log('⚠️ 프로젝트 삭제 실패: 프로젝트를 찾을 수 없음', project.no);

        // 실패 토스트 표시
        toast({
          title: "삭제 실패",
          description: "프로젝트를 찾을 수 없거나 삭제할 수 없습니다.",
          variant: "destructive",
        });

        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('❌ 프로젝트 삭제 중 오류 발생:', error);

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

  // 단계 초기화 핸들러
  const handleResetStatus = () => {
    if (!project) return;

    try {
      const success = updateCustomProject(project.no, {
        status: 'planning',
        paymentStatus: 'not_started'
      });

      if (success) {
        console.log('✅ 프로젝트 단계 초기화 성공:', {
          id: project.id,
          no: project.no,
          name: project.name
        });

        toast({
          title: "단계 초기화 완료",
          description: "프로젝트가 기획 단계로 초기화되었습니다.",
        });

        refreshProjectData();
      } else {
        throw new Error('단계 초기화 실패');
      }
    } catch (error) {
      console.error('❌ 단계 초기화 중 오류 발생:', error);

      toast({
        title: "초기화 실패",
        description: "단계 초기화 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 로딩 상태
  if (loading) {
    return <FullPageLoadingSpinner text={getLoadingText.content('ko')} />;
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">프로젝트를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 프로젝트 데이터가 없는 경우
  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">프로젝트를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 프로젝트가 존재하지 않습니다.</p>
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectDetail
        project={project}
        mode="full"
        onClose={handleClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateProject={handleCreateProject}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        canNavigatePrevious={canNavigatePrevious}
        canNavigateNext={canNavigateNext}
        // 편집 관련 props
        editState={editState}
        onUpdateField={updateField}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        // 단계 초기화
        onResetStatus={handleResetStatus}
      />

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

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </>
  );
}
