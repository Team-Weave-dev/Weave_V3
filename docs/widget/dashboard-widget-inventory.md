# 대시보드 위젯 시스템 가이드 - 시스템 아키텍처 V2.0

## 핵심 기술 스택 (실제 프로젝트 기준)
```javascript
// package.json 주요 의존성
{
  "dependencies": {
    // 🔧 프레임워크
    "next": "^14.2.32",          // React 기반 풀스택 프레임워크
    "react": "^18",              // UI 라이브러리
    "typescript": "^5",          // 타입 안전성
    
    // 🎨 스타일링 & 애니메이션
    "tailwindcss": "^3.3.0",     // 유틸리티 CSS
    "framer-motion": "^12.23.12", // iOS 스타일 애니메이션
    "clsx": "^2.0.0",            // 조건부 클래스명
    "tailwind-merge": "^2.0.0",  // Tailwind 클래스 병합
    
    // 📊 상태 관리
    "zustand": "^5.0.8",         // 간단한 상태 관리
    
    // 🔄 드래그 앤 드롭
    "@hello-pangea/dnd": "^16.6.0", // Beautiful DnD의 포크 (현재 사용 중)
    
    // 📈 차트 & 데이터 시각화
    "recharts": "^3.2.0",        // React 차트 라이브러리
    "react-chartjs-2": "^5.3.0", // Chart.js React 래퍼
    "chart.js": "^4.5.0",        // 차트 라이브러리
    
    // 🗓️ 날짜 처리
    "date-fns": "^4.1.0",        // 가벼운 날짜 유틸리티
    
    // 📝 마크다운 & 에디터
    "@uiw/react-md-editor": "^4.0.8", // 마크다운 에디터
    "react-markdown": "^10.1.0",      // 마크다운 렌더러
    "marked": "^16.2.0",              // 마크다운 파서
    
    // 🎭 아이콘
    "lucide-react": "^0.541.0",  // Lucide 아이콘 (깔끔한 iOS 스타일)
    
    // 🔐 백엔드 & 인증
    "@supabase/supabase-js": "^2.56.1",        // Supabase 클라이언트
    "@supabase/auth-helpers-nextjs": "^0.10.0", // Next.js 인증 헬퍼
    
    // 🤖 AI 통합
    "@google/generative-ai": "^0.24.1", // Google Gemini AI
    "langchain": "^0.3.31",             // LangChain AI 프레임워크
    
    // 🚀 성능 최적화
    "react-window": "^1.8.10",    // 가상 스크롤링
    
    // 📄 문서 처리
    "docx": "^9.5.1",            // Word 문서 생성
    "jspdf": "^3.0.2",           // PDF 생성
    "html2canvas": "^1.4.1"      // HTML to Canvas
  }
}
```

## 프로젝트 구조 설명
```
src/
├── app/                        # Next.js App Router
│   ├── api/                   # API 라우트 (서버 로직)
│   ├── dashboard/              # 대시보드 페이지
│   └── (auth)/                # 인증 관련 페이지
│
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트
│   │   ├── Button.tsx         # 스타일 버튼
│   │   ├── Card.tsx           # 스타일 카드
│   │   ├── Typography.tsx     # SF Pro 스타일 텍스트
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── widgets/           # 위젯 컴포넌트
│   │   │   ├── ProjectSummaryWidget.tsx
│   │   │   ├── TaskTrackerWidget.tsx
│   │   │   └── ...
│   │   │
│   │   ├── controls/          # 스타일 컨트롤
│   │   │   ├── IOSSwitch.tsx
│   │   │   ├── IOSSlider.tsx
│   │   │   └── IOSSegmentedControl.tsx
│   │   │
│   │   └── templates/         # 템플릿 시스템
│   │
│   └── layout/                # 레이아웃 컴포넌트
│
├── lib/
│   ├── dashboard/             # 대시보드 비즈니스 로직
│   ├── stores/                # Zustand 상태 스토어
│   ├── theme/                 # 테마 시스템
│   └── utils/                 # 유틸리티 함수
│
└── styles/
    ├── globals.css            # 전역 스타일
    └── ios-theme.css          # iOS 테마 변수
```


