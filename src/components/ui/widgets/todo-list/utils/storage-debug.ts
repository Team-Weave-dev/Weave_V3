/**
 * 투두리스트 localStorage 디버깅 및 캐시 문제 해결 유틸리티
 *
 * 브라우저 캐싱 vs localStorage 불일치 문제를 해결하기 위한 함수들
 * 시크릿 모드에서는 작동하지만 일반 모드에서 작동하지 않는 문제 해결용
 */

import { STORAGE_KEY, SECTIONS_KEY, VIEW_MODE_KEY, OPTIONS_KEY } from '../constants';
import type { TodoTask, TodoSection } from '../types';

// localStorage의 모든 데이터를 로그로 출력하여 상태 확인
export function debugLocalStorageState(): void {
  if (typeof window === 'undefined') {
    console.log('🔍 [DEBUG] 서버사이드에서는 localStorage에 접근할 수 없습니다.');
    return;
  }

  console.log('🔍 [DEBUG] === localStorage 상태 전체 점검 (투두리스트) ===');
  console.log(`총 localStorage 키 개수: ${localStorage.length}`);

  // 모든 localStorage 키를 순회하며 출력
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);

      // Weave 투두리스트 관련 데이터인지 확인
      if (key.includes('weave_dashboard_todo') || key.includes('todo_')) {
        console.log(`🎯 [WEAVE 투두] ${key}:`, value);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            console.log(`📊 [파싱됨] ${key}:`, parsed);
            if (Array.isArray(parsed)) {
              console.log(`📊 [투두 항목 개수]: ${parsed.length}개`);
            }
          } catch (error) {
            console.error(`❌ [ERROR] ${key} 데이터 파싱 실패:`, error);
          }
        }
      }
    }
  }

  // 우리 시스템의 투두리스트 키들 특별히 확인
  console.log('\n📦 [투두리스트 스토리지 키 상세 확인]');

  const todoTasks = localStorage.getItem(STORAGE_KEY);
  console.log(`📊 [STORAGE_KEY] ${STORAGE_KEY}:`, todoTasks);
  if (todoTasks) {
    try {
      const parsed = JSON.parse(todoTasks);
      console.log('📊 [파싱된 태스크]:',parsed);
      console.log('📊 [태스크 개수]:', Array.isArray(parsed) ? parsed.length : 0);
    } catch (error) {
      console.error('❌ [ERROR] 태스크 데이터 파싱 실패:', error);
    }
  }

  const todoSections = localStorage.getItem(SECTIONS_KEY);
  console.log(`📊 [SECTIONS_KEY] ${SECTIONS_KEY}:`, todoSections);
  if (todoSections) {
    try {
      const parsed = JSON.parse(todoSections);
      console.log('📊 [파싱된 섹션]:', parsed);
      console.log('📊 [섹션 개수]:', Array.isArray(parsed) ? parsed.length : 0);
    } catch (error) {
      console.error('❌ [ERROR] 섹션 데이터 파싱 실패:', error);
    }
  }

  const viewMode = localStorage.getItem(VIEW_MODE_KEY);
  console.log(`📊 [VIEW_MODE_KEY] ${VIEW_MODE_KEY}:`, viewMode);

  const options = localStorage.getItem(OPTIONS_KEY);
  console.log(`📊 [OPTIONS_KEY] ${OPTIONS_KEY}:`, options);

  console.log('🔍 [DEBUG] =================================');
}

