/**
 * 브랜드 설정 중앙화
 * 모든 컴포넌트에서 일관된 브랜드명과 로고를 사용하기 위한 설정
 */

export const brand = {
  // 브랜드명
  name: {
    ko: "Weave",
    en: "Weave"
  },

  // 회사명
  company: {
    ko: "Weave",
    en: "Weave"
  },

  // 설명
  description: {
    ko: "솔로프리너를 위한 완벽한 솔루션입니다.",
    en: "it's the perfect solution for solo entrepreneurs.",
    extended: {
      ko: "프리랜서와 1인 기업이 클라이언트, 프로젝트 관리, 세무 업무를 한 곳에서 해결할 수 있습니다.",
      en: "Freelancers and sole proprietors can manage clients, projects, and tax affairs all in one place."
    }
  },

  // 테마 설정
  theme: {
    primaryTextClass: "text-primary",
    primaryAccentGradient: "from-primary to-primary/60",
    avatarBackgroundClass: "bg-primary/10",
    avatarTextClass: "text-primary"
  },

  // 로고 경로
  logo: {
    favicon: "/favicon.ico",
    alt: {
      ko: "Weave 로고",
      en: "Weave logo"
    }
  },

  // 메타데이터
  metadata: {
    title: {
      ko: "Weave",
      en: "Weave"
    },
    description: {
      ko: "솔로프리너를 위한 완벽한 솔루션입니다.",
      en: "it's the perfect solution for solo entrepreneurs."
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
    dashboard: {
      ko: "대시보드",
      en: "Dashboard"
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
    taxManagement: {
      ko: "세무 신고",
      en: "Tax Management"
    },
    components: {
      ko: "컴포넌트",
      en: "Components"
    },
    activeProjects: {
      ko: "활성 프로젝트",
      en: "Active Projects"
    },
    activeProjectsDesc: {
      ko: "현재 진행 중인 프로젝트들",
      en: "Currently ongoing projects"
    },
    menuTitle: {
      ko: "메뉴",
      en: "Menu"
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
  auth: {
    login: {
      ko: "로그인",
      en: "Log In"
    },
    signup: {
      ko: "회원가입",
      en: "Sign Up"
    },
    logout: {
      ko: "로그아웃",
      en: "Log Out"
    },
    settings: {
      ko: "설정",
      en: "Settings"
    },
    account: {
      ko: "계정",
      en: "Account"
    },
    profile: {
      ko: "프로필",
      en: "Profile"
    },
    billing: {
      ko: "결제",
      en: "Billing"
    },
    usage: {
      ko: "사용량",
      en: "Usage"
    },
    plan: {
      ko: "요금제",
      en: "Plan"
    },
    profileMenu: {
      ko: "계정 메뉴",
      en: "Account Menu"
    }
  },

  // 컴포넌트 데모 텍스트
  componentDemo: {
    sections: {
      buttons: {
        title: { ko: "버튼 & 배지", en: "Buttons & Badges" },
        description: { ko: "상호작용 기본 컴포넌트를 한 눈에 살펴봅니다.", en: "Review the interactive primitives at a glance." }
      },
      forms: {
        title: { ko: "폼 입력 요소", en: "Form Inputs" },
        description: { ko: "입력 필드와 선택 컴포넌트를 조합한 기본 폼 레이아웃입니다.", en: "Core input and selection components arranged in a basic form layout." }
      },
      feedback: {
        title: { ko: "알림 & 피드백", en: "Feedback & Status" },
        description: { ko: "상태와 진행 상황을 전달하는 컴포넌트 모음입니다.", en: "Components that communicate status and progress." }
      },
      data: {
        title: { ko: "데이터 표시", en: "Data Display" },
        description: { ko: "테이블과 차트로 정보를 시각화합니다.", en: "Present information with tables and charts." }
      },
      layout: {
        title: { ko: "레이아웃 & 네비게이션", en: "Layout & Navigation" },
        description: { ko: "페이지 구조를 구성하는 핵심 컴포넌트입니다.", en: "Core components that build page structure." }
      },
      utilities: {
        title: { ko: "유틸리티 & 설정", en: "Utilities & Settings" },
        description: { ko: "팔레트 전환, 뷰 모드 토글 등 보조 기능 컴포넌트입니다.", en: "Supporting utilities like palette switching and view mode toggles." }
      },
      navigation: {
        title: { ko: "네비게이션 시스템", en: "Navigation System" },
        description: { ko: "헤더 네비게이션과 관련된 컴포넌트를 확인하세요.", en: "Explore header navigation and related components." }
      }
    },
    layoutHero: {
      centeredTitle: { ko: "히어로 · 중앙 CTA", en: "Hero · Centered CTA" },
      centeredDescription: {
        ko: "브랜드 메시지와 주/보조 버튼이 중앙에 배치된 히어로 스타일",
        en: "Hero layout with headline and primary/secondary CTAs centered"
      }
    },
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
    // 프로젝트 페이지 텍스트
    projectPage: {
      header: {
        title: { ko: "프로젝트 관리", en: "Project Management" },
        description: { ko: "모든 프로젝트를 관리하고 추적합니다", en: "Manage and track all your projects" },
        newProject: { ko: "새 프로젝트", en: "New Project" },
        previousProject: { ko: "이전 프로젝트", en: "Previous Project" },
        nextProject: { ko: "다음 프로젝트", en: "Next Project" }
      },
      stats: {
        total: { ko: "전체 프로젝트", en: "Total Projects" },
        planning: { ko: "기획", en: "Planning" },
        review: { ko: "검토", en: "Review" },
        inProgress: { ko: "진행중", en: "In Progress" },
        onHold: { ko: "보류", en: "On Hold" },
        cancelled: { ko: "취소", en: "Cancelled" },
        completed: { ko: "완료", en: "Completed" },
        monthlyRevenue: { ko: "예상 월 매출", en: "Expected Monthly Revenue" },
        selectMonth: { ko: "월 선택", en: "Select Month" },
        noProjects: { ko: "등록 프로젝트 없음", en: "No Projects" },
        projects: { ko: "개 프로젝트", en: " Projects" },
        // Tooltips for stats cards
        totalTooltip: { ko: "계정에 등록된 모든 프로젝트의 수", en: "Total number of projects registered in the account" },
        planningTooltip: { ko: "계약서와 금액 정보가 준비 중인 프로젝트의 수", en: "Number of projects with pending contract and amount information" },
        reviewTooltip: { ko: "계약서가 누락된 프로젝트의 수", en: "Number of projects missing contracts" },
        inProgressTooltip: { ko: "현재 진행 중인 프로젝트의 수", en: "Number of projects currently in progress" },
        onHoldTooltip: { ko: "일시 중단된 프로젝트의 수", en: "Number of projects temporarily on hold" },
        cancelledTooltip: { ko: "취소된 프로젝트의 수", en: "Number of cancelled projects" },
        completedTooltip: { ko: "완료된 프로젝트의 수", en: "Number of completed projects" },
        // New stats for refactored cards
        overview: { ko: "프로젝트 개요", en: "Project Overview" },
        overviewTooltipTitle: { ko: "프로젝트 통계 개요", en: "Project Statistics Overview" },
        overviewTooltipDescription: { ko: "전체 프로젝트 수와 6가지 상태별 프로젝트 분포를 한눈에 확인할 수 있습니다.", en: "View total project count and distribution across 6 status categories at a glance." },
        deadline: { ko: "마감일 임박", en: "Approaching Deadlines" },
        noDeadlines: { ko: "임박한 마감일 없음", en: "No upcoming deadlines" },
        deadlineTooltipTitle: { ko: "마감일 임박 프로젝트", en: "Projects with Upcoming Deadlines" },
        deadlineTooltipDescription: { ko: "마감일이 임박한 프로젝트의 긴급도를 확인할 수 있습니다. 긴급(7일 미만), 주의(7-14일), 여유(14일 이상)로 분류됩니다.", en: "View urgency of projects with approaching deadlines. Categorized as Critical (< 7 days), Warning (7-14 days), Normal (≥ 14 days)." },
        moreProjects: { ko: "개 더", en: " more" },
        // Deadline legend texts
        criticalLegend: { ko: "7일 미만: 긴급", en: "< 7 days: Critical" },
        warningLegend: { ko: "14일 미만: 주의", en: "< 14 days: Warning" },
        normalLegend: { ko: "14일 이상: 여유", en: "≥ 14 days: Normal" },
        // Deadline category tooltips
        criticalTooltip: { ko: "마감일까지 7일 미만 남은 긴급 프로젝트", en: "Critical projects with less than 7 days until deadline" },
        warningTooltip: { ko: "마감일까지 7-14일 남은 주의 프로젝트", en: "Warning projects with 7-14 days until deadline" },
        normalTooltip: { ko: "마감일까지 14일 이상 남은 여유 프로젝트", en: "Normal projects with 14 or more days until deadline" }
      },
      revenue: {
        tooltip: {
          title: { ko: "월 매출 계산식", en: "Revenue Calculation" },
          description: { ko: "해당 월에 등록된 프로젝트의 계약 금액을 합산했습니다.", en: "Sum of contract amounts for projects registered in this month." },
          exchangeNote: { ko: "USD 금액은 해당 월의 환율을 적용하여 KRW로 환산되었습니다.", en: "USD amounts are converted to KRW using the exchange rate for that month." },
          noProjects: { ko: "해당 월에 등록된 프로젝트가 없습니다.", en: "No projects registered in this month." }
        }
      },
      list: {
        searchPlaceholder: { ko: "프로젝트 검색...", en: "Search projects..." },
        resetFilters: { ko: "필터 초기화", en: "Reset Filters" },
        resetColumns: { ko: "열 초기화", en: "Reset Columns" },
        deleteMode: { ko: "삭제 모드", en: "Delete Mode" },
        exitDeleteMode: { ko: "삭제 모드 종료", en: "Exit Delete Mode" },
        selectAll: { ko: "전체 선택", en: "Select All" },
        deselectAll: { ko: "선택 해제", en: "Deselect All" },
        deleteSelected: { ko: "선택 삭제", en: "Delete Selected" },
        itemsSelected: { ko: "개 항목 선택됨", en: " items selected" },
        pageSize: { ko: "페이지 크기", en: "Page size" },
        totalItems: { ko: "전체", en: "Total" },
        filtered: { ko: "필터됨", en: "filtered" },
        // 액션 버튼
        deleteButton: { ko: "삭제", en: "Delete" },
        filterButton: { ko: "필터", en: "Filter" },
        columnSettingsButton: { ko: "컬럼 설정", en: "Column Settings" },
        // 필터 옵션
        filters: {
          status: {
            label: { ko: "상태", en: "Status" },
            allStatuses: { ko: "모든 상태", en: "All Statuses" },
            options: {
              all: { ko: "모든 상태", en: "All Statuses" },
              inProgress: { ko: "진행중", en: "In Progress" },
              review: { ko: "검토", en: "Review" },
              completed: { ko: "완료", en: "Completed" },
              onHold: { ko: "보류", en: "On Hold" }
            }
          },
          client: {
            label: { ko: "클라이언트", en: "Client" },
            allClients: { ko: "모든 클라이언트", en: "All Clients" },
            options: {
              all: { ko: "모든 클라이언트", en: "All Clients" }
            }
          },
          pageCount: {
            label: { ko: "페이지 개수", en: "Page Count" },
            options: {
              "5": { ko: "5개", en: "5 items" },
              "10": { ko: "10개", en: "10 items" },
              "20": { ko: "20개", en: "20 items" },
              "50": { ko: "50개", en: "50 items" }
            }
          }
        },
        // 컬럼 설정
        columns: {
          label: { ko: "표시할 컬럼", en: "Visible Columns" },
          dragToReorder: { ko: "드래그하여 순서 변경", en: "Drag to reorder" },
          eyeIconDescription: { ko: "아이콘을 클릭하여 컬럼 숨김/보이기", en: "Click icon to show/hide columns" },
          showColumn: { ko: "컬럼 보이기", en: "Show column" },
          hideColumn: { ko: "컬럼 숨기기", en: "Hide column" },
          options: {
            projectName: { ko: "프로젝트명", en: "Project Name" },
            client: { ko: "클라이언트", en: "Client" },
            status: { ko: "상태", en: "Status" },
            progress: { ko: "진행률", en: "Progress" },
            registeredDate: { ko: "등록일", en: "Registered Date" },
            dueDate: { ko: "마감일", en: "Due Date" },
            modifiedDate: { ko: "수정일", en: "Modified Date" },
            actions: { ko: "액션", en: "Actions" }
          }
        },
        // 페이지네이션 네비게이션
        pagination: {
          firstPage: { ko: "첫 페이지로", en: "Go to first page" },
          previousPage: { ko: "이전 페이지", en: "Previous page" },
          nextPage: { ko: "다음 페이지", en: "Next page" },
          lastPage: { ko: "마지막 페이지로", en: "Go to last page" },
          pageOf: { ko: "페이지", en: "Page" },
          of: { ko: "의", en: "of" },
          goToPage: { ko: "페이지로 이동", en: "Go to page" }
        }
      },
      detail: {
        projectList: { ko: "프로젝트 목록", en: "Project List" },
        noProjectSelected: { ko: "프로젝트가 선택되지 않았습니다", en: "No project selected" },
        projectNo: { ko: "프로젝트 번호", en: "Project No" },
        client: { ko: "클라이언트", en: "Client" },
        progressStatus: { ko: "진행 상황", en: "Progress Status" },
        projectProgress: { ko: "프로젝트 진도", en: "Project Progress" },
        paymentProgress: { ko: "수금상태", en: "Payment Status" },
        projectInfo: { ko: "프로젝트 정보", en: "Project Info" },
        registered: { ko: "등록일", en: "Registered" },
        dueDate: { ko: "마감일", en: "Due Date" },
        modified: { ko: "수정일", en: "Modified" },
        status: { ko: "상태", en: "Status" },
        moreDetails: { ko: "더 많은 세부 정보가 곧 추가됩니다", en: "More details will be added soon" },
        progress: { ko: "진행률", en: "Progress" }
      },
      tabs: {
        // 메인 탭
        overview: { ko: "개요", en: "Overview" },
        documentManagement: { ko: "문서관리", en: "Document Management" },
        taxManagement: { ko: "세무관리", en: "Tax Management" },

        // 문서관리 서브탭
        documentSubs: {
          contract: { ko: "계약서", en: "Contract" },
          invoice: { ko: "청구서", en: "Invoice" },
          report: { ko: "보고서", en: "Report" },
          estimate: { ko: "견적서", en: "Estimate" },
          others: { ko: "기타문서", en: "Other Documents" }
        },

        // 세무관리 서브탭
        taxSubs: {
          taxInvoice: { ko: "세금계산서", en: "Tax Invoice" },
          withholding: { ko: "원천세", en: "Withholding Tax" },
          vat: { ko: "부가세", en: "VAT" },
          cashReceipt: { ko: "현금영수증", en: "Cash Receipt" },
          cardReceipt: { ko: "카드영수증", en: "Card Receipt" }
        }
      },
      descriptions: {
        // 메인 탭 설명
        overviewDesc: { ko: "프로젝트의 전체적인 현황과 주요 정보를 확인할 수 있습니다", en: "View overall project status and key information" },
        documentManagementDesc: { ko: "프로젝트와 관련된 모든 문서를 관리할 수 있습니다", en: "Manage all project-related documents" },
        taxManagementDesc: { ko: "프로젝트의 세무 관련 문서와 정보를 관리할 수 있습니다", en: "Manage tax-related documents and information" },

        // 문서관리 서브탭 설명
        contractDesc: { ko: "프로젝트 계약서 정보를 확인할 수 있습니다", en: "View project contract information" },
        invoiceDesc: { ko: "청구서 및 정산 정보를 확인할 수 있습니다", en: "View invoice and settlement information" },
        reportDesc: { ko: "프로젝트 진행 보고서를 확인할 수 있습니다", en: "View project progress reports" },
        estimateDesc: { ko: "프로젝트 견적서 정보를 확인할 수 있습니다", en: "View project estimate information" },
        othersDesc: { ko: "기타 프로젝트 관련 문서를 확인할 수 있습니다", en: "View other project-related documents" },

        // 세무관리 서브탭 설명
        taxInvoiceDesc: { ko: "세금계산서 정보를 확인할 수 있습니다", en: "View tax invoice information" },
        withholdingDesc: { ko: "원천세 관련 정보를 확인할 수 있습니다", en: "View withholding tax information" },
        vatDesc: { ko: "부가가치세 관련 정보를 확인할 수 있습니다", en: "View VAT-related information" },
        cashReceiptDesc: { ko: "현금영수증 정보를 확인할 수 있습니다", en: "View cash receipt information" },
        cardReceiptDesc: { ko: "카드영수증 정보를 확인할 수 있습니다", en: "View card receipt information" }
      },
      labels: {
        projectStatus: { ko: "프로젝트 상태", en: "Project Status" },
        taskProgress: { ko: "작업 진행률", en: "Task Progress" },
        taskProgressTooltip: {
          ko: "작업 목록의 완료된 작업 개수를 기반으로 자동 계산됩니다. 작업을 완료 상태로 변경하면 진행률이 자동으로 업데이트됩니다.",
          en: "Automatically calculated based on completed tasks in the task list. Progress updates automatically when tasks are marked as complete."
        },
        paymentStatus: { ko: "수금상태", en: "Payment Status" },
        currentStage: { ko: "현재 단계", en: "Current Stage" },
        hasContract: { ko: "계약서 있음", en: "Has Contract" },
        hasBilling: { ko: "청구서 있음", en: "Has Billing" },
        hasDocuments: { ko: "문서 있음", en: "Has Documents" },
        contractInfo: { ko: "계약서 정보", en: "Contract Information" },
        billingInfo: { ko: "청구/정산 정보", en: "Billing Information" },
        documentInfo: { ko: "프로젝트 문서", en: "Project Documents" }
      },
      // 프로젝트 자료 현황 섹션
      documentsStatus: {
        title: { ko: "프로젝트 자료 현황", en: "Project Documents Status" },
        documents: {
          contract: { ko: "계약서", en: "Contract" },
          invoice: { ko: "청구서", en: "Invoice" },
          report: { ko: "보고서", en: "Report" },
          estimate: { ko: "견적서", en: "Estimate" },
          others: { ko: "기타문서", en: "Other Documents" }
        },
        status: {
          pending: { ko: "미보유", en: "Pending" },
          inProgress: { ko: "진행중", en: "In Progress" },
          completed: { ko: "완료", en: "Completed" }
        },
        dateFormat: {
          month: { ko: "월", en: "" },
          day: { ko: "일", en: "" }
        }
      },
      documentDeleteModal: {
        singleTitle: { ko: "문서를 삭제하시겠습니까?", en: "Delete document?" },
        singleDescription: { ko: "선택한 문서는 삭제 후 복구할 수 없습니다.", en: "This document cannot be recovered after deletion." },
        bulkTitle: { ko: "모든 문서를 삭제할까요?", en: "Delete all documents?" },
        bulkDescription: { ko: "해당 범주의 문서를 모두 삭제하면 다시 가져올 수 없습니다.", en: "All documents in this category will be permanently removed." },
        confirmLabel: { ko: "삭제", en: "Delete" },
        cancelLabel: { ko: "취소", en: "Cancel" }
      },
      // 프로젝트 생성 모달
      createModal: {
        title: { ko: "새 프로젝트 생성", en: "Create New Project" },
        subtitle: { ko: "프로젝트 정보를 입력해주세요", en: "Please enter project information" },
        fields: {
          projectName: {
            label: { ko: "프로젝트명 *", en: "Project Name *" },
            placeholder: { ko: "프로젝트 이름을 입력하세요", en: "Enter project name" },
            extractFromContract: { ko: "계약서에서 추출", en: "Extract from contract" }
          },
          client: {
            label: { ko: "클라이언트 *", en: "Client *" },
            placeholder: { ko: "클라이언트 이름을 입력하세요", en: "Enter client name" },
            extractFromContract: { ko: "계약서에서 추출", en: "Extract from contract" }
          },
          settlementMethod: {
            label: { ko: "정산방식 *", en: "Settlement Method *" },
            placeholder: { ko: "정산방식을 선택하세요", en: "Select settlement method" },
            extractFromContract: { ko: "계약서에서 추출", en: "Extract from contract" }
          },
          currency: {
            label: { ko: "통화 단위 *", en: "Currency *" },
            placeholder: { ko: "통화 단위를 선택하세요", en: "Select currency" }
          },
          projectContent: {
            label: { ko: "프로젝트 내용", en: "Project Content" },
            placeholder: { ko: "프로젝트 상세 내용을 입력하세요", en: "Enter project details" },
            extractFromContract: { ko: "계약서에서 추출", en: "Extract from contract" }
          },
          registrationDate: {
            label: { ko: "등록일 *", en: "Registration Date *" },
            placeholder: { ko: "등록일을 선택하세요", en: "Select registration date" },
            autoFill: { ko: "현재 시간 자동 입력", en: "Auto-fill current time" },
            manualInput: { ko: "직접 입력", en: "Manual input" }
          },
          dueDate: {
            label: { ko: "마감일 *", en: "Due Date *" },
            placeholder: { ko: "마감일을 선택하세요", en: "Select due date" },
            fromContract: { ko: "계약서 마감일", en: "Contract due date" }
          },
          currentStage: {
            label: { ko: "현재 단계", en: "Current Stage" },
            defaultValue: { ko: "기획", en: "Planning" },
            note: {
              ko: "프로젝트 단계는 계약서와 금액 정보를 기준으로 자동 설정됩니다. 보류, 취소, 완료 상태는 필요할 때 직접 선택하실 수 있으며, 한번 선택한 상태는 계속 유지됩니다.",
              en: "Project stages are automatically set based on contract and amount information. You can manually select On Hold, Cancelled, or Completed status when needed, and once selected, it remains unchanged."
            },
            explanation: {
              title: { ko: "프로젝트 단계는 어떻게 결정되나요?", en: "How are project stages determined?" },
              summary: {
                ko: "프로젝트 단계는 계약서와 금액 정보를 기준으로 자동으로 설정됩니다. 보류, 취소, 완료 상태는 필요할 때 직접 선택하실 수 있어요.",
                en: "Project stages are automatically set based on contract and amount information. You can manually select On Hold, Cancelled, or Completed status when needed."
              },
              rules: {
                planning: {
                  ko: "기획: 계약서와 금액 정보가 아직 없거나, 계약서는 있지만 금액이 미정인 경우",
                  en: "Planning: When contract and amount are not set yet, or contract exists but amount is pending"
                },
                review: {
                  ko: "검토: 금액은 정해졌지만 계약서가 아직 준비되지 않은 경우",
                  en: "Review: When amount is set but contract is not ready yet"
                },
                inProgress: {
                  ko: "진행중: 계약서와 금액 정보가 모두 준비된 경우",
                  en: "In Progress: When both contract and amount are ready"
                },
                manual: {
                  ko: "보류/취소/완료: 필요에 따라 언제든지 직접 선택하실 수 있어요",
                  en: "On Hold/Cancelled/Completed: You can select these anytime as needed"
                }
              }
            }
          },
          paymentStatus: {
            label: { ko: "수금상태 *", en: "Payment Status *" },
            placeholder: { ko: "수금상태를 선택하세요", en: "Select payment status" }
          },
          documentGeneration: {
            label: { ko: "문서 생성", en: "Document Generation" },
            description: { ko: "생성할 문서 유형을 선택하세요", en: "Select document types to generate" },
            categories: {
              contract: { ko: "계약서", en: "Contract" },
              invoice: { ko: "청구서", en: "Invoice" },
              estimate: { ko: "견적서", en: "Estimate" },
              report: { ko: "보고서", en: "Report" },
              others: { ko: "기타 문서", en: "Other Documents" }
            },
            categoryDescriptions: {
              contract: { ko: "표준, 서비스, 소프트웨어 등 다양한 계약서 템플릿", en: "Various contract templates including standard, service, and software" },
              invoice: { ko: "세금계산서 및 청구서 템플릿", en: "Tax invoice and billing templates" },
              estimate: { ko: "견적서 및 제안서 템플릿", en: "Quote and proposal templates" },
              report: { ko: "진행보고서 및 회고보고서 템플릿", en: "Progress and retrospective report templates" },
              others: { ko: "회의록, NDA 등 기타 문서 템플릿", en: "Meeting minutes, NDA and other document templates" }
            },
            buttons: {
              openGenerator: { ko: "문서 생성기 열기", en: "Open Document Generator" },
              generateDocument: { ko: "문서 생성", en: "Generate Document" }
            },
            optional: { ko: "문서 생성은 선택사항입니다. 프로젝트 생성 후에도 추가할 수 있습니다.", en: "Document generation is optional. You can add documents after creating the project." },
            generatorModal: {
              title: { ko: "문서 생성기", en: "Document Generator" },
              subtitle: { ko: "템플릿을 선택하고 문서를 생성하세요", en: "Select a template and generate documents" },
              categorySelect: {
                label: { ko: "문서 카테고리", en: "Document Category" },
                placeholder: { ko: "카테고리를 선택하세요", en: "Select a category" }
              },
              templateSelect: {
                label: { ko: "템플릿", en: "Template" },
                placeholder: { ko: "템플릿을 선택하세요", en: "Select a template" }
              },
              preview: {
                title: { ko: "미리보기", en: "Preview" },
                noTemplate: { ko: "템플릿을 선택하면 미리보기가 표시됩니다", en: "Select a template to see preview" },
                editMode: { ko: "편집 모드", en: "Edit Mode" },
                previewMode: { ko: "미리보기 모드", en: "Preview Mode" },
                editButton: { ko: "편집", en: "Edit" },
                previewButton: { ko: "미리보기", en: "Preview" },
                saveButton: { ko: "저장", en: "Save" },
                cancelButton: { ko: "취소", en: "Cancel" },
                editDescription: { ko: "내용을 수정하고 저장하세요", en: "Edit content and save changes" },
                unsavedChanges: { ko: "저장되지 않은 변경사항이 있습니다", en: "You have unsaved changes" },
                confirmCancel: { ko: "변경사항이 손실됩니다. 정말 취소하시겠습니까?", en: "Changes will be lost. Are you sure you want to cancel?" }
              },
              buttons: {
                generate: { ko: "생성", en: "Generate" },
                cancel: { ko: "취소", en: "Cancel" },
                close: { ko: "닫기", en: "Close" }
              },
              validation: {
                generateDisabled: { ko: "문서를 생성하려면 프로젝트명과 클라이언트를 먼저 입력하세요.", en: "Please enter project name and client to generate documents." },
                missingProjectName: { ko: "프로젝트명이 필요합니다", en: "Project name is required" },
                missingClient: { ko: "클라이언트명이 필요합니다", en: "Client name is required" },
                missingBoth: { ko: "프로젝트명과 클라이언트명이 필요합니다", en: "Project name and client name are required" }
              }
            },
            generatedList: {
              title: { ko: "생성된 문서", en: "Generated Documents" },
              empty: { ko: "생성된 문서가 없습니다", en: "No documents generated" },
              count: { ko: "개 문서", en: "documents" },
              actions: {
                view: { ko: "미리보기", en: "Preview" },
                edit: { ko: "편집", en: "Edit" },
                delete: { ko: "삭제", en: "Delete" },
                viewTooltip: { ko: "문서 미리보기", en: "Preview document" },
                editTooltip: { ko: "문서 편집", en: "Edit document" },
                deleteTooltip: { ko: "문서 삭제", en: "Delete document" },
                ariaPreview: { ko: "문서 미리보기 버튼", en: "Preview document button" },
                ariaDelete: { ko: "문서 삭제 버튼", en: "Delete document button" }
              }
            }
          }
        },
        buttons: {
          create: { ko: "프로젝트 생성", en: "Create Project" },
          cancel: { ko: "취소", en: "Cancel" },
          extractFromContract: { ko: "계약서 업로드", en: "Upload Contract" }
        },
        validation: {
          projectNameRequired: { ko: "프로젝트명을 입력하세요", en: "Project name is required" },
          clientRequired: { ko: "클라이언트를 입력하세요", en: "Client is required" },
          settlementMethodRequired: { ko: "정산방식을 선택하세요", en: "Settlement method is required" },
          registrationDateRequired: { ko: "등록일을 선택하세요", en: "Registration date is required" },
          dueDateRequired: { ko: "마감일을 선택하세요", en: "Due date is required" },
          paymentStatusRequired: { ko: "수금상태를 선택하세요", en: "Payment status is required" },
          dueDateAfterRegistration: { ko: "마감일은 등록일 이후여야 합니다", en: "Due date must be after registration date" }
        },
        success: {
          title: { ko: "프로젝트 생성 완료", en: "Project Created Successfully" },
          message: { ko: "새 프로젝트가 성공적으로 생성되었습니다", en: "New project has been created successfully" }
        },
        error: {
          title: { ko: "프로젝트 생성 실패", en: "Project Creation Failed" },
          message: { ko: "프로젝트 생성 중 오류가 발생했습니다", en: "An error occurred while creating the project" }
        }
      },
      // 프로젝트 상세 정보 섹션
      projectDetails: {
        title: { ko: "프로젝트 상세 정보", en: "Project Detail Information" },
        fields: {
          totalAmount: { ko: "총 금액", en: "Total Amount" },
          projectName: { ko: "프로젝트명", en: "Project Name" },
          settlementMethod: { ko: "정산방식", en: "Settlement Method" },
          advance: { ko: "선급", en: "Advance" },
          projectContent: { ko: "프로젝트 내용", en: "Project Content" },
          paymentStatus: { ko: "수금상태", en: "Payment Status" },
          client: { ko: "클라이언트", en: "Client" },
          projectNo: { ko: "프로젝트 번호", en: "Project Number" },
          currency: { ko: "통화 단위", en: "Currency" }
        },
        placeholders: {
          notSet: { ko: "미설정", en: "Not Set" },
          noContent: { ko: "내용 없음", en: "No Content" },
          amount: { ko: "원", en: "KRW" }
        },
        actions: {
          edit: { ko: "편집", en: "Edit" },
          save: { ko: "저장", en: "Save" },
          saving: { ko: "저장 중...", en: "Saving..." },
          cancel: { ko: "취소", en: "Cancel" },
          cancelEdit: { ko: "편집 취소", en: "Cancel Edit" },
          confirmCancelTitle: { ko: "편집 취소", en: "Cancel Edit" },
          confirmCancelMessage: { ko: "변경사항이 저장되지 않습니다. 편집을 취소하시겠습니까?", en: "Changes will not be saved. Are you sure you want to cancel editing?" },
          confirmCancelButton: { ko: "편집 취소", en: "Cancel Edit" },
          continueEditing: { ko: "계속 편집", en: "Continue Editing" },
          documentEdit: { ko: "문서 편집", en: "Document Edit" },
          documentPreview: { ko: "문서 미리보기", en: "Document Preview" },
          documentEditDescription: { ko: "내용을 수정한 뒤 저장하면 목록과 개요 카드에 즉시 반영됩니다.", en: "Changes will be immediately reflected in the list and overview cards after saving." },
          documentPreviewDescription: { ko: "생성된 문서를 확인하세요.", en: "Check the generated document." }
        },
        // 정산방식 옵션
        settlementMethods: {
          not_set: { ko: "미설정", en: "Not Set" },
          advance_final: { ko: "선금+잔금", en: "Advance+Final" },
          advance_interim_final: { ko: "선금+중도금+잔금", en: "Advance+Interim+Final" },
          post_payment: { ko: "후불", en: "Post Payment" }
        },
        // 수금상태 옵션
        paymentStatuses: {
          not_started: { ko: "협의중", en: "In Negotiation" },
          advance_completed: { ko: "선금 완료", en: "Advance Completed" },
          interim_completed: { ko: "중도금 완료", en: "Interim Completed" },
          final_completed: { ko: "잔금 완료", en: "Final Completed" }
        },
        // 통화 단위 옵션
        currencies: {
          KRW: { ko: "원화 (KRW)", en: "Korean Won (KRW)" },
          USD: { ko: "달러 (USD)", en: "US Dollar (USD)" }
        },
        // 프로젝트 단계 흐름 설명 (편집 모드 툴팁용)
        statusFlowExplanation: {
          title: { ko: "프로젝트 단계는 어떻게 결정되나요?", en: "How are project stages determined?" },
          summary: {
            ko: "프로젝트 단계는 계약서와 금액 정보를 기준으로 자동으로 설정됩니다. 보류, 취소, 완료 상태는 필요할 때 직접 선택하실 수 있어요.",
            en: "Project stages are automatically set based on contract and amount information. You can manually select On Hold, Cancelled, or Completed status when needed."
          },
          rules: {
            planning: {
              ko: "기획: 계약서와 금액 정보가 아직 없거나, 계약서는 있지만 금액이 미정인 경우",
              en: "Planning: When contract and amount are not set yet, or contract exists but amount is pending"
            },
            review: {
              ko: "검토: 금액은 정해졌지만 계약서가 아직 준비되지 않은 경우",
              en: "Review: When amount is set but contract is not ready yet"
            },
            inProgress: {
              ko: "진행중: 계약서와 금액 정보가 모두 준비된 경우",
              en: "In Progress: When both contract and amount are ready"
            },
            manual: {
              ko: "보류/취소/완료: 필요에 따라 언제든지 직접 선택하실 수 있어요",
              en: "On Hold/Cancelled/Completed: You can select these anytime as needed"
            },
            autoComplete: {
              ko: "💡 도움말: 직접 선택한 보류, 취소, 완료 상태는 계약서나 금액이 변경되어도 그대로 유지됩니다.",
              en: "💡 Tip: Manually selected On Hold, Cancelled, or Completed status remains unchanged even when contract or amount is modified."
            }
          },
          resetButton: {
            label: { ko: "단계 초기화", en: "Reset Stage" },
            tooltip: { ko: "기획 단계로 되돌리기", en: "Reset to Planning stage" },
            confirmTitle: { ko: "단계 초기화 확인", en: "Confirm Stage Reset" },
            confirmMessage: {
              ko: "프로젝트를 기획 단계로 초기화하시겠습니까? 현재 단계 정보가 초기화됩니다.",
              en: "Are you sure you want to reset the project to Planning stage? Current stage information will be reset."
            },
            confirmButton: { ko: "초기화", en: "Reset" },
            cancelButton: { ko: "취소", en: "Cancel" }
          }
        },
        // WBS (Work Breakdown Structure) 관련 텍스트
        wbs: {
          sectionTitle: { ko: "작업목록", en: "Task List" },
          addTask: { ko: "작업 추가", en: "Add Task" },
          addTaskDescription: { ko: "프로젝트에 새로운 작업을 추가합니다", en: "Add a new task to the project" },
          emptyState: { ko: "등록된 작업이 없습니다", en: "No tasks registered" },
          emptyStateDescription: { ko: "편집 버튼을 눌러 작업을 추가하여 프로젝트 진행률을 관리하세요", en: "Click the edit button to add tasks and manage project progress" },
          taskName: { ko: "작업명", en: "Task Name" },
          taskDescription: { ko: "작업 설명", en: "Task Description" },
          taskStatus: { ko: "작업 상태", en: "Task Status" },
          // 프로젝트 생성 모달용 템플릿 선택 텍스트
          templateSelectLabel: { ko: "작업 템플릿", en: "Task Template" },
          templateSelectPlaceholder: { ko: "프로젝트 유형 선택", en: "Select project type" },
          templateSelectHelp: { ko: "프로젝트 유형에 맞는 기본 작업 목록이 자동으로 생성됩니다", en: "Default tasks will be created based on project type" },
          // 빠른 템플릿 추가 기능 텍스트
          quickAddButton: { ko: "템플릿으로 추가", en: "Add from Template" },
          quickAddTitle: { ko: "작업 템플릿 선택", en: "Select Task Template" },
          quickAddDescription: { ko: "선택한 템플릿의 작업들이 현재 목록에 추가됩니다", en: "Tasks from the selected template will be added to the current list" },
          quickAddConfirm: { ko: "추가하기", en: "Add Tasks" },
          quickAddCancel: { ko: "취소", en: "Cancel" },
          // WBS 작업 상태
          statuses: {
            pending: { ko: "대기", en: "Pending" },
            in_progress: { ko: "진행중", en: "In Progress" },
            completed: { ko: "완료", en: "Completed" }
          },
          // WBS 템플릿 타입
          templates: {
            standard: { ko: "표준 프로젝트", en: "Standard Project" },
            consulting: { ko: "컨설팅", en: "Consulting" },
            education: { ko: "교육", en: "Education" },
            custom: { ko: "직접 입력", en: "Custom" }
          },
          // WBS 템플릿 설명
          templateDescriptions: {
            standard: { ko: "기획, 설계, 개발, 테스트, 배포", en: "Planning, Design, Development, Testing, Deployment" },
            consulting: { ko: "착수, 분석, 제안, 실행, 종료", en: "Initiation, Analysis, Proposal, Execution, Closure" },
            education: { ko: "기획, 자료 제작, 리허설, 강의, 피드백", en: "Planning, Material Creation, Rehearsal, Lecture, Feedback" },
            custom: { ko: "직접 작업 목록을 입력합니다", en: "Enter task list manually" }
          },
          // WBS 기능 관련
          taskCount: { ko: "작업 개수", en: "Task Count" },
          completedCount: { ko: "완료된 작업", en: "Completed Tasks" },
          progressCalculation: { ko: "진행률 자동 계산", en: "Auto-calculated Progress" },
          dragToReorder: { ko: "드래그하여 순서 변경", en: "Drag to reorder" },
          deleteTask: { ko: "작업 삭제", en: "Delete Task" },
          confirmDelete: { ko: "이 작업을 삭제하시겠습니까?", en: "Are you sure you want to delete this task?" },
          deleteAll: { ko: "전체 삭제", en: "Delete All" },
          confirmDeleteAll: { ko: "모든 작업을 삭제하시겠습니까?", en: "Are you sure you want to delete all tasks?" },
          deleteAllDescription: { ko: "모든 작업이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.", en: "All tasks will be deleted. This action cannot be undone." }
        }
      },
      messages: {
        contractLoading: { ko: "계약서 정보를 불러오는 중입니다...", en: "Loading contract information..." },
        contractEmpty: { ko: "등록된 계약서가 없습니다", en: "No contract registered" },
        billingLoading: { ko: "청구서 정보를 불러오는 중입니다...", en: "Loading billing information..." },
        billingEmpty: { ko: "등록된 청구서가 없습니다", en: "No billing registered" },
        documentsLoading: { ko: "문서 목록을 불러오는 중입니다...", en: "Loading document list..." },
        documentsEmpty: { ko: "등록된 문서가 없습니다", en: "No documents registered" }
      },
      actions: {
        edit: { ko: "편집", en: "Edit" },
        close: { ko: "닫기", en: "Close" }
      },
      deleteModal: {
        title: { ko: "프로젝트 삭제 확인", en: "Confirm Project Deletion" },
        message: { ko: "이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", en: "Are you sure you want to delete this project? This action cannot be undone." },
        confirm: { ko: "삭제", en: "Delete" },
        cancel: { ko: "취소", en: "Cancel" }
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
  },

  // 프로젝트 상태 텍스트
  projectStatus: {
    planning: {
      ko: "기획",
      en: "Planning"
    },
    in_progress: {
      ko: "진행중",
      en: "In Progress"
    },
    review: {
      ko: "검토",
      en: "Review"
    },
    completed: {
      ko: "완료",
      en: "Completed"
    },
    on_hold: {
      ko: "보류",
      en: "On Hold"
    },
    cancelled: {
      ko: "취소",
      en: "Cancelled"
    },
    title: {
      ko: "프로젝트 상태",
      en: "Project Status"
    },
    description: {
      ko: "프로젝트의 현재 진행 상태를 나타냅니다",
      en: "Indicates the current progress status of the project"
    }
  },

  // 캘린더 위젯 텍스트 (Calendar Widget Text)
  calendarWidget: {
    eventForm: {
      titleNew: { ko: "새 일정 만들기", en: "Create New Event" },
      titleEdit: { ko: "일정 수정", en: "Edit Event" },
      labelTitle: { ko: "제목", en: "Title" },
      labelType: { ko: "유형", en: "Type" },
      labelDate: { ko: "날짜", en: "Date" },
      labelAllDay: { ko: "종일 일정", en: "All Day" },
      labelStartTime: { ko: "시작 시간", en: "Start Time" },
      labelEndTime: { ko: "종료 시간", en: "End Time" },
      labelLocation: { ko: "장소", en: "Location" },
      labelDescription: { ko: "설명", en: "Description" },
      placeholderTitle: { ko: "일정 제목 (엔터로 저장)", en: "Event title (Enter to save)" },
      placeholderLocation: { ko: "장소 입력 (선택사항)", en: "Enter location (optional)" },
      placeholderDescription: { ko: "설명 입력 (선택사항, Shift+Enter로 줄바꿈)", en: "Enter description (optional, Shift+Enter for new line)" },
      typeMeeting: { ko: "회의", en: "Meeting" },
      typeTask: { ko: "작업", en: "Task" },
      typeReminder: { ko: "알림", en: "Reminder" },
      typeDeadline: { ko: "마감", en: "Deadline" },
      typeHoliday: { ko: "휴일", en: "Holiday" },
      typeOther: { ko: "기타", en: "Other" },
      buttonCancel: { ko: "취소", en: "Cancel" },
      buttonSave: { ko: "저장", en: "Save" },
      buttonUpdate: { ko: "수정", en: "Update" },
      defaultTitle: { ko: "제목 없음", en: "Untitled" },
    },
    eventDetail: {
      deleteTitle: { ko: "일정 삭제", en: "Delete Event" },
      deleteConfirm: { ko: "이 일정을 삭제하시겠습니까?", en: "Are you sure you want to delete this event?" },
      buttonDelete: { ko: "삭제", en: "Delete" },
      buttonCancel: { ko: "취소", en: "Cancel" },
      buttonClose: { ko: "닫기", en: "Close" },
      allDay: { ko: "종일", en: "All Day" },
    },
    agendaView: {
      noEvents: { ko: "일정이 없습니다", en: "No events" },
      today: { ko: "오늘", en: "Today" },
    },
    dayView: {
      allDay: { ko: "종일", en: "All Day" },
    }
  },

  // 설정 페이지 (2025-10-07 추가)
  settings: {
    page: {
      title: { ko: "설정", en: "Settings" },
      description: { ko: "프로필, 결제, 사용량 및 요금제를 관리하세요", en: "Manage your profile, billing, usage, and plan" }
    },
    tabs: {
      profile: { ko: "프로필", en: "Profile" },
      billing: { ko: "결제", en: "Billing" },
      usage: { ko: "사용량", en: "Usage" },
      plan: { ko: "요금제", en: "Plan" }
    },
    profile: {
      title: { ko: "프로필 정보", en: "Profile Information" },
      description: { ko: "개인 정보 및 사업자 정보를 관리합니다", en: "Manage your personal and business information" },
      fields: {
        name: { ko: "이름", en: "Name" },
        email: { ko: "이메일", en: "Email" },
        phone: { ko: "전화번호", en: "Phone" },
        businessNumber: { ko: "사업자등록번호", en: "Business Number" },
        businessType: { ko: "사업자 유형", en: "Business Type" },
        address: { ko: "주소", en: "Address" },
        addressDetail: { ko: "상세주소", en: "Address Detail" }
      },
      placeholders: {
        name: { ko: "홍길동", en: "John Doe" },
        email: { ko: "example@weave.com", en: "example@weave.com" },
        phone: { ko: "010-1234-5678", en: "+82-10-1234-5678" },
        businessNumber: { ko: "123-45-67890", en: "123-45-67890" },
        address: { ko: "서울시 강남구 테헤란로 123", en: "123 Teheran-ro, Gangnam-gu, Seoul" },
        addressDetail: { ko: "101동 1001호", en: "Building 101, Unit 1001" }
      },
      businessTypes: {
        freelancer: { ko: "프리랜서", en: "Freelancer" },
        individual: { ko: "개인 사업자", en: "Individual Business" },
        corporation: { ko: "법인 사업자", en: "Corporation" }
      },
      actions: {
        edit: { ko: "수정", en: "Edit" },
        save: { ko: "저장", en: "Save" },
        cancel: { ko: "취소", en: "Cancel" }
      },
      messages: {
        saveSuccess: { ko: "프로필이 저장되었습니다", en: "Profile saved successfully" },
        saveError: { ko: "프로필 저장 중 오류가 발생했습니다", en: "Error saving profile" }
      }
    },
    billing: {
      title: { ko: "결제 정보", en: "Billing Information" },
      description: { ko: "결제 수단 및 결제 내역을 관리합니다", en: "Manage payment methods and billing history" },
      paymentMethod: {
        title: { ko: "결제 수단", en: "Payment Method" },
        cardNumber: { ko: "카드 번호", en: "Card Number" },
        expiryDate: { ko: "유효기간", en: "Expiry Date" },
        cardHolder: { ko: "카드 소유자", en: "Card Holder" },
        none: { ko: "등록된 결제 수단이 없습니다", en: "No payment method registered" },
        add: { ko: "결제 수단 추가", en: "Add Payment Method" },
        change: { ko: "변경", en: "Change" },
        remove: { ko: "삭제", en: "Remove" }
      },
      history: {
        title: { ko: "결제 내역", en: "Billing History" },
        date: { ko: "날짜", en: "Date" },
        plan: { ko: "요금제", en: "Plan" },
        amount: { ko: "금액", en: "Amount" },
        status: { ko: "상태", en: "Status" },
        invoice: { ko: "영수증", en: "Invoice" },
        download: { ko: "다운로드", en: "Download" },
        none: { ko: "결제 내역이 없습니다", en: "No billing history" }
      },
      status: {
        paid: { ko: "결제 완료", en: "Paid" },
        pending: { ko: "대기 중", en: "Pending" },
        failed: { ko: "실패", en: "Failed" },
        refunded: { ko: "환불됨", en: "Refunded" }
      }
    },
    usage: {
      title: { ko: "사용량 현황", en: "Usage Status" },
      description: { ko: "현재 리소스 사용량을 확인합니다", en: "View current resource usage" },
      currentPlan: { ko: "현재 요금제", en: "Current Plan" },
      active: { ko: "활성", en: "Active" },
      unlimited: { ko: "무제한", en: "Unlimited" },
      projects: {
        title: { ko: "프로젝트", en: "Projects" },
        unlimited: { ko: "프로젝트를 무제한으로 생성할 수 있습니다", en: "You can create unlimited projects" }
      },
      widgets: {
        title: { ko: "위젯", en: "Widgets" },
        unlimited: { ko: "위젯을 무제한으로 생성할 수 있습니다", en: "You can create unlimited widgets" }
      },
      storage: {
        title: { ko: "스토리지", en: "Storage" }
      },
      aiService: {
        title: { ko: "AI 서비스", en: "AI Service" },
        status: { ko: "이용 가능 여부", en: "Availability" },
        available: { ko: "이용 가능", en: "Available" },
        unavailable: { ko: "이용 불가", en: "Unavailable" }
      }
    },
    plan: {
      title: { ko: "요금제 관리", en: "Plan Management" },
      description: { ko: "현재 요금제를 확인하고 변경하세요", en: "View and change your current plan" },
      current: { ko: "현재 플랜", en: "Current Plan" },
      currency: { ko: "원/월", en: "KRW/month" },
      perMonth: { ko: "/월", en: "/month" },
      unlimited: { ko: "무제한", en: "Unlimited" },
      free: {
        name: { ko: "무료", en: "Free" },
        price: { ko: "무료", en: "Free" }
      },
      limits: {
        projects: { ko: "프로젝트", en: "Projects" },
        widgets: { ko: "위젯", en: "Widgets" },
        storage: { ko: "스토리지", en: "Storage" },
        unit: { ko: "개", en: "" }
      },
      features: {
        'community-support': { ko: "커뮤니티 지원", en: "Community Support" },
        'email-support': { ko: "이메일 지원", en: "Email Support" },
        'priority-support': { ko: "우선 지원", en: "Priority Support" },
        'unlimited-projects': { ko: "무제한 프로젝트", en: "Unlimited Projects" },
        'unlimited-widgets': { ko: "무제한 위젯", en: "Unlimited Widgets" },
        'ai-service': { ko: "AI 서비스", en: "AI Service" }
      },
      actions: {
        upgrade: { ko: "업그레이드", en: "Upgrade" },
        downgrade: { ko: "다운그레이드", en: "Downgrade" },
        current: { ko: "현재 플랜", en: "Current Plan" }
      },
      note: {
        title: { ko: "참고사항", en: "Notes" },
        billing: { ko: "요금은 월 단위로 청구됩니다", en: "Billing is done on a monthly basis" },
        upgrade: { ko: "업그레이드는 즉시 적용되며, 남은 기간은 일할 계산됩니다", en: "Upgrades are applied immediately and prorated" },
        downgrade: { ko: "다운그레이드는 다음 결제 주기부터 적용됩니다", en: "Downgrades are applied from the next billing cycle" }
      }
    }
  },
  // Storage & Conflict Resolution (2025-10-10 추가)
  storage: {
    conflict: {
      // Dialog
      title: { ko: "데이터 충돌 해결", en: "Resolve Data Conflict" },
      entityLabel: { ko: "엔티티:", en: "Entity:" },
      idLabel: { ko: "ID:", en: "ID:" },

      // Conflict Types
      localNewer: { ko: "로컬 버전이 더 최신입니다.", en: "Local version is newer." },
      remoteNewer: { ko: "원격 버전이 더 최신입니다.", en: "Remote version is newer." },
      bothModified: { ko: "양쪽 모두 수정되었습니다. (동시 수정 가능성)", en: "Both sides modified. (Possible concurrent modification)" },
      unknown: { ko: "타임스탬프를 확인할 수 없습니다.", en: "Cannot verify timestamp." },

      // Strategy Selection
      strategyLabel: { ko: "해결 방법 선택", en: "Choose Resolution Strategy" },
      keepLocal: { ko: "로컬 버전 유지", en: "Keep Local Version" },
      keepLocalDesc: { ko: "현재 기기의 데이터를 유지합니다.", en: "Keep data from this device." },
      keepRemote: { ko: "원격 버전 선택", en: "Select Remote Version" },
      keepRemoteDesc: { ko: "서버의 데이터를 가져옵니다.", en: "Get data from server." },
      mergeAuto: { ko: "자동 병합", en: "Auto Merge" },
      mergeAutoDesc: { ko: "필드별로 최신 값을 자동으로 선택합니다.", en: "Automatically select newest value per field." },
      mergeManual: { ko: "수동 병합", en: "Manual Merge" },
      mergeManualDesc: { ko: "필드별로 직접 선택합니다. (아래에서 선택)", en: "Choose manually per field. (Select below)" },
      recommended: { ko: "권장", en: "Recommended" },

      // Manual Merge
      fieldSelectionLabel: { ko: "충돌 필드 선택", en: "Select Conflicting Fields" },
      fieldSelectionCount: { ko: "개", en: "items" },
      fieldLabel: { ko: "필드:", en: "Field:" },
      localLabel: { ko: "로컬", en: "Local" },
      remoteLabel: { ko: "원격", en: "Remote" },

      // Buttons
      cancel: { ko: "취소", en: "Cancel" },
      resolve: { ko: "해결 적용", en: "Apply Resolution" },
      resolving: { ko: "처리 중...", en: "Processing..." },

      // Toast Messages
      failureTitle: { ko: "충돌 해결 실패", en: "Conflict Resolution Failed" },
      failureDesc: { ko: "충돌 해결에 실패했습니다. 다시 시도해주세요.", en: "Failed to resolve conflict. Please try again." }
    }
  }
} as const

// 라우트 경로
export const routes = {
  home: "/",
  components: "/components",
  docs: "/docs",
  projects: "/projects",
  team: "/team",
  dashboard: "/dashboard",
  taxManagement: "/tax-management",
  login: "/login",
  signup: "/sign-up",
  settings: "/settings"
} as const

export const headerNavigation = {
  brand: {
    href: routes.home,
  },
  menus: [
    { id: 'home', labelKey: 'navigation.home', href: routes.home, icon: 'home' },
    { id: 'dashboard', labelKey: 'navigation.dashboard', href: routes.dashboard, icon: 'layoutDashboard' },
    { id: 'projects', labelKey: 'navigation.projects', href: routes.projects, icon: 'briefcase' },
    { id: 'tax', labelKey: 'navigation.taxManagement', href: routes.taxManagement, icon: 'calculator' },
  ],
  auth: {
    loggedOut: {
      primaryAction: { id: 'signup', labelKey: 'auth.signup', href: routes.signup, icon: 'userPlus' },
      secondaryAction: { id: 'login', labelKey: 'auth.login', href: routes.login, icon: 'logIn' },
    },
    profileMenu: [
      { id: 'profile', labelKey: 'auth.profile', href: `${routes.settings}?tab=profile`, icon: 'user' },
      { id: 'billing', labelKey: 'auth.billing', href: `${routes.settings}?tab=billing`, icon: 'creditCard' },
      { id: 'usage', labelKey: 'auth.usage', href: `${routes.settings}?tab=usage`, icon: 'barChart' },
      { id: 'plan', labelKey: 'auth.plan', href: `${routes.settings}?tab=plan`, icon: 'package' },
      { id: 'logout', labelKey: 'auth.logout', action: 'logout', icon: 'logOut' },
    ],
    menuTitleKey: 'auth.profileMenu',
  },
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
  dashboard: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.dashboard[lang],
  docs: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.docs[lang],
  projects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.projects[lang],
  team: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.team[lang],
  taxManagement: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.taxManagement[lang],
  components: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.components[lang],
  activeProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.activeProjects[lang],
  activeProjectsDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.activeProjectsDesc[lang],
  menuTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.navigation.menuTitle[lang]
}

export const getAuthText = {
  login: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.login[lang],
  signup: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.signup[lang],
  logout: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.logout[lang],
  settings: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.settings[lang],
  account: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.account[lang],
  profile: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.profile[lang],
  billing: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.billing[lang],
  usage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.usage[lang],
  plan: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.plan[lang],
  profileMenu: (lang: 'ko' | 'en' = defaultLanguage) => uiText.auth.profileMenu[lang]
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
  sections: {
    buttons: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.buttons.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.buttons.description[lang]
    },
    forms: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.forms.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.forms.description[lang]
    },
    feedback: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.feedback.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.feedback.description[lang]
    },
    data: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.data.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.data.description[lang]
    },
    layout: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.layout.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.layout.description[lang]
    },
    utilities: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.utilities.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.utilities.description[lang]
    },
    navigation: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.navigation.title[lang],
      description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.sections.navigation.description[lang]
    }
  },
  layoutHero: {
    centeredTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.layoutHero.centeredTitle[lang],
    centeredDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.layoutHero.centeredDescription[lang],
  },
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

