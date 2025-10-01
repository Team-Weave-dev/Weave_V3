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