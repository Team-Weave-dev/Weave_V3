import type { ProjectTableRow } from '@/lib/types/project-table.types';

/**
 * Generate mock project data
 * Used consistently across all project views
 */
export function generateMockProjects(): ProjectTableRow[] {
  const clients = ['Client A', 'Client B', 'Client C', 'Client D', 'Client E'];
  const statuses: ProjectTableRow['status'][] = [
    'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'
  ];

  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const baseDate = new Date(2024, 0, 1);
  const dayInterval = 7;

  return Array.from({ length: 20 }, (_, i) => {
    const seed1 = i * 1234 + 5678;
    const seed2 = i * 2345 + 6789;
    const seed3 = i * 3456 + 7890;
    const seed4 = i * 4567 + 8901;
    const seed5 = i * 5678 + 9012;

    const registrationDate = new Date(
      baseDate.getTime() +
      (i * dayInterval * 24 * 60 * 60 * 1000) +
      (Math.floor(seededRandom(seed1) * 3) * 24 * 60 * 60 * 1000)
    );
    const dueDate = new Date(
      registrationDate.getTime() +
      Math.floor(seededRandom(seed2) * 90) * 24 * 60 * 60 * 1000
    );

    const currentDate = new Date();
    const maxModifyTime = Math.min(
      currentDate.getTime(),
      registrationDate.getTime() + 180 * 24 * 60 * 60 * 1000
    );
    const modifyTimeRange = maxModifyTime - registrationDate.getTime();
    const modifiedDate = new Date(
      registrationDate.getTime() +
      Math.floor(seededRandom(seed3) * modifyTimeRange)
    );

    const progress = Math.floor(seededRandom(seed4) * 101);
    let paymentProgress = 0;

    if (progress >= 80) {
      paymentProgress = Math.floor(80 + seededRandom(seed5) * 21);
    } else if (progress >= 50) {
      paymentProgress = Math.floor(30 + seededRandom(seed5) * 51);
    } else if (progress >= 20) {
      paymentProgress = Math.floor(10 + seededRandom(seed5) * 31);
    } else {
      paymentProgress = Math.floor(seededRandom(seed5) * 21);
    }

    const statusIndex = Math.floor(seededRandom(seed1 + seed2) * statuses.length);
    if (statuses[statusIndex] === 'completed' && seededRandom(seed3 + seed4) > 0.3) {
      paymentProgress = 100;
    }

    return {
      id: `project-${i + 1}`,
      no: `WEAVE_${String(i + 1).padStart(3, '0')}`,
      name: `프로젝트 ${i + 1}`,
      registrationDate: registrationDate.toISOString(),
      client: clients[i % clients.length],
      progress,
      paymentProgress,
      status: statuses[statusIndex],
      dueDate: dueDate.toISOString(),
      modifiedDate: modifiedDate.toISOString(),
      hasContract: seededRandom(seed1 + 1000) > 0.5,
      hasBilling: seededRandom(seed2 + 1000) > 0.3,
      hasDocuments: seededRandom(seed3 + 1000) > 0.4
    };
  });
}

/**
 * Get a single project by ID or No
 */
export function getMockProjectById(id: string): ProjectTableRow | null {
  const projects = generateMockProjects();
  return projects.find(p => p.id === id || p.no === id) || null;
}

/**
 * Simulate async data fetching
 */
export async function fetchMockProjects(): Promise<ProjectTableRow[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateMockProjects();
}

/**
 * Simulate async single project fetching
 */
export async function fetchMockProject(id: string): Promise<ProjectTableRow | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return getMockProjectById(id);
}