// 프로젝트 페이지 텍스트 접근 함수
export const getProjectPageText = {
  // Header
  headerTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.header.title[lang],
  headerDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.header.description[lang],
  newProject: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.header.newProject[lang],
  previousProject: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.header.previousProject[lang],
  nextProject: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.header.nextProject[lang],

  // Stats
  statsTotal: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.total[lang],
  statsPlanning: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.planning[lang],
  statsReview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.review[lang],
  statsInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.inProgress[lang],
  statsOnHold: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.onHold[lang],
  statsCancelled: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.cancelled[lang],
  statsCompleted: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.completed[lang],
  statsMonthlyRevenue: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.monthlyRevenue[lang],
  statsSelectMonth: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.selectMonth[lang],
  statsNoProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.noProjects[lang],
  statsProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.projects[lang],

  // Stats Tooltips
  statsTotalTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.totalTooltip[lang],
  statsPlanningTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.planningTooltip[lang],
  statsReviewTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.reviewTooltip[lang],
  statsInProgressTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.inProgressTooltip[lang],
  statsOnHoldTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.onHoldTooltip[lang],
  statsCancelledTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.cancelledTooltip[lang],
  statsCompletedTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.completedTooltip[lang],
  // New stats for refactored cards
  statsOverview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.overview[lang],
  statsOverviewTooltipTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.overviewTooltipTitle[lang],
  statsOverviewTooltipDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.overviewTooltipDescription[lang],
  statsDeadline: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.deadline[lang],
  statsNoDeadlines: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.noDeadlines[lang],
  statsDeadlineTooltipTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.deadlineTooltipTitle[lang],
  statsDeadlineTooltipDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.deadlineTooltipDescription[lang],
  moreProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.moreProjects[lang],
  // Deadline legend
  criticalLegend: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.criticalLegend[lang],
  warningLegend: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.warningLegend[lang],
  normalLegend: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.normalLegend[lang],
  // Deadline category tooltips
  criticalTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.criticalTooltip[lang],
  warningTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.warningTooltip[lang],
  normalTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.normalTooltip[lang],

  // Revenue Tooltip
  revenueTooltipTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.revenue.tooltip.title[lang],
  revenueTooltipDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.revenue.tooltip.description[lang],
  revenueTooltipExchangeNote: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.revenue.tooltip.exchangeNote[lang],
  revenueTooltipNoProjects: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.revenue.tooltip.noProjects[lang],

  // List
  searchPlaceholder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.searchPlaceholder[lang],
  resetFilters: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.resetFilters[lang],
  resetColumns: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.resetColumns[lang],
  deleteMode: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.deleteMode[lang],
  exitDeleteMode: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.exitDeleteMode[lang],
  selectAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.selectAll[lang],
  deselectAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.deselectAll[lang],
  deleteSelected: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.deleteSelected[lang],
  itemsSelected: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.itemsSelected[lang],
  pageSize: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pageSize[lang],
  totalItems: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.totalItems[lang],
  filtered: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filtered[lang],

  // Action Buttons
  deleteButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.deleteButton[lang],
  filterButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filterButton[lang],
  columnSettingsButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columnSettingsButton[lang],

  // Filter Options
  filterStatusLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.label[lang],
  filterStatusAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.options.all[lang],
  filterStatusInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.options.inProgress[lang],
  filterStatusReview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.options.review[lang],
  filterStatusCompleted: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.options.completed[lang],
  filterStatusOnHold: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.status.options.onHold[lang],

  filterClientLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.client.label[lang],
  filterClientAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.client.options.all[lang],

  filterPageCountLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.pageCount.label[lang],
  filterPageCount5: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.pageCount.options["5"][lang],
  filterPageCount10: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.pageCount.options["10"][lang],
  filterPageCount20: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.pageCount.options["20"][lang],
  filterPageCount50: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.filters.pageCount.options["50"][lang],

  // Column Settings
  columnLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.label[lang],
  columnDragToReorder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.dragToReorder[lang],
  columnEyeIconDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.eyeIconDescription[lang],
  columnShowColumn: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.showColumn[lang],
  columnHideColumn: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.hideColumn[lang],
  columnProjectName: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.projectName[lang],
  columnClient: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.client[lang],
  columnStatus: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.status[lang],
  columnProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.progress[lang],
  columnRegisteredDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.registeredDate[lang],
  columnDueDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.dueDate[lang],
  columnModifiedDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.modifiedDate[lang],
  columnActions: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.columns.options.actions[lang],

  // Pagination
  paginationFirstPage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.firstPage[lang],
  paginationPreviousPage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.previousPage[lang],
  paginationNextPage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.nextPage[lang],
  paginationLastPage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.lastPage[lang],
  paginationPageOf: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.pageOf[lang],
  paginationOf: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.of[lang],
  paginationGoToPage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.list.pagination.goToPage[lang],

  // Detail
  projectList: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.projectList[lang],
  noProjectSelected: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.noProjectSelected[lang],
  projectNo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.projectNo[lang],
  client: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.client[lang],
  progressStatus: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.progressStatus[lang],
  projectProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.projectProgress[lang],
  paymentProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.paymentProgress[lang],
  projectInfo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.projectInfo[lang],
  registered: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.registered[lang],
  dueDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.dueDate[lang],
  modified: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.modified[lang],
  status: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.status[lang],
  moreDetails: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.moreDetails[lang],
  progress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.detail.progress[lang],

  // Main Tabs
  tabOverview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.overview[lang],
  tabDocumentManagement: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentManagement[lang],
  tabTaxManagement: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxManagement[lang],

  // Document Management Sub Tabs
  tabContract: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentSubs.contract[lang],
  tabInvoice: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentSubs.invoice[lang],
  tabReport: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentSubs.report[lang],
  tabEstimate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentSubs.estimate[lang],
  tabOthers: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.documentSubs.others[lang],

  // Tax Management Sub Tabs
  tabTaxInvoice: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxSubs.taxInvoice[lang],
  tabWithholding: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxSubs.withholding[lang],
  tabVat: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxSubs.vat[lang],
  tabCashReceipt: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxSubs.cashReceipt[lang],
  tabCardReceipt: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.tabs.taxSubs.cardReceipt[lang],

  // Main Tab Descriptions
  overviewDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.overviewDesc[lang],
  documentManagementDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.documentManagementDesc[lang],
  taxManagementDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.taxManagementDesc[lang],

  // Document Management Sub Tab Descriptions
  contractDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.contractDesc[lang],
  invoiceDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.invoiceDesc[lang],
  reportDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.reportDesc[lang],
  estimateDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.estimateDesc[lang],
  othersDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.othersDesc[lang],

  // Tax Management Sub Tab Descriptions
  taxInvoiceDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.taxInvoiceDesc[lang],
  withholdingDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.withholdingDesc[lang],
  vatDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.vatDesc[lang],
  cashReceiptDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.cashReceiptDesc[lang],
  cardReceiptDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.descriptions.cardReceiptDesc[lang],

  // Labels
  projectStatus: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.projectStatus[lang],
  taskProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.taskProgress[lang],
  taskProgressTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.taskProgressTooltip[lang],
  paymentStatus: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.paymentStatus[lang],
  currentStage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.currentStage[lang],
  hasContract: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.hasContract[lang],
  hasBilling: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.hasBilling[lang],
  hasDocuments: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.hasDocuments[lang],
  contractInfo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.contractInfo[lang],
  billingInfo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.billingInfo[lang],
  documentInfo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.labels.documentInfo[lang],

  // Messages
  contractLoading: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.contractLoading[lang],
  contractEmpty: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.contractEmpty[lang],
  billingLoading: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.billingLoading[lang],
  billingEmpty: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.billingEmpty[lang],
  documentsLoading: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.documentsLoading[lang],
  documentsEmpty: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.documentsEmpty[lang],

  // Actions
  edit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.actions.edit[lang],
  save: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.save[lang],
  saving: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.saving[lang],
  cancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.cancel[lang],
  cancelEdit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.cancelEdit[lang],
  confirmCancelTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.confirmCancelTitle[lang],
  confirmCancelMessage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.confirmCancelMessage[lang],
  confirmCancelButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.confirmCancelButton[lang],
  continueEditing: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.continueEditing[lang],
  documentEdit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.documentEdit[lang],
  documentPreview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.documentPreview[lang],
  documentEditDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.documentEditDescription[lang],
  documentPreviewDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.documentPreviewDescription[lang],
  close: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.actions.close[lang],

  // 프로젝트 자료 현황
  documentsStatusTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.title[lang],
  documentContract: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.documents.contract[lang],
  documentInvoice: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.documents.invoice[lang],
  documentReport: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.documents.report[lang],
  documentEstimate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.documents.estimate[lang],
  documentOthers: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.documents.others[lang],
  statusPending: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.status.pending[lang],
  statusInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.status.inProgress[lang],
  statusCompleted: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentsStatus.status.completed[lang],
  deleteSingleTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.singleTitle[lang],
  deleteSingleDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.singleDescription[lang],
  deleteBulkTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.bulkTitle[lang],
  deleteBulkDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.bulkDescription[lang],
  deleteConfirmLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.confirmLabel[lang],
  deleteCancelLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.documentDeleteModal.cancelLabel[lang],

  // 프로젝트 상세 정보
  projectDetailsTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.title[lang],
  fieldTotalAmount: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.totalAmount[lang],
  fieldProjectName: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.projectName[lang],
  fieldProjectNo: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.projectNo[lang],
  fieldCurrency: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.currency[lang],
  fieldSettlementMethod: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.settlementMethod[lang],
  fieldAdvance: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.advance[lang],
  fieldProjectContent: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.fields.projectContent[lang],
  placeholderNotSet: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.placeholders.notSet[lang],
  placeholderNoContent: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.placeholders.noContent[lang],
  placeholderAmount: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.placeholders.amount[lang],
  actionEdit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.edit[lang],
  actionSave: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.save[lang],
  actionCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.actions.cancel[lang],

  // Delete Modal
  deleteModalTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.title[lang],
  deleteModalMessage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.message[lang],
  deleteModalConfirm: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.confirm[lang],
  deleteModalCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.cancel[lang],

  // 프로젝트 생성 모달 - 현재 단계 설명
  createModalCurrentStageNote: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.note[lang],
  createModalCurrentStageExplanationTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.title[lang],
  createModalCurrentStageExplanationSummary: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.summary[lang],
  createModalCurrentStageExplanationPlanning: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.planning[lang],
  createModalCurrentStageExplanationReview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.review[lang],
  createModalCurrentStageExplanationInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.inProgress[lang],
  createModalCurrentStageExplanationManual: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.manual[lang],

  // 프로젝트 상세 - 단계 흐름 설명 (편집 모드 툴팁용)
  statusFlowTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.title[lang],
  statusFlowSummary: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.summary[lang],
  statusFlowPlanning: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.planning[lang],
  statusFlowReview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.review[lang],
  statusFlowInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.inProgress[lang],
  statusFlowManual: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.manual[lang],
  statusFlowAutoComplete: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.autoComplete[lang],

  // 프로젝트 상세 - 단계 초기화 버튼
  statusResetLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.label[lang],
  statusResetTooltip: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.tooltip[lang],
  statusResetConfirmTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.confirmTitle[lang],
  statusResetConfirmMessage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.confirmMessage[lang],
  statusResetConfirmButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.confirmButton[lang],
  statusResetCancelButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.resetButton.cancelButton[lang],

  // WBS (Work Breakdown Structure) 관련
  wbsSectionTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.sectionTitle[lang],
  wbsAddTask: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.addTask[lang],
  wbsAddTaskDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.addTaskDescription[lang],
  wbsEmptyState: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.emptyState[lang],
  wbsEmptyStateDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.emptyStateDescription[lang],
  wbsTaskName: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.taskName[lang],
  wbsTaskDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.taskDescription[lang],
  wbsTaskStatus: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.taskStatus[lang],
  wbsTaskCount: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.taskCount[lang],
  wbsCompletedCount: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.completedCount[lang],
  wbsProgressCalculation: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.progressCalculation[lang],
  wbsDragToReorder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.dragToReorder[lang],
  wbsDeleteTask: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.deleteTask[lang],
  wbsConfirmDelete: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.confirmDelete[lang],
  wbsDeleteAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.deleteAll[lang],
  wbsConfirmDeleteAll: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.confirmDeleteAll[lang],
  wbsDeleteAllDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.deleteAllDescription[lang],
  // WBS 템플릿 선택 (프로젝트 생성 모달용)
  wbsTemplateSelectLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.templateSelectLabel[lang],
  wbsTemplateSelectPlaceholder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.templateSelectPlaceholder[lang],
  wbsTemplateSelectHelp: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.templateSelectHelp[lang],
  // WBS 빠른 템플릿 추가 기능
  wbsQuickAddButton: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.quickAddButton[lang],
  wbsQuickAddTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.quickAddTitle[lang],
  wbsQuickAddDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.quickAddDescription[lang],
  wbsQuickAddConfirm: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.quickAddConfirm[lang],
  wbsQuickAddCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.wbs.quickAddCancel[lang]
}

