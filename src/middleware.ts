import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // CSRF 보호: POST, PUT, DELETE, PATCH 요청에 대해 Origin 검증
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Origin이 있고 호스트와 일치하지 않으면 차단
    if (origin) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[CSRF] Blocked request from ${origin} to ${host}`)
        }
        return new NextResponse('Forbidden: Invalid origin', { status: 403 })
      }
    }
  }

  // Supabase 세션 업데이트
  return await updateSession(request)
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