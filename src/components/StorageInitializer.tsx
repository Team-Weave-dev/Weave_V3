'use client'

import { useEffect, useState } from 'react'
import { initializeStorage } from '@/lib/storage'

/**
 * Storage 시스템 초기화 컴포넌트
 *
 * 앱 시작 시 자동으로 Storage 시스템을 초기화합니다:
 * - 인증 상태 확인
 * - LocalStorage 전용 또는 DualWrite 모드 선택
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
