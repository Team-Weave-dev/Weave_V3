// 브라우저 콘솔에 이 스크립트를 붙여넣어 실행하세요
// http://localhost:3002 에서 로그인한 상태로 실행해야 합니다

console.clear();
console.log('=== Task Drag Validation Diagnostic ===\n');

// 1. LocalStorage에서 tasks 가져오기
const tasksData = localStorage.getItem('weave_v2_tasks');
if (!tasksData) {
  console.error('❌ No tasks found in localStorage');
} else {
  const tasks = JSON.parse(tasksData);
  console.log(`✅ Found ${tasks.length} tasks in localStorage\n`);

  if (tasks.length > 0) {
    const task = tasks[0];
    console.log('📋 First Task:', task);
    console.log('\n=== Field Type Analysis ===');

    // 2. 각 필드 타입 확인 및 문제 감지
    const problems = [];

    Object.keys(task).forEach(key => {
      const value = task[key];
      const type = typeof value;
      const isNull = value === null;
      const isArray = Array.isArray(value);

      // 문제가 될 수 있는 필드 체크
      if (key === 'estimatedHours' || key === 'actualHours') {
        if (value !== null && value !== undefined) {
          if (typeof value !== 'number') {
            problems.push(`❌ ${key}: type is ${type}, should be number`);
            console.error(`❌ ${key}: ${JSON.stringify(value)} (type: ${type}, expected: number)`);
          } else if (value < 0) {
            problems.push(`❌ ${key}: negative value ${value}`);
            console.error(`❌ ${key}: ${value} (negative, expected: >= 0)`);
          } else {
            console.log(`✓ ${key}: ${value} (number, valid)`);
          }
        } else {
          console.log(`✓ ${key}: ${value} (null/undefined, allowed)`);
        }
      } else if (key === 'subtasks' || key === 'dependencies' || key === 'tags') {
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            problems.push(`❌ ${key}: type is ${type}, should be array`);
            console.error(`❌ ${key}: type is ${type}, should be array`);
          } else if (!value.every(item => typeof item === 'string')) {
            problems.push(`❌ ${key}: contains non-string items`);
            console.error(`❌ ${key}: contains non-string items`, value);
          } else {
            console.log(`✓ ${key}: [${value.length} strings] (valid)`);
          }
        } else {
          console.log(`✓ ${key}: ${value} (null/undefined, allowed)`);
        }
      } else if (key === 'attachments') {
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            problems.push(`❌ ${key}: type is ${type}, should be array`);
            console.error(`❌ ${key}: type is ${type}, should be array`);
          } else {
            console.log(`✓ ${key}: [${value.length} items] (array, valid)`);
          }
        } else {
          console.log(`✓ ${key}: ${value} (null/undefined, allowed)`);
        }
      } else if (key === 'recurring') {
        if (value !== null && value !== undefined) {
          if (typeof value !== 'object') {
            problems.push(`❌ ${key}: type is ${type}, should be object`);
            console.error(`❌ ${key}: type is ${type}, should be object`);
          } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(value.pattern)) {
            problems.push(`❌ ${key}.pattern: invalid value ${value.pattern}`);
            console.error(`❌ ${key}.pattern: ${value.pattern} (invalid, expected: daily/weekly/monthly/yearly)`);
          } else {
            console.log(`✓ ${key}: {pattern: ${value.pattern}} (valid)`);
          }
        } else {
          console.log(`✓ ${key}: ${value} (null/undefined, allowed)`);
        }
      } else {
        // 기타 필드
        console.log(`  ${key}: ${type}${isNull ? ' (null)' : ''}${isArray ? ' (array)' : ''}`);
      }
    });

    console.log('\n=== Simulating BaseService.update ===');

    // 3. BaseService.update 시뮬레이션
    const getDeviceId = () => {
      const storedId = localStorage.getItem('weave_device_id');
      if (storedId) return storedId;
      const newId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('weave_device_id', newId);
      return newId;
    };

    const updatedEntity = {
      ...task,
      ...{ dueDate: new Date().toISOString() },
      id: task.id,
      createdAt: task.createdAt,
      updatedAt: new Date().toISOString(),
      device_id: getDeviceId()
    };

    console.log('Merged entity (as BaseService would create):', updatedEntity);

    // 4. 검증 실행
    console.log('\n=== Running isTask Validation ===');

    const validationErrors = [];

    // Required fields
    if (!updatedEntity.id || typeof updatedEntity.id !== 'string') {
      validationErrors.push(`Invalid id: ${updatedEntity.id}`);
    }
    if (!updatedEntity.userId || typeof updatedEntity.userId !== 'string') {
      validationErrors.push(`Invalid userId: ${updatedEntity.userId}`);
    }
    if (!updatedEntity.title || typeof updatedEntity.title !== 'string') {
      validationErrors.push(`Invalid title: ${updatedEntity.title}`);
    }
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(updatedEntity.status)) {
      validationErrors.push(`Invalid status: ${updatedEntity.status}`);
    }
    if (!['low', 'medium', 'high', 'urgent'].includes(updatedEntity.priority)) {
      validationErrors.push(`Invalid priority: ${updatedEntity.priority}`);
    }

    // Optional number fields
    if (updatedEntity.estimatedHours !== undefined && updatedEntity.estimatedHours !== null) {
      if (typeof updatedEntity.estimatedHours !== 'number' || updatedEntity.estimatedHours < 0) {
        validationErrors.push(`Invalid estimatedHours: ${updatedEntity.estimatedHours} (type: ${typeof updatedEntity.estimatedHours})`);
      }
    }
    if (updatedEntity.actualHours !== undefined && updatedEntity.actualHours !== null) {
      if (typeof updatedEntity.actualHours !== 'number' || updatedEntity.actualHours < 0) {
        validationErrors.push(`Invalid actualHours: ${updatedEntity.actualHours} (type: ${typeof updatedEntity.actualHours})`);
      }
    }

    // Optional array fields
    if (updatedEntity.subtasks !== undefined && updatedEntity.subtasks !== null) {
      if (!Array.isArray(updatedEntity.subtasks)) {
        validationErrors.push(`Invalid subtasks: not an array`);
      } else if (!updatedEntity.subtasks.every(item => typeof item === 'string')) {
        validationErrors.push(`Invalid subtasks: not all items are strings`);
      }
    }
    if (updatedEntity.dependencies !== undefined && updatedEntity.dependencies !== null) {
      if (!Array.isArray(updatedEntity.dependencies)) {
        validationErrors.push(`Invalid dependencies: not an array`);
      } else if (!updatedEntity.dependencies.every(item => typeof item === 'string')) {
        validationErrors.push(`Invalid dependencies: not all items are strings`);
      }
    }
    if (updatedEntity.tags !== undefined && updatedEntity.tags !== null) {
      if (!Array.isArray(updatedEntity.tags)) {
        validationErrors.push(`Invalid tags: not an array`);
      } else if (!updatedEntity.tags.every(item => typeof item === 'string')) {
        validationErrors.push(`Invalid tags: not all items are strings`);
      }
    }

    // attachments
    if (updatedEntity.attachments !== undefined && updatedEntity.attachments !== null) {
      if (!Array.isArray(updatedEntity.attachments)) {
        validationErrors.push(`Invalid attachments: not an array`);
      }
    }

    // recurring
    if (updatedEntity.recurring !== undefined && updatedEntity.recurring !== null) {
      if (typeof updatedEntity.recurring !== 'object') {
        validationErrors.push(`Invalid recurring: not an object`);
      } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(updatedEntity.recurring.pattern)) {
        validationErrors.push(`Invalid recurring.pattern: ${updatedEntity.recurring.pattern}`);
      }
    }

    console.log('\n=== FINAL RESULT ===\n');

    if (problems.length === 0 && validationErrors.length === 0) {
      console.log('✅✅✅ ALL CHECKS PASSED! ✅✅✅');
      console.log('드래그 액션이 정상적으로 작동해야 합니다.');
    } else {
      console.error('❌❌❌ VALIDATION FAILED ❌❌❌\n');

      if (problems.length > 0) {
        console.error('Field Type Problems:');
        problems.forEach(p => console.error('  ' + p));
        console.log('');
      }

      if (validationErrors.length > 0) {
        console.error('Validation Errors:');
        validationErrors.forEach(e => console.error('  ' + e));
        console.log('');
      }

      console.log('💡 다음 필드들을 수정해야 합니다:');
      const fieldsToFix = [...new Set([...problems, ...validationErrors].map(msg => {
        const match = msg.match(/^❌?\s*(\w+)/);
        return match ? match[1] : null;
      }).filter(Boolean))];
      console.log('   ' + fieldsToFix.join(', '));
    }
  }
}

console.log('\n=== End of Diagnostic ===');
