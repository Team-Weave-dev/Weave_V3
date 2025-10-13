# src/hooks - 커스텀 훅

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~43: 파일 라인 맵
- 44~46: 중앙화·모듈화·캡슐화
- 47~50: 작업 규칙
- 51~55: 관련 문서

## 디렉토리 목적
UI와 서비스가 공유하는 상태 및 비즈니스 로직을 훅 형태로 제공합니다.
데이터 변환과 상호작용 패턴을 재사용 가능한 API로 캡슐화합니다.

## 핵심 책임
- 프로젝트 테이블 등 도메인별 상태 관리
- 서비스 데이터 가공과 오류 처리를 반환

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- use-color-palette.ts 06~55 export useColorPalette
- use-toast.ts 077~194 export reducer
- useAnimationPerformance.tsx 030~245 export useAnimationPerformance
- useAnimationPerformance.tsx 246~286 export AnimationPerformanceMonitor - 개발 모드용 성능 모니터 컴포넌트
- useIntegratedCalendar.ts 15~39 export UseIntegratedCalendarOptions - 훅 옵션
- useIntegratedCalendar.ts 40~88 export UseIntegratedCalendarReturn - 훅 반환 타입
- useIntegratedCalendar.ts 089~376 export useIntegratedCalendar - 통합 캘린더 데이터를 React 컴포넌트에서 사용하기 위한 훅 @param options 훅 옵션 @returns 통합 캘린더 데이터 및 관련 함수들 @example ```tsx const { items, filters, setFilters, isLoading } = useIntegratedCalendar({ initialFilters: { sources: ['calendar', 'todo'] }, autoRefresh: true, }); ```
- useKPIMetrics.tsx 022~197 export KPIMetric
- useKPIMetrics.tsx 198~255 export useKPIMetrics - useKPIMetrics Hook @returns 월간/연간 KPI 메트릭, 로딩 상태, 에러, 새로고침 함수
- useProjectSummary.ts 124~166 export useProjectSummary - useProjectSummary Hook @returns 프로젝트 목록, 로딩 상태, 에러, 새로고침 함수
- useRecentActivity.ts 064~107 export useRecentActivity - useRecentActivity Hook @returns 최근 활동 내역, 로딩 상태, 에러, 새로고침 함수
- useRevenueChart.ts 015~166 export RevenueData
- useRevenueChart.ts 167~220 export useRevenueChart - useRevenueChart Hook @returns 월별/분기별/연간 매출 데이터, 로딩 상태, 에러, 새로고침 함수
- useSettings.ts 045~177 export useSettings - Settings 관리 훅 @param userId - 사용자 ID
- useStorageSync.ts 036~110 export useStorageSync - Hook for real-time storage synchronization Automatically subscribes to storage changes and updates React state Works across multiple tabs/windows through localStorage events @param key - Storage key to subscribe to @param initialValue - Initial value to use before data is loaded @returns Current value, loading state, and error @example ```tsx function ProjectList() { const { data, isLoading, error } = useStorageSync<Project[]>('projects', []); if (isLoading) return <div>Loading...</div>; if (error) return <div>Error: {error.message}</div>; return <div>{data.map(p => <ProjectCard key={p.id} project={p} />)}</div>; } ```
- useStorageSync.ts 111~197 export useStorageSyncMulti - Hook for watching multiple storage keys @param keys - Array of storage keys to watch @returns Map of key to value @example ```tsx function Dashboard() { const { data, isLoading } = useStorageSyncMulti(['projects', 'tasks', 'events']); if (isLoading) return <div>Loading...</div>; const projects = data.get('projects') as Project[]; const tasks = data.get('tasks') as Task[]; const events = data.get('events') as CalendarEvent[]; return <DashboardView projects={projects} tasks={tasks} events={events} />; } ```
- useStorageSync.ts 198~263 export useStorageSyncEntity - Hook for syncing a single entity by ID @param serviceGetter - Function that returns the service instance @param id - Entity ID @param initialValue - Initial value before data loads @returns Entity data, loading state, and error @example ```tsx function ProjectDetail({ projectId }: { projectId: string }) { const { data: project, isLoading } = useStorageSyncEntity( () => projectService, projectId, null ); if (isLoading) return <div>Loading project...</div>; if (!project) return <div>Project not found</div>; return <ProjectInfo project={project} />; } ```
- useStorageSync.ts 264~335 export useStorageSyncOptimistic - Hook for optimistic updates with automatic rollback on error @param key - Storage key @param initialValue - Initial value @returns Current value and update function with optimistic updates @example ```tsx function TaskItem({ task }: { task: Task }) { const { data, update } = useStorageSyncOptimistic('tasks', []); const handleComplete = async () => { await update(async (tasks) => { // Optimistically update UI return tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t ); }); }; return <TaskCard task={task} onComplete={handleComplete} />; } ```
- useTaxScheduleData.tsx 18~74 export useTaxScheduleData - TaxSchedule 데이터 로딩 훅 Supabase 기반 실시간 동기화

## 중앙화·모듈화·캡슐화
- 훅에서 사용하는 텍스트와 상수는 config·lib 설정을 참조

## 작업 규칙
- 새 훅 추가 시 사용처와 문서를 동기화
- 반환 타입과 의존성을 명확히 정의하여 타입 안전성을 유지

## 관련 문서
- src/claude.md
- src/contexts/claude.md
- src/lib/claude.md
