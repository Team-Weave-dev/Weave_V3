# 알림 배너 리뷰 수집 시스템 가이드

## 개요

알림 배너 시스템을 통해 페이지별로 맞춤형 리뷰를 수집할 수 있습니다.
리뷰 데이터는 웹훅으로 전송되어 외부 분석 시스템에서 처리됩니다.

## 기본 구조

### 1. 일반 리뷰 배너 (페이지 구분 없음)

**설정:**
```sql
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,
  webhook_url,
  webhook_button_text,
  action_type,
  is_active,
  priority,
  reset_period
) VALUES (
  'notice',
  '서비스가 마음에 드셨나요? 별점을 남겨주세요!',
  'always',
  NULL,
  'https://your-webhook-endpoint.com/reviews',
  '리뷰 제출',
  'review',
  true,
  100,
  'never'
);
```

**웹훅 페이로드:**
```json
{
  "banner_id": "uuid-string",
  "banner_type": "notice",
  "user_id": "user-uuid-or-null",
  "action": "review",
  "timestamp": "2025-10-20T12:34:56Z",
  "data": {
    "rating": 5,
    "review": "정말 유용해요!"
  }
}
```

---

### 2. 페이지별 리뷰 배너 (대시보드 - 위젯 선택)

**설정:**
```sql
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,
  webhook_url,
  webhook_button_text,
  action_type,
  is_active,
  priority,
  reset_period
) VALUES (
  'notice',
  '대시보드가 사용하기 편리한가요? 가장 마음에 드는 위젯을 알려주세요!',
  'user_action',
  'page_visit:/dashboard',  -- 중요: 페이지 식별자
  'https://your-webhook-endpoint.com/reviews',
  '리뷰 제출',
  'review',
  true,
  100,
  'weekly'
);
```

**웹훅 페이로드:**
```json
{
  "banner_id": "uuid-string",
  "banner_type": "notice",
  "user_id": "user-uuid-or-null",
  "action": "review",
  "timestamp": "2025-10-20T12:34:56Z",
  "data": {
    "rating": 5,
    "review": "대시보드 정말 좋아요!",
    "context": {
      "page": "dashboard",
      "selectedOption": "calendar"  -- 사용자가 선택한 위젯
    }
  }
}
```

**사용 가능한 위젯 옵션:**
- `calendar`: 캘린더
- `todo-list`: 할일 목록
- `project-summary`: 프로젝트 요약
- `tax-schedule`: 세무 일정
- `tax-calculator`: 세금 계산기
- `recent-activity`: 최근 활동
- `weather`: 날씨
- `kpi-metrics`: KPI 지표
- `revenue-chart`: 매출 차트

---

### 3. 페이지별 리뷰 배너 (프로젝트 - 기능 선택)

**설정:**
```sql
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,
  webhook_url,
  webhook_button_text,
  action_type,
  is_active,
  priority,
  reset_period
) VALUES (
  'notice',
  '프로젝트 관리 기능이 만족스러우신가요? 가장 유용한 기능을 선택해주세요!',
  'user_action',
  'page_visit:/projects',  -- 프로젝트 페이지
  'https://your-webhook-endpoint.com/reviews',
  '리뷰 제출',
  'review',
  true,
  100,
  'monthly'
);
```

**웹훅 페이로드:**
```json
{
  "banner_id": "uuid-string",
  "banner_type": "notice",
  "user_id": "user-uuid-or-null",
  "action": "review",
  "timestamp": "2025-10-20T12:34:56Z",
  "data": {
    "rating": 4,
    "review": "문서 관리가 특히 편리합니다",
    "context": {
      "page": "projects",
      "selectedOption": "document-management"  -- 사용자가 선택한 기능
    }
  }
}
```

**사용 가능한 기능 옵션:**
- `detail-view`: 상세 정보 보기
- `document-management`: 문서 관리
- `progress-tracking`: 진행률 추적
- `status-management`: 상태 관리
- `financial-overview`: 재무 정보
- `task-management`: 작업 관리
- `timeline-view`: 타임라인 보기

---

## 주요 필드 설명

### trigger_action
- **형식**: `page_visit:{페이지경로}`
- **예시**:
  - `page_visit:/dashboard` → 대시보드 페이지에서만 표시
  - `page_visit:/projects` → 프로젝트 목록 또는 상세 페이지에서 표시
- **중요**: 이 값이 있어야 페이지별 선택 필드가 표시됩니다

### display_rule
- `always`: 모든 페이지에서 항상 표시 (trigger_action 무시)
- `user_action`: trigger_action에 지정된 페이지에서만 표시
  - **dwell_time_seconds를 함께 설정하면 페이지 방문 + 체류 시간 모두 체크**
  - 예: 대시보드 페이지에 방문하고 10초 체류하면 표시
- `dwell_time`: 특정 시간 체류 후 표시 (dwell_time_seconds 필요, 페이지 구분 없음)

### reset_period
- `never`: 한 번 닫으면 영구적으로 숨김
- `daily`: 매일 자정 이후 다시 표시
- `weekly`: 매주 월요일 다시 표시
- `monthly`: 매월 1일 다시 표시

### action_type
- **반드시 `'review'`로 설정** (별점 리뷰 UI 활성화)

