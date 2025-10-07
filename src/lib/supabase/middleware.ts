import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log('🛡️ [MIDDLEWARE] Request:', pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('🛡️ [MIDDLEWARE] Reading cookies:', cookies.length)
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your server
  // vulnerable to CSRF attacks.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('🛡️ [MIDDLEWARE] User found:', user ? `✓ ${user.email}` : '✗')

  // 공개 경로 정의
  const publicPaths = [
    '/',              // 홈 화면
    '/login',         // 로그인
    '/signup',        // 회원가입
    '/auth',          // OAuth 콜백
    '/api/auth',      // OAuth API 엔드포인트
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  console.log('🛡️ [MIDDLEWARE] Is public path:', isPublicPath)

  if (!user && !isPublicPath) {
    console.log('🛡️ [MIDDLEWARE] REDIRECT to /login (no user, protected path)')
    // 비인증 사용자를 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  console.log('🛡️ [MIDDLEWARE] ALLOW (user exists or public path)')
  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're trying to modify the response, do it above.
  return supabaseResponse
}