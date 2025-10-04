# services/ - 도메인 서비스 시스템

## 📋 개요

이 디렉토리는 Storage 시스템의 **도메인별 비즈니스 로직**을 캡슐화한 서비스 레이어를 포함합니다. BaseService 패턴을 기반으로 7개의 전문화된 서비스가 구현되어 있습니다.

## 🎯 서비스 레이어의 역할

### 핵심 책임

- **비즈니스 로직**: 도메인 특화 규칙 및 검증
- **데이터 관계 관리**: 엔티티 간 연관 관계 처리
- **API 추상화**: StorageManager의 저수준 API를 고수준 도메인 API로 변환
- **타입 안전성**: 엔티티별 타입 가드 통합

### 아키텍처 위치

```
Application Components
         ↓
   Domain Services  ← 이 레이어
         ↓
   StorageManager
         ↓
   Storage Adapter
         ↓
   Data Persistence
```

## 📁 서비스 구조

```
services/
├── 📋 claude.md                # 🎯 이 파일 - 서비스 시스템 가이드
├── BaseService.ts              # 공통 CRUD 로직
├── ProjectService.ts           # 프로젝트 관리 (WBS, 결제, 문서)
├── TaskService.ts              # 할일 관리 (의존성, 하위작업)
├── CalendarService.ts          # 일정 관리 (반복 이벤트)
├── DocumentService.ts          # 문서 관리
├── ClientService.ts            # 클라이언트 관리
├── DashboardService.ts         # 대시보드 설정
└── SettingsService.ts          # 사용자 설정
```

## 🔧 BaseService - 공통 서비스 패턴

### 개요

모든 도메인 서비스의 기반이 되는 추상 클래스로, 공통 CRUD 로직을 제공합니다.

### 핵심 기능

```typescript
abstract class BaseService<T> {
  protected constructor(
    protected storage: StorageManager,
    protected storageKey: string,
    protected typeGuard: (value: unknown) => value is T
  )

  /**
   * 모든 엔티티 조회
   * @returns 엔티티 배열 또는 빈 배열
   */
  async getAll(): Promise<T[]>

  /**
   * ID로 단일 엔티티 조회
   * @param id - 엔티티 ID
   * @returns 엔티티 또는 null
   */
  async getById(id: string): Promise<T | null>

  /**
   * 새 엔티티 생성
   * @param data - 엔티티 데이터
   * @returns 생성된 엔티티
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>

  /**
   * 엔티티 업데이트
   * @param id - 엔티티 ID
   * @param data - 업데이트할 필드
   * @returns 업데이트된 엔티티
   */
  async update(id: string, data: Partial<T>): Promise<T>

  /**
   * 엔티티 삭제
   * @param id - 엔티티 ID
   */
  async delete(id: string): Promise<void>

  /**
   * 다중 엔티티 조회 (배치)
   * @param ids - 엔티티 ID 배열
   * @returns 엔티티 맵
   */
  async getBatch(ids: string[]): Promise<Map<string, T>>
}
```

### 타입 가드 통합

```typescript
// BaseService는 생성 시 타입 가드를 받아 런타임 검증 수행
protected async validateData(data: unknown): Promise<T[]> {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid data: expected array`)
  }

  if (!data.every(this.typeGuard)) {
    throw new Error(`Invalid data: type guard failed`)
  }

  return data
}
```

## 📊 도메인 서비스 상세

### 1. ProjectService - 프로젝트 관리

**핵심 프로젝트 서비스** - WBS 시스템, 결제 관리, 문서 통합

```typescript
class ProjectService extends BaseService<Project> {
  /**
   * WBS 작업 추가
   * @param projectId - 프로젝트 ID
   * @param taskData - WBS 작업 데이터
   */
  async addWBSTask(projectId: string, taskData: Omit<WBSTask, 'id'>): Promise<Project>

