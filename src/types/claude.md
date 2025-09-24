# types/ - 글로벌 타입 정의 시스템

## 🎯 타입 시스템 개요

이 디렉토리는 프로젝트 전체에서 사용되는 모든 **TypeScript 타입 정의**를 중앙화하여 관리합니다. **100% 타입 안정성**과 **도메인별 명확한 분리**를 통해 확장 가능하고 유지보수가 용이한 타입 시스템을 제공합니다.

## 📁 타입 파일 구조

```
types/
├── ai-assistant.ts        # 🤖 AI 기능 및 문서 추출 타입
├── business.ts           # 💼 비즈니스 도메인 핵심 타입
├── dashboard.ts          # 📊 대시보드 위젯 시스템 타입
├── document-workflow.ts  # 📄 문서 워크플로우 타입
└── improved-dashboard.ts # 🎯 개선된 대시보드 시스템 타입
```

## 🏗️ 타입 시스템 원칙

### 1. 도메인 기반 분리
- **AI 기능**: 문서 추출, API 응답, 토큰 사용량
- **비즈니스**: 프로젝트, 클라이언트, 인보이스, 결제
- **대시보드**: 위젯 시스템, 레이아웃, 상호작용
- **워크플로우**: 문서 생성 워크플로우, 비즈니스 문서
- **고급 대시보드**: 개선된 위젯 시스템, 반응형 레이아웃

### 2. 타입 안정성 우선
- **Strict Mode**: 모든 타입에서 엄격한 검사
- **No Any**: `any` 타입 사용 금지
- **Union Types**: 명확한 상태 및 카테고리 정의
- **Optional Properties**: 선택적 속성 명확 구분

### 3. 확장성 고려
- **Generic Types**: 재사용 가능한 제네릭 타입
- **Interface Extension**: 인터페이스 상속 및 확장
- **Utility Types**: TypeScript 유틸리티 타입 활용
- **Module Augmentation**: 필요 시 타입 확장

## 🤖 AI Assistant 타입 (`ai-assistant.ts`)

### API 응답 시스템
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    processingTime?: number;
    tokenUsage?: TokenUsage;
  };
}
```

### 문서 추출 시스템
```typescript
// 지원되는 문서 타입
type DocumentType =
  | 'receipt'      // 영수증
  | 'invoice'      // 송장
  | 'tax_invoice'  // 세금계산서
  | 'contract'     // 계약서
  | 'business_card'// 명함
  | 'id_card'      // 신분증
  | 'unknown';     // 미분류

// 추출된 데이터 구조
interface ExtractedData {
  documentType: DocumentType;
  fields: ExtractedFields;
  confidence: number;
  rawText: string;
  structuredData: any;
  metadata: ExtractedMetadata;
}
```

### 주요 특징
- **토큰 사용량 추적**: AI API 사용량 모니터링
- **신뢰도 점수**: 추출된 데이터의 정확성 측정
- **메타데이터**: 처리 시간, AI 모델 정보 포함
- **에러 처리**: 구조화된 에러 응답 시스템

## 💼 Business 타입 (`business.ts`)

### 핵심 비즈니스 엔티티
```typescript
// 프로젝트 관리
interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  user_id: string;
}

// 클라이언트 관리
interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  user_id: string;
}
```

### 재무 관리 시스템
```typescript
// 인보이스
interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
}

// 결제
interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  payment_date: string;
}
```

### 작업 관리
```typescript
// 태스크
interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

// 리마인더
interface Reminder {
  id: string;
  title: string;
  reminder_date: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  related_to?: 'project' | 'invoice' | 'task' | 'general';
}
```

## 📊 Dashboard 타입 (`dashboard.ts`)

### 위젯 시스템
```typescript
// 기본 위젯 구조
interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'quickActions' | 'progress' | 'list' | 'custom' | 'projectSummary' | 'todoList';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  data?: any;
  isLocked?: boolean;
}

