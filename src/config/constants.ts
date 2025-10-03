/**
 * UI 상수 및 매직 넘버 중앙화
 * 반복되는 값들과 매직 넘버들을 상수로 관리
 */

// 레이아웃 크기
export const layout = {
  container: {
    maxWidth: "980px",        // max-w-[980px]
    textMaxWidth: "750px",    // max-w-[750px]
    navigationWidth: "256px",  // w-64
    pageMaxWidth: "1300px"    // max-w-[1300px] - 페이지 컨테이너 최대 폭
  },
  page: {
    container: "container mx-auto",             // 모든 페이지의 기본 컨테이너
    padding: {
      default: "px-4 py-6 sm:px-6 lg:px-12 lg:py-8",   // 프로젝트 페이지 기준 기본 여백
      compact: "px-4 py-4 sm:px-5 lg:px-10 lg:py-6",   // 공간이 협소한 모드
      relaxed: "px-4 py-8 sm:px-8 lg:px-16 lg:py-12"   // 히어로/프리미엄 섹션
    },
    section: {
      stack: "space-y-6 lg:space-y-8",                 // 수직 스택 간격
      gridGap: "gap-6 lg:gap-8"                         // Grid 간격
    },
    header: {
      block: "mb-6",                                    // 헤더와 본문 사이 여백
      actions: "gap-3",                                 // 액션 버튼 간격
      titleWithControls: "gap-4"                        // 제목과 컨트롤 사이 간격
    }
  },
  spacing: {
    section: {
      sm: "py-8",
      md: "py-12 md:pb-8",
      lg: "py-24 pb-20"
    },
    gap: {
      small: "gap-2",
      medium: "gap-4",
      large: "gap-8"
    },
    page: {
      paddingTop: "pt-6 lg:pt-10",     // 헤더 높이를 고려한 상단 패딩
      paddingX: "px-4 sm:px-6 lg:px-8", // 반응형 좌우 패딩
      paddingY: "py-6",                 // 상하 패딩
      contentGap: "space-y-6"           // 콘텐츠 간격
    }
  },
  heights: {
    button: "h-11",
    icon: "h-4 w-4",
    logoSmall: "w-8 h-8",
    logoMedium: "w-12 h-12",
    logoLarge: "w-16 h-16"
  }
} as const

// 호버 스타일 디자인 원칙
// IMPORTANT: 포인트 컬러 적용 시 항상 "흰색 배경(bg-primary-foreground) + Primary 텍스트 색상(text-primary)" 조합 사용
// accent 색상은 사용하지 않음 - 일관성 있는 UX를 위해 제거됨
export const hoverStyles = {
  // 드롭다운 및 선택 요소의 호버 효과
  dropdown: "hover:bg-primary-foreground hover:text-primary",
  // 버튼의 호버 효과
  buttonGhost: "hover:bg-primary-foreground hover:text-primary",
  // 포커스 스타일 (호버와 동일하게 적용)
  focus: "focus:bg-primary-foreground focus:text-primary",
  // 선택된 상태 표시 (연한 배경색 사용)
  selected: "bg-muted",
  // 활성 상태 표시
  active: "bg-muted text-foreground"
} as const

// UI 기본값
export const defaults = {
  progress: {
    initialValue: 65,
    min: 0,
    max: 100
  },
  animation: {
    duration: "duration-200",
    transition: "transition-all",
    spin: "animate-spin",
    loadingDuration: "duration-1000"
  },
  colors: {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background"
  }
} as const