  /**
   * WBS 작업 업데이트
   * @param projectId - 프로젝트 ID
   * @param taskId - WBS 작업 ID
   * @param updates - 업데이트 데이터
   */
  async updateWBSTask(projectId: string, taskId: string, updates: Partial<WBSTask>): Promise<Project>

  /**
   * WBS 작업 삭제
   * @param projectId - 프로젝트 ID
   * @param taskId - WBS 작업 ID
   */
  async deleteWBSTask(projectId: string, taskId: string): Promise<Project>

  /**
   * 프로젝트 진행률 계산 (WBS 기반)
   * @param projectId - 프로젝트 ID
   * @returns 진행률 (0-100)
   */
  async calculateProgress(projectId: string): Promise<number>

  /**
   * 결제 상태 업데이트
   * @param projectId - 프로젝트 ID
   * @param paymentStatus - 새 결제 상태
   */
  async updatePaymentStatus(projectId: string, paymentStatus: PaymentStatus): Promise<Project>

  /**
   * 문서 현황 업데이트
   * @param projectId - 프로젝트 ID
   * @param documentStatus - 문서 현황 데이터
   */
  async updateDocumentStatus(projectId: string, documentStatus: ProjectDocumentStatus): Promise<Project>

  /**
   * 클라이언트별 프로젝트 조회
   * @param clientId - 클라이언트 ID
   */
  async getByClientId(clientId: string): Promise<Project[]>

  /**
   * 상태별 프로젝트 조회
   * @param status - 프로젝트 상태
   */
  async getByStatus(status: Project['status']): Promise<Project[]>
}
```

**주요 특징**:
- WBS 시스템 완전 통합
- 진행률 자동 계산
- 결제 상태 추적
- 문서 현황 관리

### 2. TaskService - 할일 관리

**할일 서비스** - 프로젝트 연결, 의존성 관리, 하위작업

```typescript
class TaskService extends BaseService<Task> {
  /**
   * 프로젝트별 작업 조회
   * @param projectId - 프로젝트 ID
   */
  async getByProjectId(projectId: string): Promise<Task[]>

  /**
   * 하위 작업 추가
   * @param parentTaskId - 부모 작업 ID
   * @param taskData - 하위 작업 데이터
   */
  async addSubtask(parentTaskId: string, taskData: Omit<Task, 'id'>): Promise<Task>

  /**
   * 의존성 추가
   * @param taskId - 작업 ID
   * @param dependencyId - 의존 작업 ID
   */
  async addDependency(taskId: string, dependencyId: string): Promise<Task>

  /**
   * 의존성 제거
   * @param taskId - 작업 ID
   * @param dependencyId - 의존 작업 ID
   */
  async removeDependency(taskId: string, dependencyId: string): Promise<Task>

  /**
   * 작업 완료 처리
   * @param taskId - 작업 ID
   */
  async completeTask(taskId: string): Promise<Task>

  /**
   * 우선순위별 작업 조회
   * @param priority - 우선순위
   */
  async getByPriority(priority: Task['priority']): Promise<Task[]>

  /**
   * 마감일 임박 작업 조회
   * @param days - 마감일까지 남은 일수
   */
  async getUpcomingTasks(days: number): Promise<Task[]>
}
```

**주요 특징**:
- 프로젝트 연동
- 의존성 그래프 관리
- 하위작업 계층 구조
- 마감일 추적

### 3. CalendarService - 일정 관리

**캘린더 서비스** - 반복 이벤트, 프로젝트/클라이언트 연결

```typescript
class CalendarService extends BaseService<CalendarEvent> {
  /**
   * 날짜 범위 내 이벤트 조회
   * @param startDate - 시작 날짜
   * @param endDate - 종료 날짜
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>

  /**
   * 프로젝트별 이벤트 조회
   * @param projectId - 프로젝트 ID
   */
  async getByProjectId(projectId: string): Promise<CalendarEvent[]>

