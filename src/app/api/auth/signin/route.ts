import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Signin error:', error)
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // Check if user needs to migrate LocalStorage data
    if (data.user) {
      const { data: migrationStatus } = await supabase
        .from('migration_status')
        .select('version')
        .eq('user_id', data.user.id)
        .eq('version', 'v2-to-supabase')
        .single()

      const shouldMigrate = !migrationStatus

      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
        shouldMigrate,
        message: '로그인에 성공했습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: '로그인에 성공했습니다.'
    })

  } catch (error) {
    console.error('Unexpected error during signin:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}