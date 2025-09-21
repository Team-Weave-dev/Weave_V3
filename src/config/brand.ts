/**
 * 브랜드 설정 중앙화
 * 모든 컴포넌트에서 일관된 브랜드명과 로고를 사용하기 위한 설정
 */

export const brand = {
  // 브랜드명
  name: {
    ko: "UI 컴포넌트 라이브러리",
    en: "UI Components Library"
  },

  // 회사명
  company: {
    ko: "Weave",
    en: "Weave"
  },

  // 설명
  description: {
    ko: "shadcn/ui 기반의 현대적인 React 컴포넌트 라이브러리입니다.",
    en: "Modern React UI components built with Next.js and shadcn/ui",
    extended: {
      ko: "재사용 가능하고 접근성이 뛰어난 컴포넌트들을 제공합니다.",
      en: "Provides reusable and accessible components."
    }
  },

  // 로고 경로
  logo: {
    favicon: "/favicon.ico",
    alt: {
      ko: "UI 컴포넌트 라이브러리 로고",
      en: "UI Components Library logo"
    }
  },

  // 메타데이터
  metadata: {
    title: {
      ko: "UI 컴포넌트 라이브러리",
      en: "UI Components Library"
    },
    description: {
      ko: "shadcn/ui 기반의 현대적인 React 컴포넌트 라이브러리",
      en: "Modern React UI components built with Next.js and shadcn/ui"
    }
  },

  // 저작권
  copyright: {
    ko: "© 2024 Weave. All rights reserved.",
    en: "© 2024 Weave. All rights reserved."
  }
} as const