  /**
   * 클라이언트별 이벤트 조회
   * @param clientId - 클라이언트 ID
   */
  async getByClientId(clientId: string): Promise<CalendarEvent[]>

  /**
   * 반복 이벤트 생성
   * @param eventData - 이벤트 데이터 (recurring 필드 포함)
   */
  async createRecurringEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>

  /**
   * 타입별 이벤트 조회
   * @param type - 이벤트 타입
   */
  async getByType(type: CalendarEvent['type']): Promise<CalendarEvent[]>

  /**
   * 카테고리별 이벤트 조회
   * @param category - 이벤트 카테고리
   */
  async getByCategory(category: CalendarEvent['category']): Promise<CalendarEvent[]>
}
```

**주요 특징**:
- 날짜 범위 쿼리
- 반복 이벤트 지원
- 프로젝트/클라이언트 연동
- 다중 필터링

### 4. DocumentService - 문서 관리

**문서 서비스** - 프로젝트별 문서, 버전 관리

```typescript
class DocumentService extends BaseService<Document> {
  /**
   * 프로젝트별 문서 조회
   * @param projectId - 프로젝트 ID
   */
  async getByProjectId(projectId: string): Promise<Document[]>

  /**
   * 타입별 문서 조회
   * @param type - 문서 타입
   */
  async getByType(type: Document['type']): Promise<Document[]>

  /**
   * 문서 버전 업데이트
   * @param documentId - 문서 ID
   * @param version - 새 버전
   */
  async updateVersion(documentId: string, version: string): Promise<Document>

  /**
   * 문서 크기 업데이트
   * @param documentId - 문서 ID
   * @param size - 파일 크기 (bytes)
   */
  async updateSize(documentId: string, size: number): Promise<Document>

  /**
   * 최근 문서 조회
   * @param limit - 조회할 문서 수
   */
  async getRecentDocuments(limit: number): Promise<Document[]>
}
```

**주요 특징**:
- 프로젝트별 문서 관리
- 버전 추적
- 타입별 분류
- 최근 문서 조회

### 5. ClientService - 클라이언트 관리

**클라이언트 서비스** - 연락처 정보, 평점 관리

```typescript
class ClientService extends BaseService<Client> {
  /**
   * 이메일로 클라이언트 조회
   * @param email - 이메일 주소
   */
  async getByEmail(email: string): Promise<Client | null>

  /**
   * 전화번호로 클라이언트 조회
   * @param phone - 전화번호
   */
  async getByPhone(phone: string): Promise<Client | null>

  /**
   * 평점 업데이트
   * @param clientId - 클라이언트 ID
   * @param rating - 평점 (0-5)
   */
  async updateRating(clientId: string, rating: number): Promise<Client>

  /**
   * 연락처 정보 업데이트
   * @param clientId - 클라이언트 ID
   * @param contactInfo - 연락처 정보
   */
  async updateContactInfo(clientId: string, contactInfo: Partial<Client>): Promise<Client>

  /**
   * 평점별 클라이언트 조회
   * @param minRating - 최소 평점
   */
  async getByMinRating(minRating: number): Promise<Client[]>
}
```

**주요 특징**:
- 이메일/전화번호 검색
- 평점 시스템
- 연락처 관리
- 필터링 기능

### 6. DashboardService - 대시보드 설정

**대시보드 서비스** - 레이아웃 및 위젯 설정

```typescript
class DashboardService extends BaseService<DashboardLayout> {
  /**
   * 사용자 대시보드 레이아웃 조회
   * @param userId - 사용자 ID
   */
  async getByUserId(userId: string): Promise<DashboardLayout | null>

  /**
   * 위젯 추가
   * @param layoutId - 레이아웃 ID
   * @param widget - 위젯 데이터
   */
  async addWidget(layoutId: string, widget: Widget): Promise<DashboardLayout>

