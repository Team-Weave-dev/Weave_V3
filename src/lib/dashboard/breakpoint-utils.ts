/**
 * 대시보드 브레이크포인트 유틸리티 함수
 * 브레이크포인트별 컬럼 수와 너비 기준을 정의합니다.
 */

export type BreakpointKey = 'desktop' | 'tablet' | 'mobile';

/**
 * 브레이크포인트에 따른 그리드 컬럼 수를 반환합니다.
 * @param bp - 브레이크포인트 키 (desktop | tablet | mobile)
 * @returns 해당 브레이크포인트의 컬럼 수
 */
export function getColsForBreakpoint(bp: BreakpointKey): number {
  switch (bp) {
    case 'desktop':
      return 9;
    case 'tablet':
      return 6;
    case 'mobile':
      return 2;
    default:
      return 9;
  }
}

/**
 * 화면 너비에 따라 적절한 브레이크포인트를 반환합니다.
 * @param width - 화면 너비 (픽셀)
 * @returns 해당 너비에 맞는 브레이크포인트 키
 */
export function getBreakpointForWidth(width: number): BreakpointKey {
  if (width >= 1100) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}
