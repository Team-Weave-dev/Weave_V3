import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // 테스트 모드: Supabase 미들웨어 비활성화
  // 프로덕션에서는 아래 주석을 해제하세요
  // const { updateSession } = await import('@/lib/supabase/middleware')
  // return await updateSession(request)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes for auth callbacks
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}