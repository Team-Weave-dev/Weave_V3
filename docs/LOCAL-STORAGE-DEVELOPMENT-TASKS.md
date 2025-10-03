# 로컬스토리지 → Supabase 마이그레이션 개발 Task 문서

## 📋 개요

이 문서는 로컬스토리지 전역 관리 시스템 구축과 Supabase 마이그레이션을 위한 상세 개발 태스크를 정의합니다.
각 태스크는 독립적으로 개발 가능하도록 설계되어 있으며, 앞뒤 컨텍스트 없이도 안정적인 모듈화 개발이 가능합니다.

## ✅ 진행 상황 요약

### Phase별 진행 현황
- [ ] **Phase 0**: 기반 구축 및 환경 설정 (3개 태스크)
- [ ] **Phase 1**: Core Storage Manager 구현 (5개 태스크)
- [ ] **Phase 2**: LocalStorage Adapter 구현 (4개 태스크)
- [ ] **Phase 3**: 데이터 스키마 구현 (7개 태스크)
- [ ] **Phase 4**: 도메인 서비스 구현 (7개 태스크)
- [ ] **Phase 5**: 마이그레이션 시스템 (3개 태스크)
- [ ] **Phase 6**: 기존 코드 통합 (5개 태스크)
- [ ] **Phase 7**: 관계 데이터 및 동기화 (4개 태스크)
- [ ] **Phase 8**: 성능 최적화 (4개 태스크)
- [ ] **Phase 9**: 테스트 및 검증 (4개 태스크)
- [ ] **Phase 10**: Supabase 준비 (4개 태스크)

**전체 진행률**: 0/50 태스크 완료 (0%)

## 🎯 개발 원칙

1. **독립성**: 각 태스크는 독립적으로 개발 및 테스트 가능
2. **원자성**: 각 태스크는 하나의 명확한 목표를 가짐
3. **검증가능성**: 모든 태스크는 명확한 완료 기준을 가짐
4. **문서화**: 각 태스크는 입력/출력 스펙을 명시

---

## [ ] Phase 0: 기반 구축 및 환경 설정

### [ ] 0.1 프로젝트 구조 생성
**목표**: Storage 시스템을 위한 디렉토리 구조 생성
- **입력**: 없음
- **출력**: `src/lib/storage/` 디렉토리 구조
- **작업**:
  ```
  src/lib/storage/
  ├── core/           # 핵심 클래스
  ├── adapters/       # 어댑터 구현체
  ├── types/          # TypeScript 타입 정의
  ├── services/       # 도메인 서비스
  ├── migrations/     # 마이그레이션 스크립트
  └── utils/          # 유틸리티 함수
  ```
- **완료 기준**: 디렉토리 구조 생성 완료

