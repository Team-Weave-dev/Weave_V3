'use client'

import { useEffect, useState } from 'react'
import { initializeStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

/**
 * Storage 시스템 초기화 컴포넌트
 *
 * 앱 시작 시 자동으로 Storage 시스템을 초기화합니다:
 * - 인증 상태 확인 (Supabase Auth 완전히 로드될 때까지 대기)
 * - LocalStorage 전용 또는 Supabase 모드 선택
 * - 자동 마이그레이션 실행 (필요 시)
 */
export function StorageInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        console.log('🔧 Starting Storage system initialization...')

        // Supabase Auth가 완전히 로드될 때까지 대기
        const supabase = createClient()
        console.log('⏳ Waiting for Supabase auth to load...')

        // getSession()은 즉시 사용 가능하지만, getUser()는 네트워크 요청이 필요
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log('✅ User authenticated, session found')
        } else {
          console.log('ℹ️ No active session found')
        }

        // 인증 상태 확인 후 Storage 초기화
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
