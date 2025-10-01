import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'

/**
 * 루트 로딩 상태
 *
 * Next.js App Router가 자동으로 사용하는 로딩 UI입니다.
 * 페이지 전환 시 서버 컴포넌트가 로딩되는 동안 표시됩니다.
 */
export default function Loading() {
  return <FullPageLoadingSpinner />
}