import type { TodoTask, TodoSection, TodoPriority } from '../types';
import { addDays } from '../utils/date';

// 초기 목데이터 생성 함수
export const generateInitialData = (): { tasks: TodoTask[], sections: TodoSection[] } => {
  console.log('generateInitialData called');
  
  const sections: TodoSection[] = [
    { id: 'default', name: '📌 미분류', order: 0, isExpanded: true },
    { id: 'urgent', name: '🔥 긴급', order: 1, isExpanded: true },
    { id: 'work', name: '💼 업무', order: 2, isExpanded: true },
    { id: 'personal', name: '🏠 개인', order: 3, isExpanded: true },
    { id: 'learning', name: '📚 학습', order: 4, isExpanded: true },
    { id: 'ideas', name: '💡 아이디어', order: 5, isExpanded: false }
  ];

  const tasks: TodoTask[] = [
    // 긴급 섹션 태스크
    {
      id: 'urgent-1',
      title: '세금 신고 마감 (D-3)',
      completed: false,
      priority: 'p1' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'urgent-1-1',
          title: '영수증 정리하기',
          completed: true,
          priority: 'p1' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'urgent',
          parentId: 'urgent-1',
          order: 0,
          isExpanded: false,
          createdAt: new Date(),
          completedAt: new Date(),
          dueDate: addDays(new Date(), 3)
        },
        {
          id: 'urgent-1-2',
          title: '세무사 상담 예약',
          completed: false,
          priority: 'p1' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'urgent',
          parentId: 'urgent-1',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 1)
        }
      ],
      sectionId: 'urgent',
      parentId: undefined,
      order: 0,
      isExpanded: true,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 3)
    },
    {
      id: 'urgent-2',
      title: '임대차 계약서 검토',
      completed: false,
      priority: 'p1' as TodoPriority,
      depth: 0,
      children: [],
      sectionId: 'urgent',
      parentId: undefined,
      order: 1,
      isExpanded: false,
      createdAt: new Date(),
      dueDate: new Date() // 오늘
    },
    
    // 업무 섹션 태스크
    {
      id: 'work-1',
      title: 'Q4 마케팅 전략 수립',
      completed: false,
      priority: 'p2' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'work-1-1',
          title: '시장 트렌드 분석',
          completed: true,
          priority: 'p2' as TodoPriority,
          depth: 1,
          children: [
            {
              id: 'work-1-1-1',
              title: '경쟁사 분석 보고서',
              completed: true,
              priority: 'p3' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'work',
              parentId: 'work-1-1',
              order: 0,
              isExpanded: false,
              createdAt: new Date(),
              completedAt: new Date(),
              dueDate: addDays(new Date(), -2) // 2일 전 완료
            },
            {
              id: 'work-1-1-2',
              title: '소비자 동향 조사',
              completed: false,
              priority: 'p3' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'work',
              parentId: 'work-1-1',
              order: 1,
              isExpanded: false,
              createdAt: new Date(),
              dueDate: addDays(new Date(), 2)
            }
          ],
          sectionId: 'work',
          parentId: 'work-1',
          order: 0,
          isExpanded: true,
          createdAt: new Date(),
          completedAt: new Date(),
          dueDate: addDays(new Date(), 5)
        },
        {
          id: 'work-1-2',
          title: '예산 배분 계획',
          completed: false,
          priority: 'p1' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'work',
          parentId: 'work-1',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 1) // 내일
        },
        {
          id: 'work-1-3',
          title: 'KPI 목표 설정',
          completed: false,
          priority: 'p2' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'work',
          parentId: 'work-1',
          order: 2,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 4)
        }
      ],
      sectionId: 'work',
      parentId: undefined,
      order: 0,
      isExpanded: true,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 7) // 1주 후
    },
    {
      id: 'work-2',
      title: '신규 프로젝트 킥오프',
      completed: false,
      priority: 'p2' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'work-2-1',
          title: '팀원 역할 분담',
          completed: false,
          priority: 'p2' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'work',
          parentId: 'work-2',
          order: 0,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 10)
        },
        {
          id: 'work-2-2',
          title: '프로젝트 일정 수립',
          completed: false,
          priority: 'p2' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'work',
          parentId: 'work-2',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 12)
        }
      ],
      sectionId: 'work',
      parentId: undefined,
      order: 1,
      isExpanded: false,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 14) // 2주 후
    },
    {
      id: 'work-3',
      title: '주간 보고서 작성',
      completed: true,
      priority: 'p3' as TodoPriority,
      depth: 0,
      children: [],
      sectionId: 'work',
      parentId: undefined,
      order: 2,
      isExpanded: false,
      createdAt: new Date(),
      completedAt: new Date(),
      dueDate: addDays(new Date(), -7) // 1주 전 완료
    },
    
    // 개인 섹션 태스크
    {
      id: 'personal-1',
      title: '건강 관리 루틴',
      completed: false,
      priority: 'p2' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'personal-1-1',
          title: '매일 30분 운동',
          completed: false,
          priority: 'p2' as TodoPriority,
          depth: 1,
          children: [
            {
              id: 'personal-1-1-1',
              title: '월/수/금 - 근력운동',
              completed: false,
              priority: 'p3' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'personal',
              parentId: 'personal-1-1',
              order: 0,
              isExpanded: false,
              createdAt: new Date(),
              dueDate: new Date() // 오늘
            },
            {
              id: 'personal-1-1-2',
              title: '화/목 - 유산소',
              completed: false,
              priority: 'p3' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'personal',
              parentId: 'personal-1-1',
              order: 1,
              isExpanded: false,
              createdAt: new Date(),
              dueDate: addDays(new Date(), 1) // 내일
            }
          ],
          sectionId: 'personal',
          parentId: 'personal-1',
          order: 0,
          isExpanded: true,
          createdAt: new Date()
          // 반복 작업이라 마감일 없음
        },
        {
          id: 'personal-1-2',
          title: '영양제 챙기기',
          completed: true,
          priority: 'p3' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'personal',
          parentId: 'personal-1',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          completedAt: new Date(),
          dueDate: new Date() // 오늘 완료
        }
      ],
      sectionId: 'personal',
      parentId: undefined,
      order: 0,
      isExpanded: true,
      createdAt: new Date()
      // 일상 루틴이라 마감일 없음
    },
    {
      id: 'personal-2',
      title: '집안일 정리',
      completed: false,
      priority: 'p3' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'personal-2-1',
          title: '대청소 계획',
          completed: false,
          priority: 'p3' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'personal',
          parentId: 'personal-2',
          order: 0,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 6) // 주말
        },
        {
          id: 'personal-2-2',
          title: '냉장고 정리',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'personal',
          parentId: 'personal-2',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 3)
        }
      ],
      sectionId: 'personal',
      parentId: undefined,
      order: 1,
      isExpanded: false,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 7) // 이번 주 내
    },
    {
      id: 'personal-3',
      title: '친구 생일 선물 준비',
      completed: false,
      priority: 'p2' as TodoPriority,
      depth: 0,
      children: [],
      sectionId: 'personal',
      parentId: undefined,
      order: 2,
      isExpanded: false,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 5) // 5일 후
    },
    
    // 학습 섹션 태스크
    {
      id: 'learning-1',
      title: 'Next.js 15 새로운 기능 학습',
      completed: false,
      priority: 'p3' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'learning-1-1',
          title: 'Server Actions 심화',
          completed: true,
          priority: 'p3' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'learning',
          parentId: 'learning-1',
          order: 0,
          isExpanded: false,
          createdAt: new Date(),
          completedAt: new Date(),
          dueDate: addDays(new Date(), -3) // 3일 전 완료
        },
        {
          id: 'learning-1-2',
          title: 'Partial Prerendering',
          completed: false,
          priority: 'p3' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'learning',
          parentId: 'learning-1',
          order: 1,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 8)
        },
        {
          id: 'learning-1-3',
          title: 'Turbopack 최적화',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'learning',
          parentId: 'learning-1',
          order: 2,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 15)
        }
      ],
      sectionId: 'learning',
      parentId: undefined,
      order: 0,
      isExpanded: true,
      createdAt: new Date(),
      dueDate: addDays(new Date(), 20) // 장기 프로젝트
    },
    {
      id: 'learning-2',
      title: 'AI/ML 기초 공부',
      completed: false,
      priority: 'p3' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'learning-2-1',
          title: 'Python 기초 복습',
          completed: false,
          priority: 'p3' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'learning',
          parentId: 'learning-2',
          order: 0,
          isExpanded: false,
          createdAt: new Date()
          // 마감일 없는 장기 학습
        },
        {
          id: 'learning-2-2',
          title: 'TensorFlow 튜토리얼',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'learning',
          parentId: 'learning-2',
          order: 1,
          isExpanded: false,
          createdAt: new Date()
          // 마감일 없는 장기 학습
        }
      ],
      sectionId: 'learning',
      parentId: undefined,
      order: 1,
      isExpanded: false,
      createdAt: new Date()
      // 장기 학습 프로젝트라 마감일 없음
    },
    
    // 아이디어 섹션 태스크
    {
      id: 'idea-1',
      title: '사이드 프로젝트 아이디어',
      completed: false,
      priority: 'p4' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'idea-1-1',
          title: '할 일 관리 앱 고도화',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [
            {
              id: 'idea-1-1-1',
              title: 'AI 기반 우선순위 추천',
              completed: false,
              priority: 'p4' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'ideas',
              parentId: 'idea-1-1',
              order: 0,
              isExpanded: false,
              createdAt: new Date()
              // 아이디어라 마감일 없음
            },
            {
              id: 'idea-1-1-2',
              title: '팀 협업 기능',
              completed: false,
              priority: 'p4' as TodoPriority,
              depth: 2,
              children: [],
              sectionId: 'ideas',
              parentId: 'idea-1-1',
              order: 1,
              isExpanded: false,
              createdAt: new Date()
              // 아이디어라 마감일 없음
            }
          ],
          sectionId: 'ideas',
          parentId: 'idea-1',
          order: 0,
          isExpanded: false,
          createdAt: new Date()
          // 아이디어라 마감일 없음
        },
        {
          id: 'idea-1-2',
          title: '개인 재무 관리 도구',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'ideas',
          parentId: 'idea-1',
          order: 1,
          isExpanded: false,
          createdAt: new Date()
          // 아이디어라 마감일 없음
        }
      ],
      sectionId: 'ideas',
      parentId: undefined,
      order: 0,
      isExpanded: false,
      createdAt: new Date()
      // 아이디어라 마감일 없음
    },
    {
      id: 'idea-2',
      title: '블로그 콘텐츠 기획',
      completed: false,
      priority: 'p4' as TodoPriority,
      depth: 0,
      children: [
        {
          id: 'idea-2-1',
          title: '개발자 생산성 도구 리뷰',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'ideas',
          parentId: 'idea-2',
          order: 0,
          isExpanded: false,
          createdAt: new Date(),
          dueDate: addDays(new Date(), 30) // 한 달 후 목표
        },
        {
          id: 'idea-2-2',
          title: '코드 리뷰 베스트 프랙티스',
          completed: false,
          priority: 'p4' as TodoPriority,
          depth: 1,
          children: [],
          sectionId: 'ideas',
          parentId: 'idea-2',
          order: 1,
          isExpanded: false,
          createdAt: new Date()
          // 아직 계획 단계라 마감일 없음
        }
      ],
      sectionId: 'ideas',
      parentId: undefined,
      order: 1,
      isExpanded: false,
      createdAt: new Date()
      // 기획 단계라 마감일 없음
    }
  ];

  console.log('generateInitialData - tasks created:', tasks.length, 'tasks');
  console.log('generateInitialData - sections created:', sections.length, 'sections');
  console.log('generateInitialData - full tasks:', tasks);
  
  return { tasks, sections };
};