// WBS 작업 상태 텍스트 헬퍼 함수
export const getWBSStatusText = (status: 'pending' | 'in_progress' | 'completed', lang: 'ko' | 'en' = defaultLanguage) => {
  return uiText.componentDemo.projectPage.projectDetails.wbs.statuses[status][lang];
};

// WBS 템플릿 텍스트 헬퍼 함수
export const getWBSTemplateText = (template: 'standard' | 'consulting' | 'education' | 'custom', lang: 'ko' | 'en' = defaultLanguage) => {
  return uiText.componentDemo.projectPage.projectDetails.wbs.templates[template][lang];
};

// WBS 템플릿 설명 헬퍼 함수
export const getWBSTemplateDescription = (template: 'standard' | 'consulting' | 'education' | 'custom', lang: 'ko' | 'en' = defaultLanguage) => {
  return uiText.componentDemo.projectPage.projectDetails.wbs.templateDescriptions[template][lang];
}

// 프로젝트 상태 텍스트 헬퍼 함수
export const getProjectStatusText = (status: string, lang: 'ko' | 'en' = defaultLanguage) => {
  const statusMap = {
    planning: uiText.projectStatus.planning[lang],
    in_progress: uiText.projectStatus.in_progress[lang],
    review: uiText.projectStatus.review[lang],
    completed: uiText.projectStatus.completed[lang],
    on_hold: uiText.projectStatus.on_hold[lang],
    cancelled: uiText.projectStatus.cancelled[lang]
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export const getProjectStatusTitle = (lang: 'ko' | 'en' = defaultLanguage) => uiText.projectStatus.title[lang];
export const getProjectStatusDescription = (lang: 'ko' | 'en' = defaultLanguage) => uiText.projectStatus.description[lang];

// 뷰 모드 텍스트 접근 함수
export const getViewModeText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.title[lang],
  description: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.description[lang],
  listView: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.listView[lang],
  detailView: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.detailView[lang],
  switchToList: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.switchToList[lang],
  switchToDetail: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.viewMode.switchToDetail[lang]
}

// 홈 페이지 텍스트
export const getHomeText = {
  hero: {
    badge: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '🚀 프리랜서 & 1인 기업을 위한 완벽한 솔루션' : '🚀 Perfect Solution for Freelancers & Solopreneurs',
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '나를 위한 단 하나의 업무 플랫폼' : 'Your One and Only Work Platform',
    subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 관리부터 세무 신고까지' : 'From Project Management to Tax Filing',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프리랜서와 1인 기업이 클라이언트, 프로젝트 관리, 세무 업무를 한 곳에서 해결할 수 있는 통합 솔루션입니다.' : 'An integrated solution for solopreneurs and freelancers to manage clients, track projects, and handle taxes all in one place.',
    primaryAction: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지금 시작하기' : 'Get Started',
    secondaryAction: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '자세히 알아보기' : 'Learn More'
  },
  stats: {
    users: {
      value: '10,000+',
      label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '활성 사용자' : 'Active Users'
    },
    projects: {
      value: '50,000+',
      label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행된 프로젝트' : 'Projects Completed'
    },
    satisfaction: {
      value: '98%',
      label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '고객 만족도' : 'Customer Satisfaction'
    },
    uptime: {
      value: '99.9%',
      label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '서비스 가동률' : 'Service Uptime'
    }
  },
  targetUsers: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '누구를 위한 서비스인가요?' : 'Who is this for?',
    subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'Weave는 다양한 1인 사업자를 위해 설계되었습니다' : 'Weave is designed for various solo entrepreneurs',
    getUser: (index: number, lang: 'ko' | 'en' = defaultLanguage) => {
      const users = [
        { title: lang === 'ko' ? '프리랜서 개발자' : 'Freelance Developers', description: lang === 'ko' ? '프로젝트 관리와 인보이스 발행을 한 번에 해결하세요' : 'Manage projects and invoicing in one place' },
        { title: lang === 'ko' ? '디자이너' : 'Designers', description: lang === 'ko' ? '클라이언트 작업을 체계적으로 관리하고 추적하세요' : 'Systematically manage and track client work' },
        { title: lang === 'ko' ? '1인 기업' : 'Solo Entrepreneurs', description: lang === 'ko' ? '사업 운영에 필요한 모든 도구를 한 곳에서 사용하세요' : 'Use all the tools you need for business operations in one place' },
        { title: lang === 'ko' ? '컨설턴트' : 'Consultants', description: lang === 'ko' ? '고객 관리부터 세무 처리까지 통합 관리하세요' : 'Integrated management from client relations to tax processing' }
      ]
      return users[index] || users[0]
    }
  },
  features: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '핵심 기능' : 'Core Features',
    subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '비즈니스 성장을 위한 강력한 도구들' : 'Powerful tools for business growth',
    project: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 관리' : 'Project Management',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 상황을 한눈에 파악하고 효율적으로 관리하세요' : 'Track progress at a glance and manage efficiently'
    },
    tax: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세무 관리' : 'Tax Management',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금 신고와 납부를 간편하게 처리하세요' : 'Handle tax filing and payments easily'
    },
    analytics: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '데이터 분석' : 'Data Analytics',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '비즈니스 인사이트를 얻고 성장 전략을 수립하세요' : 'Gain business insights and develop growth strategies'
    },
    integration: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '통합 연동' : 'Integration',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '필요한 모든 도구와 서비스를 연결하세요' : 'Connect all the tools and services you need'
    }
  },
  carousel: {
    getItem: (index: number, lang: 'ko' | 'en' = defaultLanguage) => {
      const items = [
        { title: lang === 'ko' ? '간편한 프로젝트 관리' : 'Easy Project Management', description: lang === 'ko' ? '복잡한 프로젝트도 직관적인 인터페이스로 쉽게 관리할 수 있습니다. 진행 상황을 실시간으로 파악하고 팀원들과 효율적으로 협업하세요.' : 'Manage complex projects easily with an intuitive interface. Track progress in real-time and collaborate efficiently with team members.' },
        { title: lang === 'ko' ? '스마트한 세무 처리' : 'Smart Tax Processing', description: lang === 'ko' ? '세금 계산부터 신고까지 자동화된 시스템으로 처리하세요. 세무 전문가 없이도 정확한 세무 처리가 가능합니다.' : 'Process everything from tax calculations to filing with an automated system. Accurate tax processing without a tax expert.' },
        { title: lang === 'ko' ? '실시간 비즈니스 인사이트' : 'Real-time Business Insights', description: lang === 'ko' ? '대시보드에서 비즈니스 현황을 한눈에 파악하세요. 데이터 기반의 의사결정으로 더 빠른 성장을 이루세요.' : 'View your business status at a glance on the dashboard. Achieve faster growth with data-driven decision making.' },
        { title: lang === 'ko' ? '완벽한 통합 환경' : 'Complete Integration Environment', description: lang === 'ko' ? '필요한 모든 비즈니스 도구를 하나의 플랫폼에서 사용하세요. 더 이상 여러 서비스를 오가며 시간을 낭비할 필요가 없습니다.' : 'Use all the business tools you need on one platform. No more wasting time switching between multiple services.' }
      ]
      return items[index] || items[0]
    }
  },
  cta: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지금 바로 시작하세요' : 'Start Right Now',
    subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '더 이상 복잡한 비즈니스 관리로 시간을 낭비하지 마세요' : "Don't waste time on complex business management anymore",
    button: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '무료로 시작하기' : 'Start for Free',
    getFeature: (index: number, lang: 'ko' | 'en' = defaultLanguage) => {
      const features = [
        lang === 'ko' ? '신용카드 없이 시작' : 'No credit card required',
        lang === 'ko' ? '14일 무료 체험' : '14-day free trial',
        lang === 'ko' ? '언제든 취소 가능' : 'Cancel anytime'
      ]
      return features[index] || features[0]
    }
  }
}