// UI 텍스트 및 라벨
export const uiText = {
  buttons: {
    viewComponents: {
      ko: "컴포넌트 보기",
      en: "View Components"
    },
    loading: {
      ko: "로딩 중...",
      en: "Loading..."
    },
    submit: {
      ko: "제출",
      en: "Submit"
    },
    save: {
      ko: "저장",
      en: "Save"
    },
    cancel: {
      ko: "취소",
      en: "Cancel"
    },
    // 버튼 사이즈 레이블
    sizes: {
      default: { ko: "기본", en: "Default" },
      small: { ko: "작은", en: "Small" },
      large: { ko: "큰", en: "Large" }
    },
    // 버튼 변형 레이블
    variants: {
      primary: { ko: "Primary", en: "Primary" },
      secondary: { ko: "Secondary", en: "Secondary" },
      outline: { ko: "Outline", en: "Outline" },
      ghost: { ko: "Ghost", en: "Ghost" },
      link: { ko: "Link", en: "Link" },
      destructive: { ko: "Destructive", en: "Destructive" }
    }
  },
  navigation: {
    home: {
      ko: "홈",
      en: "Home"
    },
    docs: {
      ko: "문서",
      en: "Docs"
    },
    projects: {
      ko: "프로젝트",
      en: "Projects"
    },
    team: {
      ko: "팀",
      en: "Team"
    },
    activeProjects: {
      ko: "활성 프로젝트",
      en: "Active Projects"
    },
    activeProjectsDesc: {
      ko: "현재 진행 중인 프로젝트들",
      en: "Currently ongoing projects"
    }
  },
  notifications: {
    title: {
      ko: "알림",
      en: "Notification"
    },
    center: {
      ko: "알림 센터",
      en: "Notification Center"
    },
    systemSuccess: {
      ko: "중앙화된 컴포넌트 시스템이 성공적으로 작동 중입니다!",
      en: "Centralized component system is working successfully!"
    }
  },
  badges: {
    shadcnBased: {
      ko: "shadcn 기반",
      en: "shadcn based"
    }
  },

  // 컴포넌트 데모 텍스트
  componentDemo: {
    cards: {
      interactive: { ko: "인터랙티브 카드", en: "Interactive Card" },
      hoverEffect: { ko: "호버 효과 카드", en: "Hover Effect Card" },
      hoverDescription: { ko: "호버 시 애니메이션 효과", en: "Animation on hover" },
      hoverInstruction: { ko: "마우스를 올려보세요! 부드러운 애니메이션을 확인할 수 있습니다.", en: "Hover over me! Check out the smooth animation." },
      fastSpeed: { ko: "빠른 속도", en: "Fast Speed" },
      fastSpeedDesc: { ko: "최적화된 성능", en: "Optimized Performance" },
      easySetup: { ko: "쉬운 설정", en: "Easy Setup" },
      easySetupDesc: { ko: "간편한 커스터마이징", en: "Simple Customization" },
      teamCollaboration: { ko: "팀 협업", en: "Team Collaboration" },
      teamCollaborationDesc: { ko: "실시간 협업", en: "Real-time Collaboration" },
      iconCards: { ko: "아이콘 카드", en: "Icon Cards" }
    },
    forms: {
      projectCreate: { ko: "프로젝트 생성 폼", en: "Create Project Form" },
      projectCreateDesc: { ko: "새 프로젝트를 생성하는 폼 예시", en: "Example form for creating a new project" },
      projectName: { ko: "프로젝트 이름", en: "Project Name" },
      projectNamePlaceholder: { ko: "프로젝트 이름을 입력하세요", en: "Enter project name" },
      projectType: { ko: "프로젝트 유형", en: "Project Type" },
      selectType: { ko: "유형 선택", en: "Select Type" },
      projectDescription: { ko: "프로젝트 설명", en: "Project Description" },
      projectDescPlaceholder: { ko: "프로젝트에 대한 설명을 입력하세요...", en: "Enter project description..." },
      publicProject: { ko: "공개 프로젝트로 설정", en: "Set as Public Project" },
      createButton: { ko: "프로젝트 생성", en: "Create Project" },
      webApp: { ko: "웹 애플리케이션", en: "Web Application" },
      mobileApp: { ko: "모바일 앱", en: "Mobile App" },
      desktopApp: { ko: "데스크톱 앱", en: "Desktop App" }
    },
    buttons: {
      variantDescription: {
        default: {
          ko: "흰색 배경 + 검은색 텍스트 + 회색 테두리 → 호버 시 Primary 색상 텍스트 + Primary 테두리",
          en: "White background + Black text + Gray border → Primary color text + Primary border on hover"
        },
        outline: {
          ko: "Outline: 투명 배경 + 회색 테두리 → 호버 시 흰색 배경 + Primary 텍스트 + Primary 테두리",
          en: "Outline: Transparent background + Gray border → White background + Primary text + Primary border on hover"
        },
        ghost: {
          ko: "Ghost: 완전 투명 → 호버 시 미묘한 배경 + Primary 텍스트",
          en: "Ghost: Fully transparent → Subtle background + Primary text on hover"
        }
      }
    },
    navigation: {
      menuExample: { ko: "상단 메뉴 예시", en: "Top Menu Example" },
      menuDescription: {
        ko: "헤더의 메뉴를 확인해보세요: \"홈\", \"문서\", \"팀\"은 드롭다운 아이콘이 없고, \"프로젝트\"만 드롭다운 아이콘이 표시됩니다.",
        en: "Check the header menu: \"Home\", \"Docs\", \"Team\" have no dropdown icon, only \"Projects\" shows a dropdown icon."
      }
    },
    chartData: {
      months: {
        january: { ko: "1월", en: "Jan" },
        february: { ko: "2월", en: "Feb" },
        march: { ko: "3월", en: "Mar" },
        april: { ko: "4월", en: "Apr" },
        may: { ko: "5월", en: "May" },
        june: { ko: "6월", en: "Jun" }
      },
      weekdays: {
        monday: { ko: "월", en: "Mon" },
        tuesday: { ko: "화", en: "Tue" },
        wednesday: { ko: "수", en: "Wed" },
        thursday: { ko: "목", en: "Thu" },
        friday: { ko: "금", en: "Fri" },
        saturday: { ko: "토", en: "Sat" },
        sunday: { ko: "일", en: "Sun" }
      },
      categories: {
        work: { ko: "업무", en: "Work" },
        personal: { ko: "개인", en: "Personal" },
        meeting: { ko: "회의", en: "Meeting" },
        other: { ko: "기타", en: "Other" }
      }
    },
    status: {
      title: {
        ko: "상태 표시 컴포넌트",
        en: "Status Indicator Component"
      },
      description: {
        ko: "상태별 피드백을 나타내는 요소들",
        en: "Elements showing status-specific feedback"
      },
      active: {
        ko: "활성",
        en: "Active"
      },
      online: {
        ko: "온라인",
        en: "Online"
      },
      offline: {
        ko: "오프라인",
        en: "Offline"
      },
      pending: {
        ko: "대기 중",
        en: "Pending"
      },
      completed: {
        ko: "완료",
        en: "Completed"
      },
      error: {
        ko: "오류",
        en: "Error"
      },
      success: {
        ko: "성공",
        en: "Success"
      },
      warning: {
        ko: "경고",
        en: "Warning"
      },
      info: {
        ko: "정보",
        en: "Info"
      },
      default: {
        ko: "기본",
        en: "Default"
      },
      secondary: {
        ko: "보조",
        en: "Secondary"
      },
      outline: {
        ko: "외곽선",
        en: "Outline"
      },
      destructive: {
        ko: "위험",
        en: "Destructive"
      }
    },
    // 프로젝트 관리 상태
    projectStatus: {
      title: {
        ko: "프로젝트 상태",
        en: "Project Status"
      },
      description: {
        ko: "프로젝트 진행 상태를 나타내는 배지",
        en: "Badges showing project progress status"
      },
      review: {
        ko: "검토",
        en: "Review"
      },
      complete: {
        ko: "완료",
        en: "Complete"
      },
      cancelled: {
        ko: "취소",
        en: "Cancelled"
      },
      planning: {
        ko: "기획",
        en: "Planning"
      },
      onHold: {
        ko: "보류",
        en: "On Hold"
      },
      inProgress: {
        ko: "진행중",
        en: "In Progress"
      }
    },
    // 색상 팔레트 시스템
    colorPalette: {
      title: {
        ko: "색상 팔레트",
        en: "Color Palette"
      },
      description: {
        ko: "애플리케이션 전체 색상 테마를 변경합니다",
        en: "Change the application color theme"
      },
      select: {
        ko: "색상 팔레트 선택",
        en: "Select Color Palette"
      },
      currentPalette: {
        ko: "현재 팔레트",
        en: "Current Palette"
      },
      preview: {
        ko: "미리보기",
        en: "Preview"
      },
      semanticColors: {
        ko: "시맨틱 상태 색상",
        en: "Semantic State Colors"
      },
      projectColors: {
        ko: "프로젝트 상태 색상",
        en: "Project State Colors"
      }
    },
    // 뷰 모드 시스템
    viewMode: {
      title: {
        ko: "뷰 모드",
        en: "View Mode"
      },
      description: {
        ko: "컴포넌트 표시 방식을 선택합니다",
        en: "Choose how to display components"
      },
      listView: {
        ko: "리스트 뷰",
        en: "List View"
      },
      detailView: {
        ko: "상세 뷰",
        en: "Detail View"
      },
      switchToList: {
        ko: "리스트 뷰로 전환",
        en: "Switch to List View"
      },
      switchToDetail: {
        ko: "상세 뷰로 전환",
        en: "Switch to Detail View"
      }
    }
  },

  // 캘린더 관련 텍스트
  calendar: {
    title: {
      ko: "캘린더 컴포넌트",
      en: "Calendar Component"
    },
    description: {
      ko: "날짜 선택 및 관리",
      en: "Date selection and management"
    },
    selectedDate: {
      ko: "선택된 날짜 정보",
      en: "Selected Date Info"
    },
    selectDate: {
      ko: "날짜를 선택해주세요.",
      en: "Please select a date."
    },
    year: {
      ko: "년",
      en: "Year"
    },
    month: {
      ko: "월",
      en: "Month"
    },
    day: {
      ko: "일",
      en: "Day"
    },
    weekday: {
      ko: "요일",
      en: "Weekday"
    }
  },

  // 차트 관련 텍스트
  charts: {
    title: {
      ko: "차트 컴포넌트",
      en: "Chart Components"
    },
    description: {
      ko: "데이터 시각화 도구",
      en: "Data visualization tools"
    },
    barChart: {
      title: {
        ko: "월별 이벤트 수",
        en: "Monthly Events"
      },
      description: {
        ko: "각 월별 이벤트 발생 현황",
        en: "Monthly event occurrence status"
      }
    },
    lineChart: {
      title: {
        ko: "요일별 활동량",
        en: "Daily Activity"
      },
      description: {
        ko: "주간 활동량 변화 추이",
        en: "Weekly activity trend"
      }
    },
    pieChart: {
      title: {
        ko: "카테고리별 분포",
        en: "Category Distribution"
      },
      description: {
        ko: "업무 카테고리별 시간 분배",
        en: "Time allocation by work category"
      }
    },
    statistics: {
      title: {
        ko: "주요 통계",
        en: "Key Statistics"
      },
      totalEvents: {
        ko: "총 이벤트",
        en: "Total Events"
      },
      monthlyAverage: {
        ko: "월평균",
        en: "Monthly Avg"
      },
      busiestDay: {
        ko: "가장 바쁜 날",
        en: "Busiest Day"
      },
      averageLength: {
        ko: "평균 길이",
        en: "Average Length"
      },
      friday: {
        ko: "금요일",
        en: "Friday"
      }
    }
  },

  // 사용법 안내 텍스트
  usage: {
    title: {
      ko: "사용법",
      en: "Usage Guide"
    },
    calendarUsage: {
      ko: "캘린더 컴포넌트",
      en: "Calendar Component"
    },
    chartUsage: {
      ko: "차트 컴포넌트들",
      en: "Chart Components"
    },
    features: {
      title: {
        ko: "디자인 시스템 특징",
        en: "Design System Features"
      },
      cva: {
        ko: "cva (class-variance-authority) 기반 variant 시스템",
        en: "cva (class-variance-authority) based variant system"
      },
      forwardRef: {
        ko: "forwardRef 패턴으로 완전한 ref 지원",
        en: "Complete ref support with forwardRef pattern"
      },
      typescript: {
        ko: "TypeScript 완전 지원 (100% 타입 안정성)",
        en: "Full TypeScript support (100% type safety)"
      },
      shadcn: {
        ko: "shadcn/ui 수준의 재사용 가능한 컴포넌트",
        en: "shadcn/ui level reusable components"
      },
      accessibility: {
        ko: "Radix UI 기반 접근성 (WCAG 2.1 AA 준수)",
        en: "Radix UI based accessibility (WCAG 2.1 AA compliant)"
      },
      designTokens: {
        ko: "중앙화된 디자인 토큰 시스템",
        en: "Centralized design token system"
      },
      variants: {
        ko: "다양한 variants (size, variant, animation 등)",
        en: "Various variants (size, variant, animation, etc.)"
      },
      customization: {
        ko: "커스터마이징 가능한 props와 스타일",
        en: "Customizable props and styles"
      }
    }
  },

  // 데이터 탭 확장 텍스트
  data: {
    calendarAndCharts: {
      ko: "캘린더 & 차트 컴포넌트",
      en: "Calendar & Chart Components"
    },
    calendarAndChartsDesc: {
      ko: "날짜 관리와 데이터 시각화를 위한 고급 컴포넌트들",
      en: "Advanced components for date management and data visualization"
    }
  }
} as const