# 📦 시스템 위젯 목록 (전체 22개)

## 🔢 위젯 카테고리별 분류

| 카테고리 | 위젯 수 | 위젯 목록 |
|---------|---------|-----------|
| **프로젝트 관리** | 2개 | project-summary, task-tracker |
| **세무 관련** | 2개 | tax-deadline, tax-calculator |
| **분석 및 지표** | 6개 | revenue-chart, expense-tracker, profit-loss, cash-flow, budget-monitor, kpi-metrics |
| **생산성** | 10개 | todo-list, calendar, recent-activity, time-tracker, pomodoro, notes, reminders, weather, news-feed, analytics-dashboard |
| **커스텀/기타** | 2개 | quick-actions, team-collaboration |


## 📂 프로젝트 관리 위젯 (2개)

<!-- ### 1. 📊 프로젝트 요약 위젯 (ProjectSummaryWidget)

#### 기본 정보
- **타입**: `project-summary`
- **카테고리**: `project`
- **iOS 참고**: Activity 앱의 링 차트 + Reminders 앱의 스마트 리스트
- **기본 크기**: 2x2 (최소: 1x1, 최대: 4x4) -->


### 2. 🚀 스마트 작업 추적기 위젯 (SmartTaskTrackerWidget)

- **타입**: `task-tracker`
- **카테고리**: `project`
- **iOS 참고**: Shortcuts 앱의 자동화 + Screen Time의 인사이트 패널
- **설명**: AI 기반 프로젝트 작업 관리 및 팀 협업 인사이트
- **기본 크기**: 2x2 (스마트 기능을 위한 확대)

#### 핵심 차별점 (vs TodoList, Reminders)
| 위젯 | 용도 | 주요 기능 |
|------|------|---------|
| **SmartTaskTracker** | 프로젝트/팀 작업 관리 | AI 우선순위, 병목 감지, 팀 협업 |
| TodoList | 개인 할 일 관리 | 단순 체크리스트, Todoist 스타일 |
| Reminders | 시간 기반 알림 | 일정 알림, 반복 설정 |

