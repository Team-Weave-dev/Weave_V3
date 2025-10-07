import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔵 [GOOGLE OAUTH] Starting Google OAuth flow...')

  try {
    const supabase = await createClient()

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`
    console.log('🔵 [GOOGLE OAUTH] Redirect URL:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'email profile',
      }
    })

    if (error) {
      console.error('🔵 [GOOGLE OAUTH] ERROR:', error)
      return NextResponse.json(
        { error: 'Google 로그인 초기화에 실패했습니다.', details: error.message },
        { status: 400 }
      )
    }

    if (data.url) {
      console.log('🔵 [GOOGLE OAUTH] OAuth URL generated:', data.url)
      // Redirect to Google OAuth URL
      return NextResponse.redirect(data.url)
    }

    console.error('🔵 [GOOGLE OAUTH] No OAuth URL generated')
    return NextResponse.json(
      { error: 'OAuth URL을 생성할 수 없습니다.' },
      { status: 500 }
    )
  } catch (err) {
    console.error('🔵 [GOOGLE OAUTH] Unexpected error:', err)
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다.', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}