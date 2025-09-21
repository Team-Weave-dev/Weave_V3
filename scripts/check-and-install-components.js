#!/usr/bin/env node

/**
 * 자동 컴포넌트 검사 및 설치 스크립트
 * 누락된 shadcn/ui 컴포넌트를 자동으로 감지하고 설치합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// shadcn/ui 컴포넌트 목록 (필수 컴포넌트)
const REQUIRED_COMPONENTS = [
  'accordion',
  'alert',
  'avatar',
  'badge',
  'button',
  'calendar',
  'card',
  'carousel',
  'chart',
  'checkbox',
  'dialog',
  'dropdown-menu',
  'form',
  'input',
  'label',
  'navigation-menu',
  'progress',
  'select',
  'sheet',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toast',
  'tooltip'
];

// 커스텀 컴포넌트 (shadcn으로 설치할 수 없는 것들)
const CUSTOM_COMPONENTS = [
  'bar-chart',
  'line-chart',
  'pie-chart',
  'footer',
  'hero-section',
  'loading-button',
  'toaster',
  'palette-switcher',
  'view-mode-switch'
];

// UI 컴포넌트 디렉토리 경로
const UI_DIR = path.join(__dirname, '..', 'src', 'components', 'ui');

// 컴포넌트 존재 여부 확인
function checkComponent(componentName) {
  const componentPath = path.join(UI_DIR, `${componentName}.tsx`);
  return fs.existsSync(componentPath);
}

// shadcn 컴포넌트 설치
function installComponent(componentName) {
  console.log(`📦 Installing ${componentName}...`);
  try {
    execSync(`npx shadcn@latest add ${componentName}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${componentName} installed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${componentName}:`, error.message);
    return false;
  }
}

// brand.ts 업데이트 (텍스트 중앙화)
function updateBrandTs(componentName) {
  const brandPath = path.join(__dirname, '..', 'src', 'config', 'brand.ts');
  console.log(`📝 Adding ${componentName} texts to brand.ts...`);

  // 실제 구현 시에는 파일을 읽고 적절한 위치에 텍스트 추가
  // 여기서는 간단한 로그만 출력
  console.log(`⚠️  Please manually add ${componentName} texts to brand.ts`);
}

// constants.ts 업데이트 (상수 중앙화)
function updateConstantsTs(componentName) {
  const constantsPath = path.join(__dirname, '..', 'src', 'config', 'constants.ts');
  console.log(`📝 Adding ${componentName} constants to constants.ts...`);

  // 실제 구현 시에는 파일을 읽고 적절한 위치에 상수 추가
  console.log(`⚠️  Please manually add ${componentName} constants to constants.ts`);
}

// claude.md 문서 업데이트
function updateDocumentation(componentName) {
  console.log(`📚 Updating documentation for ${componentName}...`);

  const claudePath = path.join(__dirname, '..', 'src', 'components', 'ui', 'claude.md');
  if (fs.existsSync(claudePath)) {
    // 실제 구현 시에는 문서를 읽고 컴포넌트 정보 추가
    console.log(`⚠️  Please manually update documentation for ${componentName}`);
  }
}

// 메인 실행 함수
function main() {
  console.log('🔍 Checking for missing components...\n');

  const missingComponents = [];
  const customMissing = [];

  // 필수 컴포넌트 확인
  for (const component of REQUIRED_COMPONENTS) {
    if (!checkComponent(component)) {
      missingComponents.push(component);
    }
  }

  // 커스텀 컴포넌트 확인
  for (const component of CUSTOM_COMPONENTS) {
    if (!checkComponent(component)) {
      customMissing.push(component);
    }
  }

  // 결과 출력
  if (missingComponents.length === 0 && customMissing.length === 0) {
    console.log('✅ All components are present!\n');
    return;
  }

  // shadcn 컴포넌트 자동 설치
  if (missingComponents.length > 0) {
    console.log(`📋 Missing shadcn/ui components: ${missingComponents.join(', ')}\n`);
    console.log('🚀 Starting automatic installation...\n');

    for (const component of missingComponents) {
      const success = installComponent(component);
      if (success) {
        updateBrandTs(component);
        updateConstantsTs(component);
        updateDocumentation(component);
      }
    }
  }

  // 커스텀 컴포넌트 알림
  if (customMissing.length > 0) {
    console.log('\n⚠️  Missing custom components (manual creation required):');
    customMissing.forEach(comp => {
      console.log(`  - ${comp}`);
    });
    console.log('\nPlease create these components following the project patterns:');
    console.log('  1. Use Card structure from src/app/components/page.tsx');
    console.log('  2. Apply centralized text system (brand.ts)');
    console.log('  3. Follow grid layout patterns');
    console.log('  4. Ensure TypeScript type safety');
  }

  console.log('\n✨ Component check completed!');

  // TypeScript 컴파일 확인
  console.log('\n🔧 Running TypeScript check...');
  try {
    execSync('npm run type-check', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ TypeScript compilation successful!');
  } catch (error) {
    console.error('❌ TypeScript compilation failed. Please fix errors.');
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { checkComponent, installComponent };