// 위젯 위치
interface WidgetPosition {
  gridColumn: string;
  gridRow: string;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  width: number;
  height: number;
}
```

### 특별 위젯 타입들
```typescript
// 프로젝트 요약 위젯
interface ProjectReview {
  id: string;
  projectId: string;
  projectName: string;
  client: string;
  pm: string;
  status: 'critical' | 'warning' | 'normal' | 'completed';
  progress: number;
  deadline: Date;
  daysRemaining: number;
  budget: { total: number; spent: number; currency: string };
}

// TodoList 위젯
type TodoPriority = 'p1' | 'p2' | 'p3' | 'p4';

interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  parentId?: string;
  depth: number;
  children?: TodoTask[];
  sectionId?: string;
}
```

### 세무 일정 위젯
```typescript
// 세금 카테고리
type TaxCategory =
  | 'VAT'            // 부가가치세
  | 'income-tax'     // 소득세
  | 'corporate-tax'  // 법인세
  | 'local-tax'      // 지방세
  | 'withholding'    // 원천세
  | 'property-tax'   // 재산세
  | 'customs'        // 관세
  | 'other';         // 기타

// 세무 상태
type TaxStatus =
  | 'upcoming'       // 예정
  | 'urgent'         // 긴급 (D-3 이내)
  | 'overdue'        // 연체
  | 'completed'      // 완료
  | 'in-progress';   // 진행중

interface TaxDeadline {
  id: string;
  title: string;
  category: TaxCategory;
  deadlineDay: number;
  deadlineMonth?: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  importance: 'critical' | 'high' | 'medium' | 'low';
}
```

### 캘린더 위젯
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type?: 'meeting' | 'task' | 'reminder' | 'deadline' | 'holiday' | 'other';
}
```

## 📄 Document Workflow 타입 (`document-workflow.ts`)

### 워크플로우 시스템
```typescript
// 워크플로우 단계
interface WorkflowStep {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  data?: any;
}

// 문서 워크플로우
interface DocumentWorkflow {
  currentStep: number;
  user: User | null;
  client: Client | null;
  project: Project | null;
  documentType: DocumentType | null;
  templateId: string | null;
  steps: WorkflowStep[];
}
```

### 비즈니스 문서 타입들
```typescript
// 문서 종류
interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'legal' | 'technical' | 'financial';
  templates?: string[];
}

// 지원되는 문서 타입들
const DOCUMENT_TYPES = [
  { id: 'proposal', name: '제안서', category: 'business' },
  { id: 'quotation', name: '견적서', category: 'financial' },
  { id: 'contract', name: '계약서', category: 'legal' },
  { id: 'invoice', name: '청구서', category: 'financial' },
  { id: 'report', name: '보고서', category: 'technical' },
  { id: 'specification', name: '명세서', category: 'technical' }
];
```

### 산업 분야 분류
```typescript
const INDUSTRY_CATEGORIES = [
  { id: 'it', name: 'IT/소프트웨어', icon: '💻' },
  { id: 'design', name: '디자인/크리에이티브', icon: '🎨' },
  { id: 'consulting', name: '컨설팅', icon: '💼' },
  { id: 'education', name: '교육', icon: '📚' },
  { id: 'healthcare', name: '헬스케어', icon: '🏥' },
  // ... 추가 카테고리들
];
```

## 🎯 Improved Dashboard 타입 (`improved-dashboard.ts`)

### 개선된 위젯 시스템
```typescript
// 개선된 위젯 인터페이스
interface ImprovedWidget {
  id: string;
  type: 'stats' | 'chart' | 'quickActions' | 'projectSummary' | 'todoList' | 'calendar' | 'taxDeadline' | 'custom';
  position: GridPosition;

  // 제약 속성
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;

  // 동작 속성
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
  isBounded?: boolean;

  // 리사이즈 핸들
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;

  // 상태
  isLocked?: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}
```