// 대시보드 텍스트
export const getDashboardText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '대시보드' : 'Dashboard',
  subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '비즈니스 현황을 한눈에' : 'Your Business at a Glance',
  welcome: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '환영합니다' : 'Welcome',
  overview: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전체 현황' : 'Overview',
  autoLayout: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '자동 정렬' : 'Auto Layout',
  verticalAlign: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위로 정렬' : 'Align Top',
  optimizeLayout: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위치 최적화' : 'Optimize Layout',
  resetLayout: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '초기화' : 'Reset Layout',
  editMode: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '편집' : 'Edit',
  complete: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료' : 'Done',
  addWidget: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 추가' : 'Add Widget',
  selectWidget: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 선택' : 'Select Widget',
  cancel: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '취소' : 'Cancel',

  // 위젯 관련
  widgets: {
    calendar: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '캘린더' : 'Calendar',
    todoList: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '할 일 목록' : 'To-Do List',
    projectSummary: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 현황' : 'Project Summary',
    kpiMetrics: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '핵심 성과 지표' : 'KPI Metrics',
    taxDeadline: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세무 일정' : 'Tax Deadline',
    revenueChart: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '매출 차트' : 'Revenue Chart',
    taxCalculator: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금 계산기' : 'Tax Calculator',
    recentActivity: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최근 활동' : 'Recent Activity',
    weather: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날씨' : 'Weather',
    custom: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 위젯' : 'New Widget'
  },

  // 위젯 액션
  closeWidget: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 닫기' : 'Close Widget',
  noSpaceAlert: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯을 추가할 공간이 없습니다. 기존 위젯을 조정해주세요.' : 'No space for new widget. Please adjust existing widgets.',

  // 툴팁
  resetLayoutTooltip: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 배치를 초기 상태로 되돌립니다' : 'Reset widget layout to initial state',

  // 초기화 모달
  resetModal: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 배치 초기화' : 'Reset Widget Layout',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯 배치를 초기 상태로 되돌리시겠습니까?\n(위젯 내부 데이터는 유지됩니다)' : 'Reset widget layout to initial state?\n(Widget data will be preserved)',
    confirmButton: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '초기화' : 'Reset',
    cancelButton: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '취소' : 'Cancel'
  }
}

