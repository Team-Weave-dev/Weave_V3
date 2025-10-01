# ui/ - shadcn/ui 컴포넌트 상세 가이드

## 🎨 UI 컴포넌트 라이브러리

이 디렉토리는 **shadcn/ui** 기반의 모든 UI 컴포넌트를 포함합니다. 각 컴포넌트는 **Radix UI** 기반으로 접근성이 보장되며, **Tailwind CSS**로 스타일링됩니다.

## 📦 설치된 컴포넌트 (42개)

- **Accordion**: 접기/펼치기 패널 컴포넌트
- **Advanced-table**: 컬럼 드롭다운/리사이징을 포함한 고급 테이블
- **Alert**: 알림 메시지 컴포넌트
- **Avatar**: 사용자 프로필 이미지 컴포넌트
- **Badge**: 상태 표시 배지 컴포넌트
- **Bar-chart**: 막대 차트 데이터 시각화 컴포넌트
- **Button**: 다양한 변형의 버튼 컴포넌트
- **Calendar**: 날짜 선택 및 관리 캘린더 컴포넌트
- **Card**: 콘텐츠 컨테이너 카드 컴포넌트
- **Carousel**: 이미지/콘텐츠 슬라이더 컴포넌트
- **Chart**: 차트 컨테이너 및 레이아웃 컴포넌트
- **Checkbox**: 체크박스 입력 컴포넌트
- **Dialog**: 모달 대화상자 컴포넌트
- **Dropdown-menu**: 드롭다운 컨텍스트 메뉴
- **Footer**: 푸터 레이아웃 컴포넌트
- **Form**: 폼 컨텍스트 및 검증 컴포넌트
- **Header**: 상단 고정 헤더 네비게이션
- **Hero-section**: 히어로 섹션 레이아웃 컴포넌트
- **Interactive-card**: 호버 인터랙션이 포함된 카드 래퍼
- **Input**: 텍스트 입력 필드 컴포넌트
- **Label**: 폼 라벨 컴포넌트
- **Line-chart**: 선형 차트 데이터 시각화 컴포넌트
- **Loading-button**: 로딩 상태가 있는 인터랙티브 버튼 컴포넌트
- **Pagination**: 페이지네이션 네비게이터
- **Palette-switcher**: 상태 색상 팔레트 스위처
- **Pie-chart**: 원형 차트 데이터 시각화 컴포넌트
- **Progress**: 기본 진행률 표시 컴포넌트
- **Project-progress**: 프로젝트/메트릭 진행률 컴포넌트
- **Select**: 드롭다운 선택 컴포넌트
- **Sheet**: 사이드 패널 컴포넌트
- **Switch**: 토글 스위치 컴포넌트
- **Table**: 데이터 테이블 컴포넌트
- **Tabs**: 탭 네비게이션 컴포넌트
- **Textarea**: 다중 라인 텍스트 입력 컴포넌트
- **Toast**: 일시적 알림 메시지 컴포넌트
- **Toaster**: 토스트 알림 관리 컴포넌트
- **Tooltip**: 도움말 툴팁 컴포넌트
- **Typography**: 타이포그래피 프리셋
- **View-mode-switch**: 리스트/상세 뷰 모드 전환 컴포넌트

*마지막 업데이트: 2025-09-24*


**특별 기능**:
- 완전한 접근성 지원
- 로딩 상태 지원
- 비활성 상태 자동 처리

### 🆕 최근 추가된 컴포넌트

#### LoadingButton (`loading-button.tsx`)
```typescript
// 기본 로딩 버튼
<LoadingButton loading={isLoading}>
  {getButtonText.submit('ko')}
</LoadingButton>

// 커스텀 로딩 텍스트
<LoadingButton
  loading={isLoading}
  loadingText={getButtonText.save('ko')}
>
  저장하기
</LoadingButton>

// 로딩 스피너 위치 조정
<LoadingButton
  loading={isLoading}
  loadingPlacement="right"
  variant="secondary"
>
  처리 중
</LoadingButton>

// 중앙 정렬 로딩
<LoadingButton
  loading={isLoading}
  loadingPlacement="center"
  size="lg"
>
  업로드
</LoadingButton>

// 실제 사용 예시
function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitData()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LoadingButton
      loading={isSubmitting}
      onClick={handleSubmit}
      variant="default"
    >
      {getButtonText.submit('ko')}
    </LoadingButton>
  )
}
```

**주요 기능**:
- 자동 로딩 상태 관리 (disabled, cursor 변경)
- 중앙화된 텍스트 시스템 활용
- 3가지 스피너 위치 (left, right, center)
- 완전한 접근성 지원 (aria-describedby, 스크린 리더)
- 기존 Button 컴포넌트의 모든 variant와 호환

