'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatsData } from '@/types/dashboard';

interface StatsWidgetProps {
  title?: string;
  stats: StatsData[];
}

const iconMap: Record<string, React.ReactNode> = {
  revenue: <DollarSign className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  orders: <ShoppingCart className="h-4 w-4" />,
  conversion: <Activity className="h-4 w-4" />,
};

export function StatsWidget({ title = "통계 대시보드", stats }: StatsWidgetProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {stat.icon || iconMap[stat.label.toLowerCase()] || <Activity className="h-4 w-4" />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
              {stat.change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