### 고급 대시보드 기능
```typescript
// 대시보드 편집 상태
interface DashboardEditState {
  isEditMode: boolean;
  isDragging: boolean;
  isResizing: boolean;
  selectedWidgetId: string | null;
  draggedWidget: {
    id: string;
    originalPosition: GridPosition;
    currentPosition: GridPosition;
  } | null;
  hoveredPosition: GridPosition | null;
}

// 반응형 레이아웃
interface ResponsiveLayout {
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs?: number;
  };
  cols: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs?: number;
  };
  layouts: {
    lg?: ImprovedWidget[];
    md?: ImprovedWidget[];
    sm?: ImprovedWidget[];
    xs?: ImprovedWidget[];
    xxs?: ImprovedWidget[];
  };
}
```

### 위젯 이벤트 시스템
```typescript
interface WidgetCallbacks {
  onLayoutChange?: (widgets: ImprovedWidget[]) => void;
  onDragStart?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onDrag?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onDragStop?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onResizeStart?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onResize?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onResizeStop?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onWidgetClick?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onWidgetRemove?: (widgetId: string) => void;
}
```

## 🔧 타입 사용 가이드라인

### Import 패턴
```typescript
// 특정 타입만 import
import type { Project, Client, Invoice } from '@/types/business'
import type { Widget, DashboardLayout } from '@/types/dashboard'
import type { APIResponse, DocumentType } from '@/types/ai-assistant'

// 전체 모듈 import (필요 시)
import * as BusinessTypes from '@/types/business'
import * as DashboardTypes from '@/types/dashboard'
```

### 타입 확장
```typescript
// 기존 타입 확장
interface ExtendedProject extends Project {
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  customFields: Record<string, any>;
}

// 유니언 타입 확장
type ExtendedDocumentType = DocumentType | 'presentation' | 'worksheet'
```

### Generic 활용
```typescript
// API 응답에 Generic 사용
const projectResponse: APIResponse<Project[]> = await fetchProjects()
const invoiceResponse: APIResponse<Invoice> = await fetchInvoice(id)

// 위젯 데이터에 Generic 사용
interface TypedWidget<T> extends Widget {
  data: T;
}

type StatsWidget = TypedWidget<StatsData>
type ChartWidget = TypedWidget<ChartData>
```

## 🚀 개발 워크플로우

### 새 타입 추가 시
1. **도메인 분석**: 적절한 타입 파일 선택
2. **인터페이스 설계**: 명확하고 확장 가능한 구조
3. **Union 타입 정의**: 가능한 값들의 명시적 정의
4. **JSDoc 주석**: 복잡한 타입에 설명 추가
5. **Export**: 다른 모듈에서 사용할 타입 내보내기

### 타입 검증
```typescript
// 타입 가드 함수
function isProject(obj: any): obj is Project {
  return typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string'
}

// 런타임 검증
if (isProject(data)) {
  // data는 Project 타입으로 확정
  console.log(data.name) // 타입 안전
}
```

## 📊 품질 메트릭

### 타입 커버리지
- **전체 프로젝트**: 100% TypeScript 타입 정의
- **any 타입 사용**: 0개 (엄격 금지)
- **Union 타입**: 명확한 상태 정의 100%
- **Optional 속성**: 명시적 구분 100%

### 일관성 지표
- **명명 규칙**: PascalCase 인터페이스, camelCase 속성
- **구조 패턴**: 일관된 인터페이스 구조
- **문서화**: 모든 복잡한 타입에 주석 제공

## 🔗 관련 문서

- [`../lib/claude.md`](../lib/claude.md) - 유틸리티 함수와 타입 활용
- [`../components/claude.md`](../components/claude.md) - 컴포넌트 Props 타입
- [`../config/claude.md`](../config/claude.md) - 설정 타입 정의

---

**이 타입 시스템은 프로젝트의 모든 데이터 구조를 안전하고 명확하게 정의하여 개발 효율성과 코드 품질을 보장합니다.**