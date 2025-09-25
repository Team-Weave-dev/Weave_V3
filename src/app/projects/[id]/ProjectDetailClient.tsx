'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import ProjectCreateModal from '@/app/projects/components/ProjectCreateModal';
import { AlertCircleIcon } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { fetchMockProjects, fetchMockProject, removeCustomProject, addCustomProject, updateCustomProject } from '@/lib/mock/projects';
import { useToast } from '@/hooks/use-toast';

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
  const lang = 'ko';

  const handleClose = () => {
    // Navigate back to projects list
    router.push('/projects');
  };

  const handleCreateProject = () => {
    console.log('📝 새 프로젝트 생성 모달 열기');
    setIsCreateModalOpen(true);
  };

  const handleProjectCreate = useCallback((newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => {
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

      console.log('✅ 새 프로젝트 생성 성공:', {
        id: projectWithId.id,
        no: projectWithId.no,
        name: projectWithId.name
      });

      // 성공 토스트 표시
      toast({
        title: "프로젝트 생성 완료",
        description: `${projectWithId.name} 프로젝트가 성공적으로 생성되었습니다.`,
      });

      // 모달 닫기 및 새 프로젝트로 이동
      setIsCreateModalOpen(false);
      router.push(`/projects/${projectWithId.no}`);
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

  const handleEdit = () => {
    if (!project) return;

    // 간단한 프로젝트명 편집 (향후 완전한 편집 모달로 업그레이드 예정)
    const newName = prompt('프로젝트명을 수정하세요:', project.name);

    if (newName && newName.trim() && newName.trim() !== project.name) {
      try {
        const success = updateCustomProject(project.no, {
          name: newName.trim()
        });

        if (success) {
          console.log('✅ 프로젝트 편집 성공:', {
            id: project.id,
            no: project.no,
            oldName: project.name,
            newName: newName.trim()
          });

          // 성공 토스트 표시
          toast({
            title: "프로젝트 수정 완료",
            description: `프로젝트명이 "${newName.trim()}"로 변경되었습니다.`,
          });

          // 프로젝트 데이터 새로고침
          refreshProjectData();
        } else {
          console.log('⚠️ 프로젝트 편집 실패: 프로젝트를 찾을 수 없음', project.no);

          // 실패 토스트 표시
          toast({
            title: "수정 실패",
            description: "프로젝트를 찾을 수 없거나 수정할 수 없습니다.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ 프로젝트 편집 중 오류 발생:', error);

        // 오류 토스트 표시
        toast({
          title: "수정 오류",
          description: "프로젝트 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    } else if (newName === '') {
      // 빈 문자열 입력 시 경고
      toast({
        title: "입력 오류",
        description: "프로젝트명은 비어있을 수 없습니다.",
        variant: "destructive",
      });
    }
    // 취소하거나 동일한 이름을 입력한 경우 아무것도 하지 않음
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="mb-6">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-10 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
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

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreate={handleProjectCreate}
      />
    </>
  );
}
