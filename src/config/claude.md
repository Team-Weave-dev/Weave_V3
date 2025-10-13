# src/config - 중앙 설정

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~020: 핵심 책임
- 021~023: 구조 요약
- 024~095: 파일 라인 맵
- 096~098: 중앙화·모듈화·캡슐화
- 099~102: 작업 규칙
- 103~107: 관련 문서

## 디렉토리 목적
브랜드, 경로, 레이아웃 등 전역 설정을 관리합니다.
하드코딩을 방지하고 일관된 UI·문구 경험을 제공합니다.

## 핵심 책임
- brand.ts로 텍스트·메타데이터 정의
- constants.ts로 레이아웃 및 기본값 관리
- 도메인 전용 설정 파일 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- brand.ts 07~23 Brand Identity - 브랜드명, 회사명, 소개 문구
- brand.ts 24~30 Theme Tokens - 프라이머리 색상 및 전역 텍스트 클래스
- brand.ts 31~38 Brand Assets - 로고와 파비콘 경로
- brand.ts 39~49 Metadata - SEO 타이틀/설명 텍스트
- brand.ts 50~56 Legal Notice - 저작권 문구
- brand.ts 57~58 UI Text Registry - 공통 UI 텍스트 모음
- brand.ts 59~92 UI Buttons - 기본 버튼 라벨, 크기 및 변형 텍스트
- brand.ts 093~135 UI Navigation - 상단 네비게이션 및 메뉴 텍스트
- brand.ts 136~150 Notifications - 시스템 알림 텍스트
- brand.ts 151~157 Badges - 배지 라벨 텍스트
- brand.ts 158~202 Auth Menu - 인증 및 계정 영역 텍스트
- brand.ts 203~233 Component Demo Sections - 데모 섹션 제목과 설명
- brand.ts 234~241 Layout Hero - 히어로 레이아웃 텍스트
- brand.ts 242~255 Demo Cards - 카드 컴포넌트 관련 문구
- brand.ts 256~271 Demo Forms - 폼 데모 텍스트
- brand.ts 272~288 Demo Button Variants - 데모 버튼 변형 설명
- brand.ts 289~296 Demo Navigation - 데모 네비게이션 안내
- brand.ts 297~322 Demo Chart Data - 차트 목데이터 라벨
- brand.ts 323~386 Demo Status - 상태 배지 텍스트
- brand.ts 387~422 Demo Project Status - 프로젝트 상태 배지
- brand.ts 423~997 Project Page Text - 프로젝트 페이지 텍스트
- brand.ts 0998~1028 Component Demo Color Palette - 색상 팔레트 텍스트
- brand.ts 1029~1057 Component Demo View Mode - 뷰 전환 텍스트
- brand.ts 1058~1093 Calendar Text - 캘린더 컴포넌트 라벨
- brand.ts 1094~1161 Chart Text - 차트 관련 라벨
- brand.ts 1162~1215 Usage Guide - 사용법 안내 텍스트
- brand.ts 1216~1227 Data Tab - 데이터 탭 확장 텍스트
- brand.ts 1228~1263 Project Status - 프로젝트 상태 라벨
- brand.ts 1264~1307 Calendar Widget - 일정 위젯 텍스트
- brand.ts 1308~1446 Settings Page - 사용자 설정 페이지 텍스트
- brand.ts 1447~1492 Storage Conflict Resolution - 저장소 충돌 해결 텍스트
- brand.ts 1493~1506 Route Map - 주요 네비게이션 경로 상수
- brand.ts 1507~1533 Header Navigation Config - 헤더 메뉴 구성 및 인증 액션
- brand.ts 1534~1536 Default Language - UI 기본 언어 코드
- brand.ts 1537~1551 Brand Helpers - 브랜드 및 메타데이터 조회
- brand.ts 1552~1564 UI Text Helpers - 경로 기반 텍스트 조회
- brand.ts 1565~1578 Button Text Helpers - 버튼 라벨 및 변형 조회
- brand.ts 1579~1592 Navigation Text Helpers - 네비게이션 라벨 조회
- brand.ts 1593~1606 Auth Text Helpers - 인증 및 계정 라벨
- brand.ts 1607~1613 Notification Text Helpers - 알림 메시지 라벨
- brand.ts 1614~1618 Badge Text Helpers - 배지 라벨
- brand.ts 1619~1630 Calendar Text Helpers - 캘린더 라벨
- brand.ts 1631~1656 Chart Text Helpers - 차트 라벨
- brand.ts 1657~1674 Usage Text Helpers - 사용 안내 라벨
- brand.ts 1675~1680 Data Text Helpers - 데이터 탭 라벨
- brand.ts 1681~2997 Component Demo Text Helpers - 데모 페이지 문구
- color-palette.ts 06~26 export ColorPalette - 색상 팔레트 시스템 사용자가 선택할 수 있는 다양한 색상 테마를 제공합니다.
- color-palette.ts 27~47 export softPalette - 연한 팔레트 (기본)
- color-palette.ts 48~68 export vividPalette - 선명한 팔레트
- color-palette.ts 69~89 export monochromePalette - 모노톤 팔레트
- color-palette.ts 090~110 export highContrastPalette - 고대비 팔레트 (접근성 최적화)
- color-palette.ts 111~131 export naturePalette - 네이처 팔레트 (자연 색상)
- color-palette.ts 132~140 export colorPalettes - 팔레트 컬렉션
- color-palette.ts 141~143 export defaultPalette - 기본 팔레트
- color-palette.ts 144~148 export getPalette - 팔레트 선택 함수
- color-palette.ts 149~177 export generateCSSVariables - CSS 변수 생성 함수
- constants.ts 07~60 export layout - 레이아웃 크기
- constants.ts 61~74 export hoverStyles - 호버 스타일 디자인 원칙 IMPORTANT: 포인트 컬러 적용 시 항상 "흰색 배경(bg-primary-foreground) + Primary 텍스트 색상(text-primary)" 조합 사용 accent 색상은 사용하지 않음 - 일관성 있는 UX를 위해 제거됨
- constants.ts 75~94 export defaults - UI 기본값
- constants.ts 095~134 export typography - 타이포그래피
- constants.ts 135~143 export breakpoints - 반응형 브레이크포인트
- constants.ts 144~152 export zIndex - Z-index 계층
- constants.ts 153~198 export calendar - 캘린더 컴포넌트 디자인 토큰
- constants.ts 199~262 export chart - 차트 컴포넌트 디자인 토큰
- constants.ts 263~286 export chartTypes - 차트별 특화 설정
- constants.ts 287~312 export cssVariables - CSS 변수 직접 매핑 시스템 (Recharts 통합용)
- constants.ts 313~342 export colors - 위젯 색상 시스템 - 날씨 위젯 색상 추가
- constants.ts 343~385 export placeholderIcons - 플레이스홀더 아이콘 가이드라인
- constants.ts 386~428 export plans - 요금제 시스템 (2025-10-07 추가)
- constants.ts 429~441 export usageLimits - 사용량 제한 관련 상수

## 중앙화·모듈화·캡슐화
- 모든 텍스트·경로는 config에서 시작하여 단일 진실 공급원을 보장

## 작업 규칙
- 설정 변경 시 영향을 받는 컴포넌트·서비스·문서를 점검
- 언어 키 구조(ko, en 등)를 유지

## 관련 문서
- CLAUDE.md
- src/components/claude.md
- src/lib/claude.md