// 세금 관리 텍스트
export const getTaxManagementText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세무 관리' : 'Tax Management',
  subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '간편한 세무 신고와 절세 전략' : 'Simple Tax Filing and Tax Saving Strategies',
  serviceTitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세무 서비스 준비중' : 'Tax Service Coming Soon',
  serviceDescription: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 
    'Weave는 1인 기업을 위한 종합 세무 관리 서비스를 준비하고 있습니다.' : 
    'Weave is preparing comprehensive tax management services for solo entrepreneurs.',
  deadline: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '납부 기한' : 'Payment Deadline',
  status: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '처리 상태' : 'Processing Status',
  comingSoon: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '서비스 출시 예정' : 'Service Launch Coming Soon',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 
      '세무 관리 기능은 현재 개발 중이며, 곧 만나보실 수 있습니다. 출시 알림을 신청하시면 가장 먼저 소식을 전해드리겠습니다.' : 
      'Tax management features are currently under development and will be available soon. Sign up for launch notifications to be the first to know.'
  },
  plannedServices: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '제공 예정 서비스' : 'Planned Services',
    comprehensiveTax: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '종합소득세 신고' : 'Comprehensive Income Tax Filing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프리랜서와 1인 기업을 위한 종합소득세 신고 대행 서비스' : 'Comprehensive income tax filing service for freelancers and solo entrepreneurs'
    },
    corporateTax: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원천세 신고' : 'Corporate Tax Filing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '3.3%, 8.8% 소득신고를 위한 원천세 신고 및 관리 서비스' : 'Corporate tax filing and management service for business entities'
    },
    vat: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '부가가치세 신고' : 'VAT Filing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '정기적인 부가가치세 신고 및 매입매출 관리' : 'Regular VAT filing and purchase/sales management'
    },
    consultation: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세무 상담' : 'Tax Consultation',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전문 세무사와의 1:1 맞춤형 세무 상담 서비스' : '1:1 personalized tax consultation with professional tax advisors'
    },
    income: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '종합소득세 신고' : 'Income Tax Filing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '연말정산 및 종합소득세 간편 신고' : 'Year-end settlement and easy income tax filing'
    },
    withholding: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원천징수 관리' : 'Withholding Tax Management',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원천징수 대상 자동 계산 및 신고' : 'Automatic calculation and filing of withholding tax'
    },
    expense: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '경비 처리' : 'Expense Processing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '영수증 자동 인식 및 경비 관리' : 'Automatic receipt recognition and expense management'
    }
  },
  features: {
    partnership: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전문 세무사 파트너십' : 'Professional Tax Advisor Partnership',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '검증된 세무 전문가들과 함께 정확하고 안전한 세무 처리를 지원합니다.' : 'Work with verified tax professionals for accurate and secure tax processing.'
    },
    automation: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '자동화된 세무 처리' : 'Automated Tax Processing',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '매출과 지출 데이터를 자동으로 분석하여 세무 신고를 간편하게 처리합니다.' : 'Automatically analyze revenue and expense data for simplified tax filing.'
    },
    optimization: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '절세 전략 제안' : 'Tax Saving Strategy Proposals',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'AI가 비즈니스 데이터를 분석하여 맞춤형 절세 전략을 제안합니다.' : 'AI analyzes business data to propose personalized tax saving strategies.'
    }
  }
}

