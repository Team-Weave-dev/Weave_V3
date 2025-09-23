'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, ChevronRight } from 'lucide-react';
import type { QuickAction } from '@/types/dashboard';

interface QuickActionsWidgetProps {
  title?: string;
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-project',
    label: '새 프로젝트',
    icon: <Plus className="h-4 w-4" />,
    onClick: () => console.log('새 프로젝트'),
    variant: 'default'
  },
  {
    id: 'new-invoice',
    label: '견적서 작성',
    icon: <FileText className="h-4 w-4" />,
    onClick: () => console.log('견적서 작성'),
    variant: 'outline'
  },
  {
    id: 'add-client',
    label: '고객 추가',
    icon: <Users className="h-4 w-4" />,
    onClick: () => console.log('고객 추가'),
    variant: 'outline'
  }
];

export function QuickActionsWidget({ 
  title = "빠른 작업", 
  actions = defaultActions 
}: QuickActionsWidgetProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
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
