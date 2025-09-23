'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { ChartData } from '@/types/dashboard';

interface ChartWidgetProps {
  title?: string;
  subtitle?: string;
  data: ChartData;
}

export function ChartWidget({ title, subtitle, data }: ChartWidgetProps) {
  const displayTitle = title || getWidgetText.chart.title('ko');
  const displaySubtitle = subtitle || getWidgetText.chart.subtitle('ko');
  
  // 간단한 막대 차트 구현
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
          {displaySubtitle && <p className={typography.text.description}>{displaySubtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        <div className="h-48 flex items-end gap-2">
          {data.labels.map((label, index) => {
            const value1 = data.datasets[0]?.data[index] || 0;
            const value2 = data.datasets[1]?.data[index] || 0;
            const height1 = (value1 / maxValue) * 100;
            const height2 = (value2 / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1" style={{ height: '150px' }}>
                  <div className="flex-1 flex items-end">
                    <div 
                      className="w-full bg-primary/80 rounded-t"
                      style={{ height: `${height1}%` }}
                    />
                  </div>
                  {data.datasets[1] && (
                    <div className="flex-1 flex items-end">
                      <div 
                        className="w-full bg-primary/40 rounded-t"
                        style={{ height: `${height2}%` }}
                      />
                    </div>
                  )}
                </div>
                <span className={typography.widget.caption}>{label}</span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded",
                index === 0 ? "bg-primary/80" : "bg-primary/40"
              )} />
              <span className={typography.widget.label}>{dataset.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
