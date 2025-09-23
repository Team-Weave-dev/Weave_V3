'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, ChevronRight } from 'lucide-react';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { QuickAction } from '@/types/dashboard';

interface QuickActionsWidgetProps {
  title?: string;
  actions?: QuickAction[];
}

export function QuickActionsWidget({ 
  title, 
  actions
}: QuickActionsWidgetProps) {
  const displayTitle = title || getWidgetText.quickActions.title('ko');
  
  const defaultActions: QuickAction[] = [
    {
      id: 'new-project',
      label: getWidgetText.quickActions.actions.newProject('ko'),
      icon: <Plus className="h-4 w-4" />,
      onClick: () => console.log('새 프로젝트'),
      variant: 'default'
    },
    {
      id: 'new-invoice',
      label: getWidgetText.quickActions.actions.newInvoice('ko'),
      icon: <FileText className="h-4 w-4" />,
      onClick: () => console.log('견적서 작성'),
      variant: 'outline'
    },
    {
      id: 'add-client',
      label: getWidgetText.quickActions.actions.addClient('ko'),
      icon: <Users className="h-4 w-4" />,
      onClick: () => console.log('고객 추가'),
      variant: 'outline'
    }
  ];
  
  const displayActions = actions || defaultActions;
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        <div className="flex flex-col gap-2">
          {displayActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              className="w-full justify-between"
              onClick={action.onClick}
            >
              <span className="flex items-center gap-2">
                {action.icon}
                {action.label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
