'use client';

/**
 * Sync Monitor Dashboard
 *
 * Real-time monitoring dashboard for DualWrite synchronization status
 * and data integrity validation.
 *
 * Features:
 * - Real-time sync status updates
 * - Data integrity validation results
 * - Manual sync trigger
 * - Health indicators
 * - Auto-refresh every 5 seconds
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Database, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface SyncStatus {
  mode: 'localStorage' | 'dualWrite';
  stats?: {
    totalAttempts: number;
    successCount: number;
    failureCount: number;
    queueSize: number;
    pendingCount: number;
    lastSyncAt: string | null;
    successRate: string;
  };
  health?: {
    isHealthy: boolean;
    status: 'healthy' | 'warning';
    issues: string[];
  };
  timestamp: string;
}

interface IntegrityReport {
  timestamp: string;
  overallMatch: boolean;
  results: Array<{
    entity: string;
    match: boolean;
    localCount: number;
    supabaseCount: number;
    error?: string;
    mismatches?: Array<{
      id: string;
      field: string;
    }>;
  }>;
  summary: {
    totalEntities: number;
    matchedEntities: number;
    failedEntities: number;
    erroredEntities: number;
  };
  duration: number;
}

export default function SyncMonitorPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [validating, setValidating] = useState(false);

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  // Fetch integrity report
  const fetchIntegrityReport = async () => {
    setValidating(true);
    try {
      const response = await fetch('/api/data-integrity?deepCheck=true');
      if (response.ok) {
        const data = await response.json();
        setIntegrityReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch integrity report:', error);
    } finally {
      setValidating(false);
    }
  };

  // Manual sync trigger
  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync-status', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchSyncStatus();
      }
    } catch (error) {
      console.error('Failed to trigger manual sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSyncStatus(), fetchIntegrityReport()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">동기화 모니터</h1>
          <p className="text-muted-foreground">실시간 동기화 상태 및 데이터 무결성 모니터링</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSyncStatus();
              fetchIntegrityReport();
            }}
            disabled={loading || validating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || validating) ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          {syncStatus?.mode === 'dualWrite' && (
            <Button size="sm" onClick={triggerManualSync} disabled={syncing}>
              <Database className={`h-4 w-4 mr-2 ${syncing ? 'animate-pulse' : ''}`} />
              수동 동기화
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>동기화 상태</CardTitle>
          <CardDescription>
            {syncStatus?.mode === 'dualWrite'
              ? 'DualWrite 모드 활성화 - LocalStorage와 Supabase 동시 사용'
              : 'LocalStorage 전용 모드'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus?.mode === 'dualWrite' && syncStatus.stats && (
            <>
              {/* Health Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">건강 상태</span>
                <Badge
                  variant={syncStatus.health?.isHealthy ? 'default' : 'error'}
                  className="flex items-center gap-1"
                >
                  {syncStatus.health?.isHealthy ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {syncStatus.health?.status === 'healthy' ? '정상' : '점검 필요'}
                </Badge>
              </div>

              {/* Success Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">성공률</span>
                  <span className="font-mono">{syncStatus.stats.successRate}</span>
                </div>
                <Progress value={parseFloat(syncStatus.stats.successRate)} />
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">총 시도</p>
                  <p className="text-2xl font-bold">{syncStatus.stats.totalAttempts}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">성공</p>
                  <p className="text-2xl font-bold text-green-600">{syncStatus.stats.successCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">실패</p>
                  <p className="text-2xl font-bold text-red-600">{syncStatus.stats.failureCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">대기열</p>
                  <p className="text-2xl font-bold">{syncStatus.stats.queueSize}</p>
                </div>
              </div>

              {/* Issues */}
              {syncStatus.health?.issues && syncStatus.health.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>주의 필요</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {syncStatus.health.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Last Sync */}
              {syncStatus.stats.lastSyncAt && (
                <div className="text-sm text-muted-foreground">
                  마지막 동기화: {new Date(syncStatus.stats.lastSyncAt).toLocaleString('ko-KR')}
                </div>
              )}
            </>
          )}

          {syncStatus?.mode === 'localStorage' && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>LocalStorage 전용 모드</AlertTitle>
              <AlertDescription>
                로그인하면 DualWrite 모드가 자동으로 활성화되어 Supabase와 동기화됩니다.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Integrity Card */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 무결성</CardTitle>
          <CardDescription>
            LocalStorage와 Supabase 간 데이터 일치 여부를 검증합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validating ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">검증 중...</span>
            </div>
          ) : integrityReport ? (
            <>
              {/* Overall Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-semibold">전체 상태</p>
                  <p className="text-sm text-muted-foreground">
                    {integrityReport.duration}ms 소요
                  </p>
                </div>
                <Badge
                  variant={integrityReport.overallMatch ? 'default' : 'error'}
                  className="text-lg px-4 py-2"
                >
                  {integrityReport.overallMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      일치
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      불일치
                    </>
                  )}
                </Badge>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">총 엔티티</p>
                  <p className="text-2xl font-bold">{integrityReport.summary.totalEntities}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm text-muted-foreground">일치</p>
                  <p className="text-2xl font-bold text-green-600">
                    {integrityReport.summary.matchedEntities}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <p className="text-sm text-muted-foreground">불일치</p>
                  <p className="text-2xl font-bold text-red-600">
                    {integrityReport.summary.failedEntities}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <p className="text-sm text-muted-foreground">에러</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {integrityReport.summary.erroredEntities}
                  </p>
                </div>
              </div>

              {/* Entity Details Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>엔티티</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">LocalStorage</TableHead>
                      <TableHead className="text-right">Supabase</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrityReport.results.map((result) => (
                      <TableRow key={result.entity}>
                        <TableCell className="font-medium">{result.entity}</TableCell>
                        <TableCell>
                          {result.match ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              일치
                            </Badge>
                          ) : result.error ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              에러
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              불일치
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{result.localCount}</TableCell>
                        <TableCell className="text-right">{result.supabaseCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.error || (result.mismatches && result.mismatches.length > 0)
                            ? `${result.mismatches?.length || 0}개 불일치`
                            : '정상'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-muted-foreground text-right">
                마지막 검증: {new Date(integrityReport.timestamp).toLocaleString('ko-KR')}
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>데이터 없음</AlertTitle>
              <AlertDescription>
                데이터 무결성 검증 결과가 없습니다. 새로고침 버튼을 클릭하세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
