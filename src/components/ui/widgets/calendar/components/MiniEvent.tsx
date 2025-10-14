'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { eventTypeConfig, type MiniEventProps } from '../types';

/**
 * MiniEvent Component
 * 캘린더 내에서 이벤트를 표시하는 컴팩트한 컴포넌트
 * Google Calendar 스타일의 반응형 디자인
 */
const MiniEvent = React.memo(({
  event,
  onClick,
  displayMode = 'bar',
  isDragging = false // 드래그 중일 때 transition 비활성화
}: MiniEventProps) => {
  // 안전한 config 가져오기: event.type이 undefined, null, 빈 문자열이거나 존재하지 않는 타입이면 'other' 사용
  const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.other;

  // 점 표시 모드 (아주 작은 높이)
  if (displayMode === 'dot') {
    return (
      <div
        className="inline-flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.color)} />
      </div>
    );
  }

  // 컴팩트 모드 (작은 높이)
  if (displayMode === 'compact') {
    return (
      <div
        className={cn(
          "text-[9px] leading-none px-0.5 py-[1px] rounded-sm truncate cursor-pointer hover:opacity-80",
          !isDragging && "transition-opacity", // 드래그 중이 아닐 때만 transition
          config.color,
          "text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  // 바 모드 (중간 높이 - 기본값)
  if (displayMode === 'bar') {
    return (
      <div
        className={cn(
          "text-[10px] px-0.5 py-[1px] rounded-sm truncate cursor-pointer hover:opacity-80",
          !isDragging && "transition-opacity", // 드래그 중이 아닐 때만 transition
          config.color,
          "text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        {event.startTime && !event.allDay && (
          <span className="font-medium">{event.startTime.slice(0,5)} </span>
        )}
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  // 풀 모드 (큰 높이)
  return (
    <div
      className={cn(
        "text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
        !isDragging && "transition-opacity", // 드래그 중이 아닐 때만 transition
        config.color,
        "text-white"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={`${event.startTime || ''} ${event.title}`}
    >
      {event.startTime && !event.allDay && (
        <span className="font-medium">{event.startTime} </span>
      )}
      <span>{event.title}</span>
    </div>
  );
});

MiniEvent.displayName = 'MiniEvent';

export default MiniEvent;