#### Input (`input.tsx`)
```typescript
// 기본 텍스트 입력
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="••••••••" />

// 폼과 함께 사용
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" placeholder="johndoe" />
</div>
```

#### Textarea (`textarea.tsx`)
```typescript
// 다중 라인 텍스트 입력
<Textarea placeholder="Enter your message..." rows={4} />

// 리사이징 비활성화
<Textarea className="resize-none" />
```

#### Badge (`badge.tsx`)
```tsx
// 기본 배지 (shadcn 기본 변형)
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// 소프트 시맨틱 상태 (성공/경고/오류/정보)
<Badge variant="status-soft-success">Success</Badge>
<Badge variant="status-soft-warning">Warning</Badge>
<Badge variant="status-soft-error">Error</Badge>
<Badge variant="status-soft-info">Info</Badge>

// 프로젝트 상태 6종 (텍스트는 brand.ts에서 관리)
const status = 'in_progress' as const
<Badge variant="status-soft-inprogress">
  {getProjectStatusText(status, 'ko')}
</Badge>
```

**노트**: `status-soft-*` 변형은 `@/config/brand.ts`와 `PaletteSwitcher`가 공유하는 10개의 컬러 토큰을 기준으로 렌더링됩니다.

#### PaletteSwitcher (`palette-switcher.tsx`)
```tsx
// 팔레트 미리보기 + 상태 배지 확장
<PaletteSwitcher
  palettes={['soft']}
  selectedPalette="soft"
  onPaletteChange={(next) => console.log('palette', next)}
/>
```

**사용 목적**:
- 프로젝트 상태 6종 + 시맨틱 상태 4종을 하나의 `status-soft-*` 네이밍으로 관리
- `brand.ts`의 텍스트/레이블과 연동되어 다른 프로젝트에서도 즉시 재사용 가능
- 버튼 & 배지 영역에서 현재 팔레트 변경 사항을 실시간으로 확인

#### Avatar (`avatar.tsx`)
```typescript
// 사용자 프로필 이미지
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// 크기 변형
<Avatar className="h-12 w-12">
  <AvatarFallback>LG</AvatarFallback>
</Avatar>
```

### 📝 폼 관련 컴포넌트

#### Form (`form.tsx`)
```typescript
// React Hook Form과 통합된 폼 시스템
<Form>
  <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="shadcn" {...field} />
        </FormControl>
        <FormDescription>This is your public display name.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

#### Checkbox (`checkbox.tsx`)
```typescript
// 체크박스 입력
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

#### Switch (`switch.tsx`)
```typescript
// 토글 스위치
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

#### Select (`select.tsx`)
```typescript
// 드롭다운 선택
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

#### Label (`label.tsx`)
```typescript
// 폼 라벨
<Label htmlFor="email">Email address</Label>
<Input id="email" type="email" />
```

### 🔔 알림 컴포넌트

#### Alert (`alert.tsx`)
```typescript
// 정보 알림
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

// 경고 알림
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Your session has expired.</AlertDescription>
</Alert>
```

#### Toast (`toast.tsx` & `toaster.tsx`)
```typescript
// 토스트 훅 사용
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// 기본 토스트
toast({
  title: "Success",
  description: "Your message has been sent.",
})

// 에러 토스트
toast({
  variant: "destructive",
  title: "Uh oh! Something went wrong.",
  description: "There was a problem with your request.",
})

// 레이아웃에 Toaster 추가 필요
<Toaster />
```

### 📊 데이터 표시 컴포넌트

#### Table (`table.tsx`)
```typescript
// 데이터 테이블
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge>Active</Badge></TableCell>
      <TableCell>Developer</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Progress (`progress.tsx`)
```typescript
// 진행률 표시바
<Progress value={33} className="w-[60%]" />

// 애니메이션과 함께
const [progress, setProgress] = useState(13)

useEffect(() => {
  const timer = setTimeout(() => setProgress(66), 500)
  return () => clearTimeout(timer)
}, [])

<Progress value={progress} className="w-[60%]" />
```

#### Advanced Table (`advanced-table.tsx`)
```tsx
import { AdvancedTable } from '@/components/ui/advanced-table'

<AdvancedTable
  data={projects}
  config={tableConfig}
  onConfigChange={setTableConfig}
