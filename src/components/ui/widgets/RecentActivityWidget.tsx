'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
  MessageSquare,
  Plus,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText, getLoadingText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { RecentActivityWidgetProps, ActivityItem, ActivityType } from '@/types/dashboard';
import { useRecentActivity } from '@/hooks/useRecentActivity';

// 활동 타입별 색상 및 아이콘 매핑
const activityConfig: Record<ActivityType, { 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode; 
  label: string 
}> = {
  create: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 border-green-200', 
    icon: <Plus className="h-3 w-3" />, 
    label: '생성' 
  },
  update: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 border-blue-200', 
    icon: <Edit3 className="h-3 w-3" />, 
    label: '수정' 
  },
  complete: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 border-green-200', 
    icon: <CheckCircle2 className="h-3 w-3" />, 
    label: '완료' 
  },
  delete: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 border-red-200', 
    icon: <XCircle className="h-3 w-3" />, 
    label: '삭제' 
  },
  comment: { 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 border-purple-200', 
    icon: <MessageSquare className="h-3 w-3" />, 
    label: '댓글' 
  },
  document: { 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 border-orange-200', 
    icon: <FileText className="h-3 w-3" />, 
    label: '문서' 
  }
};

// Mock 데이터 제거 - useRecentActivity 훅에서 실제 데이터 로드

// 시간 포맷 헬퍼
const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

export function RecentActivityWidget({
  title,
  maxItems = 10,
  showFilter = true,
  filterByUser,
  filterByType,
  onActivityClick,
  lang = 'ko'
}: RecentActivityWidgetProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  const displayTitle = title || getWidgetText.recentActivity.title(lang);

  // useRecentActivity 훅으로 실제 데이터 로드
  const { activities, loading, error } = useRecentActivity();

  // 필터링된 활동 목록
  const filteredActivities = activities
    .filter(activity => {
      if (selectedFilter !== 'all' && activity.type !== selectedFilter) return false;
      // 팀 기능 구현 시 사용자 필터 활성화
      // if (selectedUserFilter !== 'all' && activity.user.id !== selectedUserFilter) return false;
      // if (filterByUser && activity.user.id !== filterByUser) return false;
      if (filterByType && activity.type !== filterByType) return false;
      return true;
    })
    .slice(0, maxItems);

  // 유니크 사용자 목록 - 팀 기능 구현 시 활성화
  // const uniqueUsers = Array.from(
  //   new Map(activities.map(activity => [activity.user.id, activity.user])).values()
  // );

  // 로딩 상태
  if (loading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="md" text={getLoadingText.data('ko')} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <XCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className={typography.text.small}>활동 데이터를 불러오는 중 오류가 발생했습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(typography.widget.title, "truncate")}>
              {displayTitle}
            </CardTitle>
            <CardDescription className={typography.text.description}>
              {getWidgetText.recentActivity.description(lang)}
            </CardDescription>
          </div>
          {showFilter && (
            <div className="flex items-center gap-1">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="h-8 w-20">
                  <Filter className="h-3 w-3" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="create">생성</SelectItem>
                  <SelectItem value="update">수정</SelectItem>
                  <SelectItem value="complete">완료</SelectItem>
                  <SelectItem value="delete">삭제</SelectItem>
                  <SelectItem value="comment">댓글</SelectItem>
                  <SelectItem value="document">문서</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="flex flex-col h-full">
          {/* 팀 기능 구현 시 사용자 필터 활성화 */}
          {/* {showFilter && uniqueUsers.length > 1 && (
            <div className="mb-2 px-3">
              <Select value={selectedUserFilter} onValueChange={setSelectedUserFilter}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 사용자</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          <ScrollArea className="flex-1">
            <div className="space-y-2 px-3">
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className={typography.text.small}>활동 내역이 없습니다</p>
                </div>
              ) : (
                filteredActivities.map((activity) => {
                  const config = activityConfig[activity.type];
                  
                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm",
                        config.bgColor,
                        onActivityClick && "hover:bg-opacity-80"
                      )}
                      onClick={() => onActivityClick?.(activity)}
                    >
                      <div className="flex items-start gap-3">
                        {/* 사용자 아바타 */}
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          {/* 활동 헤더 */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("flex items-center gap-1", config.color)}>
                              {config.icon}
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {config.label}
                              </Badge>
                            </div>
                            <span className={cn(typography.text.small, "text-muted-foreground")}>
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>

                          {/* 활동 내용 */}
                          <div className="space-y-1">
                            <p className={typography.widget.label}>
                              <span className="font-medium">{activity.user.name}</span>님이{' '}
                              <span className="font-medium">{activity.target}</span>을(를){' '}
                              {activity.action}
                            </p>
                            {activity.description && (
                              <p className={cn(typography.text.small, "text-muted-foreground")}>
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {onActivityClick && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}