#### 상세 기능 정의
```typescript
interface SmartTaskTrackerWidgetProps {
  id: string;
  config?: {
    title?: string;
    viewMode?: 'kanban' | 'sprint' | 'timeline' | 'team' | 'smart';
    
    // 스마트 기능 설정
    enableAI?: boolean;              // AI 인사이트 활성화
    enableAutoSort?: boolean;         // 자동 우선순위 정렬
    enableBottleneckDetection?: boolean; // 병목 감지
    enablePredictions?: boolean;      // 마감일 예측
    
    // 표시 옵션
    showInsights?: boolean;           // AI 인사이트 패널
    showProgress?: boolean;           // 프로젝트 진행률
    showTeamLoad?: boolean;           // 팀원 작업 부하
    maxTasks?: number;               
    
    // 통합 설정
    integrations?: {
      github?: boolean;               // GitHub Issues 연동
      jira?: boolean;                 // Jira 연동
      slack?: boolean;                // Slack 알림
    };
    
    // 필터 옵션
    filterByProject?: string[];
    filterByAssignee?: string[];
    filterByStatus?: string[];
  };
  isEditMode?: boolean;
  onTaskUpdate?: (taskId: string, updates: Partial<SmartTask>) => void;
  onTaskCreate?: () => void;
  onViewChange?: (mode: string) => void;
}

interface SmartTask {
  id: string;
  title: string;
  description?: string;
  
  // 기본 속성
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  
  // 프로젝트 관련
  projectId: string;
  projectName: string;
  sprint?: string;
  epic?: string;
  
  // 팀 협업
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    workload?: number;        // 현재 작업 부하 (0-100)
  };
  reviewer?: TeamMember;
  watchers?: TeamMember[];
  
  // 시간 관리
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  completedAt?: Date;
  
  // 의존성
  dependencies?: string[];     // 선행 작업 ID
  blockedBy?: string[];        // 블로킹 작업 ID
  blocks?: string[];           // 이 작업이 블로킹하는 작업들
  
  // AI 인사이트
  aiInsights?: {
    suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    riskLevel?: 'low' | 'medium' | 'high';  // 지연 위험도
    bottleneckScore?: number;   // 병목 점수 (0-100)
    estimatedCompletion?: Date; // AI 예측 완료일
    recommendations?: string[];  // AI 추천사항
  };
  
  // 메타데이터
  tags?: string[];
  labels?: Label[];
  customFields?: Record<string, any>;
  
  // 활동 기록
  comments?: Comment[];
  attachments?: Attachment[];
  activities?: Activity[];
  
  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
}

interface AIInsight {
  type: 'warning' | 'suggestion' | 'critical' | 'info';
  title: string;
  description: string;
  priority: number;        // 표시 우선순위
  actionable?: {
    action: string;        // 실행 가능한 액션
    taskIds?: string[];    // 관련 작업들
  };
  timestamp: Date;
}

// 스마트 뷰 모드별 데이터 구조
interface KanbanColumn {
  id: string;
  title: string;
  tasks: SmartTask[];
  limit?: number;          // WIP 제한
  color?: string;
}

interface SprintView {
  currentSprint: {
    name: string;
    startDate: Date;
    endDate: Date;
    velocity: number;
    tasks: SmartTask[];
    burndown: DataPoint[];
  };
  backlog: SmartTask[];
}

interface TeamView {
  members: Array<{
    member: TeamMember;
    tasks: SmartTask[];
    workload: number;      // 0-100
    availability: 'available' | 'busy' | 'overloaded';
  }>;
}

// 스마트 기능 엔진
interface SmartEngine {
  // 우선순위 자동 조정
  calculatePriority(task: SmartTask): 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  
  // 병목 감지
  detectBottlenecks(tasks: SmartTask[]): Array<{
    task: SmartTask;
    impact: number;        // 영향받는 작업 수
    recommendation: string;
  }>;
  
  // 작업 부하 분석
  analyzeWorkload(member: TeamMember, tasks: SmartTask[]): {
    current: number;
    optimal: number;
    recommendation: string;
  };
  
  // 마감일 예측
  predictCompletion(task: SmartTask, historicalData: any): {
    estimated: Date;
    confidence: number;    // 0-100
    risks: string[];
  };
  
  // 스마트 추천
  generateRecommendations(tasks: SmartTask[]): AIInsight[];
}
```

## 💰 세무 관련 위젯 (2개)

<!-- ### 3. 📅 세무 일정 위젯 (TaxDeadlineWidget)
- **타입**: `tax-deadline`  
- **카테고리**: `tax`
- **iOS 참고**: Calendar 앱의 이벤트 리스트 뷰
- **설명**: 연간 정기 세무 일정을 한눈에 보여주는 정보성 위젯
- **기본 크기**: 2x2 (최소: 1x1, 최대: 2x3) -->


<!-- ### 4. 🧮 세금 계산기 위젯 (TaxCalculatorWidget)
- **타입**: `tax-calculator`
- **카테고리**: `tax`
- **iOS 참고**: Calculator 앱의 미니멀 입력 인터페이스
- **설명**: 부가세, 원천세(3.3%, 8.8%) 등을 간편하게 계산하고 실수령액 산출
- **기본 크기**: 1x1 -->


## 📊 분석 및 지표 위젯 (6개)

### 5. 📊 매출 차트 위젯 (RevenueChartWidget)
- **타입**: `revenue-chart`
- **카테고리**: `analytics`
- **iOS 참고**: Health 앱의 그래프 시각화
- **설명**: 월별/분기별 수익을 차트로 표시
- **기본 크기**: 2x1

<!-- ### 6. 📈 KPI 지표 위젯 (KPIWidget)
- **타입**: `kpi-metrics`
- **카테고리**: `analytics`
- **iOS 참고**: Fitness 앱의 메트릭 카드
- **설명**: 핵심 성과 지표를 한눈에
- **기본 크기**: 3x1 -->

### 7. 💳 지출 추적기 위젯 (ExpenseTrackerWidget)
- **타입**: `expense-tracker`
- **카테고리**: `analytics`
- **iOS 참고**: Wallet 앱의 지출 트래킹
- **설명**: 카테고리별 지출 관리 및 예산 설정
- **기본 크기**: 2x2