// 라우트 경로
export const routes = {
  home: "/",
  components: "/components",
  docs: "/docs",
  projects: "/projects",
  team: "/team"
} as const

// 기본 언어 설정
export const defaultLanguage = 'ko' as const

// 헬퍼 함수들
export const getBrandName = (lang: 'ko' | 'en' = defaultLanguage) => brand.name[lang]
export const getCompanyName = (lang: 'ko' | 'en' = defaultLanguage) => brand.company[lang]
export const getDescription = (lang: 'ko' | 'en' = defaultLanguage) => brand.description[lang]
export const getExtendedDescription = (lang: 'ko' | 'en' = defaultLanguage) => brand.description.extended[lang]
export const getLogoAlt = (lang: 'ko' | 'en' = defaultLanguage) => brand.logo.alt[lang]
export const getCopyright = (lang: 'ko' | 'en' = defaultLanguage) => brand.copyright[lang]
export const getMetadata = (lang: 'ko' | 'en' = defaultLanguage) => {
  return {
    title: brand.metadata.title[lang],
    description: brand.metadata.description[lang]
  }
}

// UI 텍스트 헬퍼 함수들
export const getText = (path: string, lang: 'ko' | 'en' = defaultLanguage) => {
  const pathArray = path.split('.')
  let result: any = uiText

  for (const key of pathArray) {
    result = result[key]
    if (!result) return path // fallback to original path if not found
  }

  return result[lang] || result
}