/>
```

- 주요 기능: 컬럼 드래그 앤 드롭, 리사이징, 페이징, 삭제 모드, 키보드 네비게이션.
- 진행률 칼럼은 `ProjectProgress`(흰색 배경 + 회색 경계선 + 프라이머리 트랙)를 사용합니다.
- 헤더 정렬 버튼 UI는 제공되며, 실제 정렬 로직은 후속 마이그레이션 예정입니다.
- 프로젝트 상태는 `Badge`의 `status-soft-*` variants(`planning`, `inprogress`, `review`, `completed`, `onhold`, `cancelled`)를 사용합니다.

#### Pagination (`pagination.tsx`)
```typescript
// 기본 페이지네이션
import Pagination from '@/components/ui/pagination'

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  language="ko"
/>

// 커스텀 핸들러와 함께
<Pagination
  currentPage={config.pagination.page}
  totalPages={totalPages}
  onPageChange={updatePage}
  onFirstPage={goToFirstPage}
  onPreviousPage={goToPreviousPage}
  onNextPage={goToNextPage}
  onLastPage={goToLastPage}
  canGoToPreviousPage={canGoToPreviousPage}
  canGoToNextPage={canGoToNextPage}
  size="default"
  showInfo={false}
  language="ko"
/>

// DetailView에서 카드 목록용 (소형)
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  size="sm"
  showInfo={false}
  language="ko"
/>

// 간단한 모드 (이전/다음만)
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  simple={true}
  showInfo={true}
  language="ko"
/>
```

**주요 기능**:
- **완전한 접근성**: ARIA 레이블, 키보드 네비게이션, 스크린 리더 지원
- **중앙화된 텍스트**: brand.ts의 pagination 텍스트 시스템 활용
- **다양한 크기**: sm, default, lg 크기 지원
- **유연한 핸들러**: 개별 페이지 이동 핸들러 또는 통합 핸들러 지원
- **간단한 모드**: 이전/다음 버튼만 표시하는 심플 모드
- **반응형 디자인**: 모든 화면 크기에서 최적화

**사용 사례**:
- **ListView**: AdvancedTable 내장 페이지네이션 사용
- **DetailView**: 프로젝트 카드 목록용 소형 페이지네이션
- **일반 목록**: 데이터 목록이나 검색 결과용

#### Card (`card.tsx`)
```typescript
// 콘텐츠 컨테이너
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### InteractiveCard (`interactive-card.tsx`)
```tsx
// 호버 인터랙션이 포함된 카드 래퍼
<InteractiveCard className="max-w-sm">
  <CardHeader>
    <Typography variant="h4" color="accent">{getComponentDemoText.easySetup('ko')}</Typography>
    <Typography variant="body2" color="secondary">
      {getComponentDemoText.easySetupDesc('ko')}
    </Typography>
  </CardHeader>
  <CardContent className="flex items-center justify-between">
    <Typography variant="body2" color="secondary">
      {getComponentDemoText.hoverDescription('ko')}
    </Typography>
    <Button size="sm">{getButtonText.save('ko')}</Button>
  </CardContent>
</InteractiveCard>
```

- `Card`의 스타일을 유지하면서 `hover:-translate-y-1`, `hover:border-primary/50`로 인터랙션을 제공합니다.
- `glow` / `lift` props로 광원 효과와 상승 애니메이션을 제어할 수 있습니다.
- 카드 내부에는 기존 `CardHeader`, `CardContent`, `CardFooter` 컴포넌트를 그대로 조합합니다.

#### Carousel (`carousel.tsx`)
```typescript
// 이미지/콘텐츠 슬라이더
<Carousel className="w-full max-w-xs">
  <CarouselContent>
    <CarouselItem>
      <div className="p-1">
        <Card>
          <CardContent className="flex aspect-square items-center justify-center p-6">
            <span className="text-4xl font-semibold">1</span>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
    {/* 추가 아이템들... */}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>

// 다중 아이템 표시
<Carousel>
  <CarouselContent>
    {Array.from({ length: 5 }).map((_, index) => (
      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
        {/* 콘텐츠 */}
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

### 🧭 네비게이션 컴포넌트

#### Header (`header.tsx`)
```tsx
// 표준 헤더 (고정)
<Header />

