import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

/**
 * 프로젝트 목록 페이지 로딩 상태
 */
export default function Loading() {
  return <FullPageLoadingSpinner text={getLoadingText.data('ko')} />
}