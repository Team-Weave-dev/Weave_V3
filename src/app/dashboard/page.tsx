'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'
import { layout, typography } from '@/config/constants'
import { getDashboardText } from '@/config/brand'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      // 테스트 사용자 체크
      const testUser = localStorage.getItem('testUser')
      if (testUser) {
        const userData = JSON.parse(testUser)
        setUser(userData)
        setLoading(false)
        return
      }

      // 실제 Supabase 사용자 체크
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
        } else {
          setUser(user)
        }
      } catch (err) {
        // Supabase 설정 오류 시 로그인 페이지로
        router.push('/login')
      }
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`max-w-[1300px] mx-auto ${layout.spacing.page.paddingX} ${layout.spacing.page.paddingY} ${layout.spacing.page.contentGap}`}>
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={typography.title.page}>{getDashboardText.title('ko')}</h1>
          <p className={typography.text.subtitle}>
            {getDashboardText.subtitle('ko')}
          </p>
        </div>
      </div>
      
      {/* 대시보드 위젯 */}
      <ImprovedDashboard />
    </div>
  )
}
