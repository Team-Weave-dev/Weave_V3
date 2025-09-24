'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getProjectPageText } from '@/config/brand';
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const lang = 'ko';

  const handleClose = () => {
    // Navigate back to projects list
    router.push('/projects');
  };

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
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getProjectPageText.deleteModalTitle(lang)}</DialogTitle>
            <DialogDescription>
              {getProjectPageText.deleteModalMessage(lang)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              {getProjectPageText.deleteModalCancel(lang)}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {getProjectPageText.deleteModalConfirm(lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}