// 위젯 텍스트
export const getWidgetText = {
  title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위젯' : 'Widget',
  calendar: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '캘린더' : 'Calendar',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '일정을 확인하세요' : 'Check your schedule',
    today: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '오늘' : 'Today',
    month: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월' : 'Month',
    week: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '주' : 'Week',
    maximize: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최대화' : 'Maximize',
    minimize: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최소화' : 'Minimize',
    fullScreen: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전체 화면' : 'Full Screen',
    dragToMove: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '드래그하여 이동' : 'Drag to move',
    dragging: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '드래그 중...' : 'Dragging...',
    dropToReschedule: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '다른 날짜에 놓아서 일정 변경' : 'Drop on another date to reschedule'
  },
  stats: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '통계' : 'Statistics',
    totalRevenue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '총 수익' : 'Total Revenue',
    activeProjects: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 중인 프로젝트' : 'Active Projects',
    completedTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료된 작업' : 'Completed Tasks',
    upcomingDeadlines: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '다가오는 마감일' : 'Upcoming Deadlines'
  },
  projectWidget: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 현황' : 'Project Status',
    progress: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행률' : 'Progress',
    deadline: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '마감일' : 'Deadline',
    budget: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '예산' : 'Budget',
    team: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '팀' : 'Team'
  },
  quickActions: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '빠른 작업' : 'Quick Actions',
    newProject: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 프로젝트' : 'New Project',
    createInvoice: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '인보이스 생성' : 'Create Invoice',
    addExpense: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지출 추가' : 'Add Expense',
    viewReports: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '리포트 보기' : 'View Reports',
    actions: {
      newProject: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 프로젝트' : 'New Project',
      createInvoice: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '인보이스 생성' : 'Create Invoice',
      newInvoice: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 인보이스' : 'New Invoice',
      addExpense: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지출 추가' : 'Add Expense',
      addClient: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '클라이언트 추가' : 'Add Client'
    }
  },
  taxDeadline: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금 납부 일정' : 'Tax Payment Schedule',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금 납부 일정을 확인하세요' : 'Check your tax payment schedule',
    upcoming: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '다가오는 납부일' : 'Upcoming Payments',
    overdue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '미납' : 'Overdue',
    completed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료' : 'Completed'
  },
  taxCalculator: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금 계산기' : 'Tax Calculator',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '부가세, 원천세를 간편하게 계산하세요' : 'Easily calculate VAT and withholding tax',
    supplyAmount: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '공급가액' : 'Supply Amount',
    taxAmount: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '세금액' : 'Tax Amount',
    totalAmount: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '총액' : 'Total Amount',
    netAmount: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '실수령액' : 'Net Amount',
    vat: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '부가세 (10%)' : 'VAT (10%)',
    withholding33: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원천세 (3.3%)' : 'Withholding (3.3%)',
    withholding88: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원천세 (8.8%)' : 'Withholding (8.8%)',
    fromSupply: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '공급가액 기준' : 'From Supply',
    fromTotal: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '총액 기준' : 'From Total',
    calculate: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '계산' : 'Calculate',
    reset: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '초기화' : 'Reset',
    history: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '계산 기록' : 'History',
    placeholder: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '금액을 입력하세요' : 'Enter amount',
    copyResult: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '결과 복사' : 'Copy Result',
    clearHistory: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '기록 삭제' : 'Clear History'
  },
  projectSummary: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 요약' : 'Project Summary',
    active: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 중' : 'Active',
    completed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료됨' : 'Completed',
    delayed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지연' : 'Delayed',
    total: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전체' : 'Total',
    projectsInProgress: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '개 진행 중' : ' in progress',
    noProjects: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 중인 프로젝트가 없습니다' : 'No projects in progress',
    addProject: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트 추가' : 'Add Project',
    viewProgress: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 상황 보기' : 'View Progress'
  },
  todoList: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '할 일 목록' : 'Todo List',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '오늘의 작업을 관리하세요' : 'Manage your tasks today',
    addTask: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '작업 추가' : 'Add Task',
    addTaskPrompt: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '작업을 추가하려면 + 버튼을 클릭하세요' : 'Click + button to add task',
    newTask: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 작업' : 'New Task',
    placeholder: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새로운 작업을 입력하세요' : 'Enter new task',
    newSection: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새 섹션 추가' : 'Add new section',
    defaultSection: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '📌 미구분' : '📌 Uncategorized',
    completed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료됨' : 'Completed',
    pending: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '대기 중' : 'Pending',
    noTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '할 일이 없습니다' : 'No tasks',
    noCompletedTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료된 작업이 없습니다' : 'No completed tasks',
    emptyState: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '아직 할 일이 없어요' : 'No tasks yet',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새로운 할 일을 추가하여 업무를 시작하세요' : 'Add a new task to get started',
      actionHint: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '상단의 + 버튼을 클릭하거나\n아래 버튼을 눌러 첫 할 일을 만들어보세요' : 'Click the + button above or\nthe button below to create your first task'
    },
    priority: {
      high: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '높음' : 'High',
      medium: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '보통' : 'Medium',
      low: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '낮음' : 'Low'
    },
    priorities: {
      p1: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '긴급' : 'Urgent',
      p2: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '높음' : 'High',
      p3: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '보통' : 'Medium',
      p4: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '낮음' : 'Low'
    },
    viewMode: {
      section: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '섹션' : 'Section',
      date: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날짜' : 'Date'
    },
    dateGroups: {
      overdue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지연됨' : 'Overdue',
      today: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '오늘' : 'Today',
      tomorrow: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '내일' : 'Tomorrow',
      thisWeek: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이번 주' : 'This Week',
      nextWeek: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '다음 주' : 'Next Week',
      noDate: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날짜 미정' : 'No Date'
    },
    confirmDelete: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이 할 일을 삭제하시겠습니까?' : 'Are you sure you want to delete this task?',
    confirmDeleteSection: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이 섹션과 포함된 모든 할 일을 삭제하시겠습니까?' : 'Are you sure you want to delete this section and all tasks in it?',
    dateBadges: {
      daysAgo: (days: number, lang: 'ko' | 'en' = defaultLanguage) => 
        lang === 'ko' ? `${days}일 전` : `${days}d ago`,
      daysOverdue: (days: number, lang: 'ko' | 'en' = defaultLanguage) => 
        lang === 'ko' ? `D+${days}` : `D+${days}`,
      daysLeft: (days: number, lang: 'ko' | 'en' = defaultLanguage) => 
        lang === 'ko' ? `D-${days}` : `D-${days}`,
      daysLater: (days: number, lang: 'ko' | 'en' = defaultLanguage) => 
        lang === 'ko' ? `${days}일 후` : `${days}d later`,
      today: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '오늘' : 'Today',
      tomorrow: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '내일' : 'Tomorrow',
      yesterday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '어제' : 'Yesterday'
    },
    dueDateSettings: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '마감일 설정' : 'Set Due Date',
      clear: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지우기' : 'Clear'
    },
    emptySection: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '작업을 추가하려면 클릭하세요' : 'Click to add tasks',
    options: {
      title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '할 일 목록 설정' : 'Todo List Settings',
      description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '표시 방식을 원하는대로 조정하세요' : 'Adjust display settings as you prefer',
      dateFormat: {
        label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '마감일 표기 형식' : 'Due Date Format',
        dday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'D-day 형식' : 'D-day Format',
        date: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날짜 형식' : 'Date Format'
      },
      subtaskDisplay: {
        label: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '하위 태스크 표시' : 'Subtask Display',
        expanded: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '모두 펼치기' : 'Expand All',
        collapsed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '모두 접기' : 'Collapse All'
      },
      save: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '저장' : 'Save',
      cancel: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '취소' : 'Cancel'
    }
  },
  chart: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '차트' : 'Chart',
    subtitle: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월별 데이터' : 'Monthly Data',
    revenue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '수익' : 'Revenue',
    expenses: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지출' : 'Expenses',
    profit: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이익' : 'Profit'
  },
  kpiMetrics: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '핵심 성과 지표' : 'KPI Metrics',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '주요 비즈니스 지표를 한눈에 확인하세요' : 'View key business metrics at a glance',
    monthlyRevenue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월 매출' : 'Monthly Revenue',
    yearlyRevenue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '연간 매출' : 'Yearly Revenue',
    activeProjects: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 프로젝트' : 'Active Projects',
    monthlyProjects: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '신규 프로젝트' : 'New Projects',
    totalProjects: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '총 프로젝트' : 'Total Projects',
    completedTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료 작업' : 'Completed Tasks',
    yearlyTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '연간 작업' : 'Yearly Tasks',
    growth: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '성장률' : 'Growth Rate',
    target: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '목표' : 'Target',
    actual: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '실제' : 'Actual',
    trend: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '추세' : 'Trend',
    increase: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '증가' : 'Increase',
    decrease: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '감소' : 'Decrease',
    unchanged: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '변동없음' : 'Unchanged',
    unit: {
      currency: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '원' : 'KRW',
      count: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '건' : 'items',
      percent: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '%' : '%',
      days: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '일' : 'days'
    }
  },
  // 위젯 훅 전용 텍스트 (useProjectSummary, useKPIMetrics, useRevenueChart, useRecentActivity)
  hooks: {
    // 프로젝트 상태 라벨
    projectStatus: {
      planning: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '기획' : 'Planning',
      inProgress: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행중' : 'In Progress',
      review: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '검토' : 'Review',
      completed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료' : 'Completed',
      onHold: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '보류' : 'On Hold',
      cancelled: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '취소' : 'Cancelled'
    },
    // 기본 텍스트 (fallback)
    fallback: {
      noClient: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '클라이언트 미지정' : 'Client Not Assigned',
      noTasks: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이 프로젝트에 연결된 작업이 없습니다' : 'No tasks linked to this project',
      tasksInProgress: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '진행 중인 작업' : 'Tasks in progress',
      tasksCount: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '개' : ' tasks'
    },
    // 활동 액션 텍스트
    activityActions: {
      projectCreated: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트를 생성했습니다' : 'created a project',
      projectCompleted: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '프로젝트를 완료했습니다' : 'completed a project',
      taskCreated: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '작업을 생성했습니다' : 'created a task',
      taskCompleted: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '작업을 완료했습니다' : 'completed a task',
      documentUploaded: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '문서를 업로드했습니다' : 'uploaded a document'
    },
    // 활동 설명 (description)
    activityDescriptions: {
      clientPrefix: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '클라이언트: ' : 'Client: ',
      documentTypePrefix: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '문서 유형: ' : 'Document Type: '
    },
    // 월 이름
    monthNames: {
      january: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '1월' : 'January',
      february: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '2월' : 'February',
      march: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '3월' : 'March',
      april: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '4월' : 'April',
      may: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '5월' : 'May',
      june: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '6월' : 'June',
      july: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '7월' : 'July',
      august: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '8월' : 'August',
      september: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '9월' : 'September',
      october: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '10월' : 'October',
      november: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '11월' : 'November',
      december: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '12월' : 'December'
    },
    // 분기 이름
    quarterNames: {
      q1: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '1분기' : 'Q1',
      q2: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '2분기' : 'Q2',
      q3: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '3분기' : 'Q3',
      q4: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '4분기' : 'Q4'
    }
  },
  revenueChart: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '매출 차트' : 'Revenue Chart',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월별/분기별 수익을 차트로 표시' : 'Display monthly/quarterly revenue in charts',
    monthly: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월별' : 'Monthly',
    quarterly: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '분기별' : 'Quarterly',
    yearly: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '연간' : 'Yearly',
    revenue: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '매출' : 'Revenue',
    profit: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '이익' : 'Profit',
    expenses: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '지출' : 'Expenses',
    growth: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '성장률' : 'Growth Rate',
    compare: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '비교' : 'Compare',
    previousYear: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전년 동기' : 'Previous Year',
    target: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '목표' : 'Target',
    actual: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '실제' : 'Actual',
    noData: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '데이터가 없습니다' : 'No data available',
    unit: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '만원' : '10K KRW',
    total: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '총 매출' : 'Total Revenue',
    avgGrowth: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '평균 성장률' : 'Avg Growth Rate'
  },
  recentActivity: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최근 활동' : 'Recent Activity',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최근 작업 및 변경사항을 확인하세요' : 'Check recent work and changes',
    noActivity: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최근 활동이 없습니다' : 'No recent activity',
    filterAll: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '전체' : 'All',
    filterCreate: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '생성' : 'Create',
    filterUpdate: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '수정' : 'Update',
    filterComplete: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '완료' : 'Complete',
    filterDelete: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '삭제' : 'Delete',
    filterComment: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '댓글' : 'Comment',
    filterDocument: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '문서' : 'Document',
    userAll: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '모든 사용자' : 'All Users',
    timeJustNow: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '방금 전' : 'Just now',
    timeMinutes: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '분 전' : 'min ago',
    timeHours: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '시간 전' : 'hrs ago',
    timeDays: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '일 전' : 'days ago'
  },
  weather: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날씨 정보' : 'Weather Info',
    description: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '현재 위치 날씨 및 5일 예보' : 'Current weather and 5-day forecast',
    currentLocation: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '현재 위치' : 'Current Location',
    temperature: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '온도' : 'Temperature',
    feelsLike: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '체감' : 'Feels Like',
    humidity: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '습도' : 'Humidity',
    windSpeed: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '풍속' : 'Wind Speed',
    pressure: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '기압' : 'Pressure',
    uvIndex: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '자외선' : 'UV Index',
    visibility: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '가시거리' : 'Visibility',
    precipitation: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '강수확률' : 'Precipitation',
    forecast: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '5일 예보' : '5-Day Forecast',
    todayForecast: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '오늘' : 'Today',
    high: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최고' : 'High',
    low: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '최저' : 'Low',
    lastUpdated: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '마지막 업데이트' : 'Last Updated',
    refresh: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '새로고침' : 'Refresh',
    changeLocation: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '위치 변경' : 'Change Location',
    loading: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날씨 정보를 불러오는 중...' : 'Loading weather...',
    error: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '날씨 정보를 불러올 수 없습니다' : 'Failed to load weather',
    conditions: {
      clear: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '맑음' : 'Clear',
      partlyCloudy: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '구름 조금' : 'Partly Cloudy',
      cloudy: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '흐림' : 'Cloudy',
      rain: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '비' : 'Rain',
      snow: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '눈' : 'Snow',
      storm: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '폭풍' : 'Storm',
      fog: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '안개' : 'Fog',
      windy: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '강풍' : 'Windy'
    },
    units: {
      celsius: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '°C' : '°C',
      fahrenheit: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '°F' : '°F',
      kmPerHour: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'km/h' : 'km/h',
      meterPerSec: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'm/s' : 'm/s',
      percent: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '%' : '%',
      hPa: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'hPa' : 'hPa',
      km: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? 'km' : 'km'
    },
    weekdays: {
      sunday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '일' : 'Sun',
      monday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '월' : 'Mon',
      tuesday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '화' : 'Tue',
      wednesday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '수' : 'Wed',
      thursday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '목' : 'Thu',
      friday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '금' : 'Fri',
      saturday: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '토' : 'Sat'
    }
  },
  // 설정 페이지 텍스트 (2025-10-07 추가)
  settings: {
    page: {
      title: { ko: "설정", en: "Settings" },
      description: { ko: "프로필, 결제, 사용량 및 요금제를 관리하세요", en: "Manage your profile, billing, usage, and plan" }
    },
    tabs: {
      profile: { ko: "프로필", en: "Profile" },
      billing: { ko: "결제", en: "Billing" },
      usage: { ko: "사용량", en: "Usage" },
      plan: { ko: "요금제", en: "Plan" }
    },
    // 프로필 탭
    profile: {
      title: { ko: "프로필 정보", en: "Profile Information" },
      description: { ko: "사용자 정보를 관리하세요", en: "Manage your user information" },
      fields: {
        name: { ko: "이름", en: "Name" },
        email: { ko: "이메일", en: "Email" },
        phone: { ko: "전화번호", en: "Phone" },
        businessNumber: { ko: "사업자등록번호", en: "Business Registration Number" },
        address: { ko: "주소", en: "Address" },
        addressDetail: { ko: "상세주소", en: "Address Detail" },
        businessType: { ko: "사업자 유형", en: "Business Type" }
      },
      placeholders: {
        name: { ko: "홍길동", en: "John Doe" },
        email: { ko: "example@weave.com", en: "example@weave.com" },
        phone: { ko: "010-1234-5678", en: "+82-10-1234-5678" },
        businessNumber: { ko: "123-45-67890", en: "123-45-67890" },
        address: { ko: "서울시 강남구 테헤란로", en: "Teheran-ro, Gangnam-gu, Seoul" },
        addressDetail: { ko: "101동 1001호", en: "Building 101, Unit 1001" }
      },
      businessTypes: {
        freelancer: { ko: "프리랜서", en: "Freelancer" },
        individual: { ko: "개인사업자", en: "Individual Business" },
        corporation: { ko: "법인사업자", en: "Corporation" }
      },
      actions: {
        edit: { ko: "수정", en: "Edit" },
        save: { ko: "저장", en: "Save" },
        cancel: { ko: "취소", en: "Cancel" }
      },
      messages: {
        saveSuccess: { ko: "프로필이 저장되었습니다", en: "Profile saved successfully" },
        saveError: { ko: "저장 중 오류가 발생했습니다", en: "Error saving profile" }
      }
    },
    // 결제 탭
    billing: {
      title: { ko: "결제 정보", en: "Billing Information" },
      description: { ko: "결제 수단 및 결제 내역을 확인하세요", en: "View your payment methods and billing history" },
      paymentMethod: {
        title: { ko: "결제 수단", en: "Payment Method" },
        none: { ko: "등록된 결제 수단이 없습니다", en: "No payment method registered" },
        cardNumber: { ko: "카드 번호", en: "Card Number" },
        expiryDate: { ko: "유효기간", en: "Expiry Date" },
        cardHolder: { ko: "카드 소유자", en: "Card Holder" },
        add: { ko: "결제 수단 추가", en: "Add Payment Method" },
        change: { ko: "변경", en: "Change" },
        remove: { ko: "삭제", en: "Remove" }
      },
      history: {
        title: { ko: "결제 내역", en: "Billing History" },
        none: { ko: "결제 내역이 없습니다", en: "No billing history" },
        date: { ko: "날짜", en: "Date" },
        amount: { ko: "금액", en: "Amount" },
        plan: { ko: "요금제", en: "Plan" },
        status: { ko: "상태", en: "Status" },
        invoice: { ko: "영수증", en: "Invoice" },
        download: { ko: "다운로드", en: "Download" }
      },
      status: {
        paid: { ko: "결제 완료", en: "Paid" },
        pending: { ko: "대기 중", en: "Pending" },
        failed: { ko: "실패", en: "Failed" },
        refunded: { ko: "환불됨", en: "Refunded" }
      }
    },
    // 사용량 탭
    usage: {
      title: { ko: "사용량 현황", en: "Usage Statistics" },
      description: { ko: "현재 사용 중인 리소스를 확인하세요", en: "Check your current resource usage" },
      projects: {
        title: { ko: "프로젝트", en: "Projects" },
        current: { ko: "현재", en: "Current" },
        limit: { ko: "제한", en: "Limit" },
        unlimited: { ko: "무제한", en: "Unlimited" }
      },
      widgets: {
        title: { ko: "위젯", en: "Widgets" },
        current: { ko: "현재", en: "Current" },
        limit: { ko: "제한", en: "Limit" },
        unlimited: { ko: "무제한", en: "Unlimited" }
      },
      storage: {
        title: { ko: "스토리지", en: "Storage" },
        used: { ko: "사용 중", en: "Used" },
        total: { ko: "전체", en: "Total" },
        percentage: { ko: "사용률", en: "Usage" }
      },
      aiService: {
        title: { ko: "AI 서비스", en: "AI Service" },
        available: { ko: "이용 가능", en: "Available" },
        notAvailable: { ko: "이용 불가", en: "Not Available" },
        upgradeRequired: { ko: "Pro 요금제에서 이용 가능합니다", en: "Available in Pro plan" }
      }
    },
    // 요금제 탭
    plan: {
      title: { ko: "요금제 관리", en: "Plan Management" },
      description: { ko: "요금제를 변경하거나 업그레이드하세요", en: "Change or upgrade your plan" },
      current: { ko: "현재 요금제", en: "Current Plan" },
      free: {
        name: { ko: "Free", en: "Free" },
        price: { ko: "무료", en: "Free" },
        description: { ko: "개인 프로젝트에 적합한 무료 플랜", en: "Perfect for personal projects" },
        features: {
          projects: { ko: "프로젝트 2개", en: "2 Projects" },
          widgets: { ko: "위젯 3개", en: "3 Widgets" },
          storage: { ko: "스토리지 100MB", en: "100MB Storage" },
          support: { ko: "커뮤니티 지원", en: "Community Support" }
        }
      },
      basic: {
        name: { ko: "Basic", en: "Basic" },
        price: { ko: "9,900원/월", en: "$9.99/month" },
        description: { ko: "프리랜서를 위한 기본 플랜", en: "Essential plan for freelancers" },
        features: {
          projects: { ko: "프로젝트 무제한", en: "Unlimited Projects" },
          widgets: { ko: "위젯 무제한", en: "Unlimited Widgets" },
          storage: { ko: "스토리지 300MB", en: "300MB Storage" },
          support: { ko: "이메일 지원", en: "Email Support" }
        }
      },
      pro: {
        name: { ko: "Pro", en: "Pro" },
        price: { ko: "29,700원/월", en: "$29.99/month" },
        description: { ko: "전문가를 위한 프리미엄 플랜", en: "Premium plan for professionals" },
        features: {
          projects: { ko: "프로젝트 무제한", en: "Unlimited Projects" },
          widgets: { ko: "위젯 무제한", en: "Unlimited Widgets" },
          storage: { ko: "스토리지 1GB", en: "1GB Storage" },
          ai: { ko: "AI 서비스 이용", en: "AI Service Access" },
          support: { ko: "우선 지원", en: "Priority Support" }
        }
      },
      actions: {
        upgrade: { ko: "업그레이드", en: "Upgrade" },
        downgrade: { ko: "다운그레이드", en: "Downgrade" },
        current: { ko: "현재 플랜", en: "Current Plan" },
        changePlan: { ko: "플랜 변경", en: "Change Plan" },
        confirmUpgrade: { ko: "업그레이드 확인", en: "Confirm Upgrade" },
        confirmDowngrade: { ko: "다운그레이드 확인", en: "Confirm Downgrade" }
      },
      messages: {
        upgradeSuccess: { ko: "요금제가 업그레이드되었습니다", en: "Plan upgraded successfully" },
        downgradeSuccess: { ko: "요금제가 다운그레이드되었습니다", en: "Plan downgraded successfully" },
        upgradeError: { ko: "업그레이드 중 오류가 발생했습니다", en: "Error upgrading plan" },
        downgradeWarning: { ko: "다운그레이드 시 일부 기능이 제한될 수 있습니다", en: "Some features may be limited after downgrading" }
      }
    }
  }
}

