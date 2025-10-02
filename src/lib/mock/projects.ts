import type {
  DocumentInfo,
  DocumentStatus,
  ProjectDocumentStatus,
  ProjectTableRow,
  PaymentStatus,
  WBSTask
} from '@/lib/types/project-table.types';

/**
 * ============================================================================
 * CLEAN SLATE 시스템: localStorage 기반 프로젝트 관리
 * ============================================================================
 *
 * 이 파일은 사용자가 생성한 프로젝트만 localStorage에 저장하고 관리합니다.
 * Mock 데이터는 생성하지 않으며, 빈 상태에서 시작합니다.
 *
 * 주요 함수:
 * - addCustomProject(): 프로젝트 추가
 * - updateCustomProject(): 프로젝트 업데이트
 * - removeCustomProject(): 프로젝트 삭제
 * - fetchMockProjects(): 비동기 프로젝트 목록 조회 (localStorage)
 * - getMockProjectById(): 단일 프로젝트 조회 (localStorage)
 */

/**
 * Get a single project by ID or No (Clean Slate 시스템)
 * localStorage의 사용자 생성 프로젝트에서만 검색
 */
export function getMockProjectById(id: string): ProjectTableRow | null {
  console.log('🔍 getMockProjectById 호출됨. 검색할 ID:', id);

  // localStorage의 사용자 생성 프로젝트에서만 찾기 (Clean Slate 시스템)
  const customProjects = getCustomProjects();
  console.log('📋 사용자 생성 프로젝트 개수:', customProjects.length);

  if (customProjects.length > 0) {
    console.log('📝 사용자 생성 프로젝트 목록:', customProjects.map(p => ({ id: p.id, no: p.no, name: p.name })));
  }

  const customProject = customProjects.find(p => p.id === id || p.no === id);
  if (customProject) {
    console.log('✅ 프로젝트 발견:', { id: customProject.id, no: customProject.no, name: customProject.name });
    return customProject;
  }

  console.log('❌ 프로젝트를 찾을 수 없음:', id);
  return null;
}

// localStorage 키 상수
const CUSTOM_PROJECTS_KEY = 'weave_custom_projects';

/**
 * localStorage에서 사용자가 생성한 프로젝트들 가져오기
 * SSR 환경에서는 빈 배열 반환
 *
 * @description
 * - localStorage에서 프로젝트 로드
 * - 자동 WBS 마이그레이션 수행
 * - 마이그레이션이 발생하면 localStorage에 다시 저장
 */
function getCustomProjects(): ProjectTableRow[] {
  // SSR 환경에서는 localStorage 접근 불가
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(CUSTOM_PROJECTS_KEY);
    if (!stored) {
      return [];
    }

    const projects: ProjectTableRow[] = JSON.parse(stored);

    // WBS 마이그레이션 수행
    const migratedProjects = migrateAllProjectsToWBS(projects);

    // 마이그레이션이 발생했는지 확인 (배열 길이 또는 내용 변경)
    const migrationOccurred = migratedProjects.some((migrated, index) => {
      const original = projects[index];
      return migrated.wbsTasks && migrated.wbsTasks.length > 0 &&
             (!original.wbsTasks || original.wbsTasks.length === 0);
    });

    // 마이그레이션이 발생했으면 localStorage에 다시 저장
    if (migrationOccurred) {
      console.log('💾 마이그레이션된 프로젝트를 localStorage에 저장합니다.');
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(migratedProjects));
    }

    return migratedProjects;
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
 * ============================================================================
 * WBS 마이그레이션 (Data Migration for WBS)
 * ============================================================================
 *
 * 기존 프로젝트를 WBS 시스템으로 자동 마이그레이션합니다.
 * progress 필드를 wbsTasks 기반으로 전환하여 Single Source of Truth를 보장합니다.
 */

/**
 * 기존 프로젝트를 WBS 시스템으로 마이그레이션
 *
 * @param project - 마이그레이션할 프로젝트
 * @returns WBS 데이터를 포함한 프로젝트
 *
 * @description
 * - 이미 wbsTasks가 있으면 그대로 반환
 * - 없으면 기존 progress 값을 유지하는 더미 태스크 생성
 * - 10개의 기본 작업으로 구성 (기존 진행률 유지)
 */
function migrateProjectToWBS(project: ProjectTableRow): ProjectTableRow {
  // 이미 WBS가 있으면 마이그레이션 불필요
  if (project.wbsTasks && project.wbsTasks.length > 0) {
    return project;
  }

  // 기존 progress 값 (없으면 0)
  const oldProgress = project.progress || 0;

  // 10개의 더미 태스크 생성
  const totalTasks = 10;
  const completedTasks = Math.round((oldProgress / 100) * totalTasks);

  const dummyTasks: WBSTask[] = Array.from({ length: totalTasks }, (_, i) => {
    const taskNumber = i + 1;
    const isCompleted = i < completedTasks;

    return {
      id: `legacy-task-${taskNumber}`,
      name: `기존 작업 ${taskNumber}`,
      description: '마이그레이션으로 생성된 레거시 작업',
      status: isCompleted ? 'completed' : 'pending',
      createdAt: project.registrationDate,
      order: i,
      ...(isCompleted && { completedAt: project.modifiedDate })
    };
  });

  console.log(`🔄 WBS 마이그레이션: ${project.name} (진행률 ${oldProgress}% → ${completedTasks}/${totalTasks} 작업 완료)`);

  return {
    ...project,
    wbsTasks: dummyTasks
  };
}

