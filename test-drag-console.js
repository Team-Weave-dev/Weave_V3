// 이 스크립트를 브라우저 콘솔에 붙여넣기하여 실행

// 1. LocalStorage에서 tasks 가져오기
const tasksData = localStorage.getItem('weave_v2_tasks');
if (!tasksData) {
  console.error('No tasks found in localStorage');
} else {
  const tasks = JSON.parse(tasksData);
  console.log('Total tasks:', tasks.length);

  if (tasks.length > 0) {
    const task = tasks[0];
    console.log('\n=== First Task ===');
    console.log(JSON.stringify(task, null, 2));

    // 2. 각 필드 타입 확인
    console.log('\n=== Field Analysis ===');
    Object.keys(task).forEach(key => {
      const value = task[key];
      const type = typeof value;
      const isNull = value === null;
      const isArray = Array.isArray(value);

      console.log(`${key}:`);
      console.log(`  - type: ${type}`);
      console.log(`  - null: ${isNull}`);
      console.log(`  - array: ${isArray}`);
      console.log(`  - value:`, value);
    });

    // 3. BaseService.update() 시뮬레이션
    console.log('\n=== Simulating BaseService.update ===');

    // device_id 생성 함수 시뮬레이션
    const getDeviceId = () => {
      const storedId = localStorage.getItem('weave_device_id');
      if (storedId) return storedId;

      const newId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('weave_device_id', newId);
      return newId;
    };

    const updatedEntity = {
      ...task,
      ...{ dueDate: new Date().toISOString() },  // updates from CalendarWidget
      id: task.id,  // preserve ID
      createdAt: task.createdAt,  // preserve creation timestamp
      updatedAt: new Date().toISOString(),  // new timestamp
      device_id: getDeviceId()  // add device_id
    };

    console.log('\nUpdated entity:');
    console.log(JSON.stringify(updatedEntity, null, 2));

    // 4. isTask 검증 함수 실행
    console.log('\n=== Running isTask validation ===');

    // isTask 함수의 간단한 버전
    const validateTask = (t) => {
      const errors = [];

      // Required fields
      if (!t.id || typeof t.id !== 'string') errors.push(`Invalid id: ${t.id}`);
      if (!t.userId || typeof t.userId !== 'string') errors.push(`Invalid userId: ${t.userId}`);
      if (!t.title || typeof t.title !== 'string') errors.push(`Invalid title: ${t.title}`);
      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(t.status)) errors.push(`Invalid status: ${t.status}`);
      if (!['low', 'medium', 'high', 'urgent'].includes(t.priority)) errors.push(`Invalid priority: ${t.priority}`);
      if (!t.createdAt || typeof t.createdAt !== 'string') errors.push(`Invalid createdAt: ${t.createdAt}`);
      if (!t.updatedAt || typeof t.updatedAt !== 'string') errors.push(`Invalid updatedAt: ${t.updatedAt}`);

      // Optional string fields - null과 undefined는 허용
      const optionalStringFields = ['projectId', 'description', 'assigneeId', 'parentTaskId', 'dueDate', 'startDate', 'completedAt', 'updated_by', 'device_id', 'sectionId'];

      for (const field of optionalStringFields) {
        if (t[field] !== undefined && t[field] !== null && typeof t[field] !== 'string') {
          errors.push(`Invalid ${field}: ${t[field]} (type: ${typeof t[field]})`);
        }
      }

      // Optional number fields
      const optionalNumberFields = ['estimatedHours', 'actualHours'];
      for (const field of optionalNumberFields) {
        if (t[field] !== undefined && t[field] !== null) {
          if (typeof t[field] !== 'number' || t[field] < 0) {
            errors.push(`Invalid ${field}: ${t[field]} (type: ${typeof t[field]})`);
          }
        }
      }

      // Optional array fields
      const optionalArrayFields = ['subtasks', 'dependencies', 'tags'];
      for (const field of optionalArrayFields) {
        if (t[field] !== undefined && t[field] !== null) {
          if (!Array.isArray(t[field])) {
            errors.push(`Invalid ${field}: not an array`);
          } else if (!t[field].every(item => typeof item === 'string')) {
            errors.push(`Invalid ${field}: not all items are strings`);
          }
        }
      }

      // attachments array
      if (t.attachments !== undefined && t.attachments !== null) {
        if (!Array.isArray(t.attachments)) {
          errors.push(`Invalid attachments: not an array`);
        }
      }

      // recurring object
      if (t.recurring !== undefined && t.recurring !== null) {
        if (typeof t.recurring !== 'object') {
          errors.push(`Invalid recurring: not an object`);
        } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(t.recurring.pattern)) {
          errors.push(`Invalid recurring.pattern: ${t.recurring.pattern}`);
        }
      }

      return errors;
    };

    const errors = validateTask(updatedEntity);

    if (errors.length === 0) {
      console.log('✅ Validation PASSED!');
    } else {
      console.log('❌ Validation FAILED:');
      errors.forEach(err => console.log('  -', err));
    }

    // 5. 특정 필드 검사
    console.log('\n=== Specific Field Check ===');
    console.log('device_id:', updatedEntity.device_id);
    console.log('device_id type:', typeof updatedEntity.device_id);
    console.log('sectionId:', updatedEntity.sectionId);
    console.log('sectionId type:', typeof updatedEntity.sectionId);
  }
}

console.log('\n브라우저의 개발자 도구 콘솔에서 이 스크립트를 실행하세요.');