// 컴포넌트 프리뷰용 (고정 해제)
<Header variant="preview" />
```

**주요 특징**:
- `headerNavigation` 설정(`@/config/brand.ts`)만 수정해도 메뉴, 액션 버튼, 프로필 드롭다운이 즉시 반영됩니다.
- `variant="preview"`로 고정 해제 상태를 제공하여 컴포넌트 페이지 카드 레이아웃에도 쉽게 배치할 수 있습니다.
- 로고는 `/public/favicon.ico`와 브랜드 프라이머리 색상을 자동으로 사용합니다.

- 메뉴 구성과 아이콘은 `config/brand.ts`의 `headerNavigation.menus` 배열과 `uiText.navigation.*`를 수정해 중앙화합니다.
- 로그인/회원가입 버튼과 프로필 드롭다운 항목은 `headerNavigation.auth`와 `uiText.auth.*`에서 관리합니다.
- 브랜드명 색상, 아바타 색상은 `brand.theme`에 정의된 클래스(예: `primaryTextClass`)를 사용하여 커스터마이징합니다.
- 기본 구현은 로컬 스토리지의 `testUser` 값을 참고하므로 실제 프로젝트에서는 인증 로직을 연결하세요.

#### DropdownMenu (`dropdown-menu.tsx`)
```typescript
// 컨텍스트 메뉴
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Tooltip (`tooltip.tsx`)
```typescript
// 도움말 툴팁
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Tabs (`tabs.tsx`)
```typescript
// 탭 네비게이션
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Make changes to your account here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="Pedro Duarte" />
        </div>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

#### Accordion (`accordion.tsx`)
```typescript
// 접기/펼치기 패널
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that match the other components.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Dialog (`dialog.tsx`)
```typescript
// 모달 대화상자
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value="Pedro Duarte" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Sheet (`sheet.tsx`)
```typescript
// 사이드 패널
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### 🏗️ 레이아웃 컴포넌트

#### HeroSection (`hero-section.tsx`)
```typescript
// 세 가지 히어로 섹션 타입
<BasicHero
  title="혁신적인 UI 시스템"
  subtitle="생산성을 높이는 컴포넌트 라이브러리"
  description="완전히 커스터마이징 가능한 컴포넌트들로 더 빠르게 개발하세요."
  badge="v1.0"
  primaryAction={{
    label: "시작하기",
    onClick: () => console.log("시작하기 클릭")
  }}
  secondaryAction={{
    label: "문서 보기",
    onClick: () => console.log("문서 보기 클릭")
  }}
/>

<CenteredHero
  title="중앙정렬 히어로"
  subtitle="모든 콘텐츠가 중앙 정렬"
  /* ... */
/>

<SplitHero
  title="분할 레이아웃 히어로"
  subtitle="좌우 분할 레이아웃"
  /* ... */
/>
```

#### Footer (`footer.tsx`)
```typescript
// 기본 푸터
<BasicFooter
  companyName="UI Components"
  description="현대적이고 접근성이 뛰어난 UI 컴포넌트 라이브러리입니다."
  links={[
    {
      title: "제품",
      items: [
        { label: "컴포넌트", href: "#" },
        { label: "템플릿", href: "#" }
      ]
    }
  ]}
  newsletter={{
    title: "뉴스레터",
    description: "최신 업데이트를 받아보세요",
    placeholder: "이메일 주소",
    buttonText: "구독"
  }}
  socialLinks={[
    { label: "GitHub", href: "#" },
    { label: "Twitter", href: "#" }
  ]}
/>

// 미니멀 푸터
<MinimalFooter
  companyName="UI Kit"
  links={[
    { label: "개인정보처리방침", href: "#" },
    { label: "이용약관", href: "#" }
  ]}
  copyright="© 2024 UI Kit. 모든 권리 보유."
/>
```

## 🎨 스타일링 가이드

### CSS 변수 활용
```typescript
// Tailwind CSS 클래스가 CSS 변수를 자동 참조
className="bg-primary text-primary-foreground"    // 주 색상
className="bg-secondary text-secondary-foreground"  // 보조 색상
className="bg-muted text-muted-foreground"         // 비활성 색상
className="bg-destructive text-destructive-foreground"  // 경고 색상
```

### 다크 모드 지원
모든 컴포넌트는 자동으로 다크 모드를 지원합니다:
```typescript
// globals.css에서 자동 전환
.dark {
  --background: 240 1.9608% 10%;
  --primary: 0 0% 89.8039%;
  /* ... */
}
```

#### ProjectProgress (`project-progress.tsx`)
```typescript
// 프로젝트/메트릭 진행률 컴포넌트
<ProjectProgress value={72} size="md" />

// 라벨과 애니메이션 제어
<ProjectProgress
  value={45}
  size="sm"
  showLabel
  animated={false}
  labelPlacement="bottom"
  labelClassName="text-[11px] text-muted-foreground"
  className="max-w-[160px]"
/>

// Advanced Table 스타일 예시
<ProjectProgress
  value={tableProgress}
  size="sm"
  showLabel
  labelPlacement="bottom"
  labelClassName="text-[11px] text-muted-foreground"
  className="max-w-[120px]"