// 버튼 텍스트 헬퍼들
export const getButtonText = {
  viewComponents: (lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.viewComponents[lang],
  loading: (lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.loading[lang],
  submit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.submit[lang],
  save: (lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.save[lang],
  cancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.cancel[lang],

  // 버튼 사이즈 헬퍼
  getSize: (size: 'default' | 'small' | 'large', lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.sizes[size][lang],

  // 버튼 변형 헬퍼
  getVariant: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive', lang: 'ko' | 'en' = defaultLanguage) => uiText.buttons.variants[variant][lang]
}

// 네비게이션 텍스트 헬퍼들
export const getNavText = {
  home: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.home[lang],
  docs: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.docs[lang],
  projects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.projects[lang],
  team: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.team[lang],
  activeProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.activeProjects[lang],
  activeProjectsDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.activeProjectsDesc[lang]
}

// 알림 텍스트 헬퍼들
export const getNotificationText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.notifications.title[lang],
  center: (lang: 'ko' | 'en' = defaultLanguage) => uiText.notifications.center[lang],
  systemSuccess: (lang: 'ko' | 'en' = defaultLanguage) => uiText.notifications.systemSuccess[lang]
}

// 배지 텍스트 헬퍼들
export const getBadgeText = {
  shadcnBased: (lang: 'ko' | 'en' = defaultLanguage) => uiText.badges.shadcnBased[lang]
}

// 캘린더 텍스트 헬퍼들
export const getCalendarText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.title[lang],
  description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.description[lang],
  selectedDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.selectedDate[lang],
  selectDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.selectDate[lang],
  year: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.year[lang],
  month: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.month[lang],
  day: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.day[lang],
  weekday: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendar.weekday[lang]
}

// 차트 텍스트 헬퍼들
export const getChartText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.title[lang],
  description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.description[lang],
  barChart: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.barChart.title[lang],
    description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.barChart.description[lang]
  },
  lineChart: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.lineChart.title[lang],
    description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.lineChart.description[lang]
  },
  pieChart: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.pieChart.title[lang],
    description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.pieChart.description[lang]
  },
  statistics: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.title[lang],
    totalEvents: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.totalEvents[lang],
    monthlyAverage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.monthlyAverage[lang],
    busiestDay: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.busiestDay[lang],
    averageLength: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.averageLength[lang],
    friday: (lang: 'ko' | 'en' = defaultLanguage) => uiText.charts.statistics.friday[lang]
  }
}