### 8. 📊 손익 계산서 위젯 (ProfitLossWidget)
- **타입**: `profit-loss`
- **카테고리**: `analytics`
- **iOS 참고**: Numbers 앱의 재무 테이블
- **설명**: 수익과 비용을 비교하여 손익 분석
- **기본 크기**: 2x2

### 9. 💵 현금 흐름 위젯 (CashFlowWidget)
- **타입**: `cash-flow`
- **카테고리**: `analytics`
- **iOS 참고**: Wallet 앱의 거래 내역
- **설명**: 수입/지출 현금 흐름 시각화
- **기본 크기**: 3x2

### 10. 💰 예산 모니터 위젯 (BudgetMonitorWidget)
- **타입**: `budget-monitor`
- **카테고리**: `analytics`
- **iOS 참고**: Wallet 앱의 예산 추적
- **설명**: 예산 대비 실제 지출 모니터링
- **기본 크기**: 2x2



## 🚀 생산성 위젯 (10개)

<!-- ### 11. 📝 할 일 목록 위젯 (TodoListWidget)
- **타입**: `todo-list`
- **카테고리**: `productivity`
- **iOS 참고**: Todoist + Reminders 앱의 계층적 구조
- **기본 크기**: 2x2 (최소: 1x1, 최대: 4x4) -->


<!-- ### 12. 📆 캘린더 위젯 (CalendarWidget)
- **타입**: `calendar`
- **카테고리**: `productivity`
- **스타일 참고**: Google Calendar + iOS Calendar 하이브리드
- **설명**: 구글 캘린더 스타일의 일정 관리 위젯 (Google Calendar API 연동 준비)
- **기본 크기**: 2x2 (최소: 2x2, 최대: 4x4) -->


### 13. 🔔 최근 활동 위젯 (RecentActivityWidget)
- **타입**: `recent-activity`
- **카테고리**: `productivity`
- **iOS 참고**: Notification Center의 타임라인

#### 개념 및 필요성
- **목적**: 모든 시스템 알림을 중앙에서 관리
- **가치**: 중요한 정보를 놓치지 않도록 통합 관리
- **iOS 참고**: Notification Center

#### 상세 기능 정의
```typescript
interface NotificationCenterWidgetProps {
  id: string;
  config?: {
    maxNotifications?: number;
    groupByApp?: boolean;
    showBadges?: boolean;
    enableSound?: boolean;
    priorities?: ('high' | 'medium' | 'low')[];
  };
  onNotificationClick?: (notification: Notification) => void;
  onClearAll?: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  source: string;        // 어느 위젯/시스템에서 온 알림인지
  actionUrl?: string;    // 클릭 시 이동할 URL
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actions?: {
    label: string;
    action: () => void;
  }[];
}
```

### 14. ⏰ 시간 추적기 위젯 (TimeTrackerWidget)
- **타입**: `time-tracker`
- **카테고리**: `productivity`
- **iOS 참고**: Screen Time 앱의 활동 추적
- **설명**: 프로젝트별 시간 추적 및 리포트
- **기본 크기**: 2x2

### 15. 🍅 뽀모도로 타이머 위젯 (PomodoroWidget)
- **타입**: `pomodoro`
- **카테고리**: `productivity`
- **iOS 참고**: Clock 앱의 타이머
- **설명**: 집중력 향상을 위한 뽀모도로 기법 타이머
- **기본 크기**: 2x2

### 16. 📝 메모 위젯 (NotesWidget)
- **타입**: `notes`
- **카테고리**: `productivity`
- **iOS 참고**: Notes 앱
- **설명**: 간단한 메모와 아이디어 저장
- **기본 크기**: 1x2

### 17. 🔔 리마인더 위젯 (RemindersWidget)
- **타입**: `reminders`
- **카테고리**: `productivity`
- **iOS 참고**: Reminders 앱
- **설명**: 중요한 일정과 알림 관리
- **기본 크기**: 2x2