// 타이포그래피
export const typography = {
  title: {
    hero: "text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]",
    section: "text-2xl font-bold text-primary",
    card: "text-lg font-semibold",
    page: "text-3xl font-bold",
    pageSection: "text-2xl",
    subsection: "text-lg",
    widget: "text-lg font-semibold"
  },
  text: {
    body: "text-lg text-muted-foreground sm:text-xl",
    description: "text-sm text-muted-foreground",
    button: "text-sm font-medium",
    subtitle: "text-muted-foreground mt-1",
    base: "text-base",
    small: "text-sm",
    xs: "text-xs",
    value: "text-xl font-bold",
    label: "text-sm font-medium"
  },
  widget: {
    title: "text-lg font-semibold",
    value: "text-xl font-bold",
    label: "text-sm text-muted-foreground",
    badge: "text-xs",
    caption: "text-xs text-muted-foreground",
    heading: "font-semibold text-sm text-foreground"
  },
  detail: {
    // 프로젝트 상세 정보 텍스트 스타일
    taskInfo: "text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-md cursor-help",
    taskInfoEmpty: "text-sm text-gray-500 dark:text-gray-400 font-medium",
    // 재사용 가능한 회색 텍스트 스타일
    secondaryText: "text-sm text-gray-500 dark:text-gray-400 font-medium",
    tertiaryText: "text-xs text-gray-500 dark:text-gray-400"
  }
} as const

// 반응형 브레이크포인트
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
} as const

// Z-index 계층
export const zIndex = {
  base: 0,
  dropdown: 10,
  overlay: 20,
  modal: 30,
  toast: 40
} as const

// 캘린더 컴포넌트 디자인 토큰
export const calendar = {
  sizes: {
    small: "h-8 w-8 text-xs",        // 작은 캘린더
    default: "h-9 w-9 text-sm",      // 기본 캘린더
    large: "h-11 w-11 text-base"     // 큰 캘린더
  },
  cell: {
    padding: "p-0",
    radius: "rounded-md",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    disabled: "opacity-50 cursor-not-allowed"
  },
  header: {
    height: "h-11",
    padding: "px-3 py-2",
    fontSize: "text-sm font-medium"
  },
  navigation: {
    buttonSize: "h-7 w-7",
    buttonPadding: "p-0",
    iconSize: "h-4 w-4"
  },
  day: {
    today: "bg-muted text-muted-foreground",
    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
    outside: "text-muted-foreground opacity-50",
    disabled: "text-muted-foreground opacity-50",
    range: {
      start: "day-range-start",
      end: "day-range-end",
      middle: "day-range-middle"
    }
  },
  variants: {
    compact: {
      cell: "h-8 w-8 text-xs",
      header: "h-9 px-2 py-1 text-xs"
    },
    comfortable: {
      cell: "h-12 w-12 text-base",
      header: "h-12 px-4 py-3 text-base"
    }
  }
} as const

// 차트 컴포넌트 디자인 토큰
export const chart = {
  container: {
    minHeight: "h-[200px]",
    defaultHeight: "h-[300px]",
    maxHeight: "h-[500px]",
    padding: "p-4",
    radius: "rounded-lg",
    background: "bg-card",
    border: "border border-border"
  },
  colors: {
    primary: "hsl(var(--chart-1))",
    secondary: "hsl(var(--chart-2))",
    tertiary: "hsl(var(--chart-3))",
    quaternary: "hsl(var(--chart-4))",
    quinary: "hsl(var(--chart-5))",
    palette: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
    ]
  },
  legend: {
    position: "bottom",
    padding: "pt-0",
    itemSpacing: "gap-2",
    iconSize: "h-3 w-3",
    fontSize: "text-sm",
    color: "hsl(var(--foreground))"
  },
  grid: {
    strokeColor: "hsl(var(--border))",
    strokeWidth: 1,
    strokeDasharray: "3 3"
  },
  axis: {
    fontSize: "12px",  // text-xs는 12px에 해당
    color: "hsl(var(--foreground))",
    tickMargin: 5  // 8px → 5px로 축소하여 라벨을 차트에 더 가깝게
  },
  tooltip: {
    background: "bg-background",
    border: "border border-border rounded-md shadow-md",
    padding: "px-3 py-1.5",
    fontSize: "text-xs"
  },
  variants: {
    minimal: {
      container: "p-2",
      height: "h-[200px]",
      showGrid: false
    },
    detailed: {
      container: "p-6",
      height: "h-[400px]",
      showGrid: true,
      showLegend: true
    }
  }
} as const

