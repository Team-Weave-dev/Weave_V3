import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { signinSchema } from '@/lib/validation/auth'
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
    const result = signinSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0].message,
          issues: result.error.issues,
        },
        { status: 400 }
      )
    }

    const { email, password } = result.data // 검증된 데이터 사용

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
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      )
    }

    console.error('Unexpected error during signin:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}