<!-- ### 18. ☁️ 날씨 정보 위젯 (WeatherWidget)
- **타입**: `weather`
- **카테고리**: `productivity`
- **iOS 참고**: Weather 앱
- **설명**: 현재 위치 날씨 및 5일 예보
- **기본 크기**: 2x1 -->

### 19. 📰 뉴스 피드 위젯 (NewsFeedWidget)
- **타입**: `news-feed`
- **카테고리**: `productivity`
- **iOS 참고**: News 앱
- **설명**: 관심 분야 최신 뉴스 표시
- **기본 크기**: 2x3

### 20. 📊 분석 대시보드 위젯 (AnalyticsDashboardWidget)
- **타입**: `analytics-dashboard`
- **카테고리**: `productivity`
- **iOS 참고**: Screen Time 앱의 통계
- **설명**: 통합 분석 및 인사이트 제공
- **기본 크기**: 3x3


## 🎨 커스텀/기타 위젯 (2개)

### 21. ⚡ 빠른 실행 위젯 (QuickActionsWidget)
- **타입**: `quick-actions`
- **카테고리**: `custom`
- **목적**: 자주 사용하는 기능 바로가기
- **가치**: 클릭 한 번으로 주요 작업 실행
- **iOS 참고**: Control Center 토글

#### 구현 예시
```tsx
const QuickActionsWidget: React.FC = () => {
  const actions = [
    { icon: '📊', label: '보고서 생성', action: generateReport },
    { icon: '📧', label: '일괄 메일 발송', action: sendBulkEmail },
    { icon: '💾', label: '백업 실행', action: runBackup },
    { icon: '🔄', label: '동기화', action: syncData },
    { icon: '📈', label: '분석 시작', action: startAnalysis },
    { icon: '🔒', label: '잠금 모드', action: enableLockMode }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {actions.map(action => (
        <IOSControlButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          onClick={action.action}
          hapticFeedback="impact"
        />
      ))}
    </div>
  );
};
```

### 22. 👥 팀 협업 위젯 (TeamCollaborationWidget)
- **타입**: `team-collaboration`
- **카테고리**: `custom`
- **목적**: 실시간 팀 커뮤니케이션 및 협업
- **가치**: 대시보드에서 바로 팀 상태 확인 및 소통
- **iOS 참고**: Messages 앱의 그룹 채팅

#### UI 구성
```tsx
const TeamCollaborationWidget: React.FC = () => {
  return (
    <div className="ios-widget-container">
      {/* 팀 멤버 상태 (온라인/오프라인) */}
      <TeamMemberStatus members={teamMembers} />
      
      {/* 최근 메시지 */}
      <RecentMessages 
        messages={messages}
        onReply={(message) => {/* 답장 */}}
      />
      
      {/* 공유 파일 */}
      <SharedFiles 
        files={sharedFiles}
        onFileClick={(file) => {/* 파일 열기 */}}
      />
      
      {/* 빠른 메시지 입력 */}
      <QuickMessageInput 
        onSend={(message) => {/* 메시지 전송 */}}
      />
    </div>
  );
};
```

### 23. 🤖 AI 어시스턴트 위젯 (AIAssistantWidget)

#### 개념 및 필요성
- **목적**: AI 기반 업무 도우미 및 인사이트 제공
- **가치**: 자연어로 명령하고 추천받기
- **iOS 참고**: Siri 인터페이스

#### 기능 예시
```typescript
interface AIAssistantWidgetProps {
  id: string;
  config?: {
    model?: 'gpt-4' | 'gpt-3.5' | 'claude';
    capabilities?: ('chat' | 'analysis' | 'automation')[];
    maxTokens?: number;
    temperature?: number;
  };
  onCommand?: (command: string) => Promise<AIResponse>;
}

// 사용 예시
const commands = [
  "이번 달 매출 요약해줘",
  "내일 일정 정리해줘",
  "프로젝트 진행률 분석해줘",
  "세금 신고 마감일 알려줘"
];
```

## 📊 성능 최적화 체크리스트

