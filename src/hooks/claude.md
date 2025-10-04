# hooks/ - 커스텀 React 훅 라이브러리

## 🪝 커스텀 훅 시스템 개요

이 디렉토리는 애플리케이션 전체에서 재사용 가능한 모든 커스텀 React 훅을 관리합니다. **로직 재사용**과 **상태 관리 최적화**가 핵심 목표입니다.

## 📁 훅 구조

```
hooks/
├── use-toast.ts            # 🍞 토스트 알림 관리 훅
├── useStorageSync.ts       # 🔄 실시간 스토리지 동기화 훅 (Phase 7.4)
├── use-color-palette.ts    # 🎨 컬러 팔레트 관리 훅
└── useIntegratedCalendar.ts # 📅 통합 캘린더 관리 훅
```

## 🍞 use-toast.ts - 토스트 알림 시스템

### 개요
전역 토스트 알림을 관리하는 커스텀 훅입니다. **shadcn/ui Toast 컴포넌트**와 완벽하게 통합되어 일관된 사용자 피드백을 제공합니다.

### 주요 기능
- **전역 상태 관리**: Context API 기반 전역 토스트 상태
- **다양한 변형**: 성공, 에러, 경고, 정보 알림 지원
- **자동 해제**: 설정 가능한 자동 해제 시간
- **접근성 준수**: 스크린 리더 및 키보드 접근성 완전 지원

### 구현 구조
```typescript
// 토스트 타입 정의
export interface Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
}

// 토스트 상태 관리
interface ToasterToast extends Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// 토스트 액션 타입
export interface ToastActionElement {
  altText: string
  action: React.ComponentPropsWithoutRef<typeof ToastAction>
}
```

### 기본 사용법
```typescript
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  // 기본 토스트
  const showBasicToast = () => {
    toast({
      title: "알림",
      description: "작업이 완료되었습니다.",
    })
  }

  // 성공 토스트
  const showSuccessToast = () => {
    toast({
      title: "성공!",
      description: "데이터가 성공적으로 저장되었습니다.",
    })
  }

  // 에러 토스트
  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "오류 발생",
      description: "요청을 처리하는 중 문제가 발생했습니다.",
    })
  }

  return (
    <div>
      <Button onClick={showBasicToast}>기본 알림</Button>
      <Button onClick={showSuccessToast}>성공 알림</Button>
      <Button onClick={showErrorToast}>에러 알림</Button>
    </div>
  )
}
```

### 고급 사용법
```typescript
// 액션 버튼이 있는 토스트
const showActionToast = () => {
  toast({
    title: "확인이 필요합니다",
    description: "이 작업을 계속하시겠습니까?",
    action: (
      <ToastAction altText="확인" onClick={handleConfirm}>
        확인
      </ToastAction>
    ),
  })
}

// 커스텀 지속 시간
const showLongToast = () => {
  toast({
    title: "중요한 알림",
    description: "이 메시지는 10초 동안 표시됩니다.",
    duration: 10000, // 10초
  })
}

// 수동 해제 토스트
const showPersistentToast = () => {
  toast({
    title: "지속적인 알림",
    description: "X 버튼을 클릭해야 사라집니다.",
    duration: Infinity,
  })
}
```

### 중앙화된 메시지 사용
```typescript
import { getNotificationText } from '@/config/brand'

// ✅ 올바른 사용법 - 중앙화된 텍스트
const showCentralizedToast = () => {
  toast({
    title: getNotificationText.title('ko'),
    description: getNotificationText.systemSuccess('ko'),
  })
}

// ❌ 하드코딩 금지
const showHardcodedToast = () => {
  toast({
    title: "알림",
    description: "중앙화된 컴포넌트 시스템이 성공적으로 작동 중입니다!",
  })
}
```

### 토스트 패턴 라이브러리
```typescript
// 자주 사용되는 토스트 패턴들
export const toastPatterns = {
  // 성공 패턴
  success: (message: string) => ({
    title: "성공!",
    description: message,
    variant: "default" as const,
  }),

  // 에러 패턴
  error: (message: string) => ({
    title: "오류 발생",
    description: message,
    variant: "destructive" as const,
  }),

  // 저장 완료
  saved: () => ({
    title: "저장 완료",
    description: "변경사항이 성공적으로 저장되었습니다.",
  }),

  // 삭제 확인
  deleteConfirm: (onConfirm: () => void) => ({
    title: "삭제 확인",
    description: "이 작업은 되돌릴 수 없습니다.",
    action: (
      <ToastAction altText="삭제" onClick={onConfirm}>
        삭제
      </ToastAction>
    ),
  }),
}

// 사용 예시
toast(toastPatterns.success("데이터가 업데이트되었습니다."))
toast(toastPatterns.error("네트워크 연결을 확인해주세요."))
```