---

## 웹훅 수신 측 처리 예시

### Node.js/Express
```javascript
app.post('/reviews', async (req, res) => {
  const { banner_id, user_id, action, data } = req.body;

  if (action === 'review') {
    const { rating, review, context } = data;

    // 페이지별 분석
    if (context?.page === 'dashboard') {
      console.log(`대시보드 리뷰: ${rating}점, 선호 위젯: ${context.selectedOption}`);
      // DB 저장 또는 분석 시스템 전송
    } else if (context?.page === 'projects') {
      console.log(`프로젝트 리뷰: ${rating}점, 선호 기능: ${context.selectedOption}`);
    } else {
      console.log(`일반 리뷰: ${rating}점`);
    }
  }

  res.status(200).json({ success: true });
});
```

---

### 4. 페이지별 + 체류 시간 조합 (대시보드 10초 체류)

**설정:**
```sql
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,
  dwell_time_seconds,  -- 체류 시간 추가!
  webhook_url,
  webhook_button_text,
  action_type,
  is_active,
  priority,
  reset_period
) VALUES (
  'notice',
  '대시보드를 충분히 둘러보셨나요? 사용 경험을 알려주세요!',
  'user_action',  -- user_action + dwell_time_seconds 조합
  'page_visit:/dashboard',
  10,  -- 10초 체류 후 표시
  'https://your-webhook-endpoint.com/reviews',
  '리뷰 제출',
  'review',
  true,
  100,
  'weekly'
);
```

**동작:**
1. 대시보드 페이지 방문 체크 ✅
2. 10초 체류 시간 충족 체크 ✅
3. 둘 다 만족하면 배너 표시

**웹훅 페이로드:**
```json
{
  "banner_id": "uuid-string",
  "banner_type": "notice",
  "user_id": "user-uuid-or-null",
  "action": "review",
  "timestamp": "2025-10-20T12:34:56Z",
  "data": {
    "rating": 5,
    "review": "10초 써보니 정말 좋네요!",
    "context": {
      "page": "dashboard",
      "selectedOption": "project-summary"
    }
  }
}
```

---

## 새로운 페이지 추가 방법

다른 페이지(예: `/settings`)에도 리뷰를 수집하려면:

### 1. 설정 파일 수정
`src/config/constants.ts` 파일의 `reviewContexts`에 추가:

```typescript
export const reviewContexts: Record<string, PageReviewContext> = {
  // ... 기존 항목
  settings: {
    label: '가장 유용한 설정 항목',
    placeholder: '설정 항목을 선택하세요',
    options: [
      { value: 'profile', label: '프로필 설정' },
      { value: 'notifications', label: '알림 설정' },
      { value: 'appearance', label: '테마 설정' },
      // ...
    ],
  },
};
```

### 2. 배너 생성
```sql
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,  -- page_visit:/settings
  webhook_url,
  action_type,
  is_active,
  priority,
  reset_period
) VALUES (
  'notice',
  '설정 페이지가 편리한가요?',
  'user_action',
  'page_visit:/settings',
  'https://your-webhook-endpoint.com/reviews',
  'review',
  true,
  100,
  'never'
);
```

### 3. 자동 동작
- 시스템이 자동으로 `reviewContexts.settings` 조회
- UI에 설정 항목 선택 필드 표시
- 웹훅 페이로드에 `context.page = "settings"` 포함

---

## 모범 사례

### 1. 배너 메시지 작성
- ✅ "대시보드가 사용하기 편리한가요?"
- ✅ "가장 유용한 기능을 알려주세요!"
- ❌ "별점을 남겨주세요" (일반적, 맥락 부족)

### 2. reset_period 선택
- **never**: 중요한 일회성 피드백 (예: 첫 사용 경험)
- **weekly**: 정기적 만족도 추적
- **monthly**: 장기 트렌드 분석

### 3. 우선순위 (priority)
- 낮을수록 높은 우선순위 (0 > 100)
- 중요한 리뷰: 50
- 일반 리뷰: 100
- 선택적 리뷰: 200

### 4. 웹훅 엔드포인트
- HTTPS 필수
- 빠른 응답 권장 (< 3초)
- 실패 시 재시도 로직 고려

---

## 문제 해결

### 선택 필드가 표시되지 않음
1. `trigger_action`이 `page_visit:{경로}` 형식인지 확인
2. `action_type`이 `'review'`인지 확인
3. `reviewContexts`에 해당 페이지가 정의되어 있는지 확인

### 웹훅이 전송되지 않음
1. `webhook_url`이 유효한 HTTPS URL인지 확인
2. 브라우저 콘솔에서 네트워크 에러 확인
3. `/api/notification-banner/webhook` 라우트 동작 확인

### 리뷰가 중복 제출됨
- `interacted` 필드가 true로 설정되면 배너가 영구적으로 숨겨집니다
- 웹훅 성공 시 자동으로 처리됨

---

## 추가 정보

- **소스 코드**: `src/components/ui/notification-banner.tsx`
- **타입 정의**: `src/types/notification-banner.ts`
- **설정 파일**: `src/config/constants.ts`
- **마이그레이션**: `supabase/migrations/20251020_01_add_action_type_to_notification_banners.sql`
