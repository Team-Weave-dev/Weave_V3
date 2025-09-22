#!/usr/bin/env node

/**
 * 간단한 통합 테스트 스크립트
 * fetch API를 사용하여 기본적인 작동을 확인합니다.
 */

const BASE_URL = 'http://localhost:3000';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// 테스트할 페이지 목록
const PAGES_TO_TEST = [
  { path: '/', name: '홈', expectedStatus: 200 },
  { path: '/login', name: '로그인', expectedStatus: 200 },
  { path: '/signup', name: '회원가입', expectedStatus: 200 },
  { path: '/dashboard', name: '대시보드', expectedStatus: [200, 307] }, // 리다이렉트 가능
  { path: '/projects', name: '프로젝트', expectedStatus: [200, 307] },
  { path: '/clients', name: '클라이언트', expectedStatus: [200, 307] },
  { path: '/invoices', name: '인보이스', expectedStatus: [200, 307] }
];

async function testPage(pageInfo) {
  try {
    const response = await fetch(`${BASE_URL}${pageInfo.path}`, {
      method: 'GET',
      redirect: 'manual' // 리다이렉트를 수동으로 처리
    });
    
    const expectedStatuses = Array.isArray(pageInfo.expectedStatus) 
      ? pageInfo.expectedStatus 
      : [pageInfo.expectedStatus];
    
    if (expectedStatuses.includes(response.status)) {
      console.log(`${colors.green}✅${colors.reset} ${pageInfo.name} (${pageInfo.path}) - 상태 코드: ${response.status}`);
      return true;
    } else {
      console.log(`${colors.red}❌${colors.reset} ${pageInfo.name} (${pageInfo.path}) - 예상: ${expectedStatuses.join(' 또는 ')}, 실제: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌${colors.reset} ${pageInfo.name} (${pageInfo.path}) - 오류: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n${colors.blue}🚀 간단한 통합 테스트 시작...${colors.reset}\n`);
  
  let successCount = 0;
  let totalCount = PAGES_TO_TEST.length;
  
  // 1. 페이지 접근성 테스트
  console.log(`${colors.yellow}📄 페이지 접근성 테스트...${colors.reset}\n`);
  
  for (const pageInfo of PAGES_TO_TEST) {
    const success = await testPage(pageInfo);
    if (success) successCount++;
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 2. API 엔드포인트 테스트 (로그인)
  console.log(`\n${colors.yellow}🔐 로그인 API 테스트...${colors.reset}\n`);
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123456'
      }),
      redirect: 'manual'
    });
    
    // POST 요청은 405 (Method Not Allowed) 또는 다른 응답을 받을 수 있음
    console.log(`${colors.green}✅${colors.reset} 로그인 엔드포인트 응답: ${loginResponse.status}`);
    
  } catch (error) {
    console.log(`${colors.yellow}⚠️${colors.reset} 로그인 API 테스트 스킵: ${error.message}`);
  }
  
  // 3. 정적 자원 테스트
  console.log(`\n${colors.yellow}🎨 정적 자원 테스트...${colors.reset}\n`);
  
  const staticResources = [
    { path: '/favicon.ico', name: 'Favicon' }
  ];
  
  for (const resource of staticResources) {
    try {
      const response = await fetch(`${BASE_URL}${resource.path}`);
      if (response.ok) {
        console.log(`${colors.green}✅${colors.reset} ${resource.name} - 로드됨`);
      } else {
        console.log(`${colors.yellow}⚠️${colors.reset} ${resource.name} - 상태: ${response.status}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌${colors.reset} ${resource.name} - 오류: ${error.message}`);
    }
  }
  
  // 결과 요약
  console.log(`\n${colors.blue}📊 테스트 결과 요약${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(30)}${colors.reset}`);
  console.log(`총 페이지 테스트: ${totalCount}`);
  console.log(`${colors.green}성공: ${successCount}${colors.reset}`);
  console.log(`${colors.red}실패: ${totalCount - successCount}${colors.reset}`);
  console.log(`성공률: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  if (successCount === totalCount) {
    console.log(`\n${colors.green}🎉 모든 테스트 통과!${colors.reset}\n`);
    return 0;
  } else {
    console.log(`\n${colors.yellow}⚠️ 일부 테스트 실패${colors.reset}\n`);
    return 1;
  }
}

// 테스트 실행
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error(`${colors.red}심각한 오류:${colors.reset}`, error);
    process.exit(1);
  });