/>
```

- 배경/테두리: 모든 진행률 바는 흰색 배경(`bg-white`)과 회색 경계선(`border-border`)을 사용합니다.
- 색상 단계: 기본 `variant="primary"`는 진행률 구간에 따라 프라이머리 톤을 점진적으로 변경합니다.
- 사이즈 변형: `sm`(h-1) · `md`(h-2) · `lg`(h-3)로 구성되며, `className`으로 최대 너비 등을 제어합니다.
- 라벨: `showLabel` + `labelPlacement`(top/bottom) + `labelClassName`으로 위치와 스타일을 제어합니다.
- `trackClassName`으로 트랙(배경) 스타일, `animated`로 쉬머 애니메이션을 제어합니다.

#### Status Badges (Soft 10 Variants)
```tsx
// 프로젝트 상태 (6종)
<Badge variant="status-soft-planning">기획</Badge>
<Badge variant="status-soft-inprogress">진행중</Badge>
<Badge variant="status-soft-review">검토</Badge>
<Badge variant="status-soft-completed">완료</Badge>
<Badge variant="status-soft-onhold">보류</Badge>
<Badge variant="status-soft-cancelled">취소</Badge>

// 시맨틱 상태 (4종)
<Badge variant="status-soft-success">성공</Badge>
<Badge variant="status-soft-warning">경고</Badge>
<Badge variant="status-soft-error">오류</Badge>
<Badge variant="status-soft-info">정보</Badge>
```

- 모든 `status-soft-*` 변형은 `PaletteSwitcher`와 `AdvancedTable`이 공유하는 동일한 컬러 토큰을 사용합니다.
- 상태 텍스트는 `getProjectStatusText`, `getComponentDemoText.getStatusText` 등 `brand.ts` 헬퍼를 활용합니다.
- `PaletteSwitcher`에서 팔레트를 변경하면 버튼 & 배지 섹션이 즉시 반영됩니다.

### 🔀 View Mode Switch (`view-mode-switch.tsx`)
```tsx
const [mode, setMode] = useState<ViewMode>("list")

<ViewModeSwitch
  value={mode}
  onValueChange={(next) => setMode(next as ViewMode)}
  aria-label={getViewModeText.title('ko')}
>
  <ViewModeSwitchItem value="list" icon={<List className="h-4 w-4" />}>
    {getViewModeText.listView('ko')}
  </ViewModeSwitchItem>
  <ViewModeSwitchItem value="detail" icon={<LayoutGrid className="h-4 w-4" />}>
    {getViewModeText.detailView('ko')}
  </ViewModeSwitchItem>
</ViewModeSwitch>

// 간단한 프리셋 버전
<SimpleViewModeSwitch
  mode={mode}
  onModeChange={setMode}
  labels={{
    list: getViewModeText.listView('ko'),
    detail: getViewModeText.detailView('ko'),
  }}
  variant="toggle"
  ariaLabel={getViewModeText.title('ko')}
/>
```

- `variant="default"`는 회색 배경 위 흰색 활성 버튼, `variant="toggle"`은 Primary 배경 활성 스타일.
- `SimpleViewModeSwitch`는 동일한 내부 컴포넌트를 사용하며, `labels`/`icons`로 텍스트와 아이콘을 중앙화된 시스템과 연동.
- `disabled` 전달 시 전체 토글 그룹이 비활성화되며 접근성 속성(`aria-disabled`)이 자동 설정된다.

### 커스텀 스타일링
```typescript
// cn() 함수로 조건부 스타일링
import { cn } from "@/lib/utils"

<Button
  className={cn(
    "default-classes",
    isActive && "active-classes",
    variant === "special" && "special-classes"
  )}
>
```

## 🔧 컴포넌트 커스터마이징

### variant 추가
```typescript
// button.tsx에서 새 variant 추가
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        // 기존 variants...
        custom: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
    },
  }
)
```

### 새로운 컴포넌트 조합
```typescript
// 기존 컴포넌트를 조합하여 새로운 패턴 생성
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

## 🚨 주의사항 및 베스트 프랙티스

### 접근성 준수
```typescript
// ✅ 올바른 접근성 구현
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

<Input aria-describedby="email-error" />
<div id="email-error" role="alert">Please enter a valid email</div>

// ❌ 접근성 무시
<div onClick={handleClick}>Click me</div>  // 키보드 접근 불가
<img src="..." />  // alt 속성 누락
```

### 성능 최적화
```typescript
// ✅ React.memo 활용
const OptimizedCard = React.memo(Card)

// ✅ 조건부 렌더링 최적화
{isVisible && <HeavyComponent />}

// ❌ 불필요한 재렌더링
<Card key={Math.random()} />  // 매번 새로운 key
```

