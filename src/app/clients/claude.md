# clients/ - 클라이언트 관리 시스템

## 👥 클라이언트 관리 개요

이 디렉토리는 고객/클라이언트 정보를 체계적으로 관리하는 완전한 CRM(Customer Relationship Management) 시스템을 제공합니다. **Supabase 인증**, **실시간 검색**, **반응형 카드 레이아웃**이 주요 특징입니다.

## 📁 파일 구조

```
clients/
├── layout.tsx    # 📱 클라이언트 페이지 레이아웃 래퍼
└── page.tsx      # 👥 메인 클라이언트 관리 페이지
```

## 📱 layout.tsx - 페이지 레이아웃

### 역할 및 기능
- **AppLayout 통합**: 공통 애플리케이션 레이아웃 적용
- **네비게이션**: 사이드바, 헤더 등 공통 UI 요소 제공
- **일관성 보장**: 다른 페이지들과 동일한 레이아웃 구조 유지

### 구현 코드
```typescript
import { AppLayout } from '@/components/layout/AppLayout'

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
```

### 특징
- **Server Component**: 서버에서 렌더링되어 초기 로딩 최적화
- **레이아웃 재사용**: 애플리케이션 전체에서 일관된 구조 제공

## 👥 page.tsx - 클라이언트 관리 메인 페이지

### 핵심 기능
- **클라이언트 CRUD**: 생성, 조회, 수정, 삭제 기능
- **실시간 검색**: 이름, 이메일, 회사명으로 실시간 필터링
- **인증 통합**: Supabase 및 테스트 사용자 지원
- **반응형 그리드**: 모바일 1열 → 태블릿 2열 → 데스크톱 3열
- **모달 기반 입력**: Dialog 컴포넌트를 활용한 클라이언트 추가/수정

### 상태 관리 구조

#### 주요 State
```typescript
const [clients, setClients] = useState<Client[]>([])          // 클라이언트 목록
const [loading, setLoading] = useState(true)                  // 로딩 상태
const [searchQuery, setSearchQuery] = useState('')           // 검색 쿼리
const [isDialogOpen, setIsDialogOpen] = useState(false)      // 모달 상태
const [formData, setFormData] = useState<Partial<Client>>({  // 폼 데이터
  name: '', email: '', phone: '', company: '', address: '', notes: ''
})
```

#### Client 타입 정의
```typescript
interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}
```

### 인증 시스템

#### 이중 인증 지원
```typescript
const loadClients = async () => {
  // 1. 테스트 사용자 체크
  const testUser = localStorage.getItem('testUser')
  if (testUser) {
    const userData = JSON.parse(testUser)
    // 테스트 데이터 로드
    setClients([/* 테스트 데이터 */])
    return
  }

  // 2. 실제 Supabase 사용자 체크
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    router.push('/login')  // 인증되지 않은 경우 로그인 페이지로
    return
  }

  // 실제 데이터 로드 (현재는 임시 데이터)
  setClients([/* 실제/임시 데이터 */])
}
```

#### 인증 플로우
1. **테스트 사용자**: localStorage에서 `testUser` 확인
2. **실제 사용자**: Supabase에서 인증 상태 확인
3. **비인증 상태**: `/login` 페이지로 자동 리다이렉트
4. **데이터 로딩**: 사용자별 클라이언트 데이터 로드

### UI 구성 요소

#### 페이지 헤더
```typescript
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold">클라이언트 관리</h1>
    <p className="text-muted-foreground mt-1">
      고객 정보를 체계적으로 관리하세요
    </p>
  </div>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    새 클라이언트
  </Button>
</div>
```

#### 검색 인터페이스
```typescript
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    placeholder="클라이언트 검색..."
    className="pl-10"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

#### 반응형 클라이언트 그리드
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredClients.map((client) => (
    <Card key={client.id} className="hover:shadow-lg transition-shadow">
      {/* 클라이언트 카드 내용 */}
    </Card>
  ))}
</div>
```

### 클라이언트 카드 구조

#### 카드 헤더
```typescript
<CardHeader className="pb-3">
  <div className="flex justify-between items-start">
    <div className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div>
        <CardTitle className="text-lg">{client.name}</CardTitle>
        {client.company && (
          <p className="text-sm text-muted-foreground">{client.company}</p>
        )}
      </div>
    </div>
    <DropdownMenu>
      {/* 편집/삭제 액션 메뉴 */}
    </DropdownMenu>
  </div>
</CardHeader>
```

#### 카드 콘텐츠
```typescript
<CardContent className="space-y-2">
  {client.email && (
    <div className="flex items-center text-sm text-muted-foreground">
      <Mail className="mr-2 h-4 w-4" />
      {client.email}
    </div>
  )}
  {client.phone && (
    <div className="flex items-center text-sm text-muted-foreground">
      <Phone className="mr-2 h-4 w-4" />
      {client.phone}
    </div>
  )}
  {client.address && (
    <div className="flex items-center text-sm text-muted-foreground">
      <Building className="mr-2 h-4 w-4" />
      {client.address}
    </div>
  )}
  {client.notes && (
    <CardDescription className="pt-2 text-xs">
      {client.notes}
    </CardDescription>
  )}
</CardContent>
```

### 클라이언트 추가/수정 Dialog

