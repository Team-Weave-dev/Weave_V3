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
        newProject: { ko: "새 프로젝트", en: "New Project" }
      },
      stats: {
        total: { ko: "전체 프로젝트", en: "Total Projects" },
        inProgress: { ko: "진행중", en: "In Progress" },
        review: { ko: "검토중", en: "In Review" },
        completed: { ko: "완료", en: "Completed" }
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
              review: { ko: "검토중", en: "In Review" },
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
            client: { ko: "고객사", en: "Client" },
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
        client: { ko: "고객사", en: "Client" },
        progressStatus: { ko: "진행 상황", en: "Progress Status" },
        projectProgress: { ko: "프로젝트 진도", en: "Project Progress" },
        paymentProgress: { ko: "결제 진행", en: "Payment Progress" },
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
        paymentStatus: { ko: "결제 진행률", en: "Payment Status" },
        currentStage: { ko: "현재 단계:", en: "Current Stage:" },
        hasContract: { ko: "계약서 있음", en: "Has Contract" },
        hasBilling: { ko: "청구서 있음", en: "Has Billing" },
        hasDocuments: { ko: "문서 있음", en: "Has Documents" },
        contractInfo: { ko: "계약서 정보", en: "Contract Information" },
        billingInfo: { ko: "청구/정산 정보", en: "Billing Information" },
        documentInfo: { ko: "프로젝트 문서", en: "Project Documents" }
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
      { id: 'account', labelKey: 'auth.account', href: routes.dashboard, icon: 'user' },
      { id: 'settings', labelKey: 'auth.settings', href: routes.settings, icon: 'settings' },
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

  // Stats
  statsTotal: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.total[lang],
  statsInProgress: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.inProgress[lang],
  statsReview: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.review[lang],
  statsCompleted: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.stats.completed[lang],

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
  close: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.actions.close[lang],

  // Delete Modal
  deleteModalTitle: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.title[lang],
  deleteModalMessage: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.message[lang],
  deleteModalConfirm: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.confirm[lang],
  deleteModalCancel: (lang: 'ko' | 'en' = defaultLanguage) => uiText.componentDemo.projectPage.deleteModal.cancel[lang]
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