// 정산방식 헬퍼 함수
export const getSettlementMethodText = {
  not_set: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.settlementMethods.not_set[lang],
  advance_final: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.settlementMethods.advance_final[lang],
  advance_interim_final: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.settlementMethods.advance_interim_final[lang],
  post_payment: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.settlementMethods.post_payment[lang]
}

// 수금상태 헬퍼 함수
export const getPaymentStatusText = {
  not_started: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.paymentStatuses.not_started[lang],
  advance_completed: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.paymentStatuses.advance_completed[lang],
  interim_completed: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.paymentStatuses.interim_completed[lang],
  final_completed: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.paymentStatuses.final_completed[lang]
}

// 통화 단위 헬퍼 함수
export const getCurrencyText = {
  KRW: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.currencies.KRW[lang],
  USD: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.projectDetails.currencies.USD[lang]
}

// 로딩 헬퍼 함수
export const getLoadingText = {
  // 기본 로딩 메시지
  page: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '페이지를 불러오는 중...' : 'Loading page...',
  content: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '콘텐츠를 불러오는 중...' : 'Loading content...',
  data: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '데이터를 불러오는 중...' : 'Loading data...',
  component: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '컴포넌트를 불러오는 중...' : 'Loading component...',
  pleaseWait: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '잠시만 기다려주세요...' : 'Please wait...',

  // 접근성 레이블
  aria: (lang: 'ko' | 'en' = defaultLanguage) => lang === 'ko' ? '로딩 중' : 'Loading',

  // 프로젝트 관련 로딩 (중앙화된 텍스트 참조)
  contract: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.contractLoading[lang],
  billing: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.billingLoading[lang],
  documents: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.messages.documentsLoading[lang],
}

