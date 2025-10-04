import type {
  DocumentInfo,
  DocumentStatus,
  ProjectDocumentStatus,
  ProjectTableRow,
  PaymentStatus,
  WBSTask
} from '@/lib/types/project-table.types';
import { projectService } from '@/lib/storage';
import type { Project } from '@/lib/storage/types/entities/project';

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
 * Storage API에서 프로젝트 검색
 */
export async function getMockProjectById(id: string): Promise<ProjectTableRow | null> {
  console.log('🔍 getMockProjectById 호출됨. 검색할 ID:', id);

  try {
    // Storage API에서 검색
    await migrateLegacyProjects();  // 마이그레이션 확인

    const project = await projectService.getById(id);

    if (!project) {
      // ID로 못 찾으면 no 필드로 검색
      const allProjects = await projectService.getAll();
      const foundByNo = allProjects.find(p => p.no === id);

      if (foundByNo) {
        const row = toProjectTableRow(foundByNo);
        console.log('✅ 프로젝트 발견 (by no):', { id: row.id, no: row.no, name: row.name });
        return row;
      }

      console.log('❌ 프로젝트를 찾을 수 없음:', id);
      return null;
    }

    const row = toProjectTableRow(project);
    console.log('✅ 프로젝트 발견:', { id: row.id, no: row.no, name: row.name });
    return row;
  } catch (error) {
    console.error('❌ 프로젝트 조회 중 오류:', error);
    return null;
  }
}

// localStorage 키 상수
const CUSTOM_PROJECTS_KEY = 'weave_custom_projects';

/**
 * Storage API에서 사용자가 생성한 프로젝트들 가져오기 (내부 헬퍼)
 * SSR 환경에서는 빈 배열 반환
 *
 * @description
 * - Storage API에서 프로젝트 로드
 * - Legacy 마이그레이션 자동 수행
 * - ProjectTableRow 형식으로 반환
 */
async function getCustomProjects(): Promise<ProjectTableRow[]> {
  // SSR 환경에서는 빈 배열 반환
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    // Legacy 마이그레이션 확인 및 수행
    await migrateLegacyProjects();

    // Storage API에서 모든 프로젝트 조회
    const projects = await projectService.getAll();

    // Project → ProjectTableRow 변환
    const rows = projects.map(toProjectTableRow);

    console.log('📋 getCustomProjects: 로드된 프로젝트 수:', rows.length);

    return rows;
  } catch (error) {
    console.error('Error reading projects from Storage API:', error);
    return [];
  }
}

/**
 * ============================================================================
 * 타입 변환 함수 (Type Conversion Functions)
 * ============================================================================
 *
 * ProjectTableRow와 Project 엔티티 간의 변환을 처리합니다.
 */

/**
 * ProjectTableRow를 Project 엔티티로 변환
 */
function toProject(row: ProjectTableRow): Project {
  const now = new Date().toISOString();

  return {
    // Identity
    id: row.id,
    userId: 'user-1',  // 현재 단일 사용자 시스템
    clientId: row.client || undefined,

    // Basic info
    no: row.no,
    name: row.name,
    description: row.projectContent,
    projectContent: row.projectContent,

    // Status
    status: row.status,
    progress: row.progress || 0,
    paymentProgress: typeof row.paymentProgress === 'number' ? row.paymentProgress : undefined,

    // Schedule
    registrationDate: row.registrationDate,
    modifiedDate: row.modifiedDate,
    endDate: row.dueDate || undefined,
    startDate: undefined,

    // Payment
    settlementMethod: row.settlementMethod,
    paymentStatus: row.paymentStatus,
    totalAmount: row.totalAmount,
    currency: row.currency,

    // WBS
    wbsTasks: row.wbsTasks || [],

    // Flags
    hasContract: row.hasContract || false,
    hasBilling: row.hasBilling || false,
    hasDocuments: row.hasDocuments || false,

    // Detailed info
    contract: row.contract as any,  // Type mismatch between ProjectTableRow.ContractInfo and Project.ContractInfo
    estimate: row.estimate,
    billing: row.billing,
    documents: row.documents as any,  // Type mismatch between DocumentInfo types
    documentStatus: row.documentStatus,

    // Timestamps
    createdAt: row.registrationDate || now,
    updatedAt: row.modifiedDate || now,
  };
}

/**
 * Project 엔티티를 ProjectTableRow로 변환 (표시용)
 */
