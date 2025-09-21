/**
 * UI 상수 및 매직 넘버 중앙화
 * 반복되는 값들과 매직 넘버들을 상수로 관리
 */

// 레이아웃 크기
export const layout = {
  container: {
    maxWidth: "980px",        // max-w-[980px]
    textMaxWidth: "750px",    // max-w-[750px]
    navigationWidth: "256px"   // w-64
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
    card: "text-lg font-semibold"
  },
  text: {
    body: "text-lg text-muted-foreground sm:text-xl",
    description: "text-sm text-muted-foreground",
    button: "text-sm font-medium"
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