import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 테스트 모드: Supabase URL이 없으면 더미 값 사용
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createBrowserClient(url, key)
}