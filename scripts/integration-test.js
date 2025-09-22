#!/usr/bin/env node

/**
 * 통합 테스트 스크립트
 * 테스트 계정으로 로그인하고 모든 페이지를 방문하여 기본적인 작동을 확인합니다.
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test123456';

// 테스트할 페이지 목록
const PAGES_TO_TEST = [
  { path: '/', name: '홈' },
  { path: '/login', name: '로그인' },
  { path: '/signup', name: '회원가입' },
  { path: '/dashboard', name: '대시보드', requiresAuth: true },
  { path: '/projects', name: '프로젝트', requiresAuth: true },
  { path: '/clients', name: '클라이언트', requiresAuth: true },
  { path: '/invoices', name: '인보이스', requiresAuth: true }
];

async function runTests() {
  console.log('🚀 통합 테스트 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 뷰포트 설정
    await page.setViewport({ width: 1280, height: 800 });
    
    // 1. 로그인 테스트
    console.log('📝 로그인 테스트...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    
    // 이메일과 비밀번호 입력
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트 대기
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ 로그인 성공 - 대시보드로 이동함\n');
    } else {
      console.log(`❌ 로그인 실패 - 현재 URL: ${currentUrl}\n`);
    }
    
    // 2. 모든 페이지 방문 테스트
    console.log('📄 페이지 네비게이션 테스트...\n');
    
    for (const pageInfo of PAGES_TO_TEST) {
      if (pageInfo.requiresAuth && !currentUrl.includes('/dashboard')) {
        console.log(`⏭️ ${pageInfo.name} - 인증 필요하지만 로그인 실패로 건너뜀`);
        continue;
      }
      
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, { 
          waitUntil: 'networkidle0',
          timeout: 10000 
        });
        
        // 페이지 제목 확인
        const title = await page.title();
        
        // 에러 체크
        const hasError = await page.$('.error, .error-message, [data-error]');
        
        if (hasError) {
          console.log(`⚠️ ${pageInfo.name} (${pageInfo.path}) - 페이지 로드됨 but 에러 발견`);
        } else {
          console.log(`✅ ${pageInfo.name} (${pageInfo.path}) - 정상 로드됨`);
        }
        
        // 스크린샷 저장 (디버깅용)
        await page.screenshot({ 
          path: `test-screenshots/${pageInfo.name.replace(/\//g, '-')}.png`,
          fullPage: false 
        });
        
      } catch (error) {
        console.log(`❌ ${pageInfo.name} (${pageInfo.path}) - 로드 실패: ${error.message}`);
      }
    }
    
    // 3. 반응형 테스트
    console.log('\n📱 반응형 디자인 테스트...\n');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await page.screenshot({ 
        path: `test-screenshots/responsive-${viewport.name.toLowerCase()}.png`
      });
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - 스크린샷 저장됨`);
    }
    
    // 4. 네비게이션 메뉴 테스트
    console.log('\n🧭 네비게이션 메뉴 테스트...\n');
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    
    // 사이드바 링크 확인
    const navLinks = await page.$$eval('nav a', links => 
      links.map(link => ({ 
        text: link.textContent?.trim(), 
        href: link.href 
      }))
    );
    
    console.log('발견된 네비게이션 링크:');
    navLinks.forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });
    
    console.log('\n🎉 통합 테스트 완료!\n');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 스크린샷 디렉토리 생성
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '..', 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 테스트 실행
runTests().catch(console.error);