/**
 * Supabase 데이터베이스에서 todo 관련 데이터를 확인하는 스크립트
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname 설정 (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 직접 읽기
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          const value = values.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error) {
    console.error('⚠️ .env.local 파일을 읽을 수 없습니다:', error.message);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 사용자 ID (콘솔 로그에서 확인한 값)
const userId = '19c1cd9e-1e83-41b8-a1e5-b72c5be15e8f';

async function checkTodoData() {
  console.log('🔍 Todo 데이터 확인 시작...\n');

  // 1. Tasks 조회
  console.log('📋 Tasks 테이블 확인:');
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, tags, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (tasksError) {
    console.error('❌ Tasks 조회 실패:', tasksError);
  } else {
    console.log(`  총 ${tasks?.length || 0}개 task 발견:`);
    tasks?.forEach(task => {
      console.log(`  - ID: ${task.id}`);
      console.log(`    Title: ${task.title}`);
      console.log(`    Tags: ${JSON.stringify(task.tags)}`);

      // tags에서 sectionId 추출
      const sectionTag = task.tags?.find(tag => tag.startsWith('section:'));
      if (sectionTag) {
        const sectionId = sectionTag.substring(8);
        console.log(`    → Section ID: ${sectionId}`);
      }
      console.log('');
    });
  }

  // 2. TodoSections 조회
  console.log('\n📂 TodoSections 테이블 확인:');
  const { data: sections, error: sectionsError } = await supabase
    .from('todo_sections')
    .select('id, name, user_id, order_index, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (sectionsError) {
    console.error('❌ TodoSections 조회 실패:', sectionsError);
  } else {
    console.log(`  총 ${sections?.length || 0}개 section 발견:`);
    sections?.forEach(section => {
      console.log(`  - ID: ${section.id}`);
      console.log(`    Name: ${section.name}`);
      console.log(`    Order: ${section.order_index}`);
      console.log('');
    });
  }

  // 3. 매칭 확인
  console.log('\n🔗 Task-Section 매칭 확인:');
  if (tasks && tasks.length > 0 && sections && sections.length > 0) {
    const sectionIds = new Set(sections.map(s => s.id));

    tasks.forEach(task => {
      const sectionTag = task.tags?.find(tag => tag.startsWith('section:'));
      if (sectionTag) {
        const taskSectionId = sectionTag.substring(8);
        const isMatched = sectionIds.has(taskSectionId);

        console.log(`  Task "${task.title}":`);
        console.log(`    참조 Section ID: ${taskSectionId}`);
        console.log(`    매칭 상태: ${isMatched ? '✅ 일치' : '❌ 불일치'}`);

        if (!isMatched) {
          console.log(`    💡 이 task가 참조하는 section이 존재하지 않습니다!`);
        }
        console.log('');
      }
    });
  }

  console.log('\n✅ 데이터 확인 완료');
}

checkTodoData().catch(console.error);
