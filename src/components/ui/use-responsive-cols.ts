import { RefObject, useEffect, useRef, useState } from 'react'

export type ColsBreakpoints = {
  desktop: { minWidth: number; cols: number }
  tablet: { minWidth: number; cols: number }
  phone: { minWidth: number; cols: number }
  tiny: { minWidth: number; cols: number }
}

export const defaultColsBreakpoints: ColsBreakpoints = {
  desktop: { minWidth: 1100, cols: 9 },  // 컨테이너 최대폭 1300px - 패딩 감안
  tablet: { minWidth: 768, cols: 6 },
  phone: { minWidth: 480, cols: 3 },     // 모바일 가로모드
  tiny: { minWidth: 0, cols: 2 },        // 모바일 세로모드 (최적)
}

export function getColsForWidth(width: number, bp: ColsBreakpoints = defaultColsBreakpoints): number {
  if (width >= bp.desktop.minWidth) return bp.desktop.cols
  if (width >= bp.tablet.minWidth) return bp.tablet.cols
  if (width >= bp.phone.minWidth) return bp.phone.cols
  return bp.tiny.cols
}

export function useResponsiveCols(
  containerRef: RefObject<HTMLElement>,
  options?: {
    breakpoints?: ColsBreakpoints
    onChange?: (cols: number) => void
    initialCols?: number
  }
) {
  const { breakpoints = defaultColsBreakpoints, onChange, initialCols } = options || {}
  const [cols, setCols] = useState<number>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0
    return initialCols ?? getColsForWidth(width, breakpoints)
  })

  // onChange를 ref로 추적하여 무한 루프 방지
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const update = () => {
      // 모바일(<768px)에서는 viewport width 기준, 데스크톱에서는 container width 기준
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
      const containerWidth = containerRef.current?.clientWidth ?? viewportWidth
      const width = viewportWidth < 768 ? viewportWidth : containerWidth
      const next = getColsForWidth(width, breakpoints)
      setCols(next)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [breakpoints, containerRef])

  // onChange 콜백은 별도의 useEffect에서 처리하여 렌더링 사이클 분리
  useEffect(() => {
    onChangeRef.current?.(cols)
  }, [cols])

  return cols
}