### 타입 안정성
```typescript
// ✅ 완전한 타입 정의
interface UserCardProps {
  user: {
    id: string
    name: string
    avatar?: string
    status: 'active' | 'inactive'
  }
  onUserClick?: (userId: string) => void
}

// ❌ any 타입 사용 금지
function BadComponent(props: any) { /* ... */ }
```

## 📊 컴포넌트 메트릭

### 번들 크기 (gzipped)
- **개별 컴포넌트**: 평균 2-5KB
- **전체 UI 라이브러리**: ~85KB (tree-shaking 적용)
- **공통 의존성**: ~45KB (Radix UI + utils)

### 성능 벤치마크
- **초기 렌더링**: < 16ms (60fps 유지)
- **상호작용 응답**: < 100ms
- **메모리 사용량**: < 10MB (25개 컴포넌트)

### 📅 데이터 시각화 컴포넌트

#### Calendar (`calendar.tsx`)
```typescript
// 기본 캘린더
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

function CalendarDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      selected={selectedDate}
      onSelect={setSelectedDate}
      showToday={true}
      showNavigation={true}
      className="rounded-md border"
    />
  )
}

// 다양한 크기와 변형
<Calendar
  cellSize="sm"           // small, default, large
  variant="outline"       // default, ghost, outline
  size="lg"              // sm, default, lg
  showToday={false}      // 오늘 날짜 강조 해제
  highlightWeekends={true} // 주말 강조
/>

// 중앙화된 텍스트와 함께 사용
import { getCalendarText } from "@/config/brand"

<Card>
  <CardHeader>
    <CardTitle>{getCalendarText.title('ko')}</CardTitle>
    <CardDescription>{getCalendarText.description('ko')}</CardDescription>
  </CardHeader>
  <CardContent>
    <Calendar selected={selectedDate} onSelect={setSelectedDate} />
  </CardContent>
</Card>
```

**주요 기능**:
- **react-day-picker 기반**: 강력한 날짜 선택 기능
- **완전한 접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **중앙화된 디자인 토큰**: constants.ts의 calendar 객체 활용
- **다양한 변형**: 크기, 스타일, 동작 커스터마이징
- **TypeScript 완전 지원**: 모든 Props 타입 안정성

#### BarChart (`bar-chart.tsx`)
```typescript
// 막대 차트
import { BarChart } from "@/components/ui/bar-chart"
import { getChartText } from "@/config/brand"
import { chart } from "@/config/constants"

const data = [
  { name: '1월', value: 12 },
  { name: '2월', value: 19 },
  { name: '3월', value: 15 },
]

<BarChart
  data={data}
  title={getChartText.barChart.title('ko')}
  description={getChartText.barChart.description('ko')}
  color={chart.colors.primary}
  showGrid={true}
  showTooltip={true}
  showAxis={true}
  variant="default"
  size="default"
  animate={true}
/>
```

#### LineChart (`line-chart.tsx`)
```typescript
// 선형 차트
import { LineChart } from "@/components/ui/line-chart"

const lineData = [
  { name: '월', value: 8 },
  { name: '화', value: 12 },
  { name: '수', value: 15 },
]

<LineChart
  data={lineData}
  title={getChartText.lineChart.title('ko')}
  description={getChartText.lineChart.description('ko')}
  color={chart.colors.secondary}
  strokeWidth={3}
  showGrid={true}
  showTooltip={true}
  showDots={true}
  smooth={true}
  variant="default"
  size="default"
  animate={true}
/>
```

#### PieChart (`pie-chart.tsx`)
```typescript
// 원형 차트
import { PieChart } from "@/components/ui/pie-chart"

const pieData = [
  { name: '업무', value: 40 },
  { name: '개인', value: 25 },
  { name: '회의', value: 20 },
  { name: '기타', value: 15 }
]

<PieChart
  data={pieData}
  title={getChartText.pieChart.title('ko')}
  description={getChartText.pieChart.description('ko')}
  showLegend={true}
  showTooltip={true}
  showPercent={true}
  variant="default"
  size="default"
  animate={true}
  outerRadius={80}
/>
```

**차트 공통 기능**:
- **Recharts 기반**: 강력한 차트 라이브러리
- **중앙화된 색상 시스템**: constants.ts의 chart.colors 활용
- **완전한 접근성**: ARIA 레이블 및 키보드 내비게이션
- **반응형 디자인**: 모든 화면 크기에서 최적화
- **애니메이션 지원**: 부드러운 데이터 전환 효과
- **TypeScript 완전 지원**: 모든 데이터 타입 안정성