function toProjectTableRow(project: Project): ProjectTableRow {
  return {
    id: project.id,
    no: project.no,
    name: project.name,
    client: project.clientId || '',
    registrationDate: project.registrationDate,
    modifiedDate: project.modifiedDate,
    dueDate: project.endDate || '',
    status: project.status,
    progress: project.progress,
    paymentProgress: project.paymentStatus,
    settlementMethod: project.settlementMethod,
    paymentStatus: project.paymentStatus,
    totalAmount: project.totalAmount,
    currency: project.currency as any,  // Type mismatch: string vs Currency
    projectContent: project.projectContent,
    wbsTasks: project.wbsTasks,
    hasContract: project.hasContract,
    hasBilling: project.hasBilling,
    hasDocuments: project.hasDocuments,
    contract: project.contract as any,  // Type mismatch between ContractInfo types
    estimate: project.estimate,
    billing: project.billing,
    documents: project.documents as any,  // Type mismatch between DocumentInfo types
    documentStatus: project.documentStatus,
  };
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
  // wbsTasks 속성이 존재하면 (빈 배열이더라도) 마이그레이션 불필요
  // 사용자가 의도적으로 작업 목록을 비운 경우를 보존하기 위함
  if (project.wbsTasks !== undefined) {
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
 * ============================================================================
 * Storage API 마이그레이션 (Migration to Storage API)
 * ============================================================================
 *
 * Legacy localStorage 데이터를 Storage API로 자동 마이그레이션합니다.
 */

let migrationAttempted = false;

/**
 * Legacy localStorage 데이터를 Storage API로 마이그레이션
 *
 * @description
 * - 'weave_custom_projects' 키의 데이터를 Storage API로 이전
 * - WBS 마이그레이션 자동 적용
 * - 마이그레이션 후 legacy 키 제거
 * - 중복 실행 방지 (앱 실행당 1회만)
 */
async function migrateLegacyProjects(): Promise<void> {
  // SSR 환경에서는 실행하지 않음
  if (typeof window === 'undefined') return;

  // 이미 마이그레이션 시도했으면 스킵
  if (migrationAttempted) return;

  migrationAttempted = true;

  try {
    // 1. Storage API에 이미 데이터가 있는지 확인
    const existingProjects = await projectService.getAll();
    if (existingProjects.length > 0) {
      console.log('✅ Projects already in Storage API:', existingProjects.length);
      return;
    }

    // 2. Legacy localStorage 키 확인
    const legacyData = localStorage.getItem(CUSTOM_PROJECTS_KEY);
    if (!legacyData) {
      console.log('ℹ️ No legacy projects to migrate');
      return;
    }

    console.log('🔄 Migrating legacy projects to Storage API...');

    // 3. 파싱 및 WBS 마이그레이션
    const legacyProjects: ProjectTableRow[] = JSON.parse(legacyData);
    const migratedRows = migrateAllProjectsToWBS(legacyProjects);

    // 4. Project 엔티티로 변환
    const projects: Project[] = migratedRows.map(toProject);

    // 5. Storage API에 저장
    for (const project of projects) {
      await projectService.create(project);
    }

    // 6. Legacy 키 제거
    localStorage.removeItem(CUSTOM_PROJECTS_KEY);

    console.log(`✅ Migrated ${projects.length} projects to Storage API`);
    console.log('   - Legacy key removed:', CUSTOM_PROJECTS_KEY);
  } catch (error) {
    console.error('❌ Legacy project migration failed:', error);
    migrationAttempted = false; // 실패 시 다시 시도 가능하도록
  }
}

/**
 * 새 프로젝트 추가
 *
 * @description
 * - wbsTasks가 없는 경우 빈 배열로 초기화
 * - 새 프로젝트는 항상 WBS 시스템을 포함
 * - Storage API를 사용하여 저장
 */
export async function addCustomProject(project: ProjectTableRow): Promise<void> {
  console.log('💾 addCustomProject 호출됨:', { id: project.id, no: project.no, name: project.name });

  // wbsTasks가 없으면 빈 배열로 초기화 (새 프로젝트는 WBS 시스템 사용)
  const projectWithWBS: ProjectTableRow = {
    ...project,
    wbsTasks: project.wbsTasks || []
  };

  // ProjectTableRow → Project 변환
  const projectEntity = toProject(projectWithWBS);

  // Storage API에 저장
  await projectService.create(projectEntity);

  console.log('✅ 프로젝트 Storage API에 저장 성공:', { id: projectEntity.id, no: projectEntity.no, name: projectEntity.name });
}

/**
 * 프로젝트 업데이트 (ID 또는 번호로)
 *
 * @description
 * - Storage API를 사용하여 프로젝트 업데이트
 * - 수정일 자동 갱신
 */
export async function updateCustomProject(idOrNo: string, updates: Partial<ProjectTableRow>): Promise<boolean> {
  try {
    // Project 엔티티 updates로 변환 (필드 매핑)
    const projectUpdates: Partial<Project> = {
      ...updates.no && { no: updates.no },
      ...updates.name && { name: updates.name },
      ...updates.status && { status: updates.status },
      ...updates.progress !== undefined && { progress: updates.progress },
      ...updates.projectContent && { projectContent: updates.projectContent, description: updates.projectContent },
      ...updates.dueDate && { endDate: updates.dueDate },
      ...updates.settlementMethod && { settlementMethod: updates.settlementMethod },
      ...updates.paymentStatus && { paymentStatus: updates.paymentStatus },
      ...updates.totalAmount !== undefined && { totalAmount: updates.totalAmount },
      ...updates.currency && { currency: updates.currency },
      ...updates.wbsTasks && { wbsTasks: updates.wbsTasks },
      ...updates.hasContract !== undefined && { hasContract: updates.hasContract },
      ...updates.hasBilling !== undefined && { hasBilling: updates.hasBilling },
      ...updates.hasDocuments !== undefined && { hasDocuments: updates.hasDocuments },
      ...updates.contract && { contract: updates.contract as any },
      ...updates.estimate && { estimate: updates.estimate },
      ...updates.billing && { billing: updates.billing },
      ...updates.documents && { documents: updates.documents as any },
      ...updates.documentStatus && { documentStatus: updates.documentStatus },
      modifiedDate: new Date().toISOString(),
    };

    // Storage API 업데이트
    const updatedProject = await projectService.update(idOrNo, projectUpdates);

    if (updatedProject) {
      console.log('✅ 프로젝트 업데이트 성공:', {
        id: updatedProject.id,
        no: updatedProject.no,
        name: updatedProject.name
      });
      return true;
    }

    console.log('⚠️ 프로젝트 업데이트 실패: 프로젝트를 찾을 수 없음', idOrNo);
    return false;
  } catch (error) {
    console.error('❌ 프로젝트 업데이트 중 오류:', error);
    return false;
  }
}

/**
 * 프로젝트 삭제 (ID 또는 번호로)
 *
 * @description
 * - Storage API를 사용하여 프로젝트 삭제
 */
export async function removeCustomProject(idOrNo: string): Promise<boolean> {
  try {
    const success = await projectService.delete(idOrNo);
    if (success) {
      console.log('✅ 프로젝트 삭제 성공:', idOrNo);
    } else {
      console.log('⚠️ 프로젝트 삭제 실패: 프로젝트를 찾을 수 없음', idOrNo);
    }
    return success;
  } catch (error) {
    console.error('❌ 프로젝트 삭제 중 오류:', error);
    return false;
  }
}

/**
 * 모든 사용자 생성 프로젝트 삭제
 *
 * @description
 * - Storage API를 사용하여 모든 프로젝트 삭제
 */
export async function clearCustomProjects(): Promise<void> {
  // SSR 환경에서는 아무것도 하지 않음
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const allProjects = await projectService.getAll();
    for (const project of allProjects) {
      await projectService.delete(project.id);
    }
    console.log('✅ 모든 프로젝트 삭제 완료');
  } catch (error) {
    console.error('Error clearing custom projects:', error);
  }
}

/**
 * Simulate async data fetching
 * Clean Slate 접근법: Storage API의 사용자 생성 프로젝트만 반환
 */
export async function fetchMockProjects(): Promise<ProjectTableRow[]> {
  console.log('🚀 fetchMockProjects 호출됨 (Clean Slate 시스템)');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Storage API에서 프로젝트 로드
  const customProjects = await getCustomProjects();
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

  const project = await getMockProjectById(id);

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
 * Storage API의 모든 프로젝트와 마감일 정보를 상세히 출력
 * 브라우저 콘솔에서 debugDeadlineProjects()로 호출 가능
 */
export async function debugDeadlineProjects(): Promise<void> {
  console.log('🔍 [DEBUG] === 마감일 디버깅 시작 ===');

  const projects = await getCustomProjects();
  console.log(`📊 총 프로젝트 수: ${projects.length}`);

  if (projects.length === 0) {
    console.log('ℹ️ Storage API에 저장된 프로젝트가 없습니다.');
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
export async function debugProjectDeadline(projectIdOrNo: string): Promise<void> {
  const project = await getMockProjectById(projectIdOrNo);

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