// 오래된/잘못된 데이터 구조를 감지하고 정리
export function clearStaleTodoData(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 [CLEANUP] 오래된 투두리스트 데이터 정리 시작...');

  let cleanupCount = 0;
  const keysToRemove: string[] = [];

  // localStorage를 순회하며 정리할 키들 찾기
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // 이전 버전에서 사용했을 가능성이 있는 키 패턴들
      const isOldTodoKey = (
        key.includes('todo') &&
        ![STORAGE_KEY, SECTIONS_KEY, VIEW_MODE_KEY, OPTIONS_KEY].includes(key) &&
        (key.includes('weave') || key.includes('dashboard'))
      );

      // 잘못된 형식의 투두 키
      const isInvalidTodoKey = (
        key.startsWith('todo-') || key.startsWith('task-')
      );

      if (isOldTodoKey || isInvalidTodoKey) {
        keysToRemove.push(key);
        cleanupCount++;
        console.log(`🗑️  정리 대상: ${key}`);
      }
    }
  }

  // 찾은 키들 삭제
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ 삭제 완료: ${key}`);
  });

  // 현재 투두 데이터도 검증하고 정리
  const currentTasks = localStorage.getItem(STORAGE_KEY);
  if (currentTasks) {
    try {
      const parsed = JSON.parse(currentTasks);
      let needsUpdate = false;

      if (Array.isArray(parsed)) {
        // 유효한 태스크 데이터인지 검증
        const validTasks = parsed.filter((task: any) =>
          task &&
          typeof task === 'object' &&
          task.id &&
          task.title &&
          typeof task.completed === 'boolean'
        );

        if (validTasks.length !== parsed.length) {
          console.log(`🔧 ${parsed.length - validTasks.length}개 잘못된 태스크 데이터 정리`);
          needsUpdate = true;
        }

        if (needsUpdate) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validTasks));
          console.log('✅ 투두 태스크 데이터 정리 및 업데이트 완료');
        }
      } else {
        console.log(`🗑️  잘못된 투두 데이터 형식 제거`);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('❌ 현재 투두 데이터 정리 중 오류:', error);
      // 완전히 깨진 데이터라면 초기화
      localStorage.removeItem(STORAGE_KEY);
      console.log('🆕 투두 태스크 데이터 초기화 완료');
    }
  }

  // 섹션 데이터도 검증
  const currentSections = localStorage.getItem(SECTIONS_KEY);
  if (currentSections) {
    try {
      const parsed = JSON.parse(currentSections);
      let needsUpdate = false;

      if (Array.isArray(parsed)) {
        // 유효한 섹션 데이터인지 검증
        const validSections = parsed.filter((section: any) =>
          section &&
          typeof section === 'object' &&
          section.id &&
          section.name &&
          typeof section.order === 'number'
        );

        if (validSections.length !== parsed.length) {
          console.log(`🔧 ${parsed.length - validSections.length}개 잘못된 섹션 데이터 정리`);
          needsUpdate = true;
        }

        if (needsUpdate) {
          localStorage.setItem(SECTIONS_KEY, JSON.stringify(validSections));
          console.log('✅ 투두 섹션 데이터 정리 및 업데이트 완료');
        }
      } else {
        console.log(`🗑️  잘못된 섹션 데이터 형식 제거`);
        localStorage.removeItem(SECTIONS_KEY);
      }
    } catch (error) {
      console.error('❌ 현재 섹션 데이터 정리 중 오류:', error);
      localStorage.removeItem(SECTIONS_KEY);
      console.log('🆕 투두 섹션 데이터 초기화 완료');
    }
  }

  console.log(`🧹 [CLEANUP] 정리 완료! ${cleanupCount}개 항목 정리됨`);
}

// 강제로 모든 투두 데이터를 초기화 (핵옵션)
export function resetAllTodoData(): void {
  if (typeof window === 'undefined') return;

  console.log('💣 [RESET] 모든 투두리스트 데이터 초기화...');

  // 투두 관련 모든 localStorage 키 제거
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('todo') || key.includes('weave_dashboard_todo'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️  제거: ${key}`);
  });

  console.log(`💣 [RESET] ${keysToRemove.length}개 항목 초기화 완료!`);
  console.log('🔄 페이지를 새로고침하여 깨끗한 상태로 시작하세요.');
}

// 투두 데이터 상태 확인
export function debugTodoData(): void {
  console.log(`🔍 [TODO DEBUG] 투두리스트 데이터 상태 확인`);

  // 태스크 확인
  try {
    const tasksData = localStorage.getItem(STORAGE_KEY);
    if (tasksData) {
      const tasks = JSON.parse(tasksData) as TodoTask[];
      console.log(`📊 현재 태스크 개수: ${tasks.length}`);
      console.log('📄 태스크 목록:', tasks);

      if (tasks.length > 0) {
        tasks.forEach((task, index) => {
          console.log(`📄 태스크 ${index + 1}:`, {
            id: task.id,
            title: task.title,
            completed: task.completed,
            priority: task.priority,
            sectionId: task.sectionId,
            dueDate: task.dueDate,
            children: task.children?.length || 0
          });
        });
      }
    } else {
      console.log('📭 저장된 태스크가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 태스크 데이터 조회 오류:', error);
  }

  // 섹션 확인
  try {
    const sectionsData = localStorage.getItem(SECTIONS_KEY);
    if (sectionsData) {
      const sections = JSON.parse(sectionsData) as TodoSection[];
      console.log(`📊 현재 섹션 개수: ${sections.length}`);
      console.log('📁 섹션 목록:', sections);

      if (sections.length > 0) {
        sections.forEach((section, index) => {
          console.log(`📁 섹션 ${index + 1}:`, {
            id: section.id,
            name: section.name,
            order: section.order,
            isExpanded: section.isExpanded
          });
        });
      }
    } else {
      console.log('📭 저장된 섹션이 없습니다.');
    }
  } catch (error) {
    console.error('❌ 섹션 데이터 조회 오류:', error);
  }

  // localStorage에서 직접 확인
  console.log('\n🗄️  localStorage 직접 조회:');
  console.log('- STORAGE_KEY:', localStorage.getItem(STORAGE_KEY));
  console.log('- SECTIONS_KEY:', localStorage.getItem(SECTIONS_KEY));
  console.log('- VIEW_MODE_KEY:', localStorage.getItem(VIEW_MODE_KEY));
  console.log('- OPTIONS_KEY:', localStorage.getItem(OPTIONS_KEY));
}

// 캐시 문제 해결을 위한 원스톱 함수
export function fixTodoCacheIssues(): void {
  console.log('🚑 [CACHE FIX] 브라우저 캐싱 문제 해결 시작 (투두리스트)...');

  // 1단계: 현재 상태 진단
  console.log('1️⃣ 현재 상태 진단');
  debugLocalStorageState();

  // 2단계: 오래된 데이터 정리
  console.log('2️⃣ 오래된 데이터 정리');
  clearStaleTodoData();

  // 3단계: 정리 후 상태 확인
  console.log('3️⃣ 정리 후 상태 확인');
  debugLocalStorageState();

  console.log('🚑 [CACHE FIX] 캐시 문제 해결 완료!');
  console.log('🔄 이제 투두리스트 위젯에서 태스크를 추가/수정해보세요.');
}

// 개발 환경에서 디버깅 함수들을 전역으로 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugWeaveTodo = {
    debugLocalStorageState,
    clearStaleTodoData,
    resetAllTodoData,
    debugTodoData,
    fixTodoCacheIssues
  };
  console.log('🛠️  개발 모드: window.debugWeaveTodo 디버깅 도구 사용 가능');
}