### [ ] 0.2 TypeScript 타입 정의 - 기본 인터페이스
**목표**: Storage 시스템의 기본 인터페이스 정의
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/base.ts`
- **작업**:
  ```typescript
  // StorageAdapter 인터페이스
  // StorageManager 타입
  // StorageEvent 타입
  // TransactionFunction 타입
  ```
- **완료 기준**: TypeScript 컴파일 성공

### [ ] 0.3 설정 파일 생성
**목표**: Storage 시스템 설정 관리
- **입력**: 없음
- **출력**: `src/lib/storage/config.ts`
- **작업**:
  ```typescript
  export const STORAGE_CONFIG = {
    version: 2,
    prefix: 'weave_v2_',
    enableCache: true,
    enableCompression: false
  }
  ```
- **완료 기준**: 설정 파일 import 가능

---

## [ ] Phase 1: Core Storage Manager 구현

### [ ] 1.1 StorageManager 기본 클래스
**목표**: StorageManager 클래스의 뼈대 구현
- **입력**: `types/base.ts`
- **출력**: `src/lib/storage/core/StorageManager.ts`
- **작업**:
  ```typescript
  class StorageManager {
    constructor(adapter: StorageAdapter)
    // 메서드 시그니처만 정의
  }
  ```
- **완료 기준**: 클래스 인스턴스 생성 가능

### [ ] 1.2 기본 CRUD 메서드 구현
**목표**: get, set, remove, clear 메서드 구현
- **입력**: StorageManager 클래스
- **출력**: CRUD 메서드 구현
- **작업**:
  ```typescript
  async get<T>(key: string): Promise<T | null>
  async set<T>(key: string, value: T): Promise<void>
  async remove(key: string): Promise<void>
  async clear(): Promise<void>
  ```
- **테스트**:
  ```typescript
  // 각 메서드별 단위 테스트
  // 타입 안정성 테스트
  ```
- **완료 기준**: 모든 CRUD 테스트 통과

### [ ] 1.3 구독 시스템 구현
**목표**: 이벤트 기반 구독/알림 시스템
- **입력**: StorageManager 클래스
- **출력**: 구독 시스템 구현
- **작업**:
  ```typescript
  subscribe(key: string, callback: Subscriber): () => void
  notify(key: string, value: any): void
  ```
- **테스트**:
  ```typescript
  // 구독/구독해제 테스트
  // 알림 전달 테스트
  ```
- **완료 기준**: 구독 시스템 테스트 통과

### [ ] 1.4 배치 작업 메서드
**목표**: 다중 작업 효율화
- **입력**: StorageManager 클래스
- **출력**: 배치 메서드 구현
- **작업**:
  ```typescript
  async getBatch<T>(keys: string[]): Promise<Map<string, T>>
  async setBatch(items: Map<string, any>): Promise<void>
  ```
- **완료 기준**: 배치 작업 테스트 통과

### [ ] 1.5 트랜잭션 지원
**목표**: 원자성 보장 트랜잭션
- **입력**: StorageManager 클래스
- **출력**: 트랜잭션 메서드 구현
- **작업**:
  ```typescript
  async transaction(fn: TransactionFn): Promise<void>
  // 롤백 메커니즘
  ```
- **완료 기준**: 트랜잭션 롤백 테스트 통과

---

## [ ] Phase 2: LocalStorage Adapter 구현

### [ ] 2.1 LocalStorageAdapter 기본 구조
**목표**: LocalStorage 어댑터 클래스 생성
- **입력**: StorageAdapter 인터페이스
- **출력**: `src/lib/storage/adapters/LocalStorageAdapter.ts`
- **작업**:
  ```typescript
  class LocalStorageAdapter implements StorageAdapter {
    private prefix: string
    constructor(config?: LocalStorageConfig)
  }
  ```
- **완료 기준**: 어댑터 인스턴스 생성 가능

### [ ] 2.2 LocalStorage CRUD 구현
**목표**: localStorage API 래핑
- **입력**: LocalStorageAdapter 클래스
- **출력**: CRUD 메서드 구현
- **작업**:
  ```typescript
  // JSON 직렬화/역직렬화
  // 키 프리픽스 처리
  // 에러 처리
  ```
- **테스트**:
  ```typescript
  // localStorage 모킹 테스트
  // 직렬화 테스트
  ```
- **완료 기준**: localStorage 작업 테스트 통과

### [ ] 2.3 LocalStorage 키 관리
**목표**: 키 목록 조회 및 관리
- **입력**: LocalStorageAdapter
- **출력**: 키 관리 메서드
- **작업**:
  ```typescript
  async keys(): Promise<string[]>
  async hasKey(key: string): Promise<boolean>
  ```
- **완료 기준**: 키 관리 테스트 통과

### [ ] 2.4 용량 관리 및 압축
**목표**: LocalStorage 5MB 제한 대응
- **입력**: LocalStorageAdapter
- **출력**: 압축 유틸리티
- **작업**:
  ```typescript
  // LZ-String 통합
  // 용량 체크
  // 자동 압축 옵션
  ```
- **완료 기준**: 대용량 데이터 저장 테스트 통과

---

## [ ] Phase 3: 데이터 스키마 구현

### [ ] 3.1 User 엔티티 타입
**목표**: User 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/user.ts`
- **작업**:
  ```typescript
  interface User { ... }
  function isUser(data: unknown): data is User
  const userSchema: JSONSchema
  ```
- **완료 기준**: User 타입 검증 테스트 통과

