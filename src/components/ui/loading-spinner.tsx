import { getLoadingText } from '@/config/brand'
import { defaults } from '@/config/constants'

export interface LoadingSpinnerProps {
  /**
   * 스피너 크기
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * 표시할 텍스트 (선택사항)
   */
  text?: string

  /**
   * 언어 설정
   * @default 'ko'
   */
  language?: 'ko' | 'en'

  /**
   * 추가 CSS 클래스
   */
  className?: string
}

/**
 * LoadingSpinner 컴포넌트
 *
 * 페이지 또는 컴포넌트 로딩 상태를 표시하는 재사용 가능한 스피너입니다.
 * 중앙화된 텍스트 시스템과 스타일 상수를 활용합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <LoadingSpinner />
 *
 * // 텍스트와 함께
 * <LoadingSpinner text={getLoadingText.page('ko')} />
 *
 * // 크기 지정
 * <LoadingSpinner size="lg" text={getLoadingText.data('ko')} />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  text,
  language = 'ko',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${defaults.animation.spin} rounded-full border-primary border-t-transparent ${defaults.animation.transition}`}
        role="status"
        aria-label={getLoadingText.aria(language)}
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-muted-foreground`}>
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * 전체 페이지 로딩 스피너
 *
 * 페이지 중앙에 로딩 스피너를 표시합니다.
 *
 * @example
 * ```tsx
 * <FullPageLoadingSpinner />
 * <FullPageLoadingSpinner text={getLoadingText.page('ko')} />
 * ```
 */
export function FullPageLoadingSpinner({
  text,
  language = 'ko'
}: Omit<LoadingSpinnerProps, 'size' | 'className'>) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner
        size="md"
        text={text || getLoadingText.page(language)}
        language={language}
      />
    </div>
  )
}