#### Dialog 구조
```typescript
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      새 클라이언트
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>새 클라이언트 추가</DialogTitle>
      <DialogDescription>
        클라이언트 정보를 입력하세요
      </DialogDescription>
    </DialogHeader>
    {/* 폼 필드들 */}
    <DialogFooter>
      <Button type="submit" onClick={handleSubmit}>저장</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 폼 필드 구성
1. **이름** (필수): 클라이언트 성명
2. **이메일**: 연락용 이메일 주소
3. **전화번호**: 연락처 정보
4. **회사**: 소속 회사명
5. **주소**: 사업장 또는 거주지 주소
6. **메모**: 추가적인 클라이언트 정보 (VIP, 특이사항 등)

### 검색 및 필터링

#### 실시간 검색 로직
```typescript
const filteredClients = clients.filter(client =>
  client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  client.company?.toLowerCase().includes(searchQuery.toLowerCase())
)
```

#### 검색 범위
- **이름**: 클라이언트 성명으로 검색
- **이메일**: 이메일 주소로 검색
- **회사**: 소속 회사명으로 검색
- **대소문자 무시**: 모든 검색이 case-insensitive

### 빈 상태 처리

#### 클라이언트 없음 상태
```typescript
{filteredClients.length === 0 && (
  <Card className="p-8">
    <div className="text-center space-y-3">
      <User className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium">클라이언트가 없습니다</h3>
      <p className="text-sm text-muted-foreground">
        {searchQuery ? '검색 결과가 없습니다.' : '첫 번째 클라이언트를 추가해보세요.'}
      </p>
    </div>
  </Card>
)}
```

#### 상태별 메시지
- **초기 상태**: "첫 번째 클라이언트를 추가해보세요."
- **검색 결과 없음**: "검색 결과가 없습니다."

### 로딩 상태

#### 로딩 인디케이터
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
```

### 액션 메뉴 시스템

#### DropdownMenu 구조
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <Edit className="mr-2 h-4 w-4" />
      수정
    </DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      삭제
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 개발 상태 및 TODO

#### 현재 구현 상태
- ✅ **UI/UX**: 완전 구현됨
- ✅ **인증**: Supabase + 테스트 사용자 지원
- ✅ **검색**: 실시간 필터링
- ✅ **반응형**: 모바일/태블릿/데스크톱 대응
- ✅ **폼 검증**: 기본 클라이언트 측 검증

#### 미완성 기능 (TODO 주석 포함)
- ❌ **데이터베이스 연동**: 실제 Supabase 테이블 연동 필요
- ❌ **수정 기능**: 편집 Dialog 구현 필요
- ❌ **삭제 기능**: 삭제 확인 및 실제 삭제 로직 필요
- ❌ **데이터 검증**: 서버 측 검증 및 에러 처리
- ❌ **페이지네이션**: 많은 클라이언트 목록 처리
- ❌ **정렬 기능**: 이름, 등록일 등으로 정렬

### 데이터베이스 스키마 (예상)

#### clients 테이블 구조
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
```

### 사용된 UI 컴포넌트

#### shadcn/ui 컴포넌트
- **Card**: 클라이언트 정보 카드 표시
- **Button**: 액션 버튼 (추가, 저장 등)
- **Input**: 검색 및 폼 입력 필드
- **Dialog**: 클라이언트 추가/수정 모달
- **DropdownMenu**: 편집/삭제 액션 메뉴
- **Label**: 폼 라벨
- **Textarea**: 메모 입력 필드

#### Lucide Icons
- **Plus**: 새 클라이언트 추가
- **Search**: 검색 아이콘
- **User**: 사용자/클라이언트 아이콘
- **Mail**: 이메일 아이콘
- **Phone**: 전화번호 아이콘
- **Building**: 회사/주소 아이콘
- **MoreVertical**: 더 많은 옵션 메뉴
- **Edit**: 편집 액션
- **Trash2**: 삭제 액션

### 반응형 디자인

#### 브레이크포인트 대응
```css
/* 모바일 (기본) */
grid-cols-1

/* 태블릿 (md 이상) */
md:grid-cols-2

/* 데스크톱 (lg 이상) */
lg:grid-cols-3
```

#### 카드 호버 효과
```css
hover:shadow-lg transition-shadow
```

### 접근성 (Accessibility)

#### 키보드 내비게이션
- **Dialog**: ESC 키로 닫기
- **DropdownMenu**: 키보드 내비게이션 지원
- **Form**: Tab 순서 및 Enter 제출 지원

#### 시맨틱 HTML
- **적절한 헤딩 구조**: h1 → h3
- **폼 라벨**: 모든 input에 label 연결
- **버튼 설명**: 명확한 버튼 텍스트

### 성능 최적화

#### 컴포넌트 최적화
- **클라이언트 사이드**: 'use client' 지시어로 필요한 상호작용
- **필터링 최적화**: 실시간 검색으로 빠른 응답
- **상태 최적화**: 최소한의 상태 관리

#### 로딩 전략
- **점진적 로딩**: 인증 → 데이터 로드 순서
- **로딩 표시**: 사용자에게 명확한 로딩 피드백

## 🔗 관련 문서

- [`../layout.tsx`](../layout.tsx) - 애플리케이션 공통 레이아웃
- [`../../types/business.ts`](../../types/business.ts) - Client 타입 정의
- [`../../lib/supabase/client.ts`](../../lib/supabase/client.ts) - Supabase 클라이언트 설정
- [`../../components/layout/AppLayout.tsx`](../../components/layout/AppLayout.tsx) - 앱 레이아웃 컴포넌트

---

**이 클라이언트 관리 시스템은 현대적인 CRM 기능을 제공하며, 향후 데이터베이스 연동을 통해 완전한 비즈니스 도구로 발전할 예정입니다.**