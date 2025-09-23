import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';
import { fetchMockProject } from '@/lib/mock/projects';
import type { ProjectTableRow } from '@/lib/types/project-table.types';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Individual Project Page
 *
 * Dynamic route for displaying full project details
 * URL: /projects/[id]
 *
 * Features:
 * - Full screen project detail view
 * - Data fetching with error handling
 * - 404 handling for invalid project IDs
 */
async function getProject(id: string): Promise<ProjectTableRow | null> {
  // 중앙화된 mock 데이터 사용
  const project = await fetchMockProject(id);

  // 실제 구현에서는 API 호출
  // const response = await fetch(`/api/projects/${id}`);
  // if (!response.ok) return null;
  // return response.json();

  return project;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <Suspense fallback={<ProjectPageSkeleton />}>
      <ProjectDetailClient project={project} />
    </Suspense>
  );
}

/**
 * Loading skeleton for project page
 */
function ProjectPageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>

        {/* Progress cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="h-10 bg-muted rounded mb-4"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  );
}