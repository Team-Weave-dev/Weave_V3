import type {
  DocumentInfo,
  DocumentStatus,
  ProjectDocumentStatus,
  ProjectTableRow,
  PaymentStatus
} from '@/lib/types/project-table.types';

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
    // 수금상태 결정 (프로젝트 진행률 기반)
    let paymentProgress: PaymentStatus = 'not_started';

    if (progress >= 80) {
      // 80% 이상 진행: 잔금 완료 또는 중도금 완료
      paymentProgress = seededRandom(seed5) > 0.5 ? 'final_completed' : 'interim_completed';
    } else if (progress >= 50) {
      // 50% 이상 진행: 중도금 완료 또는 선금 완료
      paymentProgress = seededRandom(seed5) > 0.6 ? 'interim_completed' : 'advance_completed';
    } else if (progress >= 20) {
      // 20% 이상 진행: 선금 완료
      paymentProgress = 'advance_completed';
    } else {
      // 20% 미만 진행: 미시작
      paymentProgress = 'not_started';
    }

    const statusIndex = Math.floor(seededRandom(seed1 + seed2) * statuses.length);
    // 완료된 프로젝트는 대부분 잔금 완료
    if (statuses[statusIndex] === 'completed' && seededRandom(seed3 + seed4) > 0.3) {
      paymentProgress = 'final_completed';
    }

    const documents = generateProjectDocuments({
      projectIndex: i,
      registrationDate,
      seededRandom,
      seed: seed1 + seed2 + seed3
    });
    const documentStatus = summarizeDocuments(documents);

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
      hasDocuments: documents.length > 0,
      documents,
      documentStatus
    };
  });
}

/**
 * Get a single project by ID or No
 * 기본 mock 데이터와 사용자 생성 프로젝트 모두에서 검색
 */
export function getMockProjectById(id: string): ProjectTableRow | null {
  console.log('🔍 getMockProjectById 호출됨. 검색할 ID:', id);

  // 먼저 사용자 생성 프로젝트에서 찾기
  const customProjects = getCustomProjects();
  console.log('📋 사용자 생성 프로젝트 개수:', customProjects.length);

  if (customProjects.length > 0) {
    console.log('📝 사용자 생성 프로젝트 목록:', customProjects.map(p => ({ id: p.id, no: p.no, name: p.name })));
  }

  const customProject = customProjects.find(p => p.id === id || p.no === id);
  if (customProject) {
    console.log('✅ 사용자 생성 프로젝트에서 발견:', { id: customProject.id, no: customProject.no, name: customProject.name });
    return customProject;
  }

  console.log('⚠️ 사용자 생성 프로젝트에서 찾을 수 없음. 기본 mock 데이터에서 검색 중...');

  // 없으면 기본 mock 데이터에서 찾기
  const baseMockProjects = generateMockProjects();
  const baseMockProject = baseMockProjects.find(p => p.id === id || p.no === id);

  if (baseMockProject) {
    console.log('✅ 기본 mock 데이터에서 발견:', { id: baseMockProject.id, no: baseMockProject.no, name: baseMockProject.name });
    return baseMockProject;
  }

  console.log('❌ 프로젝트를 찾을 수 없음:', id);
  return null;
}

// localStorage 키 상수
const CUSTOM_PROJECTS_KEY = 'weave_custom_projects';

/**
 * localStorage에서 사용자가 생성한 프로젝트들 가져오기
 * SSR 환경에서는 빈 배열 반환
 */
function getCustomProjects(): ProjectTableRow[] {
  // SSR 환경에서는 localStorage 접근 불가
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(CUSTOM_PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading custom projects from localStorage:', error);
    return [];
  }
}

/**
 * localStorage에 사용자가 생성한 프로젝트 저장
 * SSR 환경에서는 아무것도 하지 않음
 */
function saveCustomProjects(projects: ProjectTableRow[]): void {
  // SSR 환경에서는 localStorage 접근 불가
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving custom projects to localStorage:', error);
  }
}

/**
 * 새 프로젝트 추가
 */
export function addCustomProject(project: ProjectTableRow): void {
  console.log('💾 addCustomProject 호출됨:', { id: project.id, no: project.no, name: project.name });

  const existingProjects = getCustomProjects();
  console.log('📋 기존 프로젝트 개수:', existingProjects.length);

  const updatedProjects = [project, ...existingProjects];
  console.log('📝 업데이트된 프로젝트 개수:', updatedProjects.length);

  saveCustomProjects(updatedProjects);

  // 저장 후 검증
  const verifyProjects = getCustomProjects();
  const savedProject = verifyProjects.find(p => p.id === project.id || p.no === project.no);
  if (savedProject) {
    console.log('✅ 프로젝트 저장 성공:', { id: savedProject.id, no: savedProject.no, name: savedProject.name });
  } else {
    console.log('❌ 프로젝트 저장 실패!');
  }
}

/**
 * 프로젝트 업데이트 (ID 또는 번호로)
 */
export function updateCustomProject(idOrNo: string, updates: Partial<ProjectTableRow>): boolean {
  const existingProjects = getCustomProjects();
  const projectIndex = existingProjects.findIndex(p => p.id === idOrNo || p.no === idOrNo);

  if (projectIndex !== -1) {
    // 기존 프로젝트를 업데이트하고 수정일 갱신
    const updatedProject = {
      ...existingProjects[projectIndex],
      ...updates,
      modifiedDate: new Date().toISOString()
    };

    existingProjects[projectIndex] = updatedProject;
    saveCustomProjects(existingProjects);

    console.log('✅ 프로젝트 업데이트 성공:', {
      id: updatedProject.id,
      no: updatedProject.no,
      name: updatedProject.name
    });

    return true;
  }

  console.log('⚠️ 프로젝트 업데이트 실패: 프로젝트를 찾을 수 없음', idOrNo);
  return false;
}

/**
 * 프로젝트 삭제 (ID 또는 번호로)
 */
export function removeCustomProject(idOrNo: string): boolean {
  const existingProjects = getCustomProjects();
  const filteredProjects = existingProjects.filter(
    p => p.id !== idOrNo && p.no !== idOrNo
  );

  if (filteredProjects.length !== existingProjects.length) {
    saveCustomProjects(filteredProjects);
    return true;
  }
  return false;
}

/**
 * 모든 사용자 생성 프로젝트 삭제
 * SSR 환경에서는 아무것도 하지 않음
 */
export function clearCustomProjects(): void {
  // SSR 환경에서는 localStorage 접근 불가
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CUSTOM_PROJECTS_KEY);
  } catch (error) {
    console.error('Error clearing custom projects:', error);
  }
}

/**
 * Simulate async data fetching
 * Clean Slate 접근법: localStorage의 사용자 생성 프로젝트만 반환
 */
export async function fetchMockProjects(): Promise<ProjectTableRow[]> {
  console.log('🚀 fetchMockProjects 호출됨 (Clean Slate 시스템)');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // 빈 상태에서 시작 - localStorage 프로젝트만 반환
  const customProjects = getCustomProjects();
  console.log('📋 fetchMockProjects: 로드된 프로젝트 수:', customProjects.length);

  if (customProjects.length > 0) {
    console.log('📝 로드된 프로젝트들:', customProjects.map(p => ({ id: p.id, no: p.no, name: p.name })));
  } else {
    console.log('ℹ️ 사용자 생성 프로젝트가 없습니다. 빈 배열을 반환합니다.');
  }

  return customProjects;
}

/**
 * Simulate async single project fetching
 */
export async function fetchMockProject(id: string): Promise<ProjectTableRow | null> {
  console.log('🎯 fetchMockProject 호출됨. 검색할 ID:', id);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const project = getMockProjectById(id);

  if (project) {
    console.log('✅ fetchMockProject 성공:', { id: project.id, no: project.no, name: project.name });
  } else {
    console.log('❌ fetchMockProject 실패. 프로젝트를 찾을 수 없습니다:', id);
  }

  return project;
}

interface DocumentGenerationParams {
  projectIndex: number;
  registrationDate: Date;
  seededRandom: (seed: number) => number;
  seed: number;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentInfo['type'], string> = {
  contract: '계약서',
  invoice: '청구서',
  report: '보고서',
  estimate: '견적서',
  etc: '기타 문서'
};

const DOCUMENT_TYPES: DocumentInfo['type'][] = ['contract', 'invoice', 'report', 'estimate', 'etc'];

function generateProjectDocuments({
  projectIndex,
  registrationDate,
  seededRandom,
  seed
}: DocumentGenerationParams): DocumentInfo[] {
  const documents: DocumentInfo[] = [];

  DOCUMENT_TYPES.forEach((type, typeIndex) => {
    const typeSeed = seed + typeIndex * 1111;
    const chance = seededRandom(typeSeed);
    const documentCount = chance > 0.8 ? 2 : chance > 0.5 ? 1 : 0;

    for (let docIndex = 0; docIndex < documentCount; docIndex += 1) {
      const createdAtOffsetDays = Math.floor(seededRandom(typeSeed + docIndex + 1) * 120);
      const createdAt = new Date(
        registrationDate.getTime() + createdAtOffsetDays * 24 * 60 * 60 * 1000
      );

      documents.push({
        id: `project-${projectIndex + 1}-${type}-${docIndex + 1}`,
        type,
        name: `${DOCUMENT_TYPE_LABELS[type]} ${docIndex + 1}`,
        createdAt: createdAt.toISOString(),
        status: 'completed'
      });
    }
  });

  return documents;
}

function summarizeDocuments(documents: DocumentInfo[]): ProjectDocumentStatus {
  const grouped = documents.reduce<Record<DocumentInfo['type'], DocumentInfo[]>>((acc, doc) => {
    acc[doc.type].push(doc);
    return acc;
  }, {
    contract: [],
    invoice: [],
    report: [],
    estimate: [],
    etc: []
  });

  const buildStatus = (type: DocumentInfo['type']): DocumentStatus => {
    const docs = grouped[type];
    if (docs.length === 0) {
      return {
        exists: false,
        status: 'none',
        count: 0
      };
    }

    const latest = docs.reduce((latestDoc, currentDoc) => (
      currentDoc.createdAt > latestDoc.createdAt ? currentDoc : latestDoc
    ), docs[0]);

    return {
      exists: true,
      status: 'completed',
      lastUpdated: latest.createdAt,
      count: docs.length
    };
  };

  return {
    contract: buildStatus('contract'),
    invoice: buildStatus('invoice'),
    report: buildStatus('report'),
    estimate: buildStatus('estimate'),
    etc: buildStatus('etc')
  };
}
