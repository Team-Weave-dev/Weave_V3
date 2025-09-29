'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  Flag,
  MoreVertical,
  Edit2,
  FolderPlus,
  CalendarDays,
  List,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { TodoListWidgetProps, TodoTask, TodoSection, TodoPriority } from '@/types/dashboard';

// 우선순위 색상 매핑 - 중앙화된 시스템 사용
const priorityColors: Record<TodoPriority, { badge: string; icon: string }> = {
  p1: { badge: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: 'text-red-500' },
  p2: { badge: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: 'text-orange-500' },
  p3: { badge: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: 'text-blue-500' },
  p4: { badge: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', icon: 'text-gray-400' }
};

// 로컬 스토리지 키
const STORAGE_KEY = 'weave_dashboard_todos';
const SECTIONS_KEY = 'weave_dashboard_todo_sections';
const VIEW_MODE_KEY = 'weave_dashboard_todo_view_mode';

// 날짜 그룹 타입
type ViewMode = 'section' | 'date' | 'completed';

interface DateGroup {
  id: string;
  name: string;
  emoji: string;
  order: number;
  isExpanded: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  } | null;
  isOverdue?: boolean;
}

// 날짜 관련 유틸리티 함수
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const formatDateBadge = (dueDate?: Date): { text: string; variant: "status-soft-error" | "status-soft-warning" | "status-soft-info" | "outline" } => {
  if (!dueDate) {
    return { text: '미정', variant: 'outline' };
  }
  
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: `D+${Math.abs(diffDays)}`, variant: 'status-soft-error' };
  } else if (diffDays === 0) {
    return { text: getWidgetText.todoList.dateBadges.today('ko'), variant: 'status-soft-error' };
  } else if (diffDays === 1) {
    return { text: getWidgetText.todoList.dateBadges.tomorrow('ko'), variant: 'status-soft-warning' };
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays}`, variant: 'status-soft-warning' };
  } else if (diffDays <= 7) {
    return { text: `D-${diffDays}`, variant: 'status-soft-info' };
  } else {
    return { text: `D-${diffDays}`, variant: 'outline' };
  }
};

const getDateGroups = (): DateGroup[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const thisWeekEnd = addDays(today, 7 - today.getDay());
  const nextWeekStart = addDays(thisWeekEnd, 1);
  const nextWeekEnd = addDays(nextWeekStart, 6);
  
  return [
    { 
      id: 'overdue', 
      name: getWidgetText.todoList.dateGroups.overdue('ko'), 
      emoji: '🚨', 
      order: 0, 
      isExpanded: true, 
      isOverdue: true,
      dateRange: null
    },
    { 
      id: 'today', 
      name: getWidgetText.todoList.dateGroups.today('ko'), 
      emoji: '📅', 
      order: 1, 
      isExpanded: true,
      dateRange: { start: startOfDay(today), end: endOfDay(today) }
    },
    { 
      id: 'tomorrow', 
      name: getWidgetText.todoList.dateGroups.tomorrow('ko'), 
      emoji: '📆', 
      order: 2, 
      isExpanded: true,
      dateRange: { start: startOfDay(tomorrow), end: endOfDay(tomorrow) }
    },
    { 
      id: 'this_week', 
      name: getWidgetText.todoList.dateGroups.thisWeek('ko'), 
      emoji: '📍', 
      order: 3, 
      isExpanded: true,
      dateRange: { start: addDays(today, 2), end: thisWeekEnd }
    },
    { 
      id: 'next_week', 
      name: getWidgetText.todoList.dateGroups.nextWeek('ko'), 
      emoji: '🗓️', 
      order: 4, 
      isExpanded: false,
      dateRange: { start: nextWeekStart, end: nextWeekEnd }
    }
  ];
};

// 초기 목데이터 생성 함수
const generateInitialData = (): { tasks: TodoTask[], sections: TodoSection[] } => {
  console.log('generateInitialData called');
  
  const sections: TodoSection[] = [
    { id: 'urgent', name: '🔥 긴급', order: 0, isExpanded: true },
    { id: 'work', name: '💼 업무', order: 1, isExpanded: true },
    { id: 'personal', name: '🏠 개인', order: 2, isExpanded: true },
    { id: 'learning', name: '📚 학습', order: 3, isExpanded: true },
    { id: 'ideas', name: '💡 아이디어', order: 4, isExpanded: false }
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

export function TodoListWidget({ 
  title, 
  tasks = [], 
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
  onTaskUpdate,
  defaultSize = { w: 4, h: 4 }
}: TodoListWidgetProps & { defaultSize?: { w: number; h: number } }) {
  const displayTitle = title || getWidgetText.todoList.title('ko');
  
  // 로컬 스토리지에서 데이터 로드 또는 초기 데이터 생성
  const loadInitialData = useCallback(() => {
    // SSR 체크 - 서버에서는 초기 데이터 반환
    if (typeof window === 'undefined') {
      console.log('SSR detected, returning initial data');
      return generateInitialData();
    }
    
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      const savedSections = localStorage.getItem(SECTIONS_KEY);
      
      console.log('LocalStorage savedTasks:', savedTasks);
      console.log('LocalStorage savedSections:', savedSections);
      
      if (savedTasks && savedSections && savedTasks !== '[]') {
        // 저장된 데이터가 있으면 사용
        const parsedTasks = JSON.parse(savedTasks);
        const parsedSections = JSON.parse(savedSections);
        
        // Date 객체 복원
        parsedTasks.forEach((task: any) => {
          task.createdAt = task.createdAt ? new Date(task.createdAt) : new Date();
          task.completedAt = task.completedAt ? new Date(task.completedAt) : undefined;
          task.dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
          if (task.children) {
            task.children.forEach((child: any) => {
              child.createdAt = child.createdAt ? new Date(child.createdAt) : new Date();
              child.completedAt = child.completedAt ? new Date(child.completedAt) : undefined;
              child.dueDate = child.dueDate ? new Date(child.dueDate) : undefined;
            });
          }
        });
        
        console.log('Returning saved data');
        return { tasks: parsedTasks, sections: parsedSections };
      } else {
        // 초기 데이터 생성
        console.log('Generating initial data');
        const initialData = generateInitialData();
        console.log('Generated initial data:', initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Failed to load todo data from localStorage:', error);
      const initialData = generateInitialData();
      console.log('Generated initial data after error:', initialData);
      return initialData;
    }
  }, []);
  
  // 초기화 또는 리셋을 위한 플래그 (개발 시 true로 설정하면 데이터 리셋)
  // 데이터가 보이지 않으면 true로 설정 후 새로고침, 그 다음 false로 다시 변경
  const FORCE_RESET = false; // 한 번 true로 설정 후 새로고침, 그 다음 false로 변경
  
  const [localTasks, setLocalTasks] = useState<TodoTask[]>(() => {
    console.log('Initializing localTasks...');
    if (FORCE_RESET && typeof window !== 'undefined') {
      console.log('FORCE_RESET is true, clearing localStorage');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SECTIONS_KEY);
    }
    
    // props로 전달된 tasks가 있으면 우선 사용
    if (tasks && tasks.length > 0) {
      console.log('Using tasks from props:', tasks);
      return tasks;
    }
    
    // 로컬 스토리지 또는 초기 데이터 로드
    const loadedData = loadInitialData();
    console.log('LoadInitialData returned:', loadedData);
    const { tasks: initialTasks } = loadedData;
    console.log('Loaded tasks:', initialTasks);
    console.log('Tasks length:', initialTasks?.length || 0);
    return initialTasks || [];
  });
  
  const [sections, setSections] = useState<TodoSection[]>(() => {
    if (FORCE_RESET && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SECTIONS_KEY);
    }
    
    const { sections: initialSections } = loadInitialData();
    console.log('Loaded sections:', initialSections);
    return initialSections;
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>('p3');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState<string>('');
  const [hoveringBetween, setHoveringBetween] = useState<{ afterId: string | null, sectionId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'child' | 'parent' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [draggedSection, setDraggedSection] = useState<TodoSection | null>(null);
  const [draggedOverSection, setDraggedOverSection] = useState<string | null>(null);
  
  // 날짜별 관리 관련 상태
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'section';
    }
    return 'section';
  });
  const [dateGroups, setDateGroups] = useState<DateGroup[]>(getDateGroups());
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // 외부 tasks prop 변경 시 동기화
  useEffect(() => {
    if (tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);
  
  // 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
        localStorage.setItem(VIEW_MODE_KEY, viewMode);
      } catch (error) {
        console.error('Failed to save todo data to localStorage:', error);
      }
    }
  }, [localTasks, sections, viewMode]);

  // 새 작업 추가
  const handleAddTask = (sectionId: string = 'default', parentId?: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Omit<TodoTask, 'id' | 'createdAt'> = {
      title: newTaskTitle,
      completed: false,
      priority: selectedPriority,
      depth: parentId ? getTaskDepth(parentId) + 1 : 0,
      children: [],
      sectionId,
      parentId,
      order: localTasks.filter(t => t.sectionId === sectionId && !t.parentId).length,
      isExpanded: false,
      dueDate: selectedDueDate
    };

    if (onTaskAdd) {
      onTaskAdd(newTask);
    } else {
      // 로컬 상태 관리 (데모용)
      const taskWithId: TodoTask = {
        ...newTask,
        id: `task-${Date.now()}`,
        createdAt: new Date()
      };
      
      if (parentId) {
        // 부모 작업에 자식으로 추가
        setLocalTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === parentId 
              ? { ...task, children: [...(task.children || []), taskWithId], isExpanded: true }
              : task
          )
        );
        setExpandedTasks(prev => new Set(prev).add(parentId));
      } else {
        setLocalTasks([...localTasks, taskWithId]);
      }
    }
    
    setNewTaskTitle('');
    setSelectedPriority('p3');
    setSelectedDueDate(undefined);
    setIsAdding(false);
    setAddingSectionId(null);
  };

  // 작업 깊이 계산
  const getTaskDepth = (taskId: string): number => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return 0;
    if (task.parentId) {
      return getTaskDepth(task.parentId) + 1;
    }
    return task.depth || 0;
  };

  // 섹션 추가
  const handleAddSection = (name: string) => {
    const newSection: TodoSection = {
      id: `section-${Date.now()}`,
      name,
      order: sections.length,
      isExpanded: true
    };
    setSections([...sections, newSection]);
  };

  // 섹션 토글
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  // 작업 완료 토글
  const handleToggleTask = (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    } else {
      // 로컬 상태 관리
      const toggleTaskRecursive = (tasks: TodoTask[]): TodoTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            const completed = !task.completed;
            return {
              ...task,
              completed,
              completedAt: completed ? new Date() : undefined,
              children: task.children?.map(child => ({ ...child, completed }))
            };
          }
          if (task.children) {
            return {
              ...task,
              children: toggleTaskRecursive(task.children)
            };
          }
          return task;
        });
      };
      
      setLocalTasks(toggleTaskRecursive(localTasks));
    }
  };

  // 작업 삭제
  const handleDeleteTask = (taskId: string) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    } else {
      // 로컬 상태 관리
      const deleteTaskRecursive = (tasks: TodoTask[]): TodoTask[] => {
        return tasks
          .filter(task => task.id !== taskId)
          .map(task => ({
            ...task,
            children: task.children ? deleteTaskRecursive(task.children) : []
          }));
      };
      
      setLocalTasks(deleteTaskRecursive(localTasks));
    }
  };

  // 작업 확장/축소 토글
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
    
    setLocalTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, task: TodoTask) => {
    setDraggedTask(task);
    setIsDragging(true);
    setDragStartX(e.clientX); // 드래그 시작 X 좌표 저장
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Firefox 호환성
    
    // 드래그 이미지 스타일 설정
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, targetTask: TodoTask, position: 'before' | 'after' | 'child' | 'parent') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverTask(targetTask.id);
    setDragPosition(position);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverTask(null);
    setDragPosition(null);
    setIsDragging(false);
    setDragStartX(0);
  };

  // 드롭
  const handleDrop = (e: React.DragEvent, targetTask: TodoTask | null, position: 'before' | 'after' | 'child' | 'parent', targetSectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || (targetTask && draggedTask.id === targetTask.id)) {
      handleDragEnd();
      return;
    }

    // 드래그된 작업을 모든 작업에서 제거하는 재귀 함수
    const removeFromAllTasks = (tasks: TodoTask[]): { found: TodoTask | null, updatedTasks: TodoTask[] } => {
      const result: TodoTask[] = [];
      let found: TodoTask | null = null;
      
      for (const task of tasks) {
        if (task.id === draggedTask.id) {
          found = { ...task }; // 복사본 생성
          continue; // 이 작업은 결과에 포함하지 않음 (제거)
        }
        
        const updatedTask = { ...task };
        if (task.children && task.children.length > 0) {
          const childResult = removeFromAllTasks(task.children);
          if (childResult.found && !found) {
            found = childResult.found;
          }
          updatedTask.children = childResult.updatedTasks;
        }
        result.push(updatedTask);
      }
      
      return { found, updatedTasks: result };
    };
    
    const { found: movedTask, updatedTasks: tasksAfterRemoval } = removeFromAllTasks(localTasks);
    
    if (!movedTask) {
      handleDragEnd();
      return;
    }

    // 섹션으로 직접 이동하는 경우 (섹션 영역에 드롭)
    if (!targetTask && targetSectionId) {
      const updatedTask: TodoTask = {
        ...movedTask,
        sectionId: targetSectionId,
        parentId: undefined,
        depth: 0,
        order: tasksAfterRemoval.filter(t => t.sectionId === targetSectionId && !t.parentId).length,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 sectionId도 업데이트
      const updateChildrenSection = (task: TodoTask, newSectionId: string): TodoTask => {
        return {
          ...task,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenSection(child, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenSection(updatedTask, targetSectionId);
      setLocalTasks([...tasksAfterRemoval, finalTask]);
    }
    // 타겟 위치에 추가
    else if (targetTask && position === 'child') {
      // 하위 작업으로 만들기
      const updatedTask: TodoTask = {
        ...movedTask,
        parentId: targetTask.id,
        depth: targetTask.depth + 1,
        sectionId: targetTask.sectionId,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 depth와 sectionId 업데이트
      const updateChildrenDepth = (task: TodoTask, baseDepth: number, newSectionId: string): TodoTask => {
        return {
          ...task,
          depth: baseDepth,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenDepth(child, baseDepth + 1, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenDepth(updatedTask, updatedTask.depth, targetTask.sectionId || '');
      
      const addAsChild = (tasks: TodoTask[]): TodoTask[] => {
        return tasks.map(task => {
          if (task.id === targetTask.id) {
            return {
              ...task,
              children: [...(task.children || []), finalTask],
              isExpanded: true
            };
          }
          if (task.children && task.children.length > 0) {
            return {
              ...task,
              children: addAsChild(task.children)
            };
          }
          return task;
        });
      };
      
      const finalTasks = addAsChild(tasksAfterRemoval);
      setLocalTasks(finalTasks);
      setExpandedTasks(prev => new Set(prev).add(targetTask.id));
    } else if (targetTask && position === 'parent') {
      // 상위 레벨로 이동 (depth 감소)
      const parentDepth = Math.max(0, targetTask.depth - 1);
      const updatedTask: TodoTask = {
        ...movedTask,
        parentId: parentDepth === 0 ? undefined : targetTask.parentId,
        depth: parentDepth,
        sectionId: targetTask.sectionId,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 depth 업데이트
      const updateChildrenDepth = (task: TodoTask, baseDepth: number, newSectionId: string): TodoTask => {
        return {
          ...task,
          depth: baseDepth,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenDepth(child, baseDepth + 1, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenDepth(updatedTask, updatedTask.depth, targetTask.sectionId || '');
      
      // 타겟 작업 뒤에 추가
      const insertAtPosition = (tasks: TodoTask[]): TodoTask[] => {
        const result: TodoTask[] = [];
        
        for (const task of tasks) {
          if (task.id === targetTask.id) {
            result.push(task);
            result.push(finalTask);
          } else {
            const updatedTask = { ...task };
            if (task.children && task.children.length > 0) {
              updatedTask.children = insertAtPosition(task.children);
            }
            result.push(updatedTask);
          }
        }
        
        return result;
      };
      
      const finalTasks = insertAtPosition(tasksAfterRemoval);
      setLocalTasks(finalTasks);
    } else if (targetTask) {
      // 형제 작업으로 이동 (같은 레벨로 이동)
      const updatedTask: TodoTask = {
        ...movedTask,
        parentId: targetTask.parentId,
        depth: targetTask.depth,
        sectionId: targetTask.sectionId,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 depth와 sectionId 업데이트
      const updateChildrenDepth = (task: TodoTask, baseDepth: number, newSectionId: string): TodoTask => {
        return {
          ...task,
          depth: baseDepth,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenDepth(child, baseDepth + 1, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenDepth(updatedTask, updatedTask.depth, targetTask.sectionId || '');
      
      // 타겟 작업을 찾아서 위치를 결정 (재귀적으로)
      const insertAtPosition = (tasks: TodoTask[], parentId?: string): TodoTask[] => {
        const result: TodoTask[] = [];
        
        for (const task of tasks) {
          if (task.id === targetTask.id) {
            if (position === 'before') {
              // 부모가 같은 경우에만 형제로 추가
              if (task.parentId === parentId) {
                result.push(finalTask);
                result.push(task);
              } else {
                result.push(task);
              }
            } else {
              result.push(task);
              if (task.parentId === parentId) {
                result.push(finalTask);
              }
            }
          } else {
            const updatedTask = { ...task };
            if (task.children && task.children.length > 0) {
              updatedTask.children = insertAtPosition(task.children, task.id);
            }
            result.push(updatedTask);
          }
        }
        
        return result;
      };
      
      const finalTasks = insertAtPosition(tasksAfterRemoval);
      setLocalTasks(finalTasks);
    }
    
    handleDragEnd();
  };

  // 빠른 날짜 선택 옵션
  const quickDateOptions = [
    { label: getWidgetText.todoList.dateBadges.today('ko'), value: () => new Date() },
    { label: getWidgetText.todoList.dateBadges.tomorrow('ko'), value: () => addDays(new Date(), 1) },
    { label: '3일 후', value: () => addDays(new Date(), 3) },
    { label: '1주 후', value: () => addDays(new Date(), 7) },
    { label: '날짜 없음', value: () => undefined }
  ];
  
  // 날짜 그룹 렌더링
  const renderDateGroup = (group: DateGroup) => {
    const groupTasks = getTasksByDateGroup(group);
    const isExpanded = group.isExpanded;
    
    return (
      <div key={group.id} className="mb-2">
        {/* 그룹 헤더 */}
        <div className="flex items-center gap-1 px-1 py-1 group">
          <button
            onClick={() => toggleDateGroup(group.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
            }
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm">{group.emoji}</span>
            <span className={cn(
              "text-sm font-medium",
              group.isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
            )}>
              {group.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {groupTasks.length}
            </Badge>
          </div>
          
          <button
            onClick={() => {
              setAddingSectionId(`date-${group.id}`);
              setIsAdding(true);
              // 날짜 그룹에 따라 기본 마감일 설정
              if (group.id === 'today') {
                setSelectedDueDate(new Date());
              } else if (group.id === 'tomorrow') {
                setSelectedDueDate(addDays(new Date(), 1));
              } else if (group.id === 'this_week') {
                setSelectedDueDate(addDays(new Date(), 3));
              } else if (group.id === 'next_week') {
                setSelectedDueDate(addDays(new Date(), 10));
              } else {
                setSelectedDueDate(undefined);
              }
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        
        {/* 그룹 작업들 */}
        {isExpanded && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedTask) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedTask) {
                // 날짜 그룹에 따라 dueDate 업데이트
                let newDueDate: Date | undefined;
                if (group.id === 'today') {
                  newDueDate = new Date();
                } else if (group.id === 'tomorrow') {
                  newDueDate = addDays(new Date(), 1);
                } else if (group.dateRange) {
                  newDueDate = group.dateRange.start;
                }
                
                if (group.id !== 'overdue') {
                  setLocalTasks(prev => prev.map(t => 
                    t.id === draggedTask.id ? { ...t, dueDate: newDueDate } : t
                  ));
                }
                handleDragEnd();
              }
            }}
            className={cn(
              "min-h-[40px] relative transition-all",
              draggedTask && groupTasks.length === 0 && "bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg p-4"
            )}
          >
            {/* 그룹 내 작업 추가 입력 */}
            {isAdding && addingSectionId === `date-${group.id}` && (
              <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-1">
                <Input
                  ref={inputRef}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask(sections[0]?.id || 'urgent');
                    }
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setAddingSectionId(null);
                      setSelectedDueDate(undefined);
                    }
                  }}
                  placeholder={getWidgetText.todoList.placeholder('ko')}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                
                <Button
                  size="sm"
                  onClick={() => handleAddTask(sections[0]?.id || 'urgent')}
                  className="h-7 px-2 text-xs"
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setAddingSectionId(null);
                    setNewTaskTitle('');
                    setSelectedDueDate(undefined);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  취소
                </Button>
              </div>
            )}
            
            {groupTasks.length === 0 && draggedTask && (
              <div className="text-center py-4 text-sm text-primary font-medium animate-pulse">
                📥 여기로 태스크 이동
              </div>
            )}
            {groupTasks.map((task, index) => renderTask(task, index))}
          </div>
        )}
      </div>
    );
  };
  
  // 작업 렌더링
  const renderTask = (task: TodoTask, index: number) => {
    const isExpanded = expandedTasks.has(task.id) || task.isExpanded;
    const hasChildren = task.children && task.children.length > 0;
    const isHoveringOver = draggedOverTask === task.id;

    return (
      <div key={task.id}>
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;
            const relativeX = e.clientX - rect.left;
            
            // 드래그 시작 위치와 현재 위치의 차이로 좌우 이동 판단
            const horizontalDelta = e.clientX - dragStartX;
            
            // 더 명확한 영역 구분 (4방향)
            let position: 'before' | 'after' | 'child' | 'parent';
            
            // 상하 위치가 우선
            if (y < height * 0.25) {
              position = 'before';
            } else if (y > height * 0.75) {
              position = 'after';
            } else {
              // 중간 영역에서는 드래그 시작점 대비 좌우 이동으로 판단
              if (horizontalDelta < -40 && draggedTask && draggedTask.depth > 0) {
                // 왼쪽으로 40px 이상 드래그 = 상위 레벨로
                position = 'parent';
              } else if (horizontalDelta > 40) {
                // 오른쪽으로 40px 이상 드래그 = 하위 레벨로
                position = 'child';
              } else {
                // 좌우 이동이 작으면 = 같은 레벨
                position = 'after';
              }
            }
            
            handleDragOver(e, task, position);
          }}
          onDrop={(e) => {
            if (dragPosition) {
              handleDrop(e, task, dragPosition);
            }
          }}
          onDragLeave={(e) => {
            // 다른 요소로 이동할 때 시각적 피드백 제거
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDraggedOverTask(null);
              setDragPosition(null);
            }
          }}
          className={cn(
            "group flex items-center gap-1 py-1.5 px-1 rounded transition-all relative",
            "hover:bg-gray-50 dark:hover:bg-gray-900/50",
            draggedTask?.id === task.id && "opacity-40 bg-gray-100 dark:bg-gray-800",
            isHoveringOver && dragPosition === 'before' && "before:absolute before:top-0 before:left-0 before:right-0 before:h-2 before:bg-primary/50 before:rounded before:animate-pulse",
            isHoveringOver && dragPosition === 'after' && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-2 after:bg-primary/50 after:rounded after:animate-pulse",
            isHoveringOver && dragPosition === 'child' && "bg-primary/10 border-l-4 border-primary ml-6 animate-pulse",
            isHoveringOver && dragPosition === 'parent' && "bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-400 -ml-4 animate-pulse"
          )}
          style={{ paddingLeft: `${task.depth * 24 + 4}px` }}
        >
          {/* 드래그 가이드 텍스트 */}
          {isHoveringOver && dragPosition && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none">
              {dragPosition === 'before' && '⬆️ 위에 놓기'}
              {dragPosition === 'after' && '⬇️ 아래에 놓기'}
              {dragPosition === 'child' && '➡️ 하위 작업으로'}
              {dragPosition === 'parent' && '⬅️ 상위 레벨로'}
            </div>
          )}
          {/* 드래그 핸들 */}
          <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0" />
          
          {/* 확장/축소 버튼 */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(task.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex-shrink-0"
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          
          {/* 체크박스 */}
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleTask(task.id)}
            className="flex-shrink-0"
          />
          
          {/* 작업 내용 */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onDoubleClick={() => {
              setEditingTask(task.id);
              setEditedTaskTitle(task.title);
            }}
          >
            {editingTask === task.id ? (
              <Input
                value={editedTaskTitle}
                onChange={(e) => setEditedTaskTitle(e.target.value)}
                onBlur={() => {
                  if (onTaskUpdate) {
                    onTaskUpdate(task.id, { title: editedTaskTitle });
                  } else {
                    setLocalTasks(prev => prev.map(t => 
                      t.id === task.id ? { ...t, title: editedTaskTitle } : t
                    ));
                  }
                  setEditingTask(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (onTaskUpdate) {
                      onTaskUpdate(task.id, { title: editedTaskTitle });
                    } else {
                      setLocalTasks(prev => prev.map(t => 
                        t.id === task.id ? { ...t, title: editedTaskTitle } : t
                      ));
                    }
                    setEditingTask(null);
                  }
                  if (e.key === 'Escape') {
                    setEditingTask(null);
                    setEditedTaskTitle(task.title);
                  }
                }}
                className="h-6 text-sm"
                autoFocus
              />
            ) : (
              <span className={cn(
                "text-sm",
                task.completed && "line-through text-gray-400"
              )}>
                {task.title}
              </span>
            )}
          </div>
          
          {/* 우선순위 변경 가능한 플래그 */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex-shrink-0">
                <Flag className={cn(
                  "h-3 w-3",
                  priorityColors[task.priority].icon
                )} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium mb-1">우선순위 설정</div>
                {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      setLocalTasks(prev => prev.map(t => 
                        t.id === task.id ? { ...t, priority } : t
                      ));
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm",
                      task.priority === priority && "bg-primary/10"
                    )}
                  >
                    <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                    <span className="text-xs">
                      {priority === 'p1' ? '긴급' : 
                       priority === 'p2' ? '높음' : 
                       priority === 'p3' ? '보통' : '낮음'}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* 마감일 표시 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 hover:bg-transparent p-0"
              >
                <Badge
                  variant={formatDateBadge(task.dueDate).variant}
                  className="text-xs cursor-pointer"
                >
                  {formatDateBadge(task.dueDate).text}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <div className="text-sm font-medium">마감일 변경</div>
                <div className="flex flex-col gap-1">
                  {quickDateOptions.map(option => (
                    <Button
                      key={option.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        const newDueDate = option.value();
                        setLocalTasks(prev => prev.map(t => 
                          t.id === task.id ? { ...t, dueDate: newDueDate } : t
                        ));
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <Calendar
                    mode="single"
                    selected={task.dueDate}
                    onSelect={(date) => {
                      setLocalTasks(prev => prev.map(t => 
                        t.id === task.id ? { ...t, dueDate: date || undefined } : t
                      ));
                    }}
                    className="rounded-md"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          
          {/* 삭제 버튼 */}
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
        
        {/* 자식 작업들 */}
        {hasChildren && isExpanded && (
          <div>
            {task.children!.map((child, idx) => renderTask(child, idx))}
          </div>
        )}
      </div>
    );
  };

  // 섹션별로 작업 그룹화
  const getTasksBySection = (sectionId: string) => {
    const filtered = localTasks.filter(task => (task.sectionId || 'default') === sectionId && !task.parentId);
    console.log(`Section ${sectionId}: found ${filtered.length} tasks`, filtered);
    return filtered;
  };
  
  // 날짜별로 작업 그룹화 (모든 태스크 개별 표시)
  const getTasksByDateGroup = (group: DateGroup): TodoTask[] => {
    const today = startOfDay(new Date());
    const result: TodoTask[] = [];
    
    // 모든 태스크를 플랫하게 순회하여 날짜 조건에 맞는 것만 수집
    const collectTasks = (tasks: TodoTask[]) => {
      tasks.forEach(task => {
        // 완료되지 않은 태스크만 확인
        if (!task.completed) {
          let shouldInclude = false;
          
          if (group.id === 'overdue') {
            shouldInclude = !!(task.dueDate && startOfDay(task.dueDate) < today);
          } else if (group.dateRange) {
            shouldInclude = !!(task.dueDate && 
                           task.dueDate >= group.dateRange.start && 
                           task.dueDate <= group.dateRange.end);
          }
          
          if (shouldInclude) {
            // 날짜 뷰에서는 depth를 0으로 리셋하여 평면적으로 표시
            result.push({
              ...task,
              depth: 0,
              parentId: undefined,
              children: [] // 날짜 뷰에서는 하위 태스크 표시 안함
            });
          }
        }
        
        // 하위 태스크들도 재귀적으로 확인
        if (task.children && task.children.length > 0) {
          collectTasks(task.children);
        }
      });
    };
    
    collectTasks(localTasks);
    
    // 날짜 순으로 정렬 (가장 임박한 것부터)
    return result.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };
  
  // 날짜 그룹 토글
  const toggleDateGroup = (groupId: string) => {
    setDateGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
    ));
  };

  // 섹션 드래그 핸들러
  const handleSectionDragStart = (e: React.DragEvent, section: TodoSection) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, targetSection: TodoSection) => {
    e.preventDefault();
    if (draggedSection && draggedSection.id !== targetSection.id) {
      e.dataTransfer.dropEffect = 'move';
      setDraggedOverSection(targetSection.id);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetSection: TodoSection) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection || draggedSection.id === targetSection.id) {
      setDraggedSection(null);
      setDraggedOverSection(null);
      return;
    }

    // 섹션 순서 재정렬
    const updatedSections = [...sections];
    const draggedIndex = updatedSections.findIndex(s => s.id === draggedSection.id);
    const targetIndex = updatedSections.findIndex(s => s.id === targetSection.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      updatedSections.splice(draggedIndex, 1);
      updatedSections.splice(targetIndex, 0, draggedSection);
      
      // order 값 업데이트
      updatedSections.forEach((section, index) => {
        section.order = index;
      });
      
      setSections(updatedSections);
    }
    
    setDraggedSection(null);
    setDraggedOverSection(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSection(null);
    setDraggedOverSection(null);
  };

  // 섹션 렌더링
  const renderSection = (section: TodoSection) => {
    const sectionTasks = getTasksBySection(section.id);
    const isExpanded = section.isExpanded;
    const isDraggingOver = draggedOverSection === section.id;
    
    return (
      <div 
        key={section.id} 
        className={cn(
          "mb-2 transition-all",
          draggedSection?.id === section.id && "opacity-40",
          isDraggingOver && "bg-primary/5 rounded-lg"
        )}
        draggable
        onDragStart={(e) => handleSectionDragStart(e, section)}
        onDragOver={(e) => handleSectionDragOver(e, section)}
        onDrop={(e) => handleSectionDrop(e, section)}
        onDragEnd={handleSectionDragEnd}
      >
        {/* 섹션 헤더 - 모든 섹션에 대해 표시 */}
        {(
          <div className="flex items-center gap-1 px-1 py-1 group">
            <button
              onClick={() => toggleSection(section.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </button>
            
            {/* 섹션 드래그 핸들 */}
            <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0 mr-1" />
            
            {editingSection === section.id ? (
              <Input
                defaultValue={section.name}
                onBlur={(e) => {
                  setSections(prev => prev.map(s => 
                    s.id === section.id ? { ...s, name: e.target.value } : s
                  ));
                  setEditingSection(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSections(prev => prev.map(s => 
                      s.id === section.id ? { ...s, name: e.currentTarget.value } : s
                    ));
                    setEditingSection(null);
                  }
                  if (e.key === 'Escape') {
                    setEditingSection(null);
                  }
                }}
                className="h-6 text-sm font-medium flex-1"
                autoFocus
              />
            ) : (
              <div 
                className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                onDoubleClick={() => setEditingSection(section.id)}
              >
                {section.name}
              </div>
            )}
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => {
                  setAddingSectionId(section.id);
                  setIsAdding(true);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  // 해당 섹션의 모든 태스크 삭제
                  setLocalTasks(prev => prev.filter(t => t.sectionId !== section.id));
                  // 섹션 삭제
                  setSections(prev => prev.filter(s => s.id !== section.id));
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
            </div>
          </div>
        )}
        
        {/* 섹션 작업들 */}
        {isExpanded && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedTask) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedTask && sectionTasks.length === 0) {
                handleDrop(e, null, 'before', section.id);
              }
            }}
            className={cn(
              "min-h-[40px] relative transition-all",
              draggedTask && sectionTasks.length === 0 && "bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg p-4"
            )}
          >
            {/* 섹션 내 작업 추가 입력 - 섹션의 추가 버튼 클릭 시만 표시 */}
            {isAdding && addingSectionId === section.id && (
              <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-1">
                <Input
                  ref={inputRef}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask(section.id);
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setAddingSectionId(null);
                    }
                  }}
                  placeholder={getWidgetText.todoList.placeholder('ko')}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                
                {/* 우선순위 선택 */}
                <div className="flex gap-0.5">
                  {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        selectedPriority === priority 
                          ? "bg-primary/10" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-800"
                      )}
                    >
                      <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                    </button>
                  ))}
                </div>
                
                {/* 날짜 선택 */}
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                    >
                      <CalendarDays className="h-3 w-3" />
                      {selectedDueDate && (
                        <Badge
                          variant={formatDateBadge(selectedDueDate).variant}
                          className="ml-1 text-xs"
                        >
                          {formatDateBadge(selectedDueDate).text}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">마감일 설정</div>
                      <div className="flex flex-col gap-1">
                        {quickDateOptions.map(option => (
                          <Button
                            key={option.label}
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              setSelectedDueDate(option.value());
                              setDatePopoverOpen(false);
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <Calendar
                          mode="single"
                          selected={selectedDueDate}
                          onSelect={(date) => {
                            setSelectedDueDate(date || undefined);
                            setDatePopoverOpen(false);
                          }}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  size="sm"
                  onClick={() => handleAddTask(section.id)}
                  className="h-7 px-2 text-xs"
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setAddingSectionId(null);
                    setNewTaskTitle('');
                    setSelectedPriority('p3');
                  }}
                  className="h-7 px-2 text-xs"
                >
                  취소
                </Button>
              </div>
            )}
            
            {sectionTasks.length === 0 && draggedTask && (
              <div className="text-center py-4 text-sm text-primary font-medium animate-pulse">
                📥 여기로 태스크 이동
              </div>
            )}
            {sectionTasks.map((task, index) => renderTask(task, index))}
          </div>
        )}
        
        {/* 섹션 사이 호버 영역 (새 섹션 추가) */}
        {!isAddingSection ? (
          <div className="h-8 group">
            <button
              className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1"
              onClick={() => setIsAddingSection(true)}
            >
              <FolderPlus className="h-3 w-3" />
              <span>새 섹션 추가</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded mb-2">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSectionName.trim()) {
                  handleAddSection(newSectionName);
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
                if (e.key === 'Escape') {
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
              }}
              placeholder="섹션 이름 입력..."
              className="flex-1 h-7 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => {
                if (newSectionName.trim()) {
                  handleAddSection(newSectionName);
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
              }}
              className="h-7 px-2 text-xs"
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewSectionName('');
                setIsAddingSection(false);
              }}
              className="h-7 px-2 text-xs"
            >
              취소
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden transition-all",
      isDragging && "shadow-lg"
    )}>
      <CardHeader>
        <CardTitle className={cn(typography.widget.title, "flex items-center justify-between")}>
          <span>{displayTitle}</span>
          <div className="flex items-center gap-1">
            {/* 뷰 모드 전환 버튼 */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
              <Button
                size="sm"
                variant={viewMode === 'section' ? 'default' : 'ghost'}
                onClick={() => setViewMode('section')}
                className="h-6 px-2"
              >
                <List className="h-3 w-3" />
                <span className="ml-1 text-xs">섹션</span>
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'date' ? 'default' : 'ghost'}
                onClick={() => setViewMode('date')}
                className="h-6 px-2"
              >
                <CalendarIcon className="h-3 w-3" />
                <span className="ml-1 text-xs">날짜</span>
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'completed' ? 'default' : 'ghost'}
                onClick={() => setViewMode('completed')}
                className="h-6 px-2"
              >
                <Clock className="h-3 w-3" />
                <span className="ml-1 text-xs">완료</span>
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(true);
                setAddingSectionId('top-add');
              }}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className={typography.text.description}>
          {getWidgetText.todoList.description('ko')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1">
            <div className="space-y-2 px-3">
              {/* 뷰 모드에 따라 다른 렌더링 */}
              {viewMode === 'section' ? (
                <>
                  {/* 상단 추가 버튼 클릭 시 표시 - 섹션 뷰 */}
                  {isAdding && addingSectionId === 'top-add' && (
          <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-2">
            <Input
              ref={inputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask(sections[0]?.id || 'urgent');
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setAddingSectionId(null);
                }
              }}
              placeholder={getWidgetText.todoList.placeholder('ko')}
              className="flex-1 h-7 text-sm"
              autoFocus
            />
            
            {/* 우선순위 선택 */}
            <div className="flex gap-0.5">
              {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    selectedPriority === priority 
                      ? "bg-primary/10" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-800"
                  )}
                >
                  <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                </button>
              ))}
            </div>
            
            <Button
              size="sm"
              onClick={() => handleAddTask(sections[0]?.id || 'urgent')}
              className="h-7 px-2 text-xs"
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setAddingSectionId(null);
                setNewTaskTitle('');
                setSelectedPriority('p3');
              }}
              className="h-7 px-2 text-xs"
            >
              취소
                      </Button>
                    </div>
                  )}
                  
                  {/* 섹션별 렌더링 */}
                  {sections.map(section => renderSection(section))}
                </>
              ) : viewMode === 'date' ? (
                <>
                  {/* 상단 추가 버튼 클릭 시 표시 - 날짜 뷰 */}
                  {isAdding && addingSectionId === 'top-add' && (
                    <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-2">
                      <Input
                        ref={inputRef}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(sections[0]?.id || 'urgent');
                          if (e.key === 'Escape') {
                            setIsAdding(false);
                            setAddingSectionId(null);
                            setSelectedDueDate(undefined);
                          }
                        }}
                        placeholder={getWidgetText.todoList.placeholder('ko')}
                        className="flex-1 h-7 text-sm"
                        autoFocus
                      />
                      
                      {/* 날짜 선택 */}
                      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                          >
                            <CalendarDays className="h-3 w-3" />
                            {selectedDueDate && (
                              <Badge
                                variant={formatDateBadge(selectedDueDate).variant}
                                className="ml-1 text-xs"
                              >
                                {formatDateBadge(selectedDueDate).text}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="end">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">마감일 설정</div>
                            <div className="flex flex-col gap-1">
                              {quickDateOptions.map(option => (
                                <Button
                                  key={option.label}
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => {
                                    setSelectedDueDate(option.value());
                                    setDatePopoverOpen(false);
                                  }}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                            <div className="border-t pt-2">
                              <Calendar
                                mode="single"
                                selected={selectedDueDate}
                                onSelect={(date) => {
                                  setSelectedDueDate(date || undefined);
                                  setDatePopoverOpen(false);
                                }}
                                className="rounded-md"
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAddTask(sections[0]?.id || 'urgent')}
                        className="h-7 px-2 text-xs"
                      >
                        추가
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAdding(false);
                          setAddingSectionId(null);
                          setNewTaskTitle('');
                          setSelectedDueDate(undefined);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        취소
                      </Button>
                    </div>
                  )}
                  
                  {/* 날짜별 렌더링 */}
                  {dateGroups.map(group => renderDateGroup(group))}
                </>
              ) : (
                <>
                  {/* 완료된 태스크 뷰 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 py-1">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        완료된 일정
                      </h3>
                      <Badge variant="status-soft-success" className="text-xs">
                        {(() => {
                          let count = 0;
                          const countCompleted = (tasks: TodoTask[]) => {
                            tasks.forEach(task => {
                              if (task.completed) count++;
                              if (task.children) countCompleted(task.children);
                            });
                          };
                          countCompleted(localTasks);
                          return count;
                        })()}건
                      </Badge>
                    </div>
                    {(() => {
                      const completedTasks: TodoTask[] = [];
                      
                      // 모든 완료된 태스크 수집 (상하위 관계 없이)
                      const collectCompletedTasks = (tasks: TodoTask[]) => {
                        tasks.forEach(task => {
                          if (task.completed) {
                            completedTasks.push({
                              ...task,
                              depth: 0,
                              parentId: undefined,
                              children: []
                            });
                          }
                          if (task.children && task.children.length > 0) {
                            collectCompletedTasks(task.children);
                          }
                        });
                      };
                      
                      collectCompletedTasks(localTasks);
                      
                      // 완료 날짜 기준 정렬
                      return completedTasks.sort((a, b) => {
                        if (a.completedAt && b.completedAt) {
                          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                        }
                        return 0;
                      });
                    })()
                      .map((task, index) => renderTask(task, index))}
                    {(() => {
                      let completedCount = 0;
                      const countCompleted = (tasks: TodoTask[]) => {
                        tasks.forEach(task => {
                          if (task.completed) completedCount++;
                          if (task.children) countCompleted(task.children);
                        });
                      };
                      countCompleted(localTasks);
                      return completedCount === 0;
                    })() && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">완료된 태스크가 없습니다</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* 작업이 없을 때 */}
              {localTasks.length === 0 && !isAdding && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">{getWidgetText.todoList.noTasks('ko')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}