import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

/**
 * 컴포넌트 데모 페이지 로딩 상태
 */
export default function Loading() {
  return <FullPageLoadingSpinner text={getLoadingText.component('ko')} />
}