'use client';

import { useRouter } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import type { ProjectTableRow } from '@/lib/types/project-table.types';

interface ProjectDetailClientProps {
  project: ProjectTableRow;
}

/**
 * Client Component Wrapper for ProjectDetail
 * Handles client-side interactions and navigation
 */
export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();

  const handleClose = () => {
    // Navigate back to projects list
    router.push('/projects');
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit project:', project.id);
  };

  return (
    <ProjectDetail
      project={project}
      mode="full"
      onClose={handleClose}
      onEdit={handleEdit}
    />
  );
}