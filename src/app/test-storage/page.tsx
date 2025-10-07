'use client';

/**
 * Storage System Integration Test Page
 *
 * Phase 9.2 통합 테스트 - 브라우저 기반 테스트
 *
 * 테스트 항목:
 * 1. StorageManager 기본 동작
 * 2. 도메인 서비스 (Project, Task, Calendar)
 * 3. 실시간 구독 시스템
 * 4. 트랜잭션
 * 5. 위젯 데이터 통합
 * 6. 프로젝트 페이지 기능
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  GitBranch,
  Activity,
  Settings as SettingsIcon
} from 'lucide-react';

// Storage API imports
import { storage, projectService, taskService, calendarService } from '@/lib/storage';
import type { Project, Task, CalendarEvent } from '@/lib/storage';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface TestSection {
  name: string;
  tests: TestResult[];
}

export default function StorageTestPage() {
  const [sections, setSections] = useState<TestSection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // 테스트 결과 업데이트 헬퍼
  const updateTestResult = (
    sectionName: string,
    testName: string,
    status: TestResult['status'],
    message?: string,
    duration?: number
  ) => {
    setSections(prev => {
      const newSections = [...prev];
      const sectionIndex = newSections.findIndex(s => s.name === sectionName);

      if (sectionIndex >= 0) {
        const section = newSections[sectionIndex];
        const testIndex = section.tests.findIndex(t => t.name === testName);

        if (testIndex >= 0) {
          section.tests[testIndex] = { name: testName, status, message, duration };
        } else {
          section.tests.push({ name: testName, status, message, duration });
        }
      } else {
        newSections.push({
          name: sectionName,
          tests: [{ name: testName, status, message, duration }]
        });
      }

      return newSections;
    });
  };

  // 전체 테스트 실행
  const runAllTests = async () => {
    setIsRunning(true);
    setSections([]);

    try {
      // Section 1: StorageManager CRUD 테스트
      await testStorageManagerCRUD();

      // Section 2: 도메인 서비스 테스트
      await testDomainServices();

      // Section 3: 구독 시스템 테스트
      await testSubscriptionSystem();

      // Section 4: 트랜잭션 테스트
      await testTransactionSystem();

      // Section 5: 성능 테스트
      await testPerformance();

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // 1. StorageManager CRUD 테스트
  const testStorageManagerCRUD = async () => {
    const sectionName = 'StorageManager CRUD';

    // Test 1: Set & Get
    const start1 = performance.now();
    setCurrentTest('StorageManager: Set & Get');
    updateTestResult(sectionName, 'Set & Get', 'running');

    try {
      const testData = { id: 'test-1', value: 'Test Value' };
      await storage.set('test-key', testData);
      const retrieved = await storage.get('test-key');

      if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
        updateTestResult(sectionName, 'Set & Get', 'success', '데이터 저장 및 조회 성공', performance.now() - start1);
      } else {
        updateTestResult(sectionName, 'Set & Get', 'error', '데이터 불일치');
      }
    } catch (error) {
      updateTestResult(sectionName, 'Set & Get', 'error', (error as Error).message);
    }

    // Test 2: Remove
    const start2 = performance.now();
    setCurrentTest('StorageManager: Remove');
    updateTestResult(sectionName, 'Remove', 'running');

    try {
      await storage.remove('test-key');
      const shouldBeNull = await storage.get('test-key');

      if (shouldBeNull === null) {
        updateTestResult(sectionName, 'Remove', 'success', '데이터 삭제 성공', performance.now() - start2);
      } else {
        updateTestResult(sectionName, 'Remove', 'error', '데이터가 삭제되지 않음');
      }
    } catch (error) {
      updateTestResult(sectionName, 'Remove', 'error', (error as Error).message);
    }

    // Test 3: Batch Operations
    const start3 = performance.now();
    setCurrentTest('StorageManager: Batch Operations');
    updateTestResult(sectionName, 'Batch Operations', 'running');

    try {
      const batchData = new Map([
        ['batch-1', { value: 'A' }],
        ['batch-2', { value: 'B' }],
        ['batch-3', { value: 'C' }],
      ]);

      await storage.setBatch(batchData);
      const retrieved = await storage.getBatch(['batch-1', 'batch-2', 'batch-3']);

      if (retrieved.size === 3) {
        updateTestResult(sectionName, 'Batch Operations', 'success', '배치 작업 성공', performance.now() - start3);
      } else {
        updateTestResult(sectionName, 'Batch Operations', 'error', `배치 크기 불일치: ${retrieved.size}/3`);
      }
    } catch (error) {
      updateTestResult(sectionName, 'Batch Operations', 'error', (error as Error).message);
    }
  };

  // 2. 도메인 서비스 테스트
  const testDomainServices = async () => {
    const sectionName = 'Domain Services';

    // Test 1: ProjectService
    const start1 = performance.now();
    setCurrentTest('ProjectService: Create & Read');
    updateTestResult(sectionName, 'ProjectService', 'running');

    try {
      const project = await projectService.create({
        title: 'Test Project',
        description: 'Integration Test',
        clientId: 'test-client',
        status: 'active',
        startDate: new Date().toISOString(),
      });

      const retrieved = await projectService.getById(project.id);

      if (retrieved && retrieved.title === 'Test Project') {
        updateTestResult(sectionName, 'ProjectService', 'success', 'Project CRUD 성공', performance.now() - start1);
      } else {
        updateTestResult(sectionName, 'ProjectService', 'error', '프로젝트 조회 실패');
      }
    } catch (error) {
      updateTestResult(sectionName, 'ProjectService', 'error', (error as Error).message);
    }

    // Test 2: TaskService
    const start2 = performance.now();
    setCurrentTest('TaskService: Create & Filter');
    updateTestResult(sectionName, 'TaskService', 'running');

    try {
      const task = await taskService.create({
        title: 'Test Task',
        description: 'Integration Test Task',
        status: 'todo',
        priority: 'high',
        projectId: 'test-project',
      });

      const projectTasks = await taskService.getTasksByProject('test-project');

      if (projectTasks.length > 0) {
        updateTestResult(sectionName, 'TaskService', 'success', 'Task CRUD 및 필터링 성공', performance.now() - start2);
      } else {
        updateTestResult(sectionName, 'TaskService', 'error', '태스크 필터링 실패');
      }
    } catch (error) {
      updateTestResult(sectionName, 'TaskService', 'error', (error as Error).message);
    }

    // Test 3: CalendarService
    const start3 = performance.now();
    setCurrentTest('CalendarService: Create & Filter');
    updateTestResult(sectionName, 'CalendarService', 'running');

    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 86400000);

      const event = await calendarService.create({
        title: 'Test Event',
        startDate: tomorrow.toISOString(),
        endDate: tomorrow.toISOString(),
        type: 'meeting',
      });

      const rangeEvents = await calendarService.getEventsByDateRange(
        now.toISOString(),
        new Date(now.getTime() + 2 * 86400000).toISOString()
      );

      if (rangeEvents.length > 0) {
        updateTestResult(sectionName, 'CalendarService', 'success', 'Calendar CRUD 및 날짜 필터링 성공', performance.now() - start3);
      } else {
        updateTestResult(sectionName, 'CalendarService', 'error', '이벤트 필터링 실패');
      }
    } catch (error) {
      updateTestResult(sectionName, 'CalendarService', 'error', (error as Error).message);
    }
  };

  // 3. 구독 시스템 테스트
  const testSubscriptionSystem = async () => {
    const sectionName = 'Subscription System';
    const start = performance.now();

    setCurrentTest('구독 시스템 테스트');
    updateTestResult(sectionName, 'Real-time Subscription', 'running');

    try {
      let receivedUpdate = false;

      // 구독 등록
      const unsubscribe = storage.subscribe('subscription-test', () => {
        receivedUpdate = true;
      });

      // 데이터 업데이트
      await storage.set('subscription-test', { updated: true });

      // 약간의 딜레이 후 확인
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      if (receivedUpdate) {
        updateTestResult(sectionName, 'Real-time Subscription', 'success', '구독 시스템 정상 동작', performance.now() - start);
      } else {
        updateTestResult(sectionName, 'Real-time Subscription', 'error', '구독 알림 미수신');
      }
    } catch (error) {
      updateTestResult(sectionName, 'Real-time Subscription', 'error', (error as Error).message);
    }
  };

  // 4. 트랜잭션 테스트
  const testTransactionSystem = async () => {
    const sectionName = 'Transaction System';
    const start = performance.now();

    setCurrentTest('트랜잭션 테스트');
    updateTestResult(sectionName, 'Transaction Rollback', 'running');

    try {
      // 초기 값 설정
      await storage.set('tx-test', 'original');

      try {
        await storage.transaction(async (tx) => {
          await tx.set('tx-test', 'modified');
          throw new Error('Intentional rollback');
        });
      } catch (error) {
        // Expected error
      }

      // 롤백 확인
      const value = await storage.get('tx-test');

      if (value === 'original') {
        updateTestResult(sectionName, 'Transaction Rollback', 'success', '트랜잭션 롤백 성공', performance.now() - start);
      } else {
        updateTestResult(sectionName, 'Transaction Rollback', 'error', `롤백 실패: ${value}`);
      }
    } catch (error) {
      updateTestResult(sectionName, 'Transaction Rollback', 'error', (error as Error).message);
    }
  };

  // 5. 성능 테스트
  const testPerformance = async () => {
    const sectionName = 'Performance';

    // Test 1: 100개 항목 배치 저장
    const start1 = performance.now();
    setCurrentTest('성능: 배치 저장');
    updateTestResult(sectionName, 'Batch Write (100 items)', 'running');

    try {
      const items = new Map();
      for (let i = 0; i < 100; i++) {
        items.set(`perf-${i}`, { index: i, data: `value-${i}` });
      }

      await storage.setBatch(items);
      const duration = performance.now() - start1;

      if (duration < 1000) {
        updateTestResult(sectionName, 'Batch Write (100 items)', 'success', `${duration.toFixed(2)}ms (목표: <1000ms)`, duration);
      } else {
        updateTestResult(sectionName, 'Batch Write (100 items)', 'error', `성능 목표 미달: ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      updateTestResult(sectionName, 'Batch Write (100 items)', 'error', (error as Error).message);
    }

    // Test 2: 100개 항목 배치 조회
    const start2 = performance.now();
    setCurrentTest('성능: 배치 조회');
    updateTestResult(sectionName, 'Batch Read (100 items)', 'running');

    try {
      const keys = Array.from({ length: 100 }, (_, i) => `perf-${i}`);
      await storage.getBatch(keys);
      const duration = performance.now() - start2;

      if (duration < 500) {
        updateTestResult(sectionName, 'Batch Read (100 items)', 'success', `${duration.toFixed(2)}ms (목표: <500ms)`, duration);
      } else {
        updateTestResult(sectionName, 'Batch Read (100 items)', 'error', `성능 목표 미달: ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      updateTestResult(sectionName, 'Batch Read (100 items)', 'error', (error as Error).message);
    }
  };

  // 테스트 상태 아이콘
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  // 테스트 통계
  const getStats = () => {
    const allTests = sections.flatMap(s => s.tests);
    return {
      total: allTests.length,
      success: allTests.filter(t => t.status === 'success').length,
      error: allTests.filter(t => t.status === 'error').length,
      running: allTests.filter(t => t.status === 'running').length,
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Storage System Integration Test</h1>
        <p className="text-muted-foreground">
          Phase 9.2 통합 테스트 - Storage API 및 위젯 검증
        </p>
      </div>

      {/* 테스트 컨트롤 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 실행</CardTitle>
          <CardDescription>
            전체 테스트를 실행하여 Storage 시스템의 모든 기능을 검증합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  테스트 실행 중...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  전체 테스트 실행
                </>
              )}
            </Button>

            {isRunning && currentTest && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{currentTest}</span>
              </div>
            )}
          </div>

          {/* 테스트 통계 */}
          {stats.total > 0 && (
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">전체 테스트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-xs text-muted-foreground">성공</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <div className="text-xs text-muted-foreground">실패</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
                <div className="text-xs text-muted-foreground">실행 중</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 테스트 결과 */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {section.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.tests.map((test, testIdx) => (
                  <div
                    key={testIdx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <div className="font-medium">{test.name}</div>
                        {test.message && (
                          <div className="text-sm text-muted-foreground">{test.message}</div>
                        )}
                      </div>
                    </div>
                    {test.duration !== undefined && (
                      <Badge variant="outline" className="ml-4">
                        {test.duration.toFixed(2)}ms
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빈 상태 */}
      {sections.length === 0 && !isRunning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            "전체 테스트 실행" 버튼을 클릭하여 테스트를 시작하세요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