- [ ] React.lazy()로 위젯 동적 로딩
- [ ] useMemo()로 expensive 계산 캐싱
- [ ] useCallback()으로 함수 재생성 방지
- [ ] 큰 리스트는 react-window 사용
- [ ] 이미지는 next/image 사용
- [ ] 불필요한 re-render 방지 (React.memo)
- [ ] 애니메이션은 transform/opacity만 사용
- [ ] will-change CSS 속성 신중하게 사용

## 🎯 접근성(A11y) 체크리스트

- [ ] 모든 인터랙티브 요소에 aria-label
- [ ] 키보드 내비게이션 지원 (Tab, Enter, Esc)
- [ ] Focus 표시가 명확한가?
- [ ] 색상 대비 7:1 이상
- [ ] 스크린 리더 테스트 완료
- [ ] role 속성 적절히 사용
- [ ] 에러 메시지 접근 가능
- [ ] 로딩 상태 알림


## 🏛️ 아키텍처 패턴 상세

### 위젯 레지스트리 패턴 (실제 프로젝트 구조)
```typescript
// src/lib/dashboard/ios-widget-registry.ts
// 싱글톤 패턴으로 구현된 iOS 스타일 위젯 레지스트리
class IOSWidgetRegistry {
  private static instance: IOSWidgetRegistry;
  private widgets: Map<string, WidgetDefinition> = new Map();
  
  static getInstance(): IOSWidgetRegistry {
    if (!IOSWidgetRegistry.instance) {
      IOSWidgetRegistry.instance = new IOSWidgetRegistry();
    }
    return IOSWidgetRegistry.instance;
  }
  
  register(type: string, component: React.FC, metadata: WidgetMetadata) {
    this.widgets.set(type, { component, metadata });
  }
  
  getWidget(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }
  
  getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }
}

// iOS 스타일 위젯 레지스트리는 별도로 관리
export const iosWidgetRegistry = IOSWidgetRegistry.getInstance();
```

### Lazy Loading 패턴
```typescript
// 동적 임포트와 Suspense를 활용한 최적화
const LazyWidget = lazy(() => 
  import('./widgets/HeavyWidget')
    .then(module => ({
      default: module.HeavyWidget
    }))
);

// 사용 시
<Suspense fallback={<WidgetSkeleton />}>
  <ErrorBoundary fallback={<WidgetError />}>
    <LazyWidget {...props} />
  </ErrorBoundary>
</Suspense>
```

### 상태 관리 패턴 (Zustand - iOS 대시보드 스토어)
```typescript
// src/lib/stores/useIOSDashboardStore.ts
// 실제 프로젝트에서 사용 중인 iOS 대시보드 스토어
import { create } from 'zustand';
import { IOSStyleWidget } from '@/types/ios-dashboard';

interface IOSDashboardStore {
  // 상태
  widgets: IOSStyleWidget[];
  isEditMode: boolean;
  isWiggling: boolean;
  selectedWidgetId: string | null;
  
  // 액션
  addWidget: (widget: IOSStyleWidget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<IOSStyleWidget>) => void;
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  toggleEditMode: () => void;
  startWiggle: () => void;
  stopWiggle: () => void;
  
  // 드래그 앤 드롭 (@hello-pangea/dnd)
  handleDragEnd: (result: DropResult) => void;
  
  // 레이아웃
  updateLayout: (widgets: IOSStyleWidget[]) => void;
  resetLayout: () => void;
  
  // 성능 최적화
  batchUpdate: (updates: Array<{ id: string; changes: Partial<IOSStyleWidget> }>) => void;
}

export const useIOSDashboardStore = create<IOSDashboardStore>((set) => ({
  widgets: [],
  isEditMode: false,
  isWiggling: false,
  selectedWidgetId: null,
  
  addWidget: (widget) => 
    set(state => ({ 
      widgets: [...state.widgets, widget] 
    })),
  
  removeWidget: (id) => 
    set(state => ({ 
      widgets: state.widgets.filter(w => w.id !== id) 
    })),
  
  updateWidget: (id, updates) =>
    set(state => ({
      widgets: state.widgets.map(w => 
        w.id === id ? { ...w, ...updates } : w
      )
    })),
  
  updateWidgetPosition: (id, position) =>
    set(state => ({
      widgets: state.widgets.map(w =>
        w.id === id ? { ...w, position } : w
      )
    })),
  
  toggleEditMode: () => 
    set(state => ({ 
      isEditMode: !state.isEditMode,
      isWiggling: !state.isEditMode // iOS 스타일 wiggle 애니메이션
    })),
  
  startWiggle: () => set({ isWiggling: true }),
  stopWiggle: () => set({ isWiggling: false }),
  
  // @hello-pangea/dnd 드래그 처리
  handleDragEnd: (result) => {
    if (!result.destination) return;
    
    set(state => {
      const widgets = [...state.widgets];
      const [reorderedWidget] = widgets.splice(result.source.index, 1);
      widgets.splice(result.destination!.index, 0, reorderedWidget);
      return { widgets };
    });
  },
  
  updateLayout: (widgets) => set({ widgets }),
  resetLayout: () => set({ widgets: [] }),
  
  batchUpdate: (updates) =>
    set(state => ({
      widgets: state.widgets.map(widget => {
        const update = updates.find(u => u.id === widget.id);
        return update ? { ...widget, ...update.changes } : widget;
      })
    }))
}));
```

