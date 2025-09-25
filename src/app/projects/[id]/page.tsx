import { Suspense } from 'react';
import ProjectDetailClient from './ProjectDetailClient';

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
 * - Client-side data fetching with localStorage support
 * - 404 handling for invalid project IDs
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProjectPageSkeleton />}>
      <ProjectDetailClient projectId={resolvedParams.id} />
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