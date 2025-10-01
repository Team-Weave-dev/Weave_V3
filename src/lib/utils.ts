import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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