# src/lib/storage/types/entities - 엔티티 타입

## 라인 가이드
- 012~014: 디렉토리 목적
- 015~018: 핵심 책임
- 019~021: 구조 요약
- 022~145: 파일 라인 맵
- 146~148: 중앙화·모듈화·캡슐화
- 149~152: 작업 규칙
- 153~157: 관련 문서

## 디렉토리 목적
각 도메인 엔티티(User, Project, Client 등)의 타입과 스키마를 정의합니다.

## 핵심 책임
- 엔티티별 타입·검증 스키마·기본값 정의
- Supabase와 StorageManager가 호환되는 구조 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- activity-log.ts 24~43 export ActivityType - 활동 타입 정의 - create: 생성 - update: 수정 - delete: 삭제 - complete: 완료 - comment: 댓글 (향후 구현) - document: 문서 관련 - view: 조회 (선택사항) - export: 내보내기 (선택사항) - share: 공유 (선택사항)
- activity-log.ts 44~54 export ActivityEntityType - 활동 대상 엔티티 타입 - project: 프로젝트 - task: 할일/태스크 - event: 캘린더 일정 - document: 문서 - client: 클라이언트 - settings: 설정
- activity-log.ts 55~87 export ActivityLog - ActivityLog 엔티티 인터페이스
- activity-log.ts 088~108 export CreateActivityLogInput - ActivityLog 생성 입력 타입
- activity-log.ts 109~135 export ActivityLogFilter - ActivityLog 필터 옵션
- activity-log.ts 136~159 export isActivityLog - ActivityLog 타입 가드
- activity-log.ts 160~162 export isActivityLogArray - ActivityLog 배열 타입 가드
- client.ts 20~39 export ClientAddress - Client address information
- client.ts 40~59 export ClientContact - Client contact person
- client.ts 060~146 export Client - Client entity
- client.ts 147~166 export isClientAddress - Type guard for ClientAddress
- client.ts 167~178 export isClientContact - Type guard for ClientContact
- client.ts 179~230 export isClient - Type guard for Client
- client.ts 231~235 export ClientUpdate - Partial client type for updates
- client.ts 236~236 export ClientCreate - Client creation payload (without auto-generated fields)
- document.ts 14~18 export DocumentType - Document type
- document.ts 19~23 export DocumentStatus - Document status
- document.ts 24~28 export DocumentSource - Document source
- document.ts 29~42 export DocumentSignature - Document signature information
- document.ts 043~126 export Document - Document entity
- document.ts 127~138 export isDocumentSignature - Type guard for DocumentSignature
- document.ts 139~192 export isDocument - Type guard for Document
- document.ts 193~199 export DocumentUpdate - Partial document type for updates
- document.ts 200~200 export DocumentCreate - Document creation payload (without auto-generated fields)
- event.ts 14~18 export EventType - Event type
- event.ts 19~23 export EventCategory - Event category
- event.ts 24~28 export EventStatus - Event status
- event.ts 29~33 export AttendeeStatus - Attendee response status
- event.ts 34~38 export ReminderType - Reminder type
- event.ts 39~43 export EventRecurringPattern - Recurring pattern
- event.ts 44~57 export EventAttendee - Event attendee
- event.ts 58~68 export EventReminder - Event reminder
- event.ts 69~88 export EventRecurring - Recurring event configuration
- event.ts 089~202 export CalendarEvent - CalendarEvent entity
- event.ts 203~214 export isEventAttendee - Type guard for EventAttendee
- event.ts 215~228 export isEventReminder - Type guard for EventReminder
- event.ts 229~242 export isEventRecurring - Type guard for EventRecurring
- event.ts 243~318 export isCalendarEvent - Type guard for CalendarEvent
- event.ts 319~325 export CalendarEventUpdate - Partial event type for updates
- event.ts 326~329 export CalendarEventCreate - Event creation payload (without auto-generated fields)
- project.ts 23~31 export SettlementMethod - Settlement method for project payments
- project.ts 32~44 export PaymentStatus - Payment status tracking
- project.ts 45~49 export WBSTaskStatus - WBS task status
- project.ts 50~85 export WBSTask - WBS task item
- project.ts 086~102 export DocumentStatus - Individual document status
- project.ts 103~122 export ProjectDocumentStatus - Project document status (comprehensive)
- project.ts 123~142 export DocumentInfo - Document basic information
- project.ts 143~162 export EstimateInfo - Estimate information
- project.ts 163~202 export ContractInfo - Contract information
- project.ts 203~238 export BillingInfo - Billing/Settlement information
- project.ts 239~249 export ProjectStatus - Project status
- project.ts 250~254 export ProjectPriority - Project priority
- project.ts 255~259 export ProjectVisibility - Project visibility
- project.ts 260~423 export Project - Project entity
- project.ts 424~452 export isWBSTask - Type guard for WBSTask
- project.ts 453~609 export isProject - Type guard for Project
- project.ts 610~614 export ProjectUpdate - Partial project type for updates
- project.ts 615~619 export ProjectCreate - Project creation payload (without auto-generated fields)
- project.ts 620~623 export ProjectListItem - Project list item (without heavy lazy-loaded fields)
- settings.ts 15~19 export Theme - Theme option
- settings.ts 20~24 export CalendarView - Calendar view option
- settings.ts 25~29 export WeekStartDay - Week start day (0: Sunday, 1: Monday)
- settings.ts 30~34 export ProjectView - Project view option
- settings.ts 35~39 export SortField - Sort field option
- settings.ts 40~44 export SortOrder - Sort order option
- settings.ts 45~49 export Language - Language option
- settings.ts 50~54 export TimeFormat - Time format option
- settings.ts 55~71 export WidgetPosition - Dashboard widget position
- settings.ts 72~90 export DashboardWidget - Dashboard widget
- settings.ts 091~107 export DashboardLayout - Dashboard layout configuration @deprecated Use DashboardData from DashboardService instead This interface is kept for backward compatibility only
- settings.ts 108~120 export WorkingHours - Working hours configuration
- settings.ts 121~131 export DashboardSettings - Dashboard settings @deprecated Use DashboardData from DashboardService instead This interface is kept for backward compatibility only
- settings.ts 132~151 export CalendarSettings - Calendar settings
- settings.ts 152~168 export ProjectSettings - Project settings
- settings.ts 169~194 export NotificationSettings - Notification settings
- settings.ts 195~217 export UserPreferences - User preferences
- settings.ts 218~250 export Settings - Settings entity
- settings.ts 251~268 export isWidgetPosition - Type guard for WidgetPosition
- settings.ts 269~284 export isDashboardWidget - Type guard for DashboardWidget
- settings.ts 285~302 export isDashboardLayout - Type guard for DashboardLayout
- settings.ts 303~330 export isDashboardData - Type guard for DashboardData (new format) Validates dashboard with widgets and config structure
- settings.ts 331~346 export isDashboardSettings - Type guard for DashboardSettings (legacy format) @deprecated Use isDashboardData instead This function is kept for backward compatibility only
- settings.ts 347~360 export isWorkingHours - Type guard for WorkingHours
- settings.ts 361~382 export isCalendarSettings - Type guard for CalendarSettings
- settings.ts 383~411 export isProjectSettings - Type guard for ProjectSettings
- settings.ts 412~431 export isNotificationSettings - Type guard for NotificationSettings
- settings.ts 432~452 export isUserPreferences - Type guard for UserPreferences
- settings.ts 453~481 export isSettings - Type guard for Settings
- settings.ts 482~482 export SettingsUpdate - Partial settings type for updates
- task.ts 19~23 export TaskStatus - Task status
- task.ts 24~28 export TaskPriority - Task priority
- task.ts 29~33 export RecurringPattern - Recurring pattern
- task.ts 34~50 export TaskAttachment - Task attachment information
- task.ts 51~67 export TaskRecurring - Recurring task configuration
- task.ts 068~184 export Task - Task entity
- task.ts 185~196 export isTaskAttachment - Type guard for TaskAttachment
- task.ts 197~208 export isTaskRecurring - Type guard for TaskRecurring
- task.ts 209~368 export isTask - Type guard for Task
- task.ts 369~373 export TaskUpdate - Partial task type for updates
- task.ts 374~374 export TaskCreate - Task creation payload (without auto-generated fields)
- tax-schedule.ts 14~24 export TaxCategory - Tax category types
- tax-schedule.ts 25~33 export TaxScheduleType - Tax schedule type
- tax-schedule.ts 034~103 export TaxSchedule - TaxSchedule entity
- tax-schedule.ts 104~120 export isTaxCategory - Type guard for TaxCategory
- tax-schedule.ts 121~130 export isTaxScheduleType - Type guard for TaxScheduleType
- tax-schedule.ts 131~166 export isTaxSchedule - Type guard for TaxSchedule
- tax-schedule.ts 167~173 export TaxScheduleUpdate - Partial tax schedule type for updates
- tax-schedule.ts 174~185 export TaxScheduleCreate - Tax schedule creation payload (without auto-generated fields)
- tax-schedule.ts 186~201 export getTaxCategoryName - Get Korean category name
- tax-schedule.ts 202~215 export getTaxTypeName - Get Korean type name
- tax-schedule.ts 216~227 export getTaxCategoryColor - Get category color
- todo-section.ts 14~65 export TodoSection - TodoSection entity
- todo-section.ts 66~96 export isTodoSection - Type guard for TodoSection
- todo-section.ts 097~101 export TodoSectionUpdate - Partial TodoSection type for updates
- todo-section.ts 102~102 export TodoSectionCreate - TodoSection creation payload (without auto-generated fields)
- user.ts 13~17 export BusinessType - Business type for users
- user.ts 18~26 export UserMetadata - User metadata
- user.ts 27~76 export User - User entity representing application users
- user.ts 077~115 export isUser - Type guard to check if data is a valid User @param data - Unknown data to validate @returns True if data conforms to User interface
- user.ts 116~141 export isUserMetadata - Validate user metadata structure @param metadata - Metadata object to validate @returns True if metadata is valid
- user.ts 142~146 export UserUpdate - Partial user type for updates
- user.ts 147~147 export UserCreate - User creation payload (without auto-generated fields)

## 중앙화·모듈화·캡슐화
- 엔티티 구조는 entities 디렉터리에서만 정의하고 외부에서 재정의하지 않음

## 작업 규칙
- 엔티티 필드 변경 시 서비스·마이그레이션·UI 문서를 업데이트
- Supabase 스키마와 구조가 일치하는지 검증

## 관련 문서
- src/lib/storage/types/claude.md
- src/lib/storage/services/claude.md
- supabase/migrations/claude.md
