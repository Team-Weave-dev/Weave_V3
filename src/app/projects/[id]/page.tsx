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
 * - Loading state handled by ProjectDetailClient
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;

  return <ProjectDetailClient projectId={resolvedParams.id} />;
}