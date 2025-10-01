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
    return project.documents.some(doc => doc.type === 'contract');
  }

  // 3. 둘 다 없으면 계약서 없음
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