  /**
   * 위젯 제거
   * @param layoutId - 레이아웃 ID
   * @param widgetId - 위젯 ID
   */
  async removeWidget(layoutId: string, widgetId: string): Promise<DashboardLayout>

  /**
   * 위젯 순서 변경
   * @param layoutId - 레이아웃 ID
   * @param widgetOrder - 새로운 위젯 순서
   */
  async reorderWidgets(layoutId: string, widgetOrder: string[]): Promise<DashboardLayout>

  /**
   * 레이아웃 초기화
   * @param layoutId - 레이아웃 ID
   */
  async resetLayout(layoutId: string): Promise<DashboardLayout>
}
```

**주요 특징**:
- 사용자별 레이아웃
- 위젯 관리
- 순서 변경
- 레이아웃 초기화

### 7. SettingsService - 사용자 설정

**설정 서비스** - 사용자 환경설정, 테마, 알림

```typescript
class SettingsService extends BaseService<Settings> {
  /**
   * 사용자 설정 조회
   * @param userId - 사용자 ID
   */
  async getByUserId(userId: string): Promise<Settings | null>

  /**
   * 테마 설정 업데이트
   * @param settingsId - 설정 ID
   * @param theme - 테마 (light | dark | auto)
   */
  async updateTheme(settingsId: string, theme: string): Promise<Settings>

  /**
   * 언어 설정 업데이트
   * @param settingsId - 설정 ID
   * @param language - 언어 코드
   */
  async updateLanguage(settingsId: string, language: string): Promise<Settings>

  /**
   * 알림 설정 업데이트
   * @param settingsId - 설정 ID
   * @param notifications - 알림 설정 객체
   */
  async updateNotifications(settingsId: string, notifications: NotificationSettings): Promise<Settings>

  /**
   * 개인정보 설정 업데이트
   * @param settingsId - 설정 ID
   * @param privacy - 개인정보 설정 객체
   */
  async updatePrivacy(settingsId: string, privacy: PrivacySettings): Promise<Settings>

  /**
   * 설정 초기화
   * @param settingsId - 설정 ID
   */
  async resetToDefaults(settingsId: string): Promise<Settings>
}
```

**주요 특징**:
- 사용자별 설정
- 테마/언어 관리
- 알림 설정
- 개인정보 설정
- 기본값 복원

## 🔄 사용 패턴

### 기본 사용법

```typescript
import { projectService, taskService } from '@/lib/storage'

// 프로젝트 생성
const newProject = await projectService.create({
  userId: 'user-123',
  name: '새 프로젝트',
  status: 'planning',
  wbsTasks: [],
  registrationDate: new Date().toISOString(),
  modifiedDate: new Date().toISOString()
})

// WBS 작업 추가
await projectService.addWBSTask(newProject.id, {
  name: '요구사항 분석',
  status: 'pending',
  order: 1,
  createdAt: new Date().toISOString()
})

// 프로젝트별 작업 조회
const tasks = await taskService.getByProjectId(newProject.id)
```

### 관계형 데이터 처리

```typescript
// 프로젝트 삭제 시 관련 데이터 정리
async function deleteProjectWithRelations(projectId: string) {
  await storageManager.transaction(async (tx) => {
    // 1. 프로젝트 삭제
    await projectService.delete(projectId)

    // 2. 관련 작업 삭제
    const tasks = await taskService.getByProjectId(projectId)
    for (const task of tasks) {
      await taskService.delete(task.id)
    }

    // 3. 관련 이벤트 삭제
    const events = await calendarService.getByProjectId(projectId)
    for (const event of events) {
      await calendarService.delete(event.id)
    }

    // 4. 관련 문서 삭제
    const documents = await documentService.getByProjectId(projectId)
    for (const document of documents) {
      await documentService.delete(document.id)
    }
  })
}
```

### 배치 작업 패턴

```typescript
// 여러 프로젝트 한 번에 조회
const projectIds = ['id1', 'id2', 'id3']
const projectsMap = await projectService.getBatch(projectIds)