## 🔄 useStorageSync - 실시간 스토리지 동기화 훅 (Phase 7.4)

### 개요
**Storage 시스템**과 React 상태를 실시간으로 동기화하는 훅 모음입니다. **멀티탭 동기화** 및 **낙관적 업데이트**를 지원합니다.

**📚 관련 문서**: [`src/lib/storage/claude.md`](../lib/storage/claude.md) - Storage 시스템 완전 가이드

### 주요 기능
- **실시간 동기화**: StorageManager 구독 시스템 기반 자동 동기화
- **타입 안전성**: 완전한 TypeScript 타입 지원
- **로딩/에러 상태**: React 패턴에 맞는 상태 관리
- **낙관적 업데이트**: 자동 롤백 지원
- **멀티탭 동기화**: localStorage 이벤트 기반 크로스탭 동기화

### 제공되는 훅

#### 1. useStorageSync - 단일 키 동기화
```typescript
import { useStorageSync } from '@/hooks/useStorageSync'

function ProjectList() {
  const { data, isLoading, error, refresh } = useStorageSync<Project[]>('projects', [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <Button onClick={refresh}>새로고침</Button>
    </div>
  )
}
```

#### 2. useStorageSyncMulti - 다중 키 동기화
```typescript
import { useStorageSyncMulti } from '@/hooks/useStorageSync'

function Dashboard() {
  const { data, isLoading, errors, refresh } = useStorageSyncMulti([
    'projects',
    'tasks',
    'events'
  ])

  if (isLoading) return <div>Loading...</div>

  const projects = data.get('projects') as Project[]
  const tasks = data.get('tasks') as Task[]
  const events = data.get('events') as CalendarEvent[]

  return (
    <DashboardView
      projects={projects}
      tasks={tasks}
      events={events}
    />
  )
}
```

#### 3. useStorageSyncEntity - 엔티티 ID 기반 동기화
```typescript
import { useStorageSyncEntity } from '@/hooks/useStorageSync'
import { projectService } from '@/lib/storage'

function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error, refresh } = useStorageSyncEntity(
    () => projectService,
    projectId,
    null
  )

  if (isLoading) return <div>Loading project...</div>
  if (!project) return <div>Project not found</div>

  return <ProjectInfo project={project} onRefresh={refresh} />
}
```

#### 4. useStorageSyncOptimistic - 낙관적 업데이트
```typescript
import { useStorageSyncOptimistic } from '@/hooks/useStorageSync'

function TaskList() {
  const { data: tasks, update, isLoading, error } = useStorageSyncOptimistic<Task[]>(
    'tasks',
    []
  )

  const handleToggleTask = async (taskId: string) => {
    try {
      await update(async (currentTasks) => {
        // UI는 즉시 업데이트됨 (낙관적 업데이트)
        return currentTasks.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      })
      // 성공 시 자동으로 storage에 저장
    } catch (error) {
      // 실패 시 자동 롤백
      console.error('Failed to update task:', error)
    }
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => handleToggleTask(task.id)}
        />
      ))}
    </div>
  )
}
```

### 반환 값

**useStorageSync & useStorageSyncOptimistic**:
```typescript
{
  data: T                    // 현재 데이터
  isLoading: boolean         // 로딩 상태
  error: Error | null        // 에러 상태
  refresh: () => Promise<void> // 수동 새로고침
  update?: (updater) => Promise<void> // 낙관적 업데이트 (Optimistic만)
}
```

**useStorageSyncMulti**:
```typescript
{
  data: Map<string, unknown>    // 키별 데이터 맵
  isLoading: boolean            // 로딩 상태
  errors: Map<string, Error>    // 키별 에러 맵
  refresh: () => Promise<void>  // 수동 새로고침
}
```

**useStorageSyncEntity**:
```typescript
{
  data: T | null             // 엔티티 데이터
  isLoading: boolean         // 로딩 상태
  error: Error | null        // 에러 상태
  refresh: () => Promise<void> // 수동 새로고침
}
```

### 사용 패턴

#### 프로젝트 상세 페이지
```typescript
function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: project } = useStorageSyncEntity(
    () => projectService,
    params.id,
    null
  )

  const { data: tasks } = useStorageSync<Task[]>('tasks', [])
  const projectTasks = tasks.filter(t => t.projectId === params.id)

  return <ProjectDetail project={project} tasks={projectTasks} />
}
```

#### 대시보드 위젯
```typescript
function DashboardWidgets() {
  const { data, isLoading } = useStorageSyncMulti([
    'projects',
    'tasks',
    'events',
    'settings'
  ])

  if (isLoading) return <DashboardSkeleton />

  return (
    <Dashboard
      projects={data.get('projects')}
      tasks={data.get('tasks')}
      events={data.get('events')}
      settings={data.get('settings')}
    />
  )
}
```

### 기술 세부사항

