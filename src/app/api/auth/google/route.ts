import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/ratelimit'

export async function GET(request: Request) {
  // Rate Limiting 체크
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitResult = await checkRateLimit(ip)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }

  // 개발 환경에서만 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Starting Google OAuth flow')
    console.log('[DEV] NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  }

  try {
    const supabase = await createClient()

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`

    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Redirect URL:', redirectTo)
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'email profile',
      }
    })

    if (error) {
      console.error('[OAuth Error]', error.message)
      return NextResponse.json(
        { error: 'Google 로그인 초기화에 실패했습니다.', details: error.message },
        { status: 400 }
      )
    }

    if (data.url) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV] OAuth URL generated')
      }
      // Redirect to Google OAuth URL
      return NextResponse.redirect(data.url)
    }

    console.error('[OAuth Error] No OAuth URL generated')
    return NextResponse.json(
      { error: 'OAuth URL을 생성할 수 없습니다.' },
      { status: 500 }
    )
  } catch (err) {
    console.error('[OAuth Error] Unexpected error:', err instanceof Error ? err.message : 'Unknown error')
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다.', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}