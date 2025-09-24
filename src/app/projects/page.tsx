import { Suspense } from 'react';
import ProjectsView from './components/ProjectsView';

/**
 * Projects page - Main routing entry point
 *
 * This is kept simple and delegates all logic to ProjectsView component.
 * This separation makes it clear that page.tsx is just for routing,
 * while the actual business logic lives in components.
 */
export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <ProjectsView />
    </Suspense>
  );
}