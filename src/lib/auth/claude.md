# auth/ - 인증 시스템 및 세션 관리

## 📋 개요

이 디렉토리는 **Supabase 인증 시스템**과 **세션 관리** 기능을 제공합니다. Phase 12 완료로 이메일/패스워드 인증 및 Google OAuth가 구현되어 있습니다.

## 🎯 시스템 역할

### 현재 상태 (Phase 12 완료)

- ✅ **이메일/패스워드 인증**: 기본 인증 방식 구현
- ✅ **Google OAuth**: 소셜 로그인 통합
- ✅ **쿠키 기반 세션**: Next.js 15 SSR 호환
- ✅ **보호된 라우트**: 자동 리다이렉션 시스템
- ✅ **세션 유틸리티**: 서버 컴포넌트용 헬퍼 함수

## 📁 디렉토리 구조

```
auth/
├── 📋 claude.md    # 🎯 이 파일 - 인증 시스템 가이드
└── session.ts      # 세션 관리 유틸리티
```

## 🔧 핵심 기능

### session.ts - 세션 관리 유틸리티

**서버 컴포넌트 및 Server Actions용 세션 헬퍼**

#### 1. getSession() - 세션 조회
```typescript
import { getSession } from '@/lib/auth/session'

// 현재 세션 가져오기 (null 가능)
export default async function Page() {
  const session = await getSession()

  if (!session) {
    // 비인증 상태 처리
    return <LoginPrompt />
  }

  return <AuthenticatedContent user={session.user} />
}
```

**반환 타입**:
```typescript
Session | null  // Session 객체 또는 null
```

#### 2. getUser() - 사용자 정보 조회
```typescript
import { getUser } from '@/lib/auth/session'

// 현재 인증된 사용자 정보
export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    return <div>로그인이 필요합니다</div>
  }

  return <UserProfile user={user} />
}
```

**반환 타입**:
```typescript
User | null  // User 객체 또는 null
```

#### 3. requireAuth() - 인증 필수
```typescript
import { requireAuth } from '@/lib/auth/session'

// 인증되지 않은 사용자 자동 리다이렉트
export default async function ProtectedPage() {
  const session = await requireAuth()

  // 여기 도달 시 인증 보장
  return <ProtectedContent session={session} />
}
```

**동작**:
- 세션 존재: Session 객체 반환
- 세션 없음: `/login`으로 자동 리다이렉트 (never 반환)

#### 4. isAuthenticated() - 인증 상태 확인
```typescript
import { isAuthenticated } from '@/lib/auth/session'

// 조건부 렌더링
export default async function Layout({ children }) {
  const isAuth = await isAuthenticated()

  return (
    <div>
      <Header showUserMenu={isAuth} />
      {children}
    </div>
  )
}
```

**반환 타입**:
```typescript
boolean  // true: 인증됨, false: 비인증
```

## 🚨 필수 준수 사항

### 1. 세션 확인 패턴

#### ✅ DO (권장)
```typescript
// Server Component
import { requireAuth, getUser } from '@/lib/auth/session'

// 인증 필수 페이지
export default async function ProtectedPage() {
  const session = await requireAuth()  // 자동 리다이렉트
  // ...
}

// 선택적 인증 페이지
export default async function OptionalAuthPage() {
  const user = await getUser()

  if (user) {
    return <AuthenticatedView />
  }
  return <GuestView />
}
```

#### ❌ DON'T (금지)
```typescript
// ❌ Client Component에서 직접 사용 금지
'use client'

export default function ClientPage() {
  const session = await requireAuth()  // 에러!
  // ...
}

// ❌ getSession() 후 수동 리다이렉트 (requireAuth 사용)
const session = await getSession()
if (!session) {
  redirect('/login')  // requireAuth()를 사용하세요
}
```

### 2. 클라이언트 vs 서버 인증

#### Server Component (권장)
```typescript
// ✅ Server Component에서 세션 확인
import { requireAuth } from '@/lib/auth/session'

export default async function Page() {
  const session = await requireAuth()
  return <div>{session.user.email}</div>
}
```

#### Client Component (특별한 경우만)
```typescript
// ✅ Client Component는 Supabase Client 사용
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientAuthComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return <div>{user?.email}</div>
}
```

### 3. API Routes 인증

```typescript
// src/app/api/protected/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 인증된 사용자 로직
  return NextResponse.json({ data: 'Protected data' })
}
```