// 캘린더 이벤트 폼 헬퍼 함수
export const getEventFormText = {
  titleNew: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.titleNew[lang],
  titleEdit: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.titleEdit[lang],
  labelTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelTitle[lang],
  labelType: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelType[lang],
  labelDate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelDate[lang],
  labelAllDay: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelAllDay[lang],
  labelStartTime: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelStartTime[lang],
  labelEndTime: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelEndTime[lang],
  labelLocation: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelLocation[lang],
  labelDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.labelDescription[lang],
  placeholderTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.placeholderTitle[lang],
  placeholderLocation: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.placeholderLocation[lang],
  placeholderDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.placeholderDescription[lang],
  typeMeeting: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeMeeting[lang],
  typeTask: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeTask[lang],
  typeReminder: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeReminder[lang],
  typeDeadline: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeDeadline[lang],
  typeHoliday: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeHoliday[lang],
  typeOther: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.typeOther[lang],
  buttonCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.buttonCancel[lang],
  buttonSave: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.buttonSave[lang],
  buttonUpdate: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.buttonUpdate[lang],
  defaultTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventForm.defaultTitle[lang],
}

// 캘린더 이벤트 상세 헬퍼 함수
export const getEventDetailText = {
  deleteTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.deleteTitle[lang],
  deleteConfirm: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.deleteConfirm[lang],
  buttonDelete: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.buttonDelete[lang],
  buttonCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.buttonCancel[lang],
  buttonClose: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.buttonClose[lang],
  allDay: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.eventDetail.allDay[lang],
}

// 캘린더 아젠다 뷰 헬퍼 함수
export const getAgendaViewText = {
  noEvents: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.agendaView.noEvents[lang],
  today: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.agendaView.today[lang],
}

// 캘린더 데이 뷰 헬퍼 함수
export const getDayViewText = {
  allDay: (lang: 'ko' | 'en' = defaultLanguage) => uiText.calendarWidget.dayView.allDay[lang],
}

// 설정 페이지 헬퍼 함수 (2025-10-07 추가)
export const getSettingsText = {
  // 페이지
  pageTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.page.title[lang],
  pageDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.page.description[lang],

  // 탭
  tabProfile: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.tabs.profile[lang],
  tabBilling: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.tabs.billing[lang],
  tabUsage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.tabs.usage[lang],
  tabPlan: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.tabs.plan[lang],

  // 프로필
  profileTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.profile.title[lang],
  profileDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.profile.description[lang],

  // 결제
  billingTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.billing.title[lang],
  billingDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.billing.description[lang],

  // 사용량
  usageTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.usage.title[lang],
  usageDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.usage.description[lang],

  // 요금제
  planTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.plan.title[lang],
  planDescription: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.plan.description[lang],
  currentPlan: (lang: 'ko' | 'en' = defaultLanguage) => uiText.settings.plan.current[lang],
}

// 충돌 해결 헬퍼 함수 (2025-10-10 추가)
export const getConflictText = {
  // Dialog
  title: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.title[lang],
  entityLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.entityLabel[lang],
  idLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.idLabel[lang],

  // Conflict Types
  localNewer: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.localNewer[lang],
  remoteNewer: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.remoteNewer[lang],
  bothModified: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.bothModified[lang],
  unknown: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.unknown[lang],

  // Strategy Selection
  strategyLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.strategyLabel[lang],
  keepLocal: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.keepLocal[lang],
  keepLocalDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.keepLocalDesc[lang],
  keepRemote: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.keepRemote[lang],
  keepRemoteDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.keepRemoteDesc[lang],
  mergeAuto: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.mergeAuto[lang],
  mergeAutoDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.mergeAutoDesc[lang],
  mergeManual: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.mergeManual[lang],
  mergeManualDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.mergeManualDesc[lang],
  recommended: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.recommended[lang],

  // Manual Merge
  fieldSelectionLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.fieldSelectionLabel[lang],
  fieldSelectionCount: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.fieldSelectionCount[lang],
  fieldLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.fieldLabel[lang],
  localLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.localLabel[lang],
  remoteLabel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.remoteLabel[lang],

  // Buttons
  cancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.cancel[lang],
  resolve: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.resolve[lang],
  resolving: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.resolving[lang],

  // Toast Messages
  failureTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.failureTitle[lang],
  failureDesc: (lang: 'ko' | 'en' = defaultLanguage) => uiText.storage.conflict.failureDesc[lang],
}
