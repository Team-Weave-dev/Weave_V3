/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // X-Powered-By 헤더 제거

  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/:path*',
        headers: [
          // 클릭재킹 방어
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME 스니핑 방어
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referer 정책
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 권한 정책
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // HTTPS 강제 (프로덕션)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // XSS 보호
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Content Security Policy (XSS 방어)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js 필요
              "style-src 'self' 'unsafe-inline'", // Tailwind 필요
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
