#!/usr/bin/env node

/**
 * Claude Documentation Real-time Watcher
 *
 * 파일 시스템 변경을 실시간으로 감지하여 claude.md 파일들을 자동 업데이트하는 스크립트
 *
 * 기능:
 * - 실시간 파일 변경 감지 (chokidar 없이 순수 Node.js)
 * - 디렉토리별 변경사항 추적
 * - 스마트 업데이트 (중복 업데이트 방지)
 * - 성능 최적화 (디바운싱)
 */

const fs = require('fs');
const path = require('path');
const ClaudeDocUpdater = require('./update-claude-docs');

class ClaudeDocWatcher {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcPath = path.join(this.projectRoot, 'src');
    this.updater = new ClaudeDocUpdater();
    this.watchers = new Map();
    this.updateQueue = new Set();
    this.debounceTimer = null;
    this.isUpdating = false;

    // 감시할 디렉토리 목록
    this.watchDirectories = [
      'src/components',
      'src/components/ui',
      'src/hooks',
      'src/lib',
      'src/app',
      'src/config'
    ];

    // 감시할 파일 확장자
    this.watchExtensions = ['.tsx', '.ts', '.js', '.jsx'];

    console.log('🔍 Claude Documentation Watcher 시작...\n');
  }

  /**
   * 파일이 감시 대상인지 확인
   */
  shouldWatch(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // claude.md 파일은 무시
    if (fileName.includes('claude.md')) {
      return false;
    }

    // 숨김 파일 무시
    if (fileName.startsWith('.')) {
      return false;
    }

    // node_modules 무시
    if (filePath.includes('node_modules')) {
      return false;
    }

    // 감시할 확장자만 포함
    return this.watchExtensions.includes(ext);
  }

  /**
   * 파일 변경에 따른 영향받는 디렉토리 결정
   */
  getAffectedDirectories(filePath) {
    const affected = new Set();
    const relativePath = path.relative(this.projectRoot, filePath);

    // 항상 메인 CLAUDE.md 업데이트
    affected.add('main');

    // 파일 위치에 따른 영향받는 디렉토리 결정
    if (relativePath.includes('src/components/ui/')) {
      affected.add('components/ui');
    } else if (relativePath.includes('src/components/')) {
      affected.add('components');
    }

    if (relativePath.includes('src/hooks/')) {
      affected.add('hooks');
    }

    if (relativePath.includes('src/lib/')) {
      affected.add('lib');
    }

    if (relativePath.includes('src/app/')) {
      affected.add('app');
    }

    if (relativePath.includes('src/config/')) {
      affected.add('config');
    }

    return Array.from(affected);
  }

  /**
   * 파일 변경 핸들러
   */
  handleFileChange(eventType, filePath) {
    if (!this.shouldWatch(filePath)) {
      return;
    }

    const relativePath = path.relative(this.projectRoot, filePath);
    console.log(`📝 파일 변경 감지: ${eventType} ${relativePath}`);

    // 영향받는 디렉토리들을 큐에 추가
    const affectedDirs = this.getAffectedDirectories(filePath);
    affectedDirs.forEach(dir => this.updateQueue.add(dir));

    // 디바운싱으로 중복 업데이트 방지
    this.debounceUpdate();
  }

  /**
   * 디바운싱된 업데이트 실행
   */
  debounceUpdate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processUpdateQueue();
    }, 1000); // 1초 대기
  }

  /**
   * 업데이트 큐 처리
   */
  async processUpdateQueue() {
    if (this.isUpdating || this.updateQueue.size === 0) {
      return;
    }

    this.isUpdating = true;

    try {
      console.log('\n🔄 Claude 문서 자동 업데이트 실행...');

      const updates = Array.from(this.updateQueue);
      this.updateQueue.clear();

      // 메인 문서 업데이트
      if (updates.includes('main')) {
        this.updater.updateMainClaudeDoc();
      }

      // 각 디렉토리별 업데이트
      const directories = updates.filter(dir => dir !== 'main');
      for (const dir of directories) {
        const dirPath = path.join(this.srcPath, dir.replace('components/ui', 'components/ui'));
        if (fs.existsSync(dirPath)) {
          this.updater.updateDirectoryClaudeDoc(dirPath);
        }
      }

      console.log('✅ 자동 업데이트 완료\n');

    } catch (error) {
      console.error('❌ 자동 업데이트 실패:', error.message);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 디렉토리 감시 시작
   */
  watchDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        return;
      }

      const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          const fullPath = path.join(dirPath, filename);
          this.handleFileChange(eventType, fullPath);
        }
      });

      this.watchers.set(dirPath, watcher);
      const relativePath = path.relative(this.projectRoot, dirPath);
      console.log(`👀 감시 시작: ${relativePath}/`);

    } catch (error) {
      console.error(`❌ 디렉토리 감시 실패 ${dirPath}:`, error.message);
    }
  }

  /**
   * 모든 감시 시작
   */
  startWatching() {
    console.log('📂 감시 대상 디렉토리 설정...\n');

    this.watchDirectories.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      this.watchDirectory(fullPath);
    });

    console.log('\n✨ 실시간 감시 시작됨!');
    console.log('💡 파일을 수정하면 자동으로 claude.md 파일들이 업데이트됩니다.');
    console.log('🛑 종료하려면 Ctrl+C를 누르세요.\n');

    // 초기 업데이트 실행
    setTimeout(() => {
      console.log('🔄 초기 문서 업데이트 실행...');
      this.updater.updateAll();
      console.log('\n⏳ 파일 변경을 기다리는 중...\n');
    }, 2000);
  }

  /**
   * 감시 중지
   */
  stopWatching() {
    console.log('\n🛑 감시 중지 중...');

    this.watchers.forEach((watcher, dirPath) => {
      watcher.close();
      const relativePath = path.relative(this.projectRoot, dirPath);
      console.log(`👋 감시 중지: ${relativePath}/`);
    });

    this.watchers.clear();

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    console.log('✅ 모든 감시 중지됨');
  }

  /**
   * 상태 정보 출력
   */
  printStatus() {
    console.log('\n📊 감시 상태:');
    console.log(`- 감시 중인 디렉토리: ${this.watchers.size}개`);
    console.log(`- 업데이트 대기열: ${this.updateQueue.size}개`);
    console.log(`- 업데이트 진행 중: ${this.isUpdating ? 'Yes' : 'No'}`);
    console.log('');
  }
}

// 우아한 종료 처리
function setupGracefulShutdown(watcher) {
  const cleanup = () => {
    watcher.stopWatching();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('uncaughtException', (error) => {
    console.error('💥 예상치 못한 오류:', error.message);
    cleanup();
  });
}

// CLI 실행 부분
if (require.main === module) {
  const watcher = new ClaudeDocWatcher();

  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Claude Documentation Watcher');
    console.log('');
    console.log('사용법:');
    console.log('  node watch-and-update.js           # 실시간 감시 시작');
    console.log('  node watch-and-update.js --status  # 상태 확인');
    console.log('  node watch-and-update.js --help    # 도움말');
    console.log('');
    console.log('기능:');
    console.log('  - 실시간 파일 변경 감지');
    console.log('  - 자동 claude.md 업데이트');
    console.log('  - 스마트 디바운싱');
    console.log('  - 우아한 종료 처리');
    process.exit(0);
  }

  if (args.includes('--status')) {
    watcher.printStatus();
    process.exit(0);
  }

  // 우아한 종료 설정
  setupGracefulShutdown(watcher);

  // 감시 시작
  watcher.startWatching();
}

module.exports = ClaudeDocWatcher;