// 차트별 특화 설정
export const chartTypes = {
  bar: {
    defaultRadius: 4,
    spacing: 0.1,
    fillOpacity: 0.8
  },
  line: {
    defaultStroke: 2,
    defaultRadius: 4,
    smoothing: true
  },
  pie: {
    defaultRadius: 80,
    innerRadius: 0,
    labelOffset: 20
  },
  area: {
    defaultStroke: 2,
    fillOpacity: 0.3,
    gradientStops: 2
  }
} as const

// CSS 변수 직접 매핑 시스템 (Recharts 통합용)
export const cssVariables = {
  colors: {
    foreground: "hsl(var(--foreground))",
    background: "hsl(var(--background))",
    muted: "hsl(var(--muted-foreground))",
    primary: "hsl(var(--primary))",
    border: "hsl(var(--border))"
  },
  recharts: {
    tooltip: {
      textColor: "hsl(var(--foreground))",
      backgroundColor: "hsl(var(--background))",
      borderColor: "hsl(var(--border))"
    },
    legend: {
      textColor: "hsl(var(--foreground))",
      fontSize: "14px"
    },
    axis: {
      textColor: "hsl(var(--foreground))",
      fontSize: "12px"
    }
  }
} as const

// 위젯 색상 시스템 - 날씨 위젯 색상 추가
export const colors = {
  // 시맨틱 색상
  widget: {
    // 날씨 위젯 전용 그라데이션
    weather: {
      clear: 'from-blue-400/90 to-blue-600/90',
      partlyCloudy: 'from-blue-300/90 to-gray-400/90',
      cloudy: 'from-gray-400/90 to-gray-600/90',
      rain: 'from-gray-500/90 to-blue-700/90',
      snow: 'from-blue-200/90 to-gray-300/90',
      storm: 'from-gray-600/90 to-gray-900/90',
      fog: 'from-gray-300/90 to-gray-500/90',
      windy: 'from-blue-400/90 to-gray-500/90'
    },
    // 카드 헤더 색상
    header: {
      background: 'bg-muted/50',
      border: 'border-border',
      text: 'text-foreground'
    },
    // 컨텐츠 영역
    content: {
      background: 'bg-background',
      text: 'text-foreground',
      muted: 'text-muted-foreground'
    }
  }
} as const

// 플레이스홀더 아이콘 가이드라인
export const placeholderIcons = {
  button: {
    // Button 컴포넌트 내부에서 아이콘 사용 시 가이드라인
    usage: {
      // 호버 효과가 필요한 경우: 아이콘이 버튼의 호버 상태를 따라가도록 함
      withHover: {
        recommended: `className={layout.heights.icon}`,
        example: "Filter className={layout.heights.icon}",
        note: "버튼의 호버 시 text-primary 색상으로 자동 변경됨"
      },
      // 고정 색상이 필요한 경우: 호버 상태와 무관하게 일정한 색상 유지
      fixedColor: {
        recommended: `className={\`\${layout.heights.icon} text-muted-foreground\`}`,
        example: "ChevronDown className={`${layout.heights.icon} text-muted-foreground`}",
        note: "호버와 무관하게 muted 색상으로 고정"
      }
    }
  },
  standalone: {
    // Button 외부에서 사용할 때는 일반 크기 클래스 사용
    sizes: {
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-6 w-6"
    }
  },
  colors: {
    // 아이콘 색상 가이드라인
    primary: "text-primary",
    muted: "text-muted-foreground",
    accent: "text-accent-foreground",
    destructive: "text-destructive"
  },
  common: {
    // 자주 사용되는 플레이스홀더 아이콘들
    dropdown: ["ChevronDown", "ChevronUp"],
    navigation: ["Menu", "X"],
    actions: ["Plus", "Minus", "Edit", "Trash2"],
    status: ["Check", "AlertCircle", "Info"]
  }
} as const
