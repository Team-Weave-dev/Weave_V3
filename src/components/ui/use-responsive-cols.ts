import { RefObject, useEffect, useState } from 'react'

export type ColsBreakpoints = {
  desktop: { minWidth: number; cols: number }
  tablet: { minWidth: number; cols: number }
  phone: { minWidth: number; cols: number }
  tiny: { minWidth: number; cols: number }
}

export const defaultColsBreakpoints: ColsBreakpoints = {
  desktop: { minWidth: 1200, cols: 9 },
  tablet: { minWidth: 768, cols: 6 },
  phone: { minWidth: 480, cols: 4 },
  tiny: { minWidth: 0, cols: 2 },
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

  useEffect(() => {
    const update = () => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth
      const next = getColsForWidth(width, breakpoints)
      setCols((prev) => {
        if (prev !== next) {
          onChange?.(next)
        }
        return next
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [breakpoints, containerRef, onChange])

  return cols
}

