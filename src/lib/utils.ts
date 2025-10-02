import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProjectTableRow } from '@/lib/types/project-table.types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Promise에 최소 지속 시간을 보장합니다.
 * 빠르게 완료되는 작업에서 로딩 UI 깜빡임을 방지하는 데 유용합니다.
 *
 * @param promise - 실행할 Promise
 * @param minDuration - 최소 지속 시간 (밀리초)
 * @returns 최소 시간이 보장된 Promise
 *
 * @example
 * ```typescript
 * // 로컬 데이터를 가져오지만 최소 300ms 로딩 표시
 * const data = await withMinimumDuration(
 *   fetchLocalData(),
 *   300
 * )
 * ```
 */
export async function withMinimumDuration<T>(
  promise: Promise<T>,
  minDuration: number = 300
): Promise<T> {
  const startTime = Date.now();
  const result = await promise;
  const elapsed = Date.now() - startTime;

  if (elapsed < minDuration) {
    await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
  }

  return result;
}

/**
 * 통화 단위에 따라 금액을 포맷팅합니다.
 *
 * @param amount - 포맷팅할 금액
 * @param currency - 통화 단위 ('KRW' 또는 'USD')
 * @returns 통화 기호와 함께 포맷팅된 금액 문자열
 *
 * @example
 * ```typescript
 * formatCurrency(50000000, 'KRW')  // "₩50,000,000"
 * formatCurrency(50000.5, 'USD')   // "$50,000.50"
 * ```
 */
export function formatCurrency(amount: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  if (currency === 'USD') {
    // USD: 달러 기호 + 소수점 2자리 + 천단위 쉼표
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    // KRW: 원화 기호 + 천단위 쉼표 (소수점 없음)
    return `₩${amount.toLocaleString('ko-KR')}`;
  }
}

/**
 * 프로젝트에 계약서가 있는지 확인합니다.
 *
 * 확인 순서:
 * 1. documentStatus.contract.exists (Mock 프로젝트)
 * 2. documents 배열에서 type === 'contract' 찾기 (Mock 프로젝트)
 * 3. localStorage에서 계약서 문서 찾기 (사용자 생성 프로젝트)
 *
 * @param project - 확인할 프로젝트 데이터
 * @returns 계약서가 존재하면 true, 없으면 false
 *
 * @example
 * ```typescript
 * if (!hasContractDocument(project)) {
 *   // 계약서가 누락된 프로젝트 → 검토 상태로 표시
 * }
 * ```
 */
export function hasContractDocument(project: ProjectTableRow): boolean {
  // 1. documentStatus에서 계약서 존재 여부 확인 (우선순위)
  if (project.documentStatus?.contract?.exists) {
    return true;
  }

  // 2. documents 배열에서 계약서 타입 문서 찾기
  if (project.documents && project.documents.length > 0) {
    const hasContractInArray = project.documents.some(doc => doc.type === 'contract');
    if (hasContractInArray) {
      return true;
    }
  }

  // 3. localStorage에서 계약서 문서 확인 (사용자 생성 프로젝트용)
  // SSR 환경에서는 건너뛰기
  if (typeof window !== 'undefined') {
    try {
      const storedKey = 'weave_project_documents';
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        const allDocuments = JSON.parse(stored);
        const projectDocuments = allDocuments[project.no] || allDocuments[project.id] || [];
        if (Array.isArray(projectDocuments)) {
          return projectDocuments.some((doc: any) => doc.type === 'contract');
        }
      }
    } catch (error) {
      // localStorage 접근 실패 시 무시 (에러 로그는 선택적)
      console.warn('localStorage 계약서 확인 중 오류:', error);
    }
  }

  // 4. 모든 확인 실패 - 계약서 없음
  return false;
}

/**
 * 프로젝트의 계약서가 완료 상태인지 확인합니다.
 * 계약서 필수 항목이 모두 입력되어 'completed' 상태인 경우에만 true를 반환합니다.
 *
 * @param project - 확인할 프로젝트 데이터
 * @returns 계약서가 완료 상태이면 true, 아니면 false
 *
 * @example
 * ```typescript
 * if (isContractComplete(project)) {
 *   // 계약서 완료 → 진행중 상태로 표시
 * } else {
 *   // 계약서 미완료 → 검토 상태 유지
 * }
 * ```
 */
export function isContractComplete(project: ProjectTableRow): boolean {
  // 1. documentStatus에서 계약서 상태 확인 (우선순위)
  if (project.documentStatus?.contract?.status === 'completed') {
    return true;
  }

  // 2. documents 배열에서 완료된 계약서 찾기
  if (project.documents && project.documents.length > 0) {
    return project.documents.some(
      doc => doc.type === 'contract' && doc.status === 'completed'
    );
  }

  // 3. 계약서가 없거나 완료되지 않음
  return false;
}

/**
 * 프로젝트의 실제 표시 상태를 자동 결정 로직에 따라 반환합니다.
 *
 * 자동 결정 규칙:
 * 1. 수동 선택 상태 (보류/취소/완료)는 항상 유지됨
 * 2. 계약서가 없을 때:
 *    - 총 금액 있음 → 검토 (review)
 *    - 총 금액 없음 → 기획 (planning)
 * 3. 계약서가 있을 때:
 *    - 총 금액 있음 → 진행중 (in_progress)
 *    - 총 금액 없음 → 기획 (planning)
 *
 * @param project - 확인할 프로젝트 데이터
 * @param ignoreManualStatus - true일 경우 수동 상태도 자동 결정 (기본값: false)
 * @returns 실제 표시될 프로젝트 상태
 *
 * @example
 * ```typescript
 * // UI 표시용 - 수동 상태 유지
 * const displayStatus = getActualProjectStatus(project);
 *
 * // 통계 계산용 - 모든 상태를 자동 결정
 * const statsStatus = getActualProjectStatus(project, true);
 * ```
 */
export function getActualProjectStatus(
  project: ProjectTableRow,
  ignoreManualStatus: boolean = false
): ProjectTableRow['status'] {
  // 🎯 최우선: 사용자가 수동으로 선택한 최종 상태는 항상 유지
  // (보류, 취소, 완료는 자동 결정 로직을 적용하지 않음)
  if (!ignoreManualStatus) {
    if (
      project.status === 'on_hold' ||
      project.status === 'cancelled' ||
      project.status === 'completed'
    ) {
      return project.status;
    }
  }

  // 1. 계약서가 없을 때
  if (!hasContractDocument(project)) {
    // 총 금액이 있으면 → 검토 (review)
    if (project.totalAmount && project.totalAmount > 0) {
      return 'review';
    }
    // 총 금액이 없으면 → 기획 (planning) 유지
    return 'planning';
  }

  // 2. 계약서가 있을 때 (계약서 생성 = 완료로 간주):
  //    - 총 금액 있음 → 진행중 (in_progress)
  //    - 총 금액 없음 → 기획 (planning)
  if (project.totalAmount && project.totalAmount > 0) {
    return 'in_progress';
  }

  return 'planning';
}