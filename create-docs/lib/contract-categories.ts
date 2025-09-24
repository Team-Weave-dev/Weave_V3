// 계약서 카테고리 시스템

export interface ContractCategory {
  id: string;
  name: string;
  icon: string; // 이모지 아이콘
  description: string;
  color: string; // Tailwind CSS 색상 클래스
  contracts: ContractInfo[];
}

export interface ContractInfo {
  id: string;
  name: string;
  type: 'simple' | 'detailed'; // 약식 또는 상세
  description: string;
  popular?: boolean; // 인기 템플릿 표시
}

export const contractCategories: ContractCategory[] = [
  {
    id: 'development',
    name: '개발 계약서',
    icon: '💻',
    description: '소프트웨어, 웹, 앱 개발 관련 계약서',
    color: 'bg-blue-100 border-blue-300 text-blue-900',
    contracts: [
      {
        id: 'software-contract-detailed',
        name: '소프트웨어 개발 용역 계약서',
        type: 'detailed',
        description: '소프트웨어 개발 프로젝트를 위한 상세 계약서',
        popular: true
      },
      {
        id: 'software-contract-simple',
        name: '소프트웨어 개발 용역 계약서',
        type: 'simple',
        description: '간단한 소프트웨어 개발을 위한 약식 계약서'
      },
      {
        id: 'web-contract-detailed',
        name: '웹사이트 제작 계약서',
        type: 'detailed',
        description: '웹사이트 및 웹 애플리케이션 개발 계약서',
        popular: true
      },
      {
        id: 'web-contract-simple',
        name: '웹사이트 제작 계약서',
        type: 'simple',
        description: '간단한 웹 프로젝트를 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'creative',
    name: '창작 계약서',
    icon: '🎨',
    description: '디자인, 영상, 사진 등 창작 관련 계약서',
    color: 'bg-purple-100 border-purple-300 text-purple-900',
    contracts: [
      {
        id: 'design-contract-detailed',
        name: '디자인 용역 계약서',
        type: 'detailed',
        description: '그래픽, UI/UX 디자인 프로젝트 계약서',
        popular: true
      },
      {
        id: 'design-contract-simple',
        name: '디자인 용역 계약서',
        type: 'simple',
        description: '간단한 디자인 작업을 위한 약식 계약서'
      },
      {
        id: 'video-production-contract-detailed',
        name: '영상 제작 계약서',
        type: 'detailed',
        description: '영상 촬영 및 편집 프로젝트 계약서'
      },
      {
        id: 'video-production-contract-simple',
        name: '영상 제작 계약서',
        type: 'simple',
        description: '간단한 영상 제작을 위한 약식 계약서'
      },
      {
        id: 'photography-contract-detailed',
        name: '사진 촬영 계약서',
        type: 'detailed',
        description: '상업용 사진 촬영 프로젝트 계약서'
      },
      {
        id: 'photography-contract-simple',
        name: '사진 촬영 계약서',
        type: 'simple',
        description: '간단한 사진 촬영을 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'business',
    name: '비즈니스 계약서',
    icon: '💼',
    description: '컨설팅, 교육, 마케팅 등 비즈니스 서비스 계약서',
    color: 'bg-green-100 border-green-300 text-green-900',
    contracts: [
      {
        id: 'consulting-contract-detailed',
        name: '컨설팅 계약서',
        type: 'detailed',
        description: '경영 및 기술 컨설팅 서비스 계약서'
      },
      {
        id: 'consulting-contract-simple',
        name: '컨설팅 계약서',
        type: 'simple',
        description: '간단한 컨설팅 서비스를 위한 약식 계약서'
      },
      {
        id: 'education-contract-detailed',
        name: '교육/연수 계약서',
        type: 'detailed',
        description: '기업 교육 및 연수 프로그램 계약서'
      },
      {
        id: 'education-contract-simple',
        name: '교육/연수 계약서',
        type: 'simple',
        description: '간단한 교육 서비스를 위한 약식 계약서'
      },
      {
        id: 'lecture-contract-detailed',
        name: '강연 계약서',
        type: 'detailed',
        description: '세미나 및 강연 서비스 계약서'
      },
      {
        id: 'lecture-contract-simple',
        name: '강연 계약서',
        type: 'simple',
        description: '단발성 강연을 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'marketing',
    name: '마케팅 계약서',
    icon: '📢',
    description: '광고, 홍보, 인플루언서 마케팅 계약서',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    contracts: [
      {
        id: 'advertising-contract-detailed',
        name: '광고 제작 및 집행 계약서',
        type: 'detailed',
        description: '온/오프라인 광고 캠페인 계약서'
      },
      {
        id: 'advertising-contract-simple',
        name: '광고 제작 및 집행 계약서',
        type: 'simple',
        description: '간단한 광고 제작을 위한 약식 계약서'
      },
      {
        id: 'influencer-contract-detailed',
        name: '인플루언서 마케팅 계약서',
        type: 'detailed',
        description: 'SNS 인플루언서 협업 계약서',
        popular: true
      },
      {
        id: 'influencer-contract-simple',
        name: '인플루언서 마케팅 계약서',
        type: 'simple',
        description: '간단한 인플루언서 협업을 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'general',
    name: '일반 계약서',
    icon: '📄',
    description: '프리랜서, 용역, 유지보수 등 일반 계약서',
    color: 'bg-gray-100 border-gray-300 text-gray-900',
    contracts: [
      {
        id: 'freelance-contract-detailed',
        name: '프리랜서 용역 계약서',
        type: 'detailed',
        description: '프리랜서 기본 용역 계약서',
        popular: true
      },
      {
        id: 'freelance-contract-simple',
        name: '프리랜서 용역 계약서',
        type: 'simple',
        description: '간단한 프리랜서 업무를 위한 약식 계약서'
      },
      {
        id: 'service-contract-detailed',
        name: '일반 용역 계약서',
        type: 'detailed',
        description: '다양한 서비스 제공을 위한 표준 계약서'
      },
      {
        id: 'service-contract-simple',
        name: '일반 용역 계약서',
        type: 'simple',
        description: '간단한 서비스를 위한 약식 계약서'
      },
      {
        id: 'maintenance-contract-detailed',
        name: '시스템 유지보수 계약서',
        type: 'detailed',
        description: 'IT 시스템 유지보수 서비스 계약서'
      },
      {
        id: 'maintenance-contract-simple',
        name: '시스템 유지보수 계약서',
        type: 'simple',
        description: '간단한 유지보수를 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'special',
    name: '특수 계약서',
    icon: '🔒',
    description: 'NDA, 라이선스, 출판 등 특수 목적 계약서',
    color: 'bg-red-100 border-red-300 text-red-900',
    contracts: [
      {
        id: 'nda-contract-detailed',
        name: '비밀유지계약서 (NDA)',
        type: 'detailed',
        description: '기밀정보 보호를 위한 계약서',
        popular: true
      },
      {
        id: 'nda-contract-simple',
        name: '비밀유지계약서 (NDA)',
        type: 'simple',
        description: '간단한 기밀유지를 위한 약식 계약서'
      },
      {
        id: 'licensing-contract-detailed',
        name: '소프트웨어 라이선스 계약서',
        type: 'detailed',
        description: '소프트웨어 사용권 계약서'
      },
      {
        id: 'licensing-contract-simple',
        name: '소프트웨어 라이선스 계약서',
        type: 'simple',
        description: '간단한 라이선스를 위한 약식 계약서'
      },
      {
        id: 'publishing-contract-detailed',
        name: '출판 계약서',
        type: 'detailed',
        description: '도서 및 콘텐츠 출판 계약서'
      },
      {
        id: 'publishing-contract-simple',
        name: '출판 계약서',
        type: 'simple',
        description: '간단한 출판을 위한 약식 계약서'
      },
      {
        id: 'translation-contract-detailed',
        name: '번역 서비스 계약서',
        type: 'detailed',
        description: '문서 및 콘텐츠 번역 서비스 계약서'
      },
      {
        id: 'translation-contract-simple',
        name: '번역 서비스 계약서',
        type: 'simple',
        description: '간단한 번역 작업을 위한 약식 계약서'
      }
    ]
  },
  {
    id: 'performance',
    name: '공연/예술 계약서',
    icon: '🎭',
    description: '공연, 예술 작품 관련 계약서',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    contracts: [
      {
        id: 'performance-contract-detailed',
        name: '공연 예술 출연 계약서',
        type: 'detailed',
        description: '음악, 연극, 무용 등 공연 계약서'
      },
      {
        id: 'performance-contract-simple',
        name: '공연 예술 출연 계약서',
        type: 'simple',
        description: '간단한 공연을 위한 약식 계약서'
      }
    ]
  }
];

// 모든 계약서 템플릿 ID 목록 가져오기
export function getAllContractIds(): string[] {
  return contractCategories.flatMap(category => 
    category.contracts.map(contract => contract.id)
  );
}

// 카테고리별 계약서 가져오기
export function getContractsByCategory(categoryId: string): ContractInfo[] {
  const category = contractCategories.find(cat => cat.id === categoryId);
  return category ? category.contracts : [];
}

// 인기 계약서 가져오기
export function getPopularContracts(): ContractInfo[] {
  return contractCategories.flatMap(category => 
    category.contracts.filter(contract => contract.popular)
  );
}

// 계약서 검색
export function searchContracts(query: string): ContractInfo[] {
  const lowerQuery = query.toLowerCase();
  return contractCategories.flatMap(category => 
    category.contracts.filter(contract => 
      contract.name.toLowerCase().includes(lowerQuery) ||
      contract.description.toLowerCase().includes(lowerQuery)
    )
  );
}