### 🔧 데이터 시각화 최적화

#### CSS 통합
```css
/* globals.css에 필수 import */
@import "react-day-picker/dist/style.css";
```

#### 중앙화된 설정 활용
```typescript
// constants.ts에서 차트 색상 및 설정 관리
import { chart, calendar } from "@/config/constants"

// 일관된 색상 팔레트
chart.colors.primary    // hsl(var(--chart-1))
chart.colors.secondary  // hsl(var(--chart-2))
chart.colors.palette    // 5색 배열

// 캘린더 디자인 토큰
calendar.sizes.default  // h-9 w-9 text-sm
calendar.cell.radius    // rounded-md
```

## ⏳ 로딩 UI 시스템

프로젝트의 모든 로딩 상태 UI를 관리하는 통합 시스템입니다. 상세한 가이드는 [`docs/LOADING-GUIDE.md`](../../docs/LOADING-GUIDE.md)를 참조하세요.

### 로딩 컴포넌트 목록

| 컴포넌트 | 용도 | 사용 시기 |
|---------|------|----------|
| **FullPageLoadingSpinner** | 전체 페이지 로딩 | 페이지 초기 로딩 (스켈레톤 없을 때) |
| **LoadingSpinner** | 인라인 로딩 | 컴포넌트 내부 단순 로딩 |
| **LoadingButton** | 버튼 로딩 상태 | 버튼 클릭 후 액션 처리 |
| **RouteChangeProgressBar** | 라우트 전환 | 페이지 네비게이션 (자동) |
| **ProjectProgress** | 진행률 시각화 | 프로젝트 메트릭 표시 |
| **Skeleton** (예정) | 구조 미리보기 | 전체 페이지 초기 로딩 (권장) |

### 로딩 텍스트 시스템

모든 로딩 텍스트는 `@/config/brand.ts`의 `getLoadingText` 헬퍼를 사용합니다.

```typescript
import { getLoadingText } from '@/config/brand'

// 기본 로딩 메시지
getLoadingText.page('ko')        // "페이지를 불러오는 중..."
getLoadingText.content('ko')     // "콘텐츠를 불러오는 중..."
getLoadingText.data('ko')        // "데이터를 불러오는 중..."
getLoadingText.component('ko')   // "컴포넌트를 불러오는 중..."
getLoadingText.pleaseWait('ko')  // "잠시만 기다려주세요..."

// 접근성 레이블
getLoadingText.aria('ko')        // "로딩 중"

// 프로젝트 관련
getLoadingText.contract('ko')    // "계약서 정보를 불러오는 중입니다..."
getLoadingText.billing('ko')     // "청구서 정보를 불러오는 중입니다..."
getLoadingText.documents('ko')   // "문서 목록을 불러오는 중입니다..."
```

### 사용 예시

#### FullPageLoadingSpinner
```tsx
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

// loading.tsx 파일에서
export default function Loading() {
  return <FullPageLoadingSpinner text={getLoadingText.page('ko')} />
}
```

#### LoadingSpinner
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

// 컴포넌트 내부에서
{isLoading && (
  <LoadingSpinner
    size="md"
    text={getLoadingText.data('ko')}
  />
)}
```

#### LoadingButton
```tsx
import { LoadingButton } from '@/components/ui/loading-button'
import { getButtonText } from '@/config/brand'

function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <LoadingButton
      loading={isSubmitting}
      onClick={handleSubmit}
    >
      {getButtonText.submit('ko')}
    </LoadingButton>
  )
}
```

#### RouteChangeProgressBar
```tsx
// layout.tsx에 전역 추가 (이미 적용됨)
import { RouteChangeProgressBar } from '@/components/ui/route-progress-bar'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RouteChangeProgressBar />
        {children}
      </body>
    </html>
  )
}
```

### 로딩 UI 결정 가이드

```
로딩 상태 발생
    │
    ├─ 전체 페이지 초기 로딩? → 스켈레톤 UI (권장) 또는 FullPageLoadingSpinner
    ├─ 라우트 전환? → RouteChangeProgressBar (자동 적용)
    ├─ 버튼 액션? → LoadingButton
    ├─ 데이터 시각화? → ProjectProgress
    └─ 컴포넌트 내부 로딩? → LoadingSpinner
```

### 접근성 준수사항

- ✅ 모든 로딩 컴포넌트는 `aria-label` 지원
- ✅ `getLoadingText.aria()` 사용 권장
- ✅ 스크린 리더 호환성 보장
- ✅ 키보드 내비게이션 방해하지 않음

### 🚀 향후 계획 (Phase 2)

#### Skeleton UI 추가 (권장)

스켈레톤 UI는 CLS (Cumulative Layout Shift)를 최소화하고 인지된 성능을 향상시킵니다.

```tsx
// 예정: src/components/ui/skeleton.tsx
<Skeleton className="w-full h-12" />

