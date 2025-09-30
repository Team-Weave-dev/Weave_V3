import { Suspense } from 'react';
import ProjectsView from './components/ProjectsView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getLoadingText } from '@/config/brand';

/**
 * Projects page - Main routing entry point
 *
 * This is kept simple and delegates all logic to ProjectsView component.
 * This separation makes it clear that page.tsx is just for routing,
 * while the actual business logic lives in components.
 */
export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text={getLoadingText.data('ko')} />
      </div>
    }>
      <ProjectsView />
    </Suspense>
  );
}