## 🔐 보안 가이드라인

### 입력 검증
```typescript
// Zod를 활용한 스키마 검증
const widgetConfigSchema = z.object({
  title: z.string().max(100),
  refreshInterval: z.number().min(10).max(3600),
  maxItems: z.number().min(1).max(100),
  theme: z.enum(['light', 'dark', 'auto'])
});

// 사용 예시
try {
  const validConfig = widgetConfigSchema.parse(userInput);
  // 안전한 설정 사용
} catch (error) {
  // 검증 실패 처리
}
```

### XSS 방지
```typescript
// React의 기본 XSS 보호 + 추가 sanitization
import DOMPurify from 'isomorphic-dompurify';

const SafeHTMLContent: React.FC<{ html: string }> = ({ html }) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
    ALLOWED_ATTR: ['class']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

## 📈 성능 모니터링

### 위젯 성능 측정
```typescript
// Performance Observer API 활용
const measureWidgetPerformance = (widgetName: string) => {
  const startMark = `${widgetName}-start`;
  const endMark = `${widgetName}-end`;
  
  performance.mark(startMark);
  
  // 위젯 렌더링
  
  performance.mark(endMark);
  performance.measure(widgetName, startMark, endMark);
  
  const measure = performance.getEntriesByName(widgetName)[0];
  console.log(`${widgetName} 렌더링 시간: ${measure.duration}ms`);
};
```

### React DevTools Profiler 활용
```typescript
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) => {
  // 성능 데이터 수집
  analytics.track('widget_render', {
    widgetId: id,
    phase,
    duration: actualDuration
  });
};

<Profiler id="widget" onRender={onRenderCallback}>
  <Widget />
</Profiler>
```

## 📊 분석 및 모니터링

### 위젯 사용 통계
```typescript
// Google Analytics 4 연동
const trackWidgetUsage = (action: string, widgetType: string) => {
  gtag('event', 'widget_interaction', {
    action,
    widget_type: widgetType,
    user_id: getUserId(),
    timestamp: new Date().toISOString()
  });
};

// Sentry 에러 추적
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // 위젯 관련 컨텍스트 추가
    if (event.tags?.widget) {
      event.fingerprint = ['widget', event.tags.widget];
    }
    return event;
  }
});
```

## 🎯 결론

이 문서는 WEAVE 대시보드 위젯 시스템을 iOS 스타일로 재설계한 포괄적인 가이드입니다.

### 핵심 개선사항
1. **iOS 디자인 시스템 적용**: 일관된 사용자 경험 제공
2. **실제 기술 스택 반영**: 
   - @hello-pangea/dnd (Beautiful DnD 포크)
   - recharts, chart.js (차트 라이브러리)
   - lucide-react (아이콘)
   - Zustand 5.0 (상태 관리)
3. **5개 신규 위젯 제안**: 생산성과 협업 강화
4. **상세한 구현 가이드**: 초급 개발자도 쉽게 따라할 수 있는 문서
5. **성능과 접근성 최적화**: 모든 사용자를 위한 빠르고 접근 가능한 시스템