'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { initializeStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import { useStorageInitStore } from '@/lib/stores/useStorageInitStore'

/**
 * Storage 시스템 초기화 컴포넌트
 *
 * 앱 시작 시 자동으로 Storage 시스템을 초기화합니다:
 * - 인증 상태 확인 (Supabase Auth 완전히 로드될 때까지 대기)
 * - Phase 16: 인증 필수 - 비인증 사용자는 로그인 페이지로 리다이렉트
 * - Supabase-only 모드로 Storage 초기화
 * - 전역 초기화 상태를 useStorageInitStore로 관리하여 다른 컴포넌트가 초기화 완료를 기다릴 수 있도록 함
 */
export function StorageInitializer() {
  const pathname = usePathname()
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { startInitializing, setInitialized: setGlobalInitialized, setError: setGlobalError } = useStorageInitStore()

  useEffect(() => {
    let mounted = true
    startInitializing()

    async function init() {
      try {
        console.log('🔧 Starting Storage system initialization...')
        console.log('📍 Current pathname:', pathname)

        // 공개 페이지 확인 (로그인, 회원가입, 홈 등)
        const publicPaths = ['/', '/login', '/signup', '/auth']
        const isPublicPath = publicPaths.some(path =>
          pathname === path || pathname.startsWith(path + '/')
        )

        console.log('🔍 Is public path?', isPublicPath)

        // 공개 페이지에서는 Storage 초기화를 건너뜀
        // 중요: Storage가 초기화되지 않았으므로 initialized 상태를 true로 설정하지 않음
        if (isPublicPath) {
          console.log('ℹ️ Public page - skipping Storage initialization (state remains uninitialized)')
          return
        }

        // Supabase Auth 세션 확인
        const supabase = createClient()
        console.log('⏳ Checking authentication status...')

        // getSession()은 즉시 사용 가능 (로컬 쿠키에서 읽음)
        const { data: { session } } = await supabase.auth.getSession()

        // Phase 16: 인증 필수 - 비인증 사용자는 로그인 페이지로 리다이렉트
        // (공개 페이지가 아닌 경우에만)
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
          setGlobalInitialized(true)
          console.log('✅ Storage system initialized successfully')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Failed to initialize Storage system:', errorMessage)

        if (mounted) {
          setError(errorMessage)
          setGlobalError(errorMessage)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [pathname])

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
