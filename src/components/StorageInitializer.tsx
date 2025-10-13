'use client'

import { useEffect, useState } from 'react'
import { initializeStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

/**
 * Storage 시스템 초기화 컴포넌트
 *
 * 앱 시작 시 자동으로 Storage 시스템을 초기화합니다:
 * - 인증 상태 확인 (Supabase Auth 완전히 로드될 때까지 대기)
 * - Phase 16: 인증 필수 - 비인증 사용자는 로그인 페이지로 리다이렉트
 * - Supabase-only 모드로 Storage 초기화
 */
export function StorageInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        console.log('🔧 Starting Storage system initialization...')

        // Supabase Auth 세션 확인
        const supabase = createClient()
        console.log('⏳ Checking authentication status...')

        // getSession()은 즉시 사용 가능 (로컬 쿠키에서 읽음)
        const { data: { session } } = await supabase.auth.getSession()

        // Phase 16: 인증 필수 - 비인증 사용자는 로그인 페이지로 리다이렉트
        if (!session) {
          console.log('⚠️ No active session - redirecting to login page')
          window.location.href = '/login'
          return
        }

        console.log('✅ User authenticated, initializing Supabase storage')

        // 인증된 사용자만 Storage 초기화
        await initializeStorage()

        if (mounted) {
          setInitialized(true)
          console.log('✅ Storage system initialized successfully')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Failed to initialize Storage system:', errorMessage)

        if (mounted) {
          setError(errorMessage)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  // 초기화 중 에러 발생 시 개발 환경에서만 표시
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fee',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #fcc',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999
      }}>
        <strong>Storage 초기화 실패:</strong>
        <br />
        {error}
      </div>
    )
  }

  // UI 없이 초기화만 수행
  return null
}
