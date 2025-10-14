import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('🔐 [AUTH CALLBACK] Started', { code: code ? '✓' : '✗', next })
  console.log('🔐 [DEBUG] request.url:', request.url)
  console.log('🔐 [DEBUG] origin:', origin)
  console.log('🔐 [DEBUG] NODE_ENV:', process.env.NODE_ENV)

  if (code) {
    // Determine redirect URL based on environment
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    console.log('🔐 [DEBUG] x-forwarded-host:', forwardedHost)
    console.log('🔐 [DEBUG] isLocalEnv:', isLocalEnv)

    let redirectUrl: string
    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
      console.log('🔐 [DEBUG] Using LOCAL origin')
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`
      console.log('🔐 [DEBUG] Using forwardedHost')
    } else {
      redirectUrl = `${origin}${next}`
      console.log('🔐 [DEBUG] Using origin (fallback)')
    }

    console.log('🔐 [AUTH CALLBACK] Redirect URL:', redirectUrl)

    // Create response object first (CRITICAL for cookie setting in Route Handlers)
    let response = NextResponse.redirect(redirectUrl)

    // Create Supabase client with cookie configuration for Route Handler
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            console.log('🔐 [AUTH CALLBACK] Setting cookies:', cookiesToSet.length)
            // Set cookies on the response object
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
              console.log('  - Cookie set:', name.substring(0, 30) + '...')
            })
          }
        }
      }
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      console.log('🔐 [AUTH CALLBACK] Session exchange SUCCESS', {
        userId: data.user.id,
        email: data.user.email
      })

      // public.users 테이블에 레코드가 있는지 확인
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      console.log('🔐 [AUTH CALLBACK] Checking existing user:', {
        exists: !!existingUser,
        checkError: checkError?.message
      })

      // 레코드가 없으면 생성 (checkError.code === 'PGRST116'는 레코드 없음 의미)
      if (!existingUser) {
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
            metadata: data.user.user_metadata,
          })
          .select()

        if (insertError) {
          console.error('❌ [AUTH CALLBACK] Failed to create user record:', {
            error: insertError,
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          })
        } else {
          console.log('✅ [AUTH CALLBACK] User record created in public.users:', insertData)
        }
      } else {
        console.log('✅ [AUTH CALLBACK] User record already exists in public.users')
      }

      // Return response with session cookies
      return response
    }

    // Log error for debugging
    console.error('🔐 [AUTH CALLBACK] Session exchange FAILED:', error)
  }

  console.log('🔐 [AUTH CALLBACK] No code, redirecting to error page')
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}