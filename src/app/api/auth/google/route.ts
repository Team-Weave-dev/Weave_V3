import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      scopes: 'email profile',
    }
  })

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { error: 'Google 로그인 초기화에 실패했습니다.' },
      { status: 400 }
    )
  }

  if (data.url) {
    // Redirect to Google OAuth URL
    return NextResponse.redirect(data.url)
  }

  return NextResponse.json(
    { error: 'OAuth URL을 생성할 수 없습니다.' },
    { status: 500 }
  )
}