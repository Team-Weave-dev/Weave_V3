// Tax Schedules 테이블 확인 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gajxwhhzxqnbwmvpppcu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhanh3aGh6eHFuYndtdnBwcGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTYwMDEsImV4cCI6MjA3NTM5MjAwMX0.byUzjyrf2GtL4i6cY0f7Qba6V3qdkR7OiP3LcVgEc_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTaxSchedules() {
  console.log('Checking tax_schedules table...\n');

  try {
    const { data, error, count } = await supabase
      .from('tax_schedules')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Code:', error.code);
      console.error('\n테이블이 존재하지 않거나 권한이 없습니다.');
      console.error('\n🔧 해결 방법:');
      console.error('1. Supabase Studio 접속: https://app.supabase.com/project/gajxwhhzxqnbwmvpppcu/sql');
      console.error('2. supabase/migrations/20251012_01_tax_schedules.sql 파일의 전체 내용을 복사');
      console.error('3. SQL Editor에 붙여넣고 실행');
      return;
    }

    console.log('✅ tax_schedules 테이블 존재!');
    console.log(`📊 총 레코드 수: ${count}개\n`);

    if (data && data.length > 0) {
      console.log('📅 샘플 데이터 (최근 5개):');
      data.slice(0, 5).forEach((schedule, index) => {
        console.log(`\n${index + 1}. ${schedule.title}`);
        console.log(`   날짜: ${schedule.tax_date}`);
        console.log(`   카테고리: ${schedule.category}`);
        console.log(`   타입: ${schedule.type}`);
      });
    } else {
      console.log('⚠️ 테이블은 존재하지만 데이터가 없습니다.');
      console.log('\n🔧 시드 데이터 삽입 필요:');
      console.log('supabase/migrations/20251012_01_tax_schedules.sql 파일의');
      console.log('INSERT 구문들을 Supabase Studio에서 실행하세요.');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkTaxSchedules();
