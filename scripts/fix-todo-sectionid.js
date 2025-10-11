/**
 * Todo Tasks sectionId 문제 해결 스크립트
 *
 * 브라우저 콘솔에서 실행하여 기존 tasks를 재생성합니다.
 * 이렇게 하면 sectionId가 별도 필드로도 저장됩니다.
 */

// 현재 LocalStorage의 tasks 확인
console.log('📋 현재 LocalStorage tasks 확인...');
const currentTasks = JSON.parse(localStorage.getItem('weave_v2_tasks') || '[]');
console.log('현재 tasks 수:', currentTasks.length);

// 각 task의 sectionId 필드 확인
currentTasks.forEach(task => {
  console.log(`Task "${task.title}":`, {
    sectionId_field: task.sectionId,
    tags: task.tags,
    has_section_tag: task.tags?.some(tag => tag?.startsWith('section:'))
  });
});

console.log('\n🔧 sectionId 필드 추가 중...');

// 모든 tasks에 sectionId 필드 추가
const fixedTasks = currentTasks.map(task => {
  // tags에서 sectionId 추출
  let sectionId = null;
  if (task.tags && Array.isArray(task.tags)) {
    for (const tag of task.tags) {
      if (tag && typeof tag === 'string' && tag.startsWith('section:')) {
        sectionId = tag.substring(8);
        break;
      }
    }
  }

  // sectionId 필드가 없으면 추가
  if (sectionId && !task.sectionId) {
    console.log(`✅ Task "${task.title}"에 sectionId 필드 추가: ${sectionId}`);
    return {
      ...task,
      sectionId: sectionId
    };
  }

  return task;
});

// LocalStorage에 저장
console.log('\n💾 수정된 tasks를 LocalStorage에 저장...');
localStorage.setItem('weave_v2_tasks', JSON.stringify(fixedTasks));

// 확인
console.log('\n✅ 완료! 수정된 tasks:');
fixedTasks.forEach(task => {
  console.log(`- "${task.title}": sectionId=${task.sectionId}`);
});

console.log('\n🔄 페이지를 새로고침하면 TodoList 위젯에 tasks가 표시됩니다.');
console.log('(또는 TodoList 위젯에서 작업을 추가/수정하면 자동으로 새로고침됩니다)');

// DualWrite 동기화 큐도 확인
const syncQueue = localStorage.getItem('__dual_write_sync_queue__');
if (syncQueue) {
  const queue = JSON.parse(syncQueue);
  console.log('\n📤 DualWrite 동기화 큐:', queue.length, '개 항목');
}