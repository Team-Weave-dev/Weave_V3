import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

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
    console.error('Unexpected error during signup:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}