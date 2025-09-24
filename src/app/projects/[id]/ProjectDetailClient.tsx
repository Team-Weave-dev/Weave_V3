'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import { AlertCircleIcon } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { fetchMockProjects } from '@/lib/mock/projects';

interface ProjectDetailClientProps {
  project: ProjectTableRow;
}

/**
 * Client Component Wrapper for ProjectDetail
 * Handles client-side interactions and navigation
 */
export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectList, setProjectList] = useState<ProjectTableRow[]>([]);
  const lang = 'ko';

  const handleClose = () => {
    // Navigate back to projects list
    router.push('/projects');
  };

  const handleCreateProject = () => {
    // TODO: Replace with actual navigation when project creation flow is ready
    console.log('Create new project');
  };

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const data = await fetchMockProjects();
        if (mounted) {
          setProjectList(data);
        }
      } catch (error) {
        console.error('Failed to load project list for navigation', error);
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const combinedProjects = useMemo(() => {
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
    return sortedProjects.findIndex((item) => item.no === project.no);
  }, [sortedProjects, project.no]);

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
    // TODO: Implement edit functionality
    console.log('Edit project:', project.id);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement actual delete functionality
    console.log('Deleting project:', project.id);
    setIsDeleteModalOpen(false);
    // Navigate back to projects list after deletion
    router.push('/projects');
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

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
    </>
  );
}
