/**
 * Migration Notification Component
 *
 * User notification system for storage migration status and updates
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Database,
  Cloud,
  HardDrive,
  ArrowRight,
  X
} from 'lucide-react';

/**
 * Notification types
 */
type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Storage mode types
 */
type StorageMode = 'localStorage' | 'dualwrite' | 'supabase' | 'unknown';

/**
 * Migration notification props
 */
interface MigrationNotificationProps {
  onDismiss?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Storage status interface
 */
interface StorageStatus {
  mode: StorageMode;
  health: {
    status: string;
    score: number;
    issues: string[];
  };
  sync?: {
    enabled: boolean;
    successRate: number;
    queueSize: number;
  };
  isReadyForTransition?: boolean;
  recommendations?: string[];
}

/**
 * Migration notification component
 */
export function MigrationNotification({
  onDismiss,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: MigrationNotificationProps) {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Fetch storage status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/storage-status');
      if (!response.ok) {
        throw new Error('Failed to fetch storage status');
      }

      const data = await response.json();
      setStatus({
        mode: data.storage.mode,
        health: data.health.current,
        sync: data.sync,
        isReadyForTransition: data.storage.mode === 'dualwrite' && data.health.current.score >= 80,
        recommendations: data.health.recommendations
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (dismissed) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">스토리지 상태 확인 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>스토리지 상태 확인 실패</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  // Determine notification type and content based on status
  const getNotificationContent = () => {
    const { mode, health, sync, isReadyForTransition } = status;

    // LocalStorage mode
    if (mode === 'localStorage') {
      return {
        type: 'info' as NotificationType,
        icon: <HardDrive className="h-4 w-4" />,
        title: '로컬 스토리지 모드',
        description: '현재 모든 데이터가 브라우저에 저장되고 있습니다. 로그인하면 클라우드 동기화가 활성화됩니다.',
        showProgress: false
      };
    }

    // DualWrite mode
    if (mode === 'dualwrite') {
      const syncRate = sync?.successRate || 0;
      const queueSize = sync?.queueSize || 0;

      if (health.status === 'critical' || health.status === 'error') {
        return {
          type: 'error' as NotificationType,
          icon: <XCircle className="h-4 w-4" />,
          title: '동기화 문제 발생',
          description: `데이터 동기화에 문제가 있습니다. (성공률: ${syncRate.toFixed(1)}%, 대기열: ${queueSize})`,
          showProgress: true,
          progress: syncRate
        };
      }

      if (isReadyForTransition) {
        return {
          type: 'success' as NotificationType,
          icon: <CheckCircle2 className="h-4 w-4" />,
          title: '클라우드 전환 준비 완료',
          description: '데이터 동기화가 안정적입니다. Supabase 전용 모드로 전환할 수 있습니다.',
          showProgress: true,
          progress: syncRate,
          action: {
            label: '클라우드 모드로 전환',
            onClick: () => window.location.href = '/admin/migration'
          }
        };
      }

      return {
        type: 'warning' as NotificationType,
        icon: <Database className="h-4 w-4" />,
        title: '듀얼 스토리지 모드',
        description: `로컬과 클라우드에 데이터를 동시 저장 중입니다. (동기화율: ${syncRate.toFixed(1)}%)`,
        showProgress: true,
        progress: syncRate
      };
    }

    // Supabase mode
    if (mode === 'supabase') {
      if (health.status === 'critical' || health.status === 'error') {
        return {
          type: 'error' as NotificationType,
          icon: <AlertCircle className="h-4 w-4" />,
          title: '클라우드 스토리지 문제',
          description: '클라우드 스토리지에 문제가 감지되었습니다. 자동으로 로컬 백업 모드로 전환될 수 있습니다.',
          showProgress: false
        };
      }

      return {
        type: 'success' as NotificationType,
        icon: <Cloud className="h-4 w-4" />,
        title: '클라우드 스토리지 활성',
        description: '모든 데이터가 안전하게 클라우드에 저장되고 있습니다.',
        showProgress: false
      };
    }

    // Unknown mode
    return {
      type: 'info' as NotificationType,
      icon: <Info className="h-4 w-4" />,
      title: '스토리지 상태 확인 중',
      description: '스토리지 모드를 확인할 수 없습니다.',
      showProgress: false
    };
  };

  const content = getNotificationContent();

  // Render compact notification
  if (!showDetails) {
    return (
      <Alert
        variant={content.type === 'error' ? 'destructive' : 'default'}
        className={`mb-4 ${content.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            {content.icon}
            <div className="flex-1">
              <AlertTitle className="mb-1">{content.title}</AlertTitle>
              <AlertDescription className="text-sm">
                {content.description}
              </AlertDescription>
              {content.showProgress && content.progress !== undefined && (
                <Progress value={content.progress} className="mt-2 h-1" />
              )}
              {content.action && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={content.action.onClick}
                >
                  {content.action.label}
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              상세
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  // Render detailed view
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {content.icon}
            <CardTitle>{content.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              status.health.status === 'healthy' ? 'default' :
              status.health.status === 'warning' ? 'outline' :
              'error'
            }>
              건강도: {status.health.score}%
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDetails(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage mode details */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">스토리지 모드:</span>
            <Badge>{status.mode}</Badge>
          </div>
          {status.sync && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">동기화율:</span>
              <span className="text-sm">{status.sync.successRate.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Progress bar for sync */}
        {content.showProgress && content.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>동기화 진행률</span>
              <span>{content.progress.toFixed(1)}%</span>
            </div>
            <Progress value={content.progress} />
          </div>
        )}

        {/* Health issues */}
        {status.health.issues.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>감지된 문제</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {status.health.issues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {status.recommendations && status.recommendations.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>권장 사항</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {status.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {content.action && (
            <Button onClick={content.action.onClick}>
              {content.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={fetchStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MigrationNotification;