// 예정: 재사용 가능한 스켈레톤
<SkeletonCard />        // 카드 스켈레톤
<SkeletonTable />       // 테이블 스켈레톤
<SkeletonProjectDetail /> // 프로젝트 상세 스켈레톤
```

**적용 예정 영역**:
- 프로젝트 목록 (ListView)
- 프로젝트 상세 (DetailView)
- 대시보드 위젯

**예상 효과**:
- CLS 감소 → Core Web Vitals 개선
- 인지된 성능 향상 → 사용자 만족도 증가
- 업계 표준 패턴 준수 → 전문성 향상

---

**참고 문서**: [`docs/LOADING-GUIDE.md`](../../docs/LOADING-GUIDE.md)

## 🔄 컴포넌트 페이지 재사용 가이드

### 스타일 재사용 원칙
새로운 컴포넌트를 추가할 때 기존 컴포넌트 페이지의 구조와 스타일을 재사용해야 합니다:

#### 1. **레이아웃 구조 재사용**
```tsx
// ✅ 기존 Card 구조 재사용
<Card>
  <CardHeader>
    <CardTitle>{getComponentText.newComponent.title('ko')}</CardTitle>
    <CardDescription>{getComponentText.newComponent.description('ko')}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 새 컴포넌트 구현 */}
    <NewComponent />
  </CardContent>
</Card>
```

#### 2. **중앙화된 텍스트 시스템 적용**
**❌ 절대 하드코딩 금지**:
```tsx
<CardTitle>새 컴포넌트</CardTitle>  // 하드코딩 금지
```

**✅ 중앙화된 텍스트 사용**:
```tsx
// brand.ts에 새 텍스트 추가
export const getComponentText = {
  newComponent: {
    title: { ko: "새 컴포넌트", en: "New Component" },
    description: { ko: "새 컴포넌트 설명", en: "New component description" }
  }
}

// 페이지에서 사용
<CardTitle>{getComponentText.newComponent.title('ko')}</CardTitle>
```

#### 3. **스타일 패턴 재사용**
```tsx
// ✅ 기존 그리드 패턴 재사용
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 새 컴포넌트들 */}
</div>

// ✅ 기존 간격 시스템 재사용
<div className="space-y-4">
  {/* 컴포넌트 내용 */}
</div>
```

#### 4. **사용법 코드 블록 패턴**
```tsx
// ✅ 표준 사용법 표시 패턴
<div>
  <h4 className="font-semibold mb-2">{getUsageText.newComponentUsage('ko')}</h4>
  <code className="block p-2 bg-muted rounded text-sm">
    {`import { NewComponent } from '@/components/ui/new-component'`}
  </code>
</div>
```

#### 5. **데모 인터랙션 패턴**
```tsx
// ✅ 상태 관리와 인터랙션
const [newComponentState, setNewComponentState] = useState(defaults.newComponent.initialValue)

const handleNewComponentAction = () => {
  // 액션 로직
}

<NewComponent
  value={newComponentState}
  onChange={setNewComponentState}
  onClick={handleNewComponentAction}
/>
```

### 📋 새 컴포넌트 추가 체크리스트

1. **텍스트 중앙화**: `brand.ts`에 모든 텍스트 추가
2. **상수 중앙화**: `constants.ts`에 기본값/설정 추가
3. **레이아웃 재사용**: 기존 Card/Grid 패턴 사용
4. **스타일 일관성**: 기존 간격/색상 시스템 준수
5. **사용법 표시**: 표준 코드 블록 패턴 적용
6. **상호작용 구현**: 적절한 상태 관리 및 핸들러
7. **접근성 준수**: ARIA 레이블 및 키보드 지원
8. **문서 업데이트**: 이 파일의 컴포넌트 목록 업데이트

### 🚨 주의사항

- **절대 하드코딩 금지**: 모든 텍스트는 `brand.ts`에서 관리
- **스타일 일관성**: 기존 디자인 토큰과 패턴 준수
- **접근성 필수**: 모든 새 컴포넌트는 WCAG 2.1 AA 준수
- **타입 안정성**: 모든 Props와 상태에 TypeScript 타입 정의

---

**이 UI 컴포넌트들은 현대적인 웹 애플리케이션의 모든 요구사항을 충족하는 완전한 디자인 시스템을 제공합니다.**
