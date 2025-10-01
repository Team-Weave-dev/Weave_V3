"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * RouteChangeProgressBar 컴포넌트
 *
 * 클라이언트 사이드 네비게이션 시 상단에 진행바를 표시합니다.
 * Next.js App Router의 페이지 전환을 감지하여 자동으로 작동합니다.
 *
 * @example
 * ```tsx
 * // layout.tsx에 추가
 * <RouteChangeProgressBar />
 * ```
 */
export function RouteChangeProgressBar() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 페이지 로딩 시작
    setIsLoading(true)
    setProgress(20)

    // 진행바 애니메이션
    const timer1 = setTimeout(() => setProgress(60), 100)
    const timer2 = setTimeout(() => setProgress(80), 200)

    // 페이지 로딩 완료
    const timer3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <>
      {/* 진행바 */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }}
      />

      {/* 그림자 효과 */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none"
        style={{
          boxShadow: progress > 0 && progress < 100
            ? '0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))'
            : 'none'
        }}
      />
    </>
  )
}

/**
 * 커스터마이징 가능한 진행바 컴포넌트
 *
 * 색상과 높이를 커스터마이징할 수 있는 진행바입니다.
 */
export interface CustomProgressBarProps {
  /**
   * 진행바 높이 (px)
   * @default 2
   */
  height?: number

  /**
   * 진행바 색상 (Tailwind 클래스 또는 CSS 색상)
   * @default 'bg-primary'
   */
  color?: string

  /**
   * 그림자 효과 표시 여부
   * @default true
   */
  showGlow?: boolean
}

export function CustomRouteProgressBar({
  height = 2,
  color = 'bg-primary',
  showGlow = true
}: CustomProgressBarProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    setProgress(20)

    const timer1 = setTimeout(() => setProgress(60), 100)
    const timer2 = setTimeout(() => setProgress(80), 200)
    const timer3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${color} transition-all duration-200 ease-out`}
        style={{
          height: `${height}px`,
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }}
      />

      {showGlow && (
        <div
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          style={{
            height: `${height}px`,
            boxShadow: progress > 0 && progress < 100
              ? '0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))'
              : 'none'
          }}
        />
      )}
    </>
  )
}