// Map을 배열로 변환
const projects = Array.from(projectsMap.values())

// 필터링 및 정렬
const activeProjects = projects
  .filter(p => p.status === 'in_progress')
  .sort((a, b) => a.name.localeCompare(b.name))
```

### React 컴포넌트에서 사용

```typescript
import { projectService } from '@/lib/storage'
import { useEffect, useState } from 'react'

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAll()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleStatusChange = async (id: string, status: Project['status']) => {
    try {
      const updated = await projectService.update(id, { status })
      setProjects(prev => prev.map(p => p.id === id ? updated : p))
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  if (loading) return <div>로딩 중...</div>

  return (
    <div>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}
```

## 🚨 주의사항

### 1. 서비스를 통한 데이터 접근

```typescript
// ✅ 서비스 사용 (권장)
const projects = await projectService.getAll()
await projectService.update(id, { status: 'completed' })

// ❌ StorageManager 직접 사용 (비권장)
const projects = await storageManager.get<Project[]>('projects')
// 타입 검증, 비즈니스 로직, 관계 관리 누락
```

### 2. 트랜잭션에서 서비스 사용

```typescript
// ✅ 트랜잭션 내부에서 서비스 사용 가능
await storageManager.transaction(async (tx) => {
  await projectService.delete(projectId)
  await taskService.delete(taskId)
})

// ❌ 서비스 메서드 내부에서 중첩 트랜잭션
// BaseService는 이미 트랜잭션을 사용하므로 중첩 금지
```

### 3. 데이터 검증

```typescript
// ✅ 서비스 메서드는 자동으로 타입 검증 수행
const project = await projectService.getById(id)
// project는 Project 타입으로 보장됨

// ✅ 생성 시 추가 검증
async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  // 비즈니스 규칙 검증
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    throw new Error('시작일은 종료일보다 앞서야 합니다')
  }

  // BaseService.create 호출
  return super.create(data)
}
```

### 4. 에러 처리

```typescript
// ✅ 서비스 레벨에서 적절한 에러 처리
try {
  await projectService.update(id, { status: 'completed' })
} catch (error) {
  if (error instanceof StorageError) {
    // Storage 레벨 에러
    console.error('Storage error:', error.code, error.message)
  } else {
    // 비즈니스 로직 에러
    console.error('Business logic error:', error)
  }
}
```

## 📊 서비스별 주요 메서드 요약

| 서비스 | 핵심 기능 | 주요 메서드 수 | 특수 기능 |
|--------|----------|--------------|----------|
| **ProjectService** | WBS, 결제, 문서 | 15+ | WBS 관리, 진행률 계산 |
| **TaskService** | 할일, 의존성 | 12+ | 의존성 그래프, 하위작업 |
| **CalendarService** | 일정, 반복 이벤트 | 10+ | 날짜 범위 쿼리 |
| **DocumentService** | 문서, 버전 관리 | 8+ | 버전 추적 |
| **ClientService** | 클라이언트 정보 | 9+ | 평점 시스템 |
| **DashboardService** | 레이아웃, 위젯 | 7+ | 위젯 관리 |
| **SettingsService** | 사용자 설정 | 10+ | 설정 초기화 |

## 🔗 관련 문서

- **Core**: [`../core/claude.md`](../core/claude.md) - StorageManager
- **Types**: [`../types/claude.md`](../types/claude.md) - 엔티티 타입 정의
- **Adapters**: [`../adapters/claude.md`](../adapters/claude.md) - Storage Adapter
- **Schema**: [`../../../docs/LOCAL-STORAGE-SCHEMA.md`](../../../docs/LOCAL-STORAGE-SCHEMA.md)

---

**서비스 레이어는 도메인 로직을 캡슐화하고, 타입 안전한 고수준 API를 제공하여 애플리케이션 개발을 단순화합니다.**

*마지막 업데이트: 2025-10-05*
