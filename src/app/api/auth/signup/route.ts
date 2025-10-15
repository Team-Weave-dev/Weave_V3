import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validation/auth'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: Request) {
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

  try {
    const body = await request.json()

    // 입력 검증
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0].message,
          issues: result.error.issues,
        },
        { status: 400 }
      )
    }

    const { email, password, name } = result.data // 검증된 데이터 사용

    const supabase = await createClient()

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          name: name || email.split('@')[0], // Default name from email
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // 2. Create user profile in users table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: name || email.split('@')[0],
          avatar: null,
          metadata: {},
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Note: Profile creation failure is non-critical
        // User can still login and profile will be created later
      }

      // 3. Create default user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: authData.user.id,
          dashboard: {
            layout: 'grid',
            widgets: [],
            theme: 'light',
            showSidebar: true,
            compactView: false
          },
          preferences: {
            language: 'ko',
            timezone: 'Asia/Seoul',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            currency: 'KRW',
            firstDayOfWeek: 1,
            notifications: {
              email: true,
              push: false,
              desktop: true,
              taskReminders: true,
              projectUpdates: true
            },
            privacy: {
              profileVisibility: 'private',
              showEmail: false,
              showPhone: false
            }
          }
        })

      if (settingsError) {
        console.error('Settings creation error:', settingsError)
        // Non-critical error
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.'
    })

  } catch (error) {
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      )
    }

    console.error('Unexpected error during signup:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}