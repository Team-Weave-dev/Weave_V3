/**
 * Clear Activity Logs Script
 *
 * localStorage에 저장된 활동 로그를 초기화합니다.
 * 브라우저 개발자 콘솔에서 실행하거나, 애플리케이션에 임시로 추가하여 사용할 수 있습니다.
 */

console.log('🧹 활동 로그 초기화 시작...');

// 활동 로그 키
const ACTIVITY_LOGS_KEY = 'weave:activity_logs';

try {
  // 기존 로그 확인
  const existingLogs = localStorage.getItem(ACTIVITY_LOGS_KEY);

  if (existingLogs) {
    const logs = JSON.parse(existingLogs);
    console.log(`📊 기존 로그 수: ${logs.length}개`);

    // 로그 초기화
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify([]));
    console.log('✅ 활동 로그가 초기화되었습니다.');
  } else {
    console.log('ℹ️ 저장된 활동 로그가 없습니다.');
  }

  console.log('\n🔄 페이지를 새로고침하여 변경사항을 확인하세요.');
} catch (error) {
  console.error('❌ 오류 발생:', error);
}