### [ ] 3.2 Project 엔티티 타입
**목표**: Project 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/project.ts`
- **작업**:
  ```typescript
  interface Project { ... }
  interface WBSTask { ... }
  type SettlementMethod = ...
  type PaymentStatus = ...
  interface ProjectDocumentStatus { ... }
  interface EstimateInfo { ... }
  interface ContractInfo { ... }
  interface BillingInfo { ... }
  function isProject(data: unknown): data is Project
  const projectSchema: JSONSchema
  ```
- **주요 필드**:
  - WBS 시스템: wbsTasks (작업 목록)
  - 결제 시스템: settlementMethod, paymentStatus, totalAmount
  - 문서 시스템: documentStatus, documents
  - 견적/계약/청구: estimate, contract, billing
  - 프로젝트 내용: projectContent
- **완료 기준**: Project 타입 검증 테스트 통과

### [ ] 3.3 Client 엔티티 타입
**목표**: Client 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/client.ts`
- **작업**: Client 인터페이스 및 검증 함수
- **완료 기준**: Client 타입 검증 테스트 통과

### [ ] 3.4 Task 엔티티 타입
**목표**: Task 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/task.ts`
- **작업**: Task 인터페이스 및 검증 함수
- **완료 기준**: Task 타입 검증 테스트 통과

### [ ] 3.5 CalendarEvent 엔티티 타입
**목표**: CalendarEvent 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/event.ts`
- **작업**: CalendarEvent 인터페이스 및 검증 함수
- **완료 기준**: CalendarEvent 타입 검증 테스트 통과

