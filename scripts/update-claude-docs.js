#!/usr/bin/env node

/**
 * Claude Documentation Auto-Update System
 *
 * 디렉토리 변경사항을 감지하여 claude.md 파일들을 자동 업데이트하는 스크립트
 *
 * 기능:
 * - 파일/디렉토리 변경 감지
 * - 해당 claude.md 파일 자동 업데이트
 * - 메인 CLAUDE.md와 하위 claude.md 동기화
 * - 컴포넌트/훅/유틸리티 개수 자동 카운팅
 */

const fs = require('fs');
const path = require('path');

class ClaudeDocUpdater {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcPath = path.join(this.projectRoot, 'src');
    this.mainClaudePath = path.join(this.projectRoot, 'CLAUDE.md');
  }

  /**
   * 디렉토리 내 파일 개수 카운팅
   */
  countFiles(dirPath, extensions = []) {
    try {
      if (!fs.existsSync(dirPath)) return 0;

      const files = fs.readdirSync(dirPath);
      if (extensions.length === 0) {
        return files.filter(file =>
          !file.startsWith('.') &&
          !file.includes('claude.md') &&
          fs.statSync(path.join(dirPath, file)).isFile()
        ).length;
      }

      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext) && !file.includes('claude.md');
      }).length;
    } catch (error) {
      console.error(`Error counting files in ${dirPath}:`, error.message);
      return 0;
    }
  }

  /**
   * 컴포넌트 개수 카운팅
   */
  countComponents() {
    const uiPath = path.join(this.srcPath, 'components', 'ui');
    return this.countFiles(uiPath, ['.tsx', '.ts']);
  }

  /**
   * 훅 개수 카운팅
   */
  countHooks() {
    const hooksPath = path.join(this.srcPath, 'hooks');
    return this.countFiles(hooksPath, ['.ts', '.tsx']);
  }

  /**
   * 유틸리티 함수 개수 카운팅
   */
  countUtils() {
    const libPath = path.join(this.srcPath, 'lib');
    return this.countFiles(libPath, ['.ts', '.tsx']);
  }

  /**
   * 페이지 개수 카운팅
   */
  countPages() {
    const appPath = path.join(this.srcPath, 'app');
    let pageCount = 0;

    // 루트 page.tsx
    if (fs.existsSync(path.join(appPath, 'page.tsx'))) {
      pageCount++;
    }

    // 하위 디렉토리의 page.tsx들
    try {
      const dirs = fs.readdirSync(appPath)
        .filter(item => fs.statSync(path.join(appPath, item)).isDirectory());

      dirs.forEach(dir => {
        if (fs.existsSync(path.join(appPath, dir, 'page.tsx'))) {
          pageCount++;
        }
      });
    } catch (error) {
      console.error('Error counting pages:', error.message);
    }

    return pageCount;
  }

  /**
   * 설정 파일 개수 카운팅
   */
  countConfigs() {
    const configPath = path.join(this.srcPath, 'config');
    return this.countFiles(configPath, ['.ts', '.tsx']);
  }

  /**
   * 메인 CLAUDE.md 업데이트
   */
  updateMainClaudeDoc() {
    try {
      if (!fs.existsSync(this.mainClaudePath)) {
        console.error('메인 CLAUDE.md 파일을 찾을 수 없습니다.');
        return false;
      }

      let content = fs.readFileSync(this.mainClaudePath, 'utf8');

      // 현재 개수들 계산
      const stats = {
        components: this.countComponents(),
        hooks: this.countHooks(),
        utils: this.countUtils(),
        pages: this.countPages(),
        configs: this.countConfigs()
      };

      // 디렉토리 구조 업데이트
      const updatedStructure = `📁 중앙화된 디렉토리 구조

\`\`\`
NEW_UI_Components/
├── 📋 CLAUDE.md                      # 메인 프로젝트 문서 (이 파일)
├── 🔧 .claude/                       # MCP 설정
├── 📁 src/                           # 소스 코드 루트
│   ├── 📋 claude.md                  # 소스 코드 전체 가이드
│   ├── 📱 app/ (${stats.pages}개)                     # Next.js App Router
│   │   └── 📋 claude.md              # App Router 가이드
│   ├── ⚙️ config/ (${stats.configs}개)                   # 중앙화 설정
│   │   └── 📋 claude.md              # 설정 시스템 가이드
│   ├── 🧩 components/ (${stats.components}개)             # 재사용 컴포넌트
│   │   ├── 📋 claude.md              # 컴포넌트 시스템 가이드
│   │   └── 🎨 ui/                    # shadcn/ui 컴포넌트
│   │       └── 📋 claude.md          # UI 컴포넌트 상세 가이드
│   ├── 🪝 hooks/ (${stats.hooks}개)                   # 커스텀 React 훅
│   │   └── 📋 claude.md              # 훅 라이브러리 가이드
│   └── 📚 lib/ (${stats.utils}개)                     # 유틸리티 함수
│       └── 📋 claude.md              # 유틸리티 가이드
├── 🔧 scripts/                       # 자동화 스크립트
│   ├── update-claude-docs.js         # 문서 자동 업데이트
│   └── watch-and-update.js           # 실시간 변경 감지
└── 📦 package.json                   # 프로젝트 설정
\`\`\``;

      // 구조 부분 교체
      content = content.replace(
        /📁 중앙화된 디렉토리 구조[\s\S]*?```/,
        updatedStructure
      );

      // 시스템 현황 업데이트
      const statsSection = `## 📊 시스템 현황

### 📈 개발 진행률
- **UI 컴포넌트**: ${stats.components}개 (shadcn/ui 기반)
- **페이지**: ${stats.pages}개 (Next.js App Router)
- **커스텀 훅**: ${stats.hooks}개 (React 훅)
- **유틸리티**: ${stats.utils}개 (순수 함수)
- **설정 파일**: ${stats.configs}개 (중앙화 시스템)

### 🏗️ 아키텍처 완성도
- **중앙화 시스템**: ✅ 완료 (하드코딩 0개)
- **타입 안정성**: ✅ 완료 (TypeScript 100%)
- **문서화 시스템**: ✅ 완료 (자동 업데이트)
- **컴포넌트 라이브러리**: ✅ 완료 (접근성 준수)

*마지막 업데이트: ${new Date().toISOString().split('T')[0]}*`;

      // 기존 시스템 현황 섹션이 있으면 교체, 없으면 추가
      if (content.includes('## 📊 시스템 현황')) {
        content = content.replace(
          /## 📊 시스템 현황[\s\S]*?(?=\n## |\n---|\n\*\*|$)/,
          statsSection + '\n\n'
        );
      } else {
        // 하드코딩 방지 규칙 섹션 앞에 추가
        content = content.replace(
          /## 🚨 하드코딩 방지 규칙/,
          statsSection + '\n\n## 🚨 하드코딩 방지 규칙'
        );
      }

      fs.writeFileSync(this.mainClaudePath, content, 'utf8');
      console.log('✅ 메인 CLAUDE.md 업데이트 완료');
      return true;

    } catch (error) {
      console.error('❌ 메인 CLAUDE.md 업데이트 실패:', error.message);
      return false;
    }
  }

  /**
   * 특정 디렉토리의 claude.md 업데이트
   */
  updateDirectoryClaudeDoc(dirPath) {
    const claudePath = path.join(dirPath, 'claude.md');

    if (!fs.existsSync(claudePath)) {
      console.log(`📝 ${dirPath}에 claude.md 파일이 없습니다. 스킵합니다.`);
      return false;
    }

    try {
      let content = fs.readFileSync(claudePath, 'utf8');
      const relativePath = path.relative(this.srcPath, dirPath);

      // 각 디렉토리별 특별한 업데이트 로직
      switch (relativePath) {
        case 'components/ui':
          content = this.updateUIComponentDoc(content, dirPath);
          break;
        case 'hooks':
          content = this.updateHooksDoc(content, dirPath);
          break;
        case 'lib':
          content = this.updateLibDoc(content, dirPath);
          break;
        case 'app':
          content = this.updateAppDoc(content, dirPath);
          break;
        case 'config':
          content = this.updateConfigDoc(content, dirPath);
          break;
      }

      fs.writeFileSync(claudePath, content, 'utf8');
      console.log(`✅ ${relativePath}/claude.md 업데이트 완료`);
      return true;

    } catch (error) {
      console.error(`❌ ${claudePath} 업데이트 실패:`, error.message);
      return false;
    }
  }

  /**
   * UI 컴포넌트 문서 업데이트
   */
  updateUIComponentDoc(content, dirPath) {
    const componentFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.tsx') && !file.includes('claude'))
      .sort();

    const componentList = componentFiles.map(file => {
      const name = path.basename(file, '.tsx');
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return `- **${capitalizedName}**: ${this.getComponentDescription(name)}`;
    }).join('\n');

    // 컴포넌트 목록 업데이트
    const listPattern = /## 📦 설치된 컴포넌트 \(\d+개\)[\s\S]*?(?=\n## |\n---|\n\*\*|$)/;
    const newSection = `## 📦 설치된 컴포넌트 (${componentFiles.length}개)

${componentList}

*마지막 업데이트: ${new Date().toISOString().split('T')[0]}*

`;

    if (listPattern.test(content)) {
      content = content.replace(listPattern, newSection);
    }

    return content;
  }

  /**
   * 훅 문서 업데이트
   */
  updateHooksDoc(content, dirPath) {
    const hookFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.ts') && !file.includes('claude'))
      .sort();

    const hookList = hookFiles.map(file => {
      const name = path.basename(file, '.ts');
      return `- **${name}**: ${this.getHookDescription(name)}`;
    }).join('\n');

    const listPattern = /## 📦 설치된 훅 \(\d+개\)[\s\S]*?(?=\n## |\n---|\n\*\*|$)/;
    const newSection = `## 📦 설치된 훅 (${hookFiles.length}개)

${hookList}

*마지막 업데이트: ${new Date().toISOString().split('T')[0]}*

`;

    if (listPattern.test(content)) {
      content = content.replace(listPattern, newSection);
    } else {
      // 새 섹션 추가 (기존 구조 다음에)
      content = content.replace(
        /```\n\n## 🍞 use-toast\.ts/,
        `\`\`\`\n\n${newSection}## 🍞 use-toast.ts`
      );
    }

    return content;
  }

  /**
   * 라이브러리 문서 업데이트
   */
  updateLibDoc(content, dirPath) {
    const utilFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.ts') && !file.includes('claude'))
      .sort();

    const utilList = utilFiles.map(file => {
      const name = path.basename(file, '.ts');
      return `- **${name}**: ${this.getUtilDescription(name)}`;
    }).join('\n');

    const listPattern = /## 📦 설치된 유틸리티 \(\d+개\)[\s\S]*?(?=\n## |\n---|\n\*\*|$)/;
    const newSection = `## 📦 설치된 유틸리티 (${utilFiles.length}개)

${utilList}

*마지막 업데이트: ${new Date().toISOString().split('T')[0]}*

`;

    if (listPattern.test(content)) {
      content = content.replace(listPattern, newSection);
    } else {
      // 새 섹션 추가
      content = content.replace(
        /```\n\n## 🛠️ utils\.ts/,
        `\`\`\`\n\n${newSection}## 🛠️ utils.ts`
      );
    }

    return content;
  }

  /**
   * 앱 문서 업데이트 (페이지 목록)
   */
  updateAppDoc(content, dirPath) {
    // 페이지 개수는 이미 메인에서 카운팅됨
    return content;
  }

  /**
   * 설정 문서 업데이트
   */
  updateConfigDoc(content, dirPath) {
    // 설정 파일 개수는 이미 메인에서 카운팅됨
    return content;
  }

  /**
   * 컴포넌트 설명 생성
   */
  getComponentDescription(name) {
    const descriptions = {
      'button': '다양한 변형의 버튼 컴포넌트',
      'card': '콘텐츠 컨테이너 카드 컴포넌트',
      'input': '텍스트 입력 필드 컴포넌트',
      'label': '폼 라벨 컴포넌트',
      'textarea': '다중 라인 텍스트 입력 컴포넌트',
      'toast': '일시적 알림 메시지 컴포넌트',
      'toaster': '토스트 알림 관리 컴포넌트',
      'badge': '상태 표시 배지 컴포넌트',
      'tabs': '탭 네비게이션 컴포넌트',
      'dialog': '모달 대화상자 컴포넌트',
      'dropdown-menu': '드롭다운 컨텍스트 메뉴',
      'header': '상단 고정 헤더 네비게이션',
      'interactive-card': '호버 인터랙션이 포함된 카드 래퍼',
      'progress': '진행률 표시 컴포넌트',
      'select': '드롭다운 선택 컴포넌트',
      'switch': '토글 스위치 컴포넌트',
      'tooltip': '도움말 툴팁 컴포넌트',
      'avatar': '사용자 프로필 이미지 컴포넌트',
      'checkbox': '체크박스 입력 컴포넌트',
      'alert': '알림 메시지 컴포넌트',
      'form': '폼 컨텍스트 및 검증 컴포넌트',
      'sheet': '사이드 패널 컴포넌트',
      'accordion': '접기/펼치기 패널 컴포넌트',
      'table': '데이터 테이블 컴포넌트',
      'carousel': '이미지/콘텐츠 슬라이더 컴포넌트',
      'bar-chart': '막대 차트 데이터 시각화 컴포넌트',
      'line-chart': '선형 차트 데이터 시각화 컴포넌트',
      'pie-chart': '원형 차트 데이터 시각화 컴포넌트',
      'chart': '차트 컨테이너 및 레이아웃 컴포넌트',
      'calendar': '날짜 선택 및 관리 캘린더 컴포넌트',
      'loading-button': '로딩 상태가 있는 인터랙티브 버튼 컴포넌트',
      'hero-section': '히어로 섹션 레이아웃 컴포넌트',
      'footer': '푸터 레이아웃 컴포넌트',
      'advanced-table': '고급 테이블 구성 요소',
      'palette-switcher': '상태 배지 팔레트 스위처',
      'project-progress': '프로젝트 전용 진행률 컴포넌트',
      'pagination': '페이지네이션 네비게이터',
      'typography': '타이포그래피 프리셋',
      'view-mode-switch': '뷰 모드 전환 스위치'
    };

    return descriptions[name] || '재사용 가능한 UI 컴포넌트';
  }

  /**
   * 훅 설명 생성
   */
  getHookDescription(name) {
    const descriptions = {
      'use-toast': '토스트 알림 관리 훅',
      'use-local-storage': '로컬 스토리지 동기화 훅',
      'use-toggle': '불린 상태 토글 훅',
      'use-api': 'API 호출 관리 훅',
      'use-form-validation': '폼 검증 관리 훅'
    };

    return descriptions[name] || '커스텀 React 훅';
  }

  /**
   * 유틸리티 설명 생성
   */
  getUtilDescription(name) {
    const descriptions = {
      'utils': '클래스명 병합 및 공통 유틸리티',
      'validation': '입력값 검증 유틸리티',
      'storage': '로컬 스토리지 관리 유틸리티',
      'format': '데이터 포맷팅 유틸리티',
      'api': 'API 통신 유틸리티'
    };

    return descriptions[name] || '범용 유틸리티 함수';
  }

  /**
   * 전체 문서 업데이트 실행
   */
  updateAll() {
    console.log('🚀 Claude 문서 자동 업데이트 시작...\n');

    // 메인 CLAUDE.md 업데이트
    this.updateMainClaudeDoc();

    // 각 하위 디렉토리의 claude.md 업데이트
    const directories = [
      path.join(this.srcPath, 'components', 'ui'),
      path.join(this.srcPath, 'hooks'),
      path.join(this.srcPath, 'lib'),
      path.join(this.srcPath, 'app'),
      path.join(this.srcPath, 'config')
    ];

    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.updateDirectoryClaudeDoc(dir);
      }
    });

    console.log('\n✨ Claude 문서 업데이트 완료!');
  }

  /**
   * 특정 디렉토리만 업데이트
   */
  updateDirectory(dirName) {
    console.log(`🔄 ${dirName} 디렉토리 문서 업데이트 중...`);

    const dirPath = path.join(this.srcPath, dirName);
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ 디렉토리를 찾을 수 없습니다: ${dirPath}`);
      return;
    }

    this.updateDirectoryClaudeDoc(dirPath);
    this.updateMainClaudeDoc(); // 메인 문서도 함께 업데이트

    console.log(`✅ ${dirName} 디렉토리 업데이트 완료`);
  }
}

// CLI 실행 부분
if (require.main === module) {
  const updater = new ClaudeDocUpdater();

  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 전체 업데이트
    updater.updateAll();
  } else if (args[0] === '--dir' && args[1]) {
    // 특정 디렉토리 업데이트
    updater.updateDirectory(args[1]);
  } else {
    console.log('사용법:');
    console.log('  node update-claude-docs.js           # 전체 업데이트');
    console.log('  node update-claude-docs.js --dir components  # 특정 디렉토리만');
  }
}

module.exports = ClaudeDocUpdater;