// 사용법 텍스트 헬퍼들
export const getUsageText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.title[lang],
  calendarUsage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.calendarUsage[lang],
  chartUsage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.chartUsage[lang],
  features: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.title[lang],
    cva: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.cva[lang],
    forwardRef: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.forwardRef[lang],
    typescript: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.typescript[lang],
    shadcn: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.shadcn[lang],
    accessibility: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.accessibility[lang],
    designTokens: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.designTokens[lang],
    variants: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.variants[lang],
    customization: (lang: 'ko' | 'en' = defaultLanguage) => uiText.usage.features.customization[lang]
  }
}

// 데이터 텍스트 헬퍼들
export const getDataText = {
  calendarAndCharts: (lang: 'ko' | 'en' = defaultLanguage) => uiText.data.calendarAndCharts[lang],
  calendarAndChartsDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.data.calendarAndChartsDesc[lang]
}

// 컴포넌트 데모 텍스트 헬퍼들
export const getComponentDemoText = {
  // Cards
  interactive: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.interactive[lang],
  hoverEffect: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.hoverEffect[lang],
  hoverDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.hoverDescription[lang],
  hoverInstruction: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.hoverInstruction[lang],
  fastSpeed: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.fastSpeed[lang],
  fastSpeedDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.fastSpeedDesc[lang],
  easySetup: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.easySetup[lang],
  easySetupDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.easySetupDesc[lang],
  teamCollaboration: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.teamCollaboration[lang],
  teamCollaborationDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.teamCollaborationDesc[lang],
  iconCards: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.cards.iconCards[lang],

  // Forms
  projectCreate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectCreate[lang],
  projectCreateDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectCreateDesc[lang],
  projectName: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectName[lang],
  projectNamePlaceholder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectNamePlaceholder[lang],
  projectType: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectType[lang],
  selectType: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.selectType[lang],
  projectDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectDescription[lang],
  projectDescPlaceholder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.projectDescPlaceholder[lang],
  publicProject: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.publicProject[lang],
  createProject: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.createButton[lang],
  webApp: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.webApp[lang],
  mobileApp: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.mobileApp[lang],
  desktopApp: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.forms.desktopApp[lang],

  // Buttons
  getVariantDescription: (variant: 'default' | 'outline' | 'ghost', lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.buttons.variantDescription[variant][lang]
  },

  // Navigation
  menuExample: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.navigation.menuExample[lang],
  menuDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.navigation.menuDescription[lang],

  // Chart Data
  getMonthName: (month: number, lang: 'ko' | 'en' = defaultLanguage) => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june'] as const
    const monthKey = months[month - 1]
    return monthKey ? uiText.componentDemo.chartData.months[monthKey][lang] : ''
  },
  getWeekday: (day: number, lang: 'ko' | 'en' = defaultLanguage) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
    const dayKey = days[day]
    return dayKey ? uiText.componentDemo.chartData.weekdays[dayKey][lang] : ''
  },
  getCategory: (category: 'work' | 'personal' | 'meeting' | 'other', lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.chartData.categories[category][lang]
  },

  // Status & Badge
  getStatusTitle: (lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.status.title[lang]
  },
  getStatusDescription: (lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.status.description[lang]
  },
  getStatusText: (status: 'active' | 'online' | 'offline' | 'pending' | 'completed' | 'error' | 'success' | 'warning' | 'info', lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.status[status][lang]
  },
  getBadgeVariant: (variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline', lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.status[variant][lang]
  },

  // Project Status
  getProjectStatusTitle: (lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.projectStatus.title[lang]
  },
  getProjectStatusDescription: (lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.projectStatus.description[lang]
  },
  getProjectStatus: (status: 'review' | 'complete' | 'cancelled' | 'planning' | 'onHold' | 'inProgress', lang: 'ko' | 'en' = defaultLanguage) => {
    return uiText.componentDemo.projectStatus[status][lang]
  }
}

// 색상 팔레트 텍스트 접근 함수
export const getPaletteText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.title[lang],
  description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.description[lang],
  select: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.select[lang],
  currentPalette: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.currentPalette[lang],
  preview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.preview[lang],
  semanticColors: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.semanticColors[lang],
  projectColors: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.colorPalette.projectColors[lang]
}

// 뷰 모드 텍스트 접근 함수
export const getViewModeText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.title[lang],
  description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.description[lang],
  listView: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.listView[lang],
  detailView: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.detailView[lang],
  switchToList: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.switchToList[lang],
  switchToDetail: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.switchToDetail[lang]
}