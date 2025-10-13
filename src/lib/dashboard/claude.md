# src/lib/dashboard - 대시보드 서비스

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~19: 핵심 책임
- 20~22: 구조 요약
- 23~60: 파일 라인 맵
- 61~63: 중앙화·모듈화·캡슐화
- 64~67: 작업 규칙
- 68~72: 관련 문서

## 디렉토리 목적
대시보드 위젯을 위한 데이터 헬퍼, 레이아웃 유틸, 애니메이션 프리셋을 제공합니다.

## 핵심 책임
- grid-utils로 반응형 레이아웃 계산
- widget-defaults로 초깃값 제공
- ios-animations로 모션 프리셋 노출

## 구조 요약
- ios-animations/: 애니메이션 설정 (→ src/lib/dashboard/ios-animations/claude.md)

## 파일 라인 맵
- grid-utils.ts 09~18 export GridPosition - 단순화된 그리드 아이템 위치 인터페이스
- grid-utils.ts 19~30 export GridBounds - 그리드 아이템 경계 정보
- grid-utils.ts 31~42 export GridConfig - 그리드 설정
- grid-utils.ts 43~56 export positionToBounds - GridPosition을 GridBounds로 변환
- grid-utils.ts 57~76 export checkCollision - 두 그리드 영역이 겹치는지 확인
- grid-utils.ts 77~94 export getCollisions - 현재 아이템과 충돌하는 아이템들의 인덱스를 반환
- grid-utils.ts 095~114 export checkCollisionWithItems - 여러 아이템과의 충돌 체크
- grid-utils.ts 115~138 export isWithinBounds - 그리드 경계 내에 있는지 확인
- grid-utils.ts 139~167 export constrainToBounds - 그리드 위치를 경계 내로 조정
- grid-utils.ts 168~210 export findEmptySpace - 빈 공간 찾기
- grid-utils.ts 211~314 export compactLayout - 컴팩트 레이아웃 생성 (충돌 해결 + 빈 공간 제거) 겹쳐있는 위젯들을 분리하고, 모든 위젯을 상단으로 정렬
- grid-utils.ts 315~329 export pixelsToGrid - 픽셀 좌표를 그리드 좌표로 변환
- grid-utils.ts 330~346 export gridToPixels - 그리드 좌표를 픽셀 좌표로 변환
- grid-utils.ts 347~371 export deltaToGrid - 드래그 델타를 그리드 단위로 변환
- grid-utils.ts 372~403 export getOverlapRatio - 두 위젯의 겹침 비율 계산
- grid-utils.ts 404~432 export canSwapWidgets - 위젯 스왑 가능 여부 확인
- grid-utils.ts 433~516 export optimizeLayout - 최적화된 레이아웃 생성 (좌우 공간 활용) 위젯들을 좌상단부터 채워나가며 빈 공간을 최소화
- grid-utils.ts 517~548 export getTransformStyle - CSS Transform 스타일 생성 (성능 최적화)
- ios-animations.ts 12~39 export wiggleAnimation - Wiggle 애니메이션 설정 iOS 홈 화면의 앱 아이콘 흔들림 효과 재현
- ios-animations.ts 40~49 export dragSpringTransition - 드래그 스프링 애니메이션 설정
- ios-animations.ts 50~63 export dragStartAnimation - 드래그 시작 시 애니메이션
- ios-animations.ts 64~74 export dragEndAnimation - 드래그 종료 시 애니메이션
- ios-animations.ts 75~84 export layoutTransition - 재배치 트랜지션 효과
- ios-animations.ts 085~106 export enterEditModeAnimation - 편집 모드 진입 애니메이션
- ios-animations.ts 107~137 export deleteButtonAnimation - 삭제 버튼 애니메이션
- ios-animations.ts 138~168 export resizeHandleAnimation - 리사이즈 핸들 애니메이션
- ios-animations.ts 169~197 export addWidgetAnimation - 위젯 추가 애니메이션
- ios-animations.ts 198~219 export pageTransition - 페이지 전환 애니메이션
- widget-defaults.ts 06~07 export WidgetType - 위젯 기본 크기 설정 대시보드 위젯들의 기본 크기를 정의합니다.
- widget-defaults.ts 08~20 export WidgetDefaultSize
- widget-defaults.ts 021~106 export WIDGET_DEFAULT_SIZES - 위젯 타입별 기본 크기 설정 9x9 그리드 기준으로 정의
- widget-defaults.ts 107~114 export getDefaultWidgetSize - 위젯 타입에 따른 기본 크기 반환
- widget-defaults.ts 115~140 export getRecommendedPosition - 위젯 타입에 따른 추천 위치 반환 최적의 레이아웃을 위한 기본 위치 제안
- widget-defaults.ts 141~170 export getResponsiveWidgetSize - 반응형 크기 조정 화면 크기에 따라 위젯 크기를 자동 조정
- widget-defaults.ts 171~192 export isValidWidgetSize - 위젯 크기 유효성 검증
- widget-defaults.ts 193~210 export constrainWidgetSize - 위젯 크기 제약 적용 최소/최대 크기 범위 내로 제한

## 중앙화·모듈화·캡슐화
- 레이아웃과 애니메이션 상수는 이 디렉터리에서만 정의

## 작업 규칙
- 위젯 레이아웃 변경 시 grid 유틸과 기본값을 검토
- 애니메이션 추가 시 ios-animations와 컴포넌트 문서를 업데이트

## 관련 문서
- src/lib/claude.md
- src/components/dashboard/claude.md
- src/app/dashboard/claude.md
