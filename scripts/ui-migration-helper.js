#!/usr/bin/env node

/**
 * UI 마이그레이션 헬퍼 스크립트
 * h2 브랜치의 UI 컴포넌트를 중앙화 시스템으로 리팩토링하는 것을 지원합니다.
 */

const fs = require('fs');
const path = require('path');

// 하드코딩된 텍스트 패턴 감지
const HARDCODED_PATTERNS = [
  /["'][가-힣]+["']/g,              // 한글 텍스트
  />[^<]*[가-힣]+[^<]*</g,         // JSX 내부 한글
  /placeholder=["'][^"']+["']/g,   // placeholder 속성
  /aria-label=["'][^"']+["']/g,    // aria-label 속성
  /title=["'][^"']+["']/g,         // title 속성
];

// 하드코딩된 스타일 패턴 감지
const HARDCODED_STYLES = [
  /className=["'][^"']*px-\d+[^"']*["']/g,  // padding 하드코딩
  /className=["'][^"']*py-\d+[^"']*["']/g,
  /className=["'][^"']*text-\d+xl[^"']*["']/g, // 텍스트 크기
  /className=["'][^"']*bg-[^"'\s]+["']/g,     // 배경색
  /style={{[^}]+}}/g,                          // 인라인 스타일
];

// UI 컴포넌트 매핑 규칙
const COMPONENT_MAPPING = {
  '<button': '→ Button component',
  '<input': '→ Input component',
  '<select': '→ Select component',
  '<textarea': '→ Textarea component',
  '<table': '→ Table component',
  '<form': '→ Form component',
  '<dialog': '→ Dialog component',
  '<nav': '→ NavigationMenu component',
};

/**
 * 파일 분석 및 리팩토링 필요 항목 탐지
 */
function analyzeFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  // 하드코딩된 텍스트 찾기
  HARDCODED_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'hardcoded-text',
        count: matches.length,
        samples: matches.slice(0, 3),
      });
    }
  });

  // 하드코딩된 스타일 찾기
  HARDCODED_STYLES.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'hardcoded-style',
        count: matches.length,
        samples: matches.slice(0, 3),
      });
    }
  });

  // 네이티브 HTML 요소 사용 찾기
  Object.keys(COMPONENT_MAPPING).forEach(tag => {
    if (content.includes(tag)) {
      issues.push({
        type: 'native-element',
        element: tag,
        suggestion: COMPONENT_MAPPING[tag],
      });
    }
  });

  return issues.length > 0 ? { file: filePath, issues } : null;
}

/**
 * 디렉토리 재귀 스캔
 */
function scanDirectory(dir, results = []) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      scanDirectory(fullPath, results);
    } else if (stat.isFile()) {
      const analysis = analyzeFile(fullPath);
      if (analysis) {
        results.push(analysis);
      }
    }
  });

  return results;
}

/**
 * 리포트 생성
 */
function generateReport(results) {
  console.log('\n📊 UI 마이그레이션 분석 리포트');
  console.log('=' .repeat(60));

  let totalIssues = 0;
  const summary = {
    'hardcoded-text': 0,
    'hardcoded-style': 0,
    'native-element': 0,
  };

  results.forEach(({ file, issues }) => {
    console.log(`\n📁 ${file}`);
    issues.forEach(issue => {
      totalIssues++;
      summary[issue.type]++;

      switch (issue.type) {
        case 'hardcoded-text':
          console.log(`  ⚠️  하드코딩된 텍스트 (${issue.count}개)`);
          issue.samples.forEach(sample => {
            console.log(`      예시: ${sample.substring(0, 50)}...`);
          });
          console.log(`      → brand.ts로 이동 필요`);
          break;

        case 'hardcoded-style':
          console.log(`  ⚠️  하드코딩된 스타일 (${issue.count}개)`);
          issue.samples.forEach(sample => {
            console.log(`      예시: ${sample.substring(0, 50)}...`);
          });
          console.log(`      → constants.ts 또는 cn() 유틸리티 사용`);
          break;

        case 'native-element':
          console.log(`  ⚠️  네이티브 HTML 요소: ${issue.element}`);
          console.log(`      ${issue.suggestion}`);
          break;
      }
    });
  });

  console.log('\n' + '=' .repeat(60));
  console.log('📈 요약:');
  console.log(`  총 파일 수: ${results.length}`);
  console.log(`  총 이슈 수: ${totalIssues}`);
  console.log(`  하드코딩된 텍스트: ${summary['hardcoded-text']}건`);
  console.log(`  하드코딩된 스타일: ${summary['hardcoded-style']}건`);
  console.log(`  네이티브 요소: ${summary['native-element']}건`);
  console.log('=' .repeat(60));

  return summary;
}

/**
 * 마이그레이션 가이드 생성
 */
function generateMigrationGuide(summary) {
  const guidePath = path.join(__dirname, '..', 'migration-guide.md');

  let content = `# UI 마이그레이션 가이드

## 📊 현재 상태
- 하드코딩된 텍스트: ${summary['hardcoded-text']}건
- 하드코딩된 스타일: ${summary['hardcoded-style']}건
- 네이티브 HTML 요소: ${summary['native-element']}건

## 🔧 마이그레이션 체크리스트

### 1. 텍스트 중앙화
- [ ] brand.ts에 새로운 텍스트 섹션 추가
- [ ] 모든 하드코딩된 텍스트를 brand.ts로 이동
- [ ] getXXXText 헬퍼 함수 생성

### 2. 스타일 중앙화
- [ ] constants.ts에 새로운 스타일 상수 추가
- [ ] 하드코딩된 Tailwind 클래스를 상수로 변환
- [ ] cn() 유틸리티 함수 적용

### 3. 컴포넌트 교체
- [ ] 네이티브 HTML 요소를 shadcn/ui 컴포넌트로 교체
- [ ] 누락된 컴포넌트 설치 (npm run check:components)
- [ ] 컴포넌트 props 타입 정의

### 4. 검증
- [ ] TypeScript 컴파일 확인 (npm run type-check)
- [ ] 빌드 테스트 (npm run build)
- [ ] 기능 동작 확인 (npm run dev)

## 📝 다음 단계
1. 이 가이드를 참고하여 각 파일을 수동으로 리팩토링
2. 각 단계 완료 후 체크리스트 업데이트
3. 모든 작업 완료 후 PR 생성
`;

  fs.writeFileSync(guidePath, content);
  console.log(`\n✅ 마이그레이션 가이드가 생성되었습니다: ${guidePath}\n`);
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || path.join(__dirname, '..', 'src');

  console.log(`🔍 스캔 시작: ${targetDir}\n`);

  try {
    const results = scanDirectory(targetDir);

    if (results.length === 0) {
      console.log('✨ 리팩토링이 필요한 파일이 없습니다!');
      return;
    }

    const summary = generateReport(results);
    generateMigrationGuide(summary);

    console.log(`💡 팁: 다음 명령어를 실행하여 컴포넌트 설치를 확인하세요:`);
    console.log(`   npm run check:components\n`);

  } catch (error) {
    console.error('❌ 스캔 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, scanDirectory };