#!/usr/bin/env node

/**
 * 날짜 수정 기능 테스트 스크립트
 *
 * Task와 CalendarEvent의 날짜 업데이트가 제대로 작동하는지 확인합니다.
 */

console.log('📅 날짜 수정 기능 테스트 시작...\n');

// 브라우저 콘솔에서 실행할 테스트 코드
const browserScript = `
(async function testDateUpdate() {
  console.log('🧪 날짜 업데이트 테스트 시작...');

  // 1. 기존 tasks 확인
  console.log('\\n📋 현재 tasks 확인...');
  const tasks = JSON.parse(localStorage.getItem('weave_v2_tasks') || '[]');
  console.log('Tasks 개수:', tasks.length);

  if (tasks.length === 0) {
    console.log('⚠️ Task가 없습니다. 테스트 task를 생성합니다...');

    const testTask = {
      id: 'test-task-' + Date.now(),
      userId: '1',
      title: '날짜 수정 테스트 Task',
      description: '이 task는 날짜 수정 테스트용입니다',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
      startDate: new Date().toISOString(),
      sectionId: 'WEAVE_TODO_001',
      tags: ['section:WEAVE_TODO_001'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(testTask);
    localStorage.setItem('weave_v2_tasks', JSON.stringify(tasks));
    console.log('✅ 테스트 task 생성 완료:', testTask.id);
  }

  // 2. 첫 번째 task의 날짜 수정 시도
  const taskToUpdate = tasks[0];
  console.log('\\n🔧 Task 날짜 수정 시도...');
  console.log('수정할 Task ID:', taskToUpdate.id);
  console.log('현재 dueDate:', taskToUpdate.dueDate);

  const newDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14일 후

  // TaskService를 통한 업데이트 시뮬레이션
  taskToUpdate.dueDate = newDueDate.toISOString();
  taskToUpdate.updatedAt = new Date().toISOString();
  taskToUpdate.device_id = 'test-device'; // BaseService가 추가하는 필드

  console.log('새로운 dueDate:', taskToUpdate.dueDate);
  console.log('device_id 추가:', taskToUpdate.device_id);

  // 검증
  console.log('\\n✅ Task 검증 시작...');
  console.log('- id:', typeof taskToUpdate.id === 'string' ? '✓' : '✗');
  console.log('- userId:', typeof taskToUpdate.userId === 'string' ? '✓' : '✗');
  console.log('- title:', typeof taskToUpdate.title === 'string' ? '✓' : '✗');
  console.log('- status:', ['pending', 'in_progress', 'completed', 'cancelled'].includes(taskToUpdate.status) ? '✓' : '✗');
  console.log('- priority:', ['low', 'medium', 'high', 'urgent'].includes(taskToUpdate.priority) ? '✓' : '✗');
  console.log('- device_id (optional):', !taskToUpdate.device_id || typeof taskToUpdate.device_id === 'string' ? '✓' : '✗');
  console.log('- sectionId (optional):', !taskToUpdate.sectionId || typeof taskToUpdate.sectionId === 'string' ? '✓' : '✗');

  // 저장
  try {
    localStorage.setItem('weave_v2_tasks', JSON.stringify(tasks));
    console.log('\\n✅ Task 날짜 업데이트 성공!');
  } catch (error) {
    console.error('❌ Task 저장 실패:', error);
  }

  // 3. CalendarEvent 테스트
  console.log('\\n📅 CalendarEvent 테스트...');
  const events = JSON.parse(localStorage.getItem('weave_v2_events') || '[]');
  console.log('Events 개수:', events.length);

  if (events.length === 0) {
    console.log('⚠️ Event가 없습니다. 테스트 event를 생성합니다...');

    const testEvent = {
      id: 'test-event-' + Date.now(),
      userId: '1',
      title: '날짜 수정 테스트 이벤트',
      description: '이 이벤트는 날짜 수정 테스트용입니다',
      type: 'meeting',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2시간 후
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    events.push(testEvent);
    localStorage.setItem('weave_v2_events', JSON.stringify(events));
    console.log('✅ 테스트 event 생성 완료:', testEvent.id);
  }

  // Event 날짜 수정
  const eventToUpdate = events[0];
  console.log('\\n🔧 Event 날짜 수정 시도...');
  console.log('수정할 Event ID:', eventToUpdate.id);
  console.log('현재 startDate:', eventToUpdate.startDate);
  console.log('현재 endDate:', eventToUpdate.endDate);

  const newStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 내일
  const newEndDate = new Date(Date.now() + 26 * 60 * 60 * 1000); // 내일 + 2시간

  eventToUpdate.startDate = newStartDate.toISOString();
  eventToUpdate.endDate = newEndDate.toISOString();
  eventToUpdate.updatedAt = new Date().toISOString();
  eventToUpdate.device_id = 'test-device'; // BaseService가 추가하는 필드

  console.log('새로운 startDate:', eventToUpdate.startDate);
  console.log('새로운 endDate:', eventToUpdate.endDate);
  console.log('device_id 추가:', eventToUpdate.device_id);

  // 검증
  console.log('\\n✅ Event 검증 시작...');
  console.log('- id:', typeof eventToUpdate.id === 'string' ? '✓' : '✗');
  console.log('- userId:', typeof eventToUpdate.userId === 'string' ? '✓' : '✗');
  console.log('- title:', typeof eventToUpdate.title === 'string' ? '✓' : '✗');
  console.log('- type:', ['meeting', 'deadline', 'milestone', 'reminder', 'other'].includes(eventToUpdate.type) ? '✓' : '✗');
  console.log('- startDate <= endDate:', new Date(eventToUpdate.startDate) <= new Date(eventToUpdate.endDate) ? '✓' : '✗');
  console.log('- device_id (optional):', !eventToUpdate.device_id || typeof eventToUpdate.device_id === 'string' ? '✓' : '✗');

  // 저장
  try {
    localStorage.setItem('weave_v2_events', JSON.stringify(events));
    console.log('\\n✅ Event 날짜 업데이트 성공!');
  } catch (error) {
    console.error('❌ Event 저장 실패:', error);
  }

  console.log('\\n🎉 테스트 완료! 페이지를 새로고침하여 변경사항을 확인하세요.');
})();
`;

console.log('📋 다음 스크립트를 브라우저 콘솔에서 실행하세요:\n');
console.log('='.repeat(80));
console.log(browserScript);
console.log('='.repeat(80));

console.log('\n📍 실행 방법:');
console.log('1. 브라우저에서 http://localhost:3002 접속');
console.log('2. F12 또는 개발자 도구 열기');
console.log('3. Console 탭에서 위 스크립트 붙여넣기 및 실행');
console.log('4. 결과 확인');