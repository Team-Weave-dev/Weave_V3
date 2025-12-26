'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calendar, Bell, Palette, Globe } from 'lucide-react';
import type { CalendarSettings } from '../types';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalendarSettings;
  onSave: (settings: CalendarSettings) => void;
}

/**
 * CalendarSettings Component
 * 캘린더 설정을 관리하는 모달
 */
const CalendarSettingsModal = React.memo(({
  isOpen,
  onClose,
  settings,
  onSave,
}: CalendarSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<CalendarSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    localStorage.setItem('calendarSettings', JSON.stringify(localSettings));
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: CalendarSettings = {
      weekStartsOn: 0,
      defaultView: 'month',
      showWeekNumbers: false,
      notificationSettings: {
        enabled: false,
        defaultReminderMinutes: 15,
      },
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            캘린더 설정
          </DialogTitle>
          <DialogDescription>
            캘린더의 표시 방법과 동작을 사용자화할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              일반
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              표시
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              알림
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              연동
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="week-starts">주 시작일</Label>
              <Select
                value={localSettings.weekStartsOn.toString()}
                onValueChange={(value) =>
                  setLocalSettings({
                    ...localSettings,
                    weekStartsOn: parseInt(value) as 0 | 1,
                  })
                }
              >
                <SelectTrigger id="week-starts">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">일요일</SelectItem>
                  <SelectItem value="1">월요일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-view">기본 보기</Label>
              <Select
                value={localSettings.defaultView}
                onValueChange={(value: 'month' | 'week' | 'day' | 'agenda') =>
                  setLocalSettings({ ...localSettings, defaultView: value })
                }
              >
                <SelectTrigger id="default-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">월</SelectItem>
                  <SelectItem value="week">주</SelectItem>
                  <SelectItem value="day">일</SelectItem>
                  <SelectItem value="agenda">일정 목록</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="week-numbers">주 번호 표시</Label>
                <p className="text-sm text-muted-foreground">
                  캘린더에 주 번호를 표시합니다
                </p>
              </div>
              <Switch
                id="week-numbers"
                checked={localSettings.showWeekNumbers}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showWeekNumbers: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>이벤트 색상 커스터마이징</Label>
              <p className="text-sm text-muted-foreground">
                이벤트 타입별 색상을 변경할 수 있습니다 (향후 업데이트 예정)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-enabled">알림 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  일정 알림을 받습니다
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={localSettings.notificationSettings?.enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    notificationSettings: {
                      ...localSettings.notificationSettings,
                      enabled: checked,
                      defaultReminderMinutes:
                        localSettings.notificationSettings?.defaultReminderMinutes || 15,
                    },
                  })
                }
              />
            </div>

            {localSettings.notificationSettings?.enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">기본 알림 시간 (분)</Label>
                <Select
                  value={localSettings.notificationSettings.defaultReminderMinutes.toString()}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      notificationSettings: {
                        ...localSettings.notificationSettings!,
                        defaultReminderMinutes: parseInt(value),
                      },
                    })
                  }
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5분 전</SelectItem>
                    <SelectItem value="10">10분 전</SelectItem>
                    <SelectItem value="15">15분 전</SelectItem>
                    <SelectItem value="30">30분 전</SelectItem>
                    <SelectItem value="60">1시간 전</SelectItem>
                    <SelectItem value="1440">1일 전</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">구글 캘린더 연동</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  구글 계정으로 로그인하여 캘린더를 동기화할 수 있습니다
                </p>
              </div>

              {!localSettings.googleCalendarEnabled ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm">
                    구글 캘린더 연동을 시작하려면 아래 버튼을 클릭하세요.
                  </p>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      // NOTE: Google OAuth 2.0 연동 구현 예정 (P2 Feature)
                      // 구현 시: GIS 라이브러리 → OAuth 팝업 → Access Token → Calendar API 권한
                      alert('구글 캘린더 연동 기능은 향후 업데이트 예정입니다.\n\nOAuth 2.0 방식으로 안전하게 구현될 예정입니다.');
                      setLocalSettings({
                        ...localSettings,
                        googleCalendarEnabled: true,
                      });
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    구글 계정으로 연결하기
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    안전한 OAuth 2.0 방식으로 연동됩니다
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">연결됨</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalSettings({
                          ...localSettings,
                          googleCalendarEnabled: false,
                          googleCalendarApiKey: undefined,
                          googleCalendarId: undefined,
                        });
                      }}
                    >
                      연결 해제
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    구글 캘린더와 동기화 중입니다
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>개발자 참고:</strong> OAuth 2.0 구현 시 Google Identity Services (gsi) 라이브러리를 사용하고,
                  Calendar API v3 권한(https://www.googleapis.com/auth/calendar.readonly)이 필요합니다.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CalendarSettingsModal.displayName = 'CalendarSettingsModal';

export default CalendarSettingsModal;