**구독 메커니즘**:
- StorageManager의 subscribe 메서드 사용
- StorageEvent 타입 기반 이벤트 처리
- 컴포넌트 언마운트 시 자동 구독 해제

**에러 처리**:
- try-catch로 모든 에러 캡처
- 에러 상태를 React state로 관리
- 사용자에게 명확한 에러 메시지 제공

**성능 최적화**:
- 불필요한 리렌더링 방지 (useCallback, useMemo)
- 병렬 데이터 로딩 (Promise.all)
- 자동 cleanup으로 메모리 누수 방지

## 🚀 새로운 훅 추가 가이드

### 1. 훅 파일 생성
```typescript
// src/hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // localStorage에서 초기값 읽기
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // localStorage에 값 저장
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
```

### 2. 타입 정의
```typescript
// 훅의 매개변수와 반환값에 완전한 타입 정의
export interface UseApiOptions {
  immediate?: boolean
  retry?: number
  timeout?: number
}

export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  // 구현...
}
```

### 3. 테스트 추가 (향후)
```typescript
// src/hooks/__tests__/use-local-storage.test.ts
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })
})
```

### 4. 문서 업데이트
```markdown
# hooks/claude.md에 새 훅 정보 추가

## 📦 설치된 훅 (1개)

- **use-toast**: 토스트 알림 관리 훅

*마지막 업데이트: 2025-09-19*


## 🔧 훅 개발 패턴

### 상태 관리 훅
```typescript
// useState를 확장한 훅 패턴
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}
```

### 사이드 이펙트 훅
```typescript
// useEffect를 활용한 훅 패턴
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}
```

### 이벤트 리스너 훅
```typescript
// 이벤트 리스너 관리 훅 패턴
export function useEventListener<T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element?: Element | Window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement = element ?? window
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[T])

    targetElement.addEventListener(eventName, eventListener)

    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
```

## 🚨 훅 개발 베스트 프랙티스

### 1. 의존성 최적화
```typescript
// ✅ 올바른 의존성 관리
const memoizedCallback = useCallback(() => {
  doSomething(value)
}, [value]) // value만 의존성에 포함

// ❌ 불필요한 의존성
const badCallback = useCallback(() => {
  doSomething(value)
}, [value, someObject]) // someObject가 매번 변경될 수 있음
```

### 2. 메모이제이션 활용
```typescript
// ✅ 연산 결과 메모이제이션
const expensiveValue = useMemo(() => {
  return expensiveCalculation(input)
}, [input])

// ✅ 객체 메모이제이션
const config = useMemo(() => ({
  api: apiUrl,
  timeout: timeoutValue
}), [apiUrl, timeoutValue])
```

### 3. 커스텀 훅 합성
```typescript
// 여러 훅을 조합한 고수준 훅
export function useFormWithValidation<T>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const { toast } = useToast()

  const validate = useCallback((fieldName?: keyof T) => {
    // 검증 로직...
  }, [validationRules])

  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void>) => {
    try {
      await onSubmit(values)
      toast(toastPatterns.success("저장되었습니다."))
    } catch (error) {
      toast(toastPatterns.error("저장에 실패했습니다."))
    }
  }, [values, toast])

  return {
    values,
    errors,
    touched,
    setValues,
    validate,
    handleSubmit
  }
}
```

## 🔄 자동 업데이트 감지

이 디렉토리의 변경사항이 다음 항목들을 자동 업데이트해야 합니다:

### 새 훅 추가 시
- **메인 CLAUDE.md**: 훅 개수 업데이트
- **이 문서**: 새 훅 상세 정보 추가
- **인덱스 파일**: export 문 추가 (필요시)
- **타입 정의**: 전역 타입 업데이트

### 기능 변경 시
- **관련 컴포넌트**: 훅 사용 패턴 업데이트
- **예제 코드**: 변경된 API 반영
- **테스트 코드**: 새로운 기능 테스트 추가

## 📊 품질 메트릭

### 훅 품질 지표
- **재사용률**: 80% 이상 (여러 컴포넌트에서 사용)
- **타입 안정성**: 100% (모든 매개변수와 반환값 타입 정의)
- **메모리 누수**: 0개 (적절한 cleanup 함수 구현)
- **테스트 커버리지**: 90% 이상 (향후 목표)

### 성능 지표
- **초기화 시간**: < 1ms
- **리렌더링 최적화**: 불필요한 리렌더링 0회
- **메모리 사용량**: < 1KB per hook instance

### 개발자 경험
- **타입 추론**: 100% (완전한 IntelliSense 지원)
- **에러 처리**: 모든 예외 상황 적절히 처리
- **문서화**: 모든 훅에 사용 예시 포함

---

**이 훅 라이브러리는 React 애플리케이션의 로직 재사용성과 상태 관리 효율성을 극대화합니다.**