## 📖 인증 플로우

### 1. 회원가입 플로우
```
사용자 → /signup 페이지
  ↓
이메일/패스워드 입력
  ↓
POST /api/auth/signup
  ↓
Supabase Auth 회원가입
  ↓
users 테이블 프로필 생성
  ↓
user_settings 기본 설정 생성
  ↓
이메일 인증 발송 (선택)
  ↓
/dashboard 리다이렉트
```

### 2. 로그인 플로우
```
사용자 → /login 페이지
  ↓
이메일/패스워드 입력 또는 Google 클릭
  ↓
POST /api/auth/signin 또는 GET /api/auth/google
  ↓
Supabase Auth 인증
  ↓
세션 쿠키 설정
  ↓
LocalStorage 마이그레이션 체크
  ↓
/dashboard 리다이렉트
```

### 3. 세션 갱신 플로우
```
페이지 요청
  ↓
middleware.ts 실행
  ↓
Supabase 세션 확인
  ↓
세션 유효: 쿠키 갱신 → 요청 통과
세션 무효: /login 리다이렉트
```

## 🔗 관련 API Routes

### 인증 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|------|
| `/api/auth/signup` | POST | 이메일/패스워드 회원가입 |
| `/api/auth/signin` | POST | 이메일/패스워드 로그인 |
| `/api/auth/google` | GET | Google OAuth 로그인 |
| `/api/auth/signout` | POST | 로그아웃 |
| `/api/auth/callback` | GET | OAuth 콜백 (자동) |

**사용 예시**:
```typescript
// 회원가입
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password',
    name: '홍길동'
  })
})

// 로그인
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password'
  })
})

// Google 로그인
window.location.href = '/api/auth/google'
```

## 🛡️ 보안 고려사항

### 1. 패스워드 정책
```typescript
// ✅ 강력한 패스워드 요구
- 최소 8자 이상
- 대문자, 소문자, 숫자 포함
- 특수문자 권장

// Supabase 대시보드에서 설정
- Password minimum length: 8
- Password required characters: 대문자, 소문자, 숫자
```

### 2. 세션 보안
```typescript
// ✅ 쿠키 설정
- HttpOnly: true (XSS 방지)
- Secure: true (HTTPS 전용)
- SameSite: 'lax' (CSRF 방지)
- Path: '/' (전역 접근)
- MaxAge: 7일 (자동 만료)
```

### 3. 토큰 관리
```typescript
// ✅ Access Token 갱신
- Supabase가 자동 처리
- Refresh Token으로 자동 갱신
- middleware.ts에서 세션 유효성 검증

// ❌ 토큰 직접 관리 금지
- localStorage에 토큰 저장 금지 (XSS 취약)
- 수동 토큰 갱신 금지 (Supabase 자동 처리)
```

## 📊 사용 통계

### Phase 12 구현 결과
- ✅ **인증 시스템**: 100% 완료
- ✅ **API Routes**: 4개 (signup, signin, google, signout)
- ✅ **세션 유틸리티**: 4개 함수
- ✅ **보호된 라우트**: middleware.ts 기반
- ✅ **타입 안전성**: 100% TypeScript

### 보안 체크리스트
- ✅ RLS 정책 적용 (users, user_settings 테이블)
- ✅ 쿠키 기반 세션 (SSR 호환)
- ✅ CSRF 방지 (SameSite 쿠키)
- ✅ XSS 방지 (HttpOnly 쿠키)
- ✅ 패스워드 해싱 (Supabase 자동)
- ✅ OAuth 2.0 표준 준수 (Google)

## 🔗 관련 문서

- **Supabase Client**: [`../supabase/claude.md`](../supabase/claude.md)
- **API Routes**: [`../../app/api/claude.md`](../../app/api/claude.md)
- **Storage System**: [`../storage/claude.md`](../storage/claude.md)
- **통합 계획**: [`../../../docs/SUPABASE-INTEGRATION-PLAN.md`](../../../docs/SUPABASE-INTEGRATION-PLAN.md)

---

**이 인증 시스템은 Supabase Auth를 기반으로 안전하고 확장 가능한 사용자 인증을 제공하며, Next.js 15 SSR과 완벽하게 통합되어 있습니다.**

*마지막 업데이트: 2025-10-09*
*Phase: 12 완료*
*작성자: Claude Code*
