// 견적서 템플릿 카테고리 시스템

export interface QuoteCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  templates: QuoteTemplateInfo[];
}

export interface QuoteTemplateInfo {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
}

export const quoteCategories: QuoteCategory[] = [
  {
    id: 'it-development',
    name: 'IT/개발',
    icon: '💻',
    description: '웹, 앱, 소프트웨어 개발 견적서',
    color: 'bg-blue-100 border-blue-300 text-blue-900',
    templates: [
      {
        id: 'web-development',
        name: '웹사이트 개발 견적서',
        description: '홈페이지, 쇼핑몰, 웹 애플리케이션',
        popular: true
      },
      {
        id: 'mobile-app',
        name: '모바일 앱 개발 견적서',
        description: 'iOS/Android 앱 개발',
        popular: true
      },
      {
        id: 'software-development',
        name: '소프트웨어 개발 견적서',
        description: '맞춤형 소프트웨어, ERP, CRM'
      },
      {
        id: 'game-development',
        name: '게임 개발 견적서',
        description: '모바일/PC 게임 개발'
      },
      {
        id: 'ai-ml-development',
        name: 'AI/ML 개발 견적서',
        description: '인공지능, 머신러닝 솔루션'
      }
    ]
  },
  {
    id: 'design-creative',
    name: '디자인/창작',
    icon: '🎨',
    description: '그래픽, UI/UX, 영상 제작 견적서',
    color: 'bg-purple-100 border-purple-300 text-purple-900',
    templates: [
      {
        id: 'graphic-design',
        name: '그래픽 디자인 견적서',
        description: '로고, 브로슈어, 포스터 디자인',
        popular: true
      },
      {
        id: 'ui-ux-design',
        name: 'UI/UX 디자인 견적서',
        description: '앱/웹 인터페이스 디자인'
      },
      {
        id: 'video-production',
        name: '영상 제작 견적서',
        description: '광고, 홍보, 유튜브 영상',
        popular: true
      },
      {
        id: 'photography',
        name: '사진 촬영 견적서',
        description: '제품, 프로필, 행사 촬영'
      },
      {
        id: '3d-modeling',
        name: '3D 모델링 견적서',
        description: '3D 디자인, 렌더링, 애니메이션'
      }
    ]
  },
  {
    id: 'marketing',
    name: '마케팅/광고',
    icon: '📢',
    description: '디지털 마케팅, SNS, 광고 캠페인 견적서',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    templates: [
      {
        id: 'digital-marketing',
        name: '디지털 마케팅 견적서',
        description: 'SNS, 검색광고, 콘텐츠 마케팅',
        popular: true
      },
      {
        id: 'influencer-marketing',
        name: '인플루언서 마케팅 견적서',
        description: '인스타그램, 유튜브 협업'
      },
      {
        id: 'content-creation',
        name: '콘텐츠 제작 견적서',
        description: '블로그, SNS 콘텐츠'
      },
      {
        id: 'seo-optimization',
        name: 'SEO 최적화 견적서',
        description: '검색엔진 최적화 서비스'
      }
    ]
  },
  {
    id: 'consulting',
    name: '컨설팅/교육',
    icon: '🎓',
    description: '비즈니스 컨설팅, 교육, 강의 견적서',
    color: 'bg-green-100 border-green-300 text-green-900',
    templates: [
      {
        id: 'business-consulting',
        name: '비즈니스 컨설팅 견적서',
        description: '경영, 전략, 프로세스 개선'
      },
      {
        id: 'it-consulting',
        name: 'IT 컨설팅 견적서',
        description: '시스템 구축, 디지털 전환'
      },
      {
        id: 'education-training',
        name: '교육/연수 견적서',
        description: '기업 교육, 직무 연수'
      },
      {
        id: 'lecture',
        name: '강연/세미나 견적서',
        description: '전문 강연, 워크샵'
      }
    ]
  },
  {
    id: 'content-writing',
    name: '콘텐츠/번역',
    icon: '✍️',
    description: '카피라이팅, 번역, 출판 견적서',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    templates: [
      {
        id: 'copywriting',
        name: '카피라이팅 견적서',
        description: '광고 카피, 브랜드 스토리'
      },
      {
        id: 'translation',
        name: '번역 서비스 견적서',
        description: '문서, 웹사이트, 영상 번역'
      },
      {
        id: 'technical-writing',
        name: '기술 문서 작성 견적서',
        description: '매뉴얼, API 문서, 가이드'
      },
      {
        id: 'content-writing',
        name: '콘텐츠 작성 견적서',
        description: '블로그, 기사, 보도자료'
      }
    ]
  },
  {
    id: 'maintenance',
    name: '유지보수/운영',
    icon: '🔧',
    description: '시스템 유지보수, 운영 대행 견적서',
    color: 'bg-gray-100 border-gray-300 text-gray-900',
    templates: [
      {
        id: 'system-maintenance',
        name: '시스템 유지보수 견적서',
        description: '웹사이트, 서버, 앱 유지보수'
      },
      {
        id: 'social-media-management',
        name: 'SNS 운영 대행 견적서',
        description: '인스타그램, 페이스북 운영'
      },
      {
        id: 'customer-support',
        name: '고객 지원 서비스 견적서',
        description: 'CS, 채팅 상담 운영'
      }
    ]
  },
  {
    id: 'event-production',
    name: '이벤트/행사',
    icon: '🎉',
    description: '행사 기획, 운영, 대행 견적서',
    color: 'bg-pink-100 border-pink-300 text-pink-900',
    templates: [
      {
        id: 'event-planning',
        name: '행사 기획 견적서',
        description: '컨퍼런스, 세미나, 전시회'
      },
      {
        id: 'wedding-planning',
        name: '웨딩 플래닝 견적서',
        description: '결혼식 기획 및 진행'
      },
      {
        id: 'performance',
        name: '공연/축하 행사 견적서',
        description: '음악, 무용, 축하 공연'
      }
    ]
  },
  {
    id: 'standard',
    name: '표준 견적서',
    icon: '📋',
    description: '범용 견적서 템플릿',
    color: 'bg-slate-100 border-slate-300 text-slate-900',
    templates: [
      {
        id: 'standard-quote',
        name: '표준 견적서',
        description: '모든 업종에 사용 가능한 기본 템플릿',
        popular: true
      },
      {
        id: 'simple-quote',
        name: '간단 견적서',
        description: '핵심 정보만 담은 간략한 템플릿'
      },
      {
        id: 'detailed-quote',
        name: '상세 견적서',
        description: '세부 내역이 포함된 전문 템플릿'
      }
    ]
  }
];

// 인기 견적서 템플릿 가져오기
export function getPopularQuoteTemplates(): QuoteTemplateInfo[] {
  return quoteCategories.flatMap(category => 
    category.templates.filter(template => template.popular)
  );
}

// 견적서 템플릿 검색
export function searchQuoteTemplates(query: string): QuoteTemplateInfo[] {
  const lowerQuery = query.toLowerCase();
  return quoteCategories.flatMap(category => 
    category.templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
    )
  );
}