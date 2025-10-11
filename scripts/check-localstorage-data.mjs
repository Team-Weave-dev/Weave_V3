/**
 * LocalStorage에서 todo 관련 데이터를 확인하는 스크립트
 * (브라우저 콘솔에서 실행용 코드 생성)
 */

console.log(`
====================================================================
📋 LocalStorage Todo 데이터 확인 스크립트
====================================================================

다음 코드를 브라우저 콘솔에 복사해서 실행하세요:

--------------------------------------------------------------------
// LocalStorage 전체 키 확인
console.log('🔑 LocalStorage 전체 키 목록:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(\`  \${i + 1}. \${key}\`);
}

// Tasks 데이터 확인
console.log('\\n📋 Tasks 데이터:');
const tasksKey = 'weave_v2_tasks';
const tasksData = localStorage.getItem(tasksKey);
if (tasksData) {
  const tasks = JSON.parse(tasksData);
  console.log(\`  총 \${tasks.length}개 task:\`);
  tasks.forEach((task, i) => {
    console.log(\`  \${i + 1}. \${task.title} (ID: \${task.id})\`);
    console.log(\`     Tags: \${JSON.stringify(task.tags)}\`);
  });
} else {
  console.log('  ❌ Tasks 데이터 없음');
}

// TodoSections 데이터 확인
console.log('\\n📂 TodoSections 데이터:');
const sectionsKey = 'weave_v2_todo_sections';
const sectionsData = localStorage.getItem(sectionsKey);
if (sectionsData) {
  const sections = JSON.parse(sectionsData);
  console.log(\`  총 \${sections.length}개 section:\`);
  sections.forEach((section, i) => {
    console.log(\`  \${i + 1}. \${section.name} (ID: \${section.id})\`);
  });
} else {
  console.log('  ❌ TodoSections 데이터 없음');
}
--------------------------------------------------------------------

위 코드를 실행한 후 결과를 보여주세요.
====================================================================
`);