/**
 * 모든 프로젝트를 WBS 시스템으로 일괄 마이그레이션
 *
 * @param projects - 마이그레이션할 프로젝트 배열
 * @returns 마이그레이션된 프로젝트 배열
 */
function migrateAllProjectsToWBS(projects: ProjectTableRow[]): ProjectTableRow[] {
  let migrationCount = 0;

  const migratedProjects = projects.map(project => {
    const needsMigration = !project.wbsTasks || project.wbsTasks.length === 0;
    if (needsMigration) {
      migrationCount++;
    }
    return migrateProjectToWBS(project);
  });

  if (migrationCount > 0) {
    console.log(`✅ WBS 마이그레이션 완료: ${migrationCount}개 프로젝트`);
  }

  return migratedProjects;
}

/**
 * 새 프로젝트 추가
 *
 * @description
 * - wbsTasks가 없는 경우 빈 배열로 초기화
 * - 새 프로젝트는 항상 WBS 시스템을 포함
 */
export function addCustomProject(project: ProjectTableRow): void {
  console.log('💾 addCustomProject 호출됨:', { id: project.id, no: project.no, name: project.name });

  const existingProjects = getCustomProjects();
  console.log('📋 기존 프로젝트 개수:', existingProjects.length);

  // wbsTasks가 없으면 빈 배열로 초기화 (새 프로젝트는 WBS 시스템 사용)
  const projectWithWBS: ProjectTableRow = {
    ...project,
    wbsTasks: project.wbsTasks || []
  };

  const updatedProjects = [projectWithWBS, ...existingProjects];
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

// ============================================================================
// 디버깅 도구 (Debugging Tools)
// ============================================================================

/**
 * localStorage의 모든 프로젝트와 마감일 정보를 상세히 출력
 * 브라우저 콘솔에서 debugDeadlineProjects()로 호출 가능
 */
export function debugDeadlineProjects(): void {
  console.log('🔍 [DEBUG] === 마감일 디버깅 시작 ===');

  const projects = getCustomProjects();
  console.log(`📊 총 프로젝트 수: ${projects.length}`);

  if (projects.length === 0) {
    console.log('ℹ️ localStorage에 저장된 프로젝트가 없습니다.');
    return;
  }

  console.log('\n📋 프로젝트별 상세 정보:');
  projects.forEach((project, index) => {
    const dueDate = project.dueDate;
    const parsedDate = dueDate ? new Date(dueDate) : null;
    const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

    let daysRemaining = null;
    let category = null;

    if (isValidDate && parsedDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      parsedDate.setHours(0, 0, 0, 0);

      const diffTime = parsedDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 마감일 초과 → 긴급
      if (daysRemaining < 0) {
        category = '초과 (긴급)';
      }
      // 당일 또는 7일 미만 → 긴급
      else if (daysRemaining < 7) {
        category = '긴급';
      }
      // 7일 이상 14일 미만 → 주의
      else if (daysRemaining < 14) {
        category = '주의';
      }
      // 14일 이상 → 여유
      else {
        category = '여유';
      }
    }

    const displayDays = daysRemaining !== null
      ? (daysRemaining < 0 ? `초과 D+${Math.abs(daysRemaining)}` : `D-${daysRemaining}`)
      : 'N/A';

    console.log(`\n${index + 1}. ${project.name} (${project.no})`);
    console.log(`   마감일: ${dueDate || '없음'}`);
    console.log(`   파싱 결과: ${isValidDate ? parsedDate?.toISOString().split('T')[0] : 'Invalid Date'}`);
    console.log(`   남은 일수: ${displayDays}`);
    console.log(`   카테고리: ${category || 'N/A'}`);
    console.log(`   상태(원본): ${project.status}`);
    console.log(`   총 금액: ${project.totalAmount || '없음'}`);
    console.log(`   계약서: ${project.documentStatus?.contract?.exists ? '있음' : '없음'}`);
  });

  console.log('\n✅ 디버깅 완료');
}

/**
 * 특정 프로젝트의 마감일 정보만 출력
 */
export function debugProjectDeadline(projectIdOrNo: string): void {
  const project = getMockProjectById(projectIdOrNo);

  if (!project) {
    console.log(`❌ 프로젝트를 찾을 수 없습니다: ${projectIdOrNo}`);
    return;
  }

  console.log(`🔍 [DEBUG] ${project.name} 마감일 정보:`);
  console.log(`   마감일: ${project.dueDate || '없음'}`);

  if (project.dueDate) {
    const parsedDate = new Date(project.dueDate);
    const isValidDate = !isNaN(parsedDate.getTime());

    console.log(`   파싱 결과: ${isValidDate ? parsedDate.toISOString() : 'Invalid Date'}`);

    if (isValidDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      parsedDate.setHours(0, 0, 0, 0);

      const diffTime = parsedDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const displayDays = daysRemaining < 0 ? `초과 D+${Math.abs(daysRemaining)}` : `D-${daysRemaining}`;
      let category = '';
      if (daysRemaining < 0) category = '초과 (긴급)';
      else if (daysRemaining < 7) category = '긴급';
      else if (daysRemaining < 14) category = '주의';
      else category = '여유';

      console.log(`   남은 일수: ${displayDays}`);
      console.log(`   카테고리: ${category}`);
    }
  }
}

// ============================================================================
// localStorage 키 상수
// ============================================================================