### [ ] 3.6 Document 엔티티 타입
**목표**: Document 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/document.ts`
- **작업**: Document 인터페이스 및 검증 함수
- **완료 기준**: Document 타입 검증 테스트 통과

### [ ] 3.7 Settings 엔티티 타입
**목표**: Settings 타입 정의 및 검증
- **입력**: LOCAL-STORAGE-SCHEMA.md
- **출력**: `src/lib/storage/types/entities/settings.ts`
- **작업**: Settings 인터페이스 및 검증 함수
- **완료 기준**: Settings 타입 검증 테스트 통과

---

## [ ] Phase 4: 도메인 서비스 구현

### [ ] 4.1 BaseService 추상 클래스
**목표**: 서비스 공통 기능 추상화
- **입력**: StorageManager
- **출력**: `src/lib/storage/services/BaseService.ts`
- **작업**:
  ```typescript
  abstract class BaseService<T> {
    constructor(protected storage: StorageManager)
    protected abstract entityKey: string
    // 공통 CRUD 메서드
  }
  ```
- **완료 기준**: 추상 클래스 상속 테스트

### [ ] 4.2 ProjectService 구현
**목표**: Project 도메인 서비스
- **입력**: BaseService, Project 타입
- **출력**: `src/lib/storage/services/ProjectService.ts`
- **작업**:
  ```typescript
  class ProjectService extends BaseService<Project> {
    // 기본 조회
    async getProjectsByStatus(status: string)
    async getProjectsByClient(clientId: string)
    async getProjectWithRelations(id: string)

    // WBS 관리
    async addWBSTask(projectId: string, task: WBSTask)
    async updateWBSTask(projectId: string, taskId: string, updates: Partial<WBSTask>)
    async removeWBSTask(projectId: string, taskId: string)
    async reorderWBSTasks(projectId: string, taskIds: string[])
    async calculateProgress(projectId: string): number  // WBS 기반 자동 계산

    // 결제 관리
    async updatePaymentStatus(projectId: string, status: PaymentStatus)
    async updateSettlementMethod(projectId: string, method: SettlementMethod)

    // 문서 관리
    async updateDocumentStatus(projectId: string, status: ProjectDocumentStatus)
    async addDocument(projectId: string, document: DocumentInfo)
    async removeDocument(projectId: string, documentId: string)
  }
  ```
- **테스트**: 프로젝트 CRUD, WBS 관리, 결제/문서 관리 테스트
- **완료 기준**: 모든 ProjectService 테스트 통과

### [ ] 4.3 TaskService 구현
**목표**: Task 도메인 서비스
- **입력**: BaseService, Task 타입
- **출력**: `src/lib/storage/services/TaskService.ts`
- **작업**:
  ```typescript
  class TaskService extends BaseService<Task> {
    async getTasksByProject(projectId: string)
    async getOverdueTasks()
    async createRecurringTask(task: Task)
  }
  ```
- **완료 기준**: TaskService 테스트 통과

### [ ] 4.4 CalendarService 구현
**목표**: Calendar 도메인 서비스
- **입력**: BaseService, CalendarEvent 타입
- **출력**: `src/lib/storage/services/CalendarService.ts`
- **작업**:
  ```typescript
  class CalendarService extends BaseService<CalendarEvent> {
    async getEventsByDateRange(start: Date, end: Date)
    async getEventsByProject(projectId: string)
  }
  ```
- **완료 기준**: CalendarService 테스트 통과

### [ ] 4.5 DocumentService 구현
**목표**: Document 도메인 서비스
- **입력**: BaseService, Document 타입
- **출력**: `src/lib/storage/services/DocumentService.ts`
- **작업**: 문서 CRUD 및 프로젝트별 조회
- **완료 기준**: DocumentService 테스트 통과

### [ ] 4.6 ClientService 구현
**목표**: Client 도메인 서비스
- **입력**: BaseService, Client 타입
- **출력**: `src/lib/storage/services/ClientService.ts`
- **작업**: 클라이언트 CRUD 및 검색
- **완료 기준**: ClientService 테스트 통과

### [ ] 4.7 SettingsService 구현
**목표**: Settings 도메인 서비스
- **입력**: BaseService, Settings 타입
- **출력**: `src/lib/storage/services/SettingsService.ts`
- **작업**: 설정 저장 및 조회
- **완료 기준**: SettingsService 테스트 통과

---

## [ ] Phase 5: 마이그레이션 시스템

### [ ] 5.1 마이그레이션 매니저
**목표**: 버전 관리 및 마이그레이션 실행
- **입력**: StorageManager
- **출력**: `src/lib/storage/migrations/MigrationManager.ts`
- **작업**:
  ```typescript
  class MigrationManager {
    async getCurrentVersion(): Promise<number>
    async migrate(targetVersion: number): Promise<void>
    async rollback(version: number): Promise<void>
  }
  ```
- **완료 기준**: 마이그레이션 실행 테스트 통과

### [ ] 5.2 V1 → V2 마이그레이션
**목표**: 기존 데이터를 새 구조로 마이그레이션
- **입력**: 기존 localStorage 키 목록
- **출력**: `src/lib/storage/migrations/v1-to-v2.ts`
- **작업**:
  ```typescript
  // 키 매핑 테이블
  const keyMapping = {
    'weave_custom_projects': 'projects',
    'weave-dashboard-layout': 'settings.dashboard'
  }
  ```
- **테스트**: 샘플 데이터 마이그레이션 테스트
- **완료 기준**: 데이터 무손실 마이그레이션

### [ ] 5.3 백업 시스템
**목표**: 마이그레이션 전 데이터 백업
- **입력**: 현재 localStorage 데이터
- **출력**: `src/lib/storage/utils/BackupManager.ts`
- **작업**:
  ```typescript
  class BackupManager {
    async createBackup(): Promise<BackupData>
    async restoreBackup(backup: BackupData): Promise<void>
    async exportToFile(): Promise<Blob>
  }
  ```
- **완료 기준**: 백업 및 복구 테스트 통과

---

## [ ] Phase 6: 기존 코드 통합

### [ ] 6.1 대시보드 위젯 스토어 마이그레이션
**목표**: useImprovedDashboardStore 통합
- **입력**: `useImprovedDashboardStore.ts`
- **출력**: Storage API 사용 버전
- **작업**:
  ```typescript
  // 기존 zustand 스토어를 Storage API로 변경
  // 구독 시스템 통합
  ```
- **테스트**: 대시보드 기능 동작 확인
- **완료 기준**: 기존 기능 100% 동작

### [ ] 6.2 프로젝트 데이터 마이그레이션
**목표**: projects.ts 통합
- **입력**: `lib/mock/projects.ts`
- **출력**: ProjectService 사용 버전
- **작업**:
  ```typescript
  // getStoredProjects → projectService.getAll()
  // saveProjects → projectService.saveAll()
  ```
- **완료 기준**: 프로젝트 CRUD 동작

### [ ] 6.3 할일 목록 마이그레이션
**목표**: useLocalStorage 훅 통합
- **입력**: `useLocalStorage.ts`
- **출력**: TaskService 사용 버전
- **작업**: 할일 컴포넌트 Storage API 통합
- **완료 기준**: 할일 기능 동작

### [ ] 6.4 캘린더 데이터 마이그레이션
**목표**: LocalStorageDataSource 통합
- **입력**: `LocalStorageDataSource.ts`
- **출력**: CalendarService 사용 버전
- **작업**: 캘린더 이벤트 Storage API 통합
- **완료 기준**: 캘린더 기능 동작

### [ ] 6.5 문서 관리 통합
**목표**: 문서 시스템 Storage API 통합
- **입력**: 문서 관련 코드
- **출력**: DocumentService 사용 버전
- **작업**: 문서 CRUD Storage API 통합
- **완료 기준**: 문서 관리 기능 동작

---

## [ ] Phase 7: 관계 데이터 및 동기화

### [ ] 7.1 프로젝트-할일 연결
**목표**: 프로젝트와 할일 간 관계 구현
- **입력**: ProjectService, TaskService
- **출력**: 관계 메서드 구현
- **작업**:
  ```typescript
  // 프로젝트 삭제 시 관련 할일 처리
  // 프로젝트별 할일 집계
  ```
- **완료 기준**: 관계 무결성 테스트 통과

### [ ] 7.2 프로젝트-캘린더 연결
**목표**: 프로젝트와 일정 간 관계 구현
- **입력**: ProjectService, CalendarService
- **출력**: 관계 메서드 구현
- **작업**: 프로젝트별 일정 연동
- **완료 기준**: 일정 연동 테스트 통과

### [ ] 7.3 프로젝트-문서 연결
**목표**: 프로젝트와 문서 간 관계 구현
- **입력**: ProjectService, DocumentService
- **출력**: 관계 메서드 구현
- **작업**: 프로젝트별 문서 관리
- **완료 기준**: 문서 관계 테스트 통과

### [ ] 7.4 실시간 동기화 구현
**목표**: 컴포넌트 간 데이터 동기화
- **입력**: Storage 구독 시스템
- **출력**: 동기화 훅
- **작업**:
  ```typescript
  function useStorageSync(key: string) {
    // 실시간 업데이트 구독
    // React 상태 동기화
  }
  ```
- **완료 기준**: 멀티탭 동기화 테스트

---

## [ ] Phase 8: 성능 최적화

### [ ] 8.1 캐싱 시스템 구현
**목표**: 읽기 성능 향상
- **입력**: StorageManager
- **출력**: 캐싱 레이어
- **작업**:
  ```typescript
  class CacheLayer {
    private cache: Map<string, CacheEntry>
    // TTL 관리
    // 무효화 전략
  }
  ```
- **완료 기준**: 캐시 히트율 > 80%

### [ ] 8.2 배치 최적화
**목표**: 다중 작업 성능 개선
- **입력**: 배치 메서드
- **출력**: 최적화된 배치 처리
- **작업**: 배치 크기 최적화, 병렬 처리
- **완료 기준**: 배치 성능 50% 개선

### [ ] 8.3 압축 최적화
**목표**: 저장 공간 효율화
- **입력**: 압축 유틸리티
- **출력**: 선택적 압축 시스템
- **작업**: 크기별 자동 압축 결정
- **완료 기준**: 저장 공간 30% 절약

### [ ] 8.4 인덱싱 시스템
**목표**: 조회 성능 향상
- **입력**: 엔티티 데이터
- **출력**: 인덱스 관리자
- **작업**:
  ```typescript
  // 상태별 프로젝트 인덱스
  // 날짜별 이벤트 인덱스
  ```
- **완료 기준**: 조회 성능 70% 개선

---

## [ ] Phase 9: 테스트 및 검증

### [ ] 9.1 단위 테스트 작성
**목표**: 모든 모듈 단위 테스트
- **입력**: 각 모듈
- **출력**: 테스트 파일
- **작업**: Jest 테스트 케이스 작성
- **완료 기준**: 커버리지 > 80%

### [ ] 9.2 통합 테스트 작성
**목표**: 시스템 통합 테스트
- **입력**: 전체 시스템
- **출력**: 통합 테스트 스위트
- **작업**: E2E 시나리오 테스트
- **완료 기준**: 주요 시나리오 통과

### [ ] 9.3 성능 벤치마크
**목표**: 성능 측정 및 최적화
- **입력**: 테스트 데이터셋
- **출력**: 성능 보고서
- **작업**: CRUD 작업 벤치마크
- **완료 기준**: 목표 성능 달성

### [ ] 9.4 마이그레이션 테스트
**목표**: 실제 데이터 마이그레이션 검증
- **입력**: 프로덕션 유사 데이터
- **출력**: 마이그레이션 보고서
- **작업**: 대용량 데이터 마이그레이션 테스트
- **완료 기준**: 무손실 마이그레이션 확인

---

## [ ] Phase 10: Supabase 준비 (Future)

### [ ] 10.1 SupabaseAdapter 프로토타입
**목표**: Supabase 어댑터 초기 구현
- **입력**: StorageAdapter 인터페이스
- **출력**: `src/lib/storage/adapters/SupabaseAdapter.ts`
- **작업**:
  ```typescript
  class SupabaseAdapter implements StorageAdapter {
    // Supabase 클라이언트 통합
    // RLS 정책 적용
  }
  ```
- **완료 기준**: 기본 CRUD 동작

### [ ] 10.2 DualWriteAdapter 구현
**목표**: 이중 쓰기 어댑터
- **입력**: LocalStorage + Supabase 어댑터
- **출력**: `src/lib/storage/adapters/DualWriteAdapter.ts`
- **작업**: 로컬 우선, Supabase 백그라운드 동기화
- **완료 기준**: 이중 쓰기 동작 확인

### [ ] 10.3 동기화 모니터 구현
**목표**: 동기화 상태 추적
- **입력**: DualWriteAdapter
- **출력**: 동기화 모니터링 시스템
- **작업**: 동기화 상태 대시보드
- **완료 기준**: 실시간 모니터링 동작

### [ ] 10.4 오프라인 지원
**목표**: 오프라인 모드 구현
- **입력**: 어댑터 시스템
- **출력**: 오프라인 큐 시스템
- **작업**: 오프라인 작업 큐, 자동 재시도
- **완료 기준**: 오프라인/온라인 전환 테스트

---

## 📊 우선순위 매트릭스

| Phase | 중요도 | 난이도 | 예상 시간 | 의존성 |
|-------|--------|--------|-----------|---------|
| 0 | 높음 | 낮음 | 2h | 없음 |
| 1 | 필수 | 중간 | 8h | Phase 0 |
| 2 | 필수 | 낮음 | 4h | Phase 1 |
| 3 | 필수 | 낮음 | 6h | Phase 0 |
| 4 | 높음 | 중간 | 8h | Phase 1,3 |
| 5 | 높음 | 중간 | 4h | Phase 1,2 |
| 6 | 필수 | 높음 | 12h | Phase 1-4 |
| 7 | 중간 | 중간 | 6h | Phase 4,6 |
| 8 | 낮음 | 중간 | 8h | Phase 1-7 |
| 9 | 높음 | 낮음 | 8h | Phase 1-8 |
| 10 | 미래 | 높음 | 16h | Phase 1-9 |

## 🎯 최소 실행 가능 제품 (MVP)

**MVP 구성**: Phase 0 → 1 → 2 → 3 → 4 → 6 (약 40시간)

이 구성으로 기본적인 로컬스토리지 통합이 가능하며, 이후 단계는 점진적으로 추가 가능합니다.

## 🔄 반복 가능한 개발 사이클

각 태스크는 다음 사이클을 따릅니다:

1. **스펙 확인**: 입력/출력 명세 확인
2. **구현**: 코드 작성
3. **테스트**: 단위 테스트 작성 및 실행
4. **통합**: 기존 시스템과 통합
5. **검증**: 완료 기준 확인
6. **문서화**: 코드 문서 및 사용 예시 작성

---

## 📝 개발자 노트

### 각 태스크 시작 전 체크리스트
- [ ] 이전 태스크의 출력물이 존재하는가?
- [ ] 필요한 타입/인터페이스가 정의되어 있는가?
- [ ] 테스트 환경이 구성되어 있는가?
- [ ] 완료 기준이 명확한가?

### 각 태스크 완료 후 체크리스트
- [ ] 코드가 TypeScript 컴파일을 통과하는가?
- [ ] 테스트가 작성되고 통과하는가?
- [ ] 문서가 업데이트되었는가?
- [ ] 다음 태스크를 위한 출력물이 준비되었는가?

### 트러블슈팅 가이드
- **문제**: TypeScript 타입 오류
  - **해결**: `types/` 디렉토리의 타입 정의 확인
- **문제**: 테스트 실패
  - **해결**: 모킹 설정 및 테스트 데이터 확인
- **문제**: 마이그레이션 실패
  - **해결**: 백업 복구 후 마이그레이션 스크립트 디버깅

---

*작성일: 2025-01-03*
*버전: 1.0.0*
*작성자: Claude Code with Scribe Persona*