/**
 * 개선된 대시보드 스토어
 * 단순화되고 최적화된 상태 관리
 * 브레이크포인트별 레이아웃 지원
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ImprovedWidget, DashboardConfig, DashboardEditState, BreakpointKey, BreakpointLayouts, DashboardPreset, DashboardPresetMeta } from '@/types/improved-dashboard';
import { GridPosition, checkCollisionWithItems, constrainToBounds, findEmptySpace, compactLayout, optimizeLayout, checkCollision } from '@/lib/dashboard/grid-utils';
import { getBreakpointForWidth, getColsForBreakpoint } from '@/lib/dashboard/breakpoint-utils';
import { dashboardService } from '@/lib/storage';
import { useStorageInitStore } from './useStorageInitStore';

interface ImprovedDashboardStore {
  // 초기화 상태
  isInitialized: boolean;

  // 브레이크포인트별 레이아웃
  currentBreakpoint: BreakpointKey;
  layouts: BreakpointLayouts;

  // 설정
  config: DashboardConfig;

  // 편집 상태
  editState: DashboardEditState;

  // 브레이크포인트 액션
  setCurrentBreakpoint: (bp: BreakpointKey) => void;
  setLayoutForBreakpoint: (bp: BreakpointKey, widgets: ImprovedWidget[]) => void;
  getLayoutForBreakpoint: (bp: BreakpointKey) => ImprovedWidget[];

  // 위젯 액션 (현재 브레이크포인트에 작용)
  setWidgets: (widgets: ImprovedWidget[]) => void;
  addWidget: (widget: ImprovedWidget) => void;
  updateWidget: (id: string, updates: Partial<ImprovedWidget>) => void;
  updateWidgetPosition: (id: string, position: GridPosition) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: GridPosition) => void;
  resizeWidget: (id: string, position: GridPosition) => void;
  resizeWidgetWithPush: (id: string, position: GridPosition) => void;
  resizeWidgetWithShrink: (id: string, position: GridPosition) => void;
  resizeWidgetSmart: (id: string, position: GridPosition) => void;
  swapWidgets: (id1: string, id2: string) => void;
  moveWidgetWithPush: (id: string, position: GridPosition) => void;

  // 레이아웃 액션
  compactWidgets: (compactType?: 'vertical' | 'horizontal') => void;
  optimizeWidgetLayout: () => void;
  findSpaceForWidget: (width: number, height: number) => GridPosition | null;
  checkCollision: (widgetId: string, position: GridPosition) => boolean;

  // 설정 액션
  updateConfig: (config: Partial<DashboardConfig>) => void;
  setColumns: (cols: number) => void;
  setRowHeight: (height: number) => void;
  setGap: (gap: number) => void;

  // 편집 모드 액션
  enterEditMode: () => void;
  exitEditMode: () => void;
  startDragging: (widgetId: string, position: GridPosition) => void;
  updateDragging: (position: GridPosition) => void;
  stopDragging: () => void;
  startResizing: (widgetId: string, position: GridPosition) => void;
  updateResizing: (position: GridPosition) => void;
  stopResizing: () => void;
  selectWidget: (widgetId: string | null) => void;
  setHoveredPosition: (position: GridPosition | null) => void;
  setDragOverWidget: (widgetId: string | null) => void;

  // 유틸리티 액션
  resetStore: () => void;
  exportLayout: () => string;
  importLayout: (layoutJson: string) => void;

  // 프리셋 관리 액션
  savePreset: (name: string, description?: string) => Promise<DashboardPreset>;
  loadPreset: (presetId: string) => Promise<void>;
  deletePreset: (presetId: string) => Promise<void>;
  listPresets: () => Promise<DashboardPresetMeta[]>;
  getPresetById: (presetId: string) => Promise<DashboardPreset | null>;
}

// 초기 설정
const initialConfig: DashboardConfig = {
  cols: 9,
  rowHeight: 120,
  gap: 16,
  // maxRows 제거 - 세로 무한 확장 허용
  isDraggable: true,
  isResizable: true,
  preventCollision: true,
  allowOverlap: false,
  compactType: 'vertical',
  useCSSTransforms: true,
  transformScale: 1,
  resizeHandles: ['se'],
  isDroppable: false,
};

// 초기 편집 상태
const initialEditState: DashboardEditState = {
  isEditMode: false,
  isDragging: false,
  isResizing: false,
  selectedWidgetId: null,
  draggedWidget: null,
  resizingWidget: null,
  hoveredPosition: null,
  dragOverWidgetId: null,
};

// Zustand 스토어 생성 (Storage API 연동)
export const useImprovedDashboardStore = create<ImprovedDashboardStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        // 초기 상태
        isInitialized: false,
        currentBreakpoint: 'desktop' as BreakpointKey,
        layouts: {
          desktop: [],
          tablet: [],
          mobile: []
        },
        config: initialConfig,
        editState: initialEditState,

        // 브레이크포인트 액션
        setCurrentBreakpoint: (bp) => set((state) => {
          state.currentBreakpoint = bp;
          const cols = getColsForBreakpoint(bp);
          state.config.cols = cols;
        }),

        setLayoutForBreakpoint: (bp, widgets) => set((state) => {
          state.layouts[bp] = widgets;
        }),

        getLayoutForBreakpoint: (bp) => {
          const state = get();
          return state.layouts[bp] || [];
        },

        // 위젯 액션 (현재 브레이크포인트에 작용)
        setWidgets: (widgets) => set((state) => {
          state.layouts[state.currentBreakpoint] = widgets;
        }),

        addWidget: (widget) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];

          // ID 중복 방지: 동일 ID가 이미 있으면 추가하지 않음
          if (currentWidgets.some(w => w.id === widget.id)) {
            console.log(`Widget with ID ${widget.id} already exists, skipping`);
            return;
          }

          // 충돌 체크
          const positions = currentWidgets.map(w => w.position);
          if (!checkCollisionWithItems(widget.position, positions)) {
            state.layouts[state.currentBreakpoint] = [...currentWidgets, widget];
          } else {
            // 충돌 시 빈 공간 찾기
            const emptySpace = findEmptySpace(
              widget.position.w,
              widget.position.h,
              positions,
              state.config
            );
            if (emptySpace) {
              state.layouts[state.currentBreakpoint] = [...currentWidgets, { ...widget, position: emptySpace }];
            } else {
              console.warn('No empty space for new widget');
            }
          }
        }),

        updateWidget: (id, updates) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const index = currentWidgets.findIndex(w => w.id === id);
          if (index !== -1) {
            const updated = [...currentWidgets];
            updated[index] = { ...updated[index], ...updates };
            state.layouts[state.currentBreakpoint] = updated;
          }
        }),

        updateWidgetPosition: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const index = currentWidgets.findIndex(w => w.id === id);
          if (index !== -1) {
            const constrained = constrainToBounds(position, state.config);
            const updated = [...currentWidgets];
            updated[index] = { ...updated[index], position: constrained };
            state.layouts[state.currentBreakpoint] = updated;
          }
        }),

        removeWidget: (id) => set((state) => {
          // 현재 브레이크포인트에서만 제거
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          state.layouts[state.currentBreakpoint] = currentWidgets.filter(w => w.id !== id);

          // 편집 상태 정리
          if (state.editState.selectedWidgetId === id) {
            state.editState.selectedWidgetId = null;
          }
          if (state.editState.draggedWidget?.id === id) {
            state.editState.draggedWidget = null;
            state.editState.isDragging = false;
          }
          if (state.editState.resizingWidget?.id === id) {
            state.editState.resizingWidget = null;
            state.editState.isResizing = false;
          }
        }),

        moveWidget: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widget = currentWidgets.find(w => w.id === id);
          if (!widget) return;

          // 충돌 체크 (자기 자신 제외)
          if (state.config.preventCollision) {
            const otherPositions = currentWidgets
              .filter(w => w.id !== id)
              .map(w => w.position);

            if (checkCollisionWithItems(position, otherPositions)) {
              return; // 충돌 시 이동 취소
            }
          }

          // 경계 내로 제한
          const constrained = constrainToBounds(position, state.config);
          const index = currentWidgets.findIndex(w => w.id === id);
          if (index !== -1) {
            const updated = [...currentWidgets];
            updated[index] = { ...updated[index], position: constrained };
            state.layouts[state.currentBreakpoint] = updated;
          }
        }),

        resizeWidget: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widget = currentWidgets.find(w => w.id === id);
          if (!widget) return;

          // 최소/최대 크기 적용
          let { x, y, w, h } = position;
          if (widget.minW) w = Math.max(w, widget.minW);
          if (widget.maxW) w = Math.min(w, widget.maxW);
          if (widget.minH) h = Math.max(h, widget.minH);
          if (widget.maxH) h = Math.min(h, widget.maxH);

          const newPosition = { x, y, w, h };

          // 충돌 체크
          if (state.config.preventCollision) {
            const otherPositions = currentWidgets
              .filter(w => w.id !== id)
              .map(w => w.position);

            if (checkCollisionWithItems(newPosition, otherPositions)) {
              return; // 충돌 시 크기 조정 취소
            }
          }

          // 경계 내로 제한
          const constrained = constrainToBounds(newPosition, state.config);
          const index = currentWidgets.findIndex(w => w.id === id);
          if (index !== -1) {
            const updated = [...currentWidgets];
            updated[index] = { ...updated[index], position: constrained };
            state.layouts[state.currentBreakpoint] = updated;
          }
        }),

        resizeWidgetWithPush: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widgetIndex = currentWidgets.findIndex(w => w.id === id);
          if (widgetIndex === -1) return;

          const widget = currentWidgets[widgetIndex];

          // 최소/최대 크기 적용
          let { x, y, w, h } = position;
          if (widget.minW) w = Math.max(w, widget.minW);
          if (widget.maxW) w = Math.min(w, widget.maxW);
          if (widget.minH) h = Math.max(h, widget.minH);
          if (widget.maxH) h = Math.min(h, widget.maxH);

          const newPosition = constrainToBounds({ x, y, w, h }, state.config);
          const positions = currentWidgets.map(w => ({ ...w.position }));
          positions[widgetIndex] = newPosition;

          // 크기 증가로 인한 충돌 위젯들을 밀어냄
          const queue: number[] = [widgetIndex];
          const processed = new Set<number>();
          const maxGuard = 1000;
          let guard = 0;

          while (queue.length > 0 && guard++ < maxGuard) {
            const currentIndex = queue.shift()!;
            if (processed.has(currentIndex)) continue;
            processed.add(currentIndex);

            const currentPos = positions[currentIndex];

            for (let i = 0; i < positions.length; i++) {
              if (i === currentIndex || processed.has(i)) continue;

              if (checkCollision(currentPos, positions[i])) {
                // static 위젯은 움직이지 않음
                if (currentWidgets[i].static) continue;

                // 충돌한 위젯을 밀어냄
                const deltaY = currentPos.y + currentPos.h - positions[i].y;
                const deltaX = currentPos.x + currentPos.w - positions[i].x;

                // 세로 방향 우선 밀어내기
                if (deltaY <= positions[i].h) {
                  positions[i] = constrainToBounds({
                    ...positions[i],
                    y: currentPos.y + currentPos.h
                  }, state.config);
                } else if (deltaX <= positions[i].w) {
                  // 가로 방향으로 밀어내기
                  positions[i] = constrainToBounds({
                    ...positions[i],
                    x: currentPos.x + currentPos.w
                  }, state.config);
                }

                queue.push(i);
              }
            }
          }

          // 모든 위젯 위치 업데이트
          state.layouts[state.currentBreakpoint] = currentWidgets.map((w, i) => ({
            ...w,
            position: positions[i]
          }));
        }),

        resizeWidgetWithShrink: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widgetIndex = currentWidgets.findIndex(w => w.id === id);
          if (widgetIndex === -1) return;

          const widget = currentWidgets[widgetIndex];

          // 최소/최대 크기 적용
          let { x, y, w, h } = position;
          if (widget.minW) w = Math.max(w, widget.minW);
          if (widget.maxW) w = Math.min(w, widget.maxW);
          if (widget.minH) h = Math.max(h, widget.minH);
          if (widget.maxH) h = Math.min(h, widget.maxH);

          const newPosition = constrainToBounds({ x, y, w, h }, state.config);
          const positions = currentWidgets.map(w => ({ ...w.position }));
          positions[widgetIndex] = newPosition;

          // 충돌하는 위젯들의 크기를 줄임
          for (let i = 0; i < positions.length; i++) {
            if (i === widgetIndex) continue;

            if (checkCollision(newPosition, positions[i])) {
              const targetWidget = currentWidgets[i];

              // static 위젯은 크기 조정 안함
              if (targetWidget.static) {
                // static 위젯과 충돌 시 리사이즈 취소
                return;
              }

              // 충돌 영역 계산
              const overlapRight = newPosition.x + newPosition.w - positions[i].x;
              const overlapBottom = newPosition.y + newPosition.h - positions[i].y;

              // 크기를 줄일 수 있는지 확인
              const canShrinkHorizontally =
                targetWidget.minW ? positions[i].w - overlapRight >= targetWidget.minW : positions[i].w > overlapRight;
              const canShrinkVertically =
                targetWidget.minH ? positions[i].h - overlapBottom >= targetWidget.minH : positions[i].h > overlapBottom;

              if (canShrinkHorizontally && overlapRight < positions[i].w) {
                // 가로 크기 줄이기
                positions[i] = {
                  ...positions[i],
                  x: newPosition.x + newPosition.w,
                  w: positions[i].w - overlapRight
                };
              } else if (canShrinkVertically && overlapBottom < positions[i].h) {
                // 세로 크기 줄이기
                positions[i] = {
                  ...positions[i],
                  y: newPosition.y + newPosition.h,
                  h: positions[i].h - overlapBottom
                };
              } else {
                // 크기를 줄일 수 없으면 위치 이동
                if (overlapBottom < overlapRight) {
                  positions[i] = constrainToBounds({
                    ...positions[i],
                    y: newPosition.y + newPosition.h
                  }, state.config);
                } else {
                  positions[i] = constrainToBounds({
                    ...positions[i],
                    x: newPosition.x + newPosition.w
                  }, state.config);
                }
              }
            }
          }

          // 모든 위젯 위치 업데이트
          state.layouts[state.currentBreakpoint] = currentWidgets.map((w, i) => ({
            ...w,
            position: positions[i]
          }));
        }),

        resizeWidgetSmart: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widgetIndex = currentWidgets.findIndex(w => w.id === id);
          if (widgetIndex === -1) return;

          const widget = currentWidgets[widgetIndex];

          // 최소/최대 크기 적용
          let { x, y, w, h } = position;
          if (widget.minW) w = Math.max(w, widget.minW);
          if (widget.maxW) w = Math.min(w, widget.maxW);
          if (widget.minH) h = Math.max(h, widget.minH);
          if (widget.maxH) h = Math.min(h, widget.maxH);

          const newPosition = constrainToBounds({ x, y, w, h }, state.config);
          const positions = currentWidgets.map(w => ({ ...w.position }));
          const minSizes = currentWidgets.map(w => ({
            minW: w.minW || 1,
            minH: w.minH || 1
          }));

          positions[widgetIndex] = newPosition;

          // 충돌 처리 큐 - 연쇄 충돌 처리를 위해
          const queue: { index: number, attempts: number }[] = [{ index: widgetIndex, attempts: 0 }];
          const processed = new Set<string>();
          const maxGuard = 1000;
          let guard = 0;

          while (queue.length > 0 && guard++ < maxGuard) {
            const { index: currentIndex, attempts } = queue.shift()!;
            const key = `${currentIndex}-${attempts}`;

            if (processed.has(key)) continue;
            processed.add(key);

            const currentPos = positions[currentIndex];

            // 이 위젯과 충돌하는 모든 위젯 찾기
            const collisions: number[] = [];
            for (let i = 0; i < positions.length; i++) {
              if (i === currentIndex) continue;
              if (checkCollision(currentPos, positions[i])) {
                collisions.push(i);
              }
            }

            // 충돌하는 위젯들 처리
            for (const targetIndex of collisions) {
              const targetWidget = currentWidgets[targetIndex];
              const targetPos = positions[targetIndex];

              // static 위젯은 움직이지 않음
              if (targetWidget.static) continue;

              // 충돌 영역 계산
              const overlapX = Math.min(currentPos.x + currentPos.w, targetPos.x + targetPos.w) -
                              Math.max(currentPos.x, targetPos.x);
              const overlapY = Math.min(currentPos.y + currentPos.h, targetPos.y + targetPos.h) -
                              Math.max(currentPos.y, targetPos.y);

              // 스마트 전략 결정: 겹침 정도와 최소 크기를 고려
              let resolved = false;

              // 1. 먼저 크기 축소 시도 (겹침이 작을 때)
              if (overlapX < targetPos.w / 2 || overlapY < targetPos.h / 2) {
                // 가로 축소 가능한지 확인
                if (overlapX < targetPos.w && targetPos.w - overlapX >= minSizes[targetIndex].minW) {
                  // 오른쪽에서 겹치면 왼쪽으로 축소
                  if (currentPos.x > targetPos.x) {
                    positions[targetIndex] = {
                      ...targetPos,
                      w: currentPos.x - targetPos.x
                    };
                    resolved = true;
                  }
                }

                // 세로 축소 가능한지 확인
                if (!resolved && overlapY < targetPos.h && targetPos.h - overlapY >= minSizes[targetIndex].minH) {
                  // 아래에서 겹치면 위로 축소
                  if (currentPos.y > targetPos.y) {
                    positions[targetIndex] = {
                      ...targetPos,
                      h: currentPos.y - targetPos.y
                    };
                    resolved = true;
                  }
                }
              }

              // 2. 축소가 불가능하면 밀어내기
              if (!resolved) {
                // 세로/가로 중 더 적게 밀어낼 수 있는 방향 선택
                const pushDown = currentPos.y + currentPos.h;
                const pushRight = currentPos.x + currentPos.w;

                // 그리드 경계 체크
                const canPushDown = true; // 세로 무한 확장 허용
                const canPushRight = pushRight + targetPos.w <= state.config.cols;

                if (canPushDown && (!canPushRight || overlapY < overlapX)) {
                  // 아래로 밀기
                  positions[targetIndex] = constrainToBounds({
                    ...targetPos,
                    y: pushDown
                  }, state.config);

                  // 밀린 위젯도 연쇄 충돌 체크 대상에 추가
                  queue.push({ index: targetIndex, attempts: attempts + 1 });
                } else if (canPushRight) {
                  // 오른쪽으로 밀기
                  positions[targetIndex] = constrainToBounds({
                    ...targetPos,
                    x: pushRight
                  }, state.config);

                  // 밀린 위젯도 연쇄 충돌 체크 대상에 추가
                  queue.push({ index: targetIndex, attempts: attempts + 1 });
                } else {
                  // 둘 다 불가능하면 최소 크기로 축소 후 밀기
                  if (targetPos.h > minSizes[targetIndex].minH) {
                    positions[targetIndex] = {
                      ...targetPos,
                      h: minSizes[targetIndex].minH,
                      y: pushDown
                    };
                  } else if (targetPos.w > minSizes[targetIndex].minW) {
                    positions[targetIndex] = {
                      ...targetPos,
                      w: minSizes[targetIndex].minW,
                      x: pushRight
                    };
                  }
                  // 그래도 충돌하면 강제로 아래로 밀기 (그리드 확장)
                  else {
                    positions[targetIndex] = {
                      ...targetPos,
                      y: pushDown
                    };
                  }

                  queue.push({ index: targetIndex, attempts: attempts + 1 });
                }
              }
            }
          }

          // 모든 위젯 위치 업데이트
          state.layouts[state.currentBreakpoint] = currentWidgets.map((w, i) => ({
            ...w,
            position: positions[i]
          }));
        }),

        moveWidgetWithPush: (id, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const index = currentWidgets.findIndex(w => w.id === id);
          if (index === -1) return;
          const config = state.config;
          const positions = currentWidgets.map(w => ({ ...w.position }));

          positions[index] = constrainToBounds(position, config);

          const queue: number[] = [index];
          const maxGuard = 2000;
          let guard = 0;
          while (queue.length && guard++ < maxGuard) {
            const cur = queue.shift()!;
            const curPos = positions[cur];
            for (let i = 0; i < positions.length; i++) {
              if (i === cur) continue;
              if (checkCollision(curPos, positions[i])) {
                if (currentWidgets[i].static) {
                  const newY = positions[i].y + positions[i].h;
                  positions[cur] = constrainToBounds({ ...positions[cur], y: newY }, config);
                  queue.push(cur);
                } else {
                  const newY = curPos.y + curPos.h;
                  positions[i] = constrainToBounds({ ...positions[i], y: newY }, config);
                  queue.push(i);
                }
              }
            }
          }

          state.layouts[state.currentBreakpoint] = currentWidgets.map((w, i) => ({ ...w, position: positions[i] }));
        }),

        swapWidgets: (id1, id2) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const index1 = currentWidgets.findIndex(w => w.id === id1);
          const index2 = currentWidgets.findIndex(w => w.id === id2);
          if (index1 === -1 || index2 === -1) return;
          const config = state.config;
          const positions = currentWidgets.map(w => ({ ...w.position }));

          const pos1 = { ...positions[index1] };
          const pos2 = { ...positions[index2] };
          positions[index1] = { x: pos2.x, y: pos2.y, w: pos1.w, h: pos1.h };
          positions[index2] = { x: pos1.x, y: pos1.y, w: pos2.w, h: pos2.h };

          // 충돌 시 아래 방향으로 밀어내며 해소
          const queue: number[] = [index1, index2];
          const maxGuard = 1000;
          let guard = 0;
          while (queue.length && guard++ < maxGuard) {
            const cur = queue.shift()!;
            const curPos = positions[cur];
            for (let i = 0; i < positions.length; i++) {
              if (i === cur) continue;
              if (checkCollision(curPos, positions[i])) {
                if (currentWidgets[i].static) {
                  const newY = positions[i].y + positions[i].h;
                  positions[cur] = constrainToBounds({ ...positions[cur], y: newY }, config);
                  queue.push(cur);
                } else {
                  const newY = curPos.y + curPos.h;
                  positions[i] = constrainToBounds({ ...positions[i], y: newY }, config);
                  queue.push(i);
                }
              }
            }
          }

          state.layouts[state.currentBreakpoint] = currentWidgets.map((w, i) => ({ ...w, position: positions[i] }));
        }),

        // 레이아웃 액션
        compactWidgets: (compactType = 'vertical') => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          console.log('🎯 compactWidgets 호출:', { compactType, widgetCount: currentWidgets.length });

          if (!compactType) return;

          // 정렬 전 Y 값을 명확하게 출력 (배열이 접히지 않도록)
          const beforeY = currentWidgets.map(w => w.position.y);
          console.log('📍 정렬 전 Y 값 배열:', beforeY);
          console.log('📍 정렬 전 위젯 상세:');
          currentWidgets.forEach(w => {
            console.log(`  - ${w.type} (id: ${w.id.substring(0, 8)}): y=${w.position.y}, h=${w.position.h}, 점유 행=[${w.position.y} ~ ${w.position.y + w.position.h - 1}]`);
          });

          const positions = currentWidgets.map(w => w.position);
          const compacted = compactLayout(positions, state.config, compactType);

          state.layouts[state.currentBreakpoint] = currentWidgets.map((widget, index) => ({
            ...widget,
            position: compacted[index],
          }));

          // 정렬 후 Y 값을 명확하게 출력
          const updatedWidgets = state.layouts[state.currentBreakpoint] || [];
          const afterY = updatedWidgets.map(w => w.position.y);
          console.log('📍 정렬 후 Y 값 배열:', afterY);
          console.log('📍 정렬 후 위젯 상세:');
          updatedWidgets.forEach(w => {
            console.log(`  - ${w.type} (id: ${w.id.substring(0, 8)}): y=${w.position.y}, h=${w.position.h}, 점유 행=[${w.position.y} ~ ${w.position.y + w.position.h - 1}]`);
          });

          // 변화가 있었는지 확인
          const hasChanges = beforeY.some((y, i) => y !== afterY[i]);
          console.log('✨ 정렬 결과:', hasChanges ? '✅ 위젯이 이동했습니다!' : '⚠️ 위젯이 이미 정렬되어 있습니다 (이동 없음)');

          if (!hasChanges) {
            console.log('💡 힌트: 위젯들이 이미 y=0부터 연속적으로 배치되어 있어서 정렬할 필요가 없습니다.');
          }
        }),

        // 위치 최적화 액션 (좌우 공간 활용)
        optimizeWidgetLayout: () => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          console.log('🎯 optimizeWidgetLayout 호출:', { widgetCount: currentWidgets.length });

          // 최적화 전 위치 출력
          console.log('📍 최적화 전 위젯 상세:');
          currentWidgets.forEach(w => {
            console.log(`  - ${w.type} (id: ${w.id.substring(0, 8)}): x=${w.position.x}, y=${w.position.y}, w=${w.position.w}, h=${w.position.h}`);
          });

          const positions = currentWidgets.map(w => w.position);
          const optimized = optimizeLayout(positions, state.config);

          state.layouts[state.currentBreakpoint] = currentWidgets.map((widget, index) => ({
            ...widget,
            position: optimized[index],
          }));

          // 최적화 후 위치 출력
          const updatedWidgets = state.layouts[state.currentBreakpoint] || [];
          console.log('📍 최적화 후 위젯 상세:');
          updatedWidgets.forEach(w => {
            console.log(`  - ${w.type} (id: ${w.id.substring(0, 8)}): x=${w.position.x}, y=${w.position.y}, w=${w.position.w}, h=${w.position.h}`);
          });

          console.log('✨ 위치 최적화 완료!');
        }),

        findSpaceForWidget: (width, height) => {
          const state = get();
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const positions = currentWidgets.map(w => w.position);
          return findEmptySpace(width, height, positions, state.config);
        },

        checkCollision: (widgetId, position) => {
          const state = get();
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const otherPositions = currentWidgets
            .filter(w => w.id !== widgetId && !w.static) // static 위젯도 제외
            .map(w => w.position);
          return checkCollisionWithItems(position, otherPositions);
        },

        // 설정 액션
        updateConfig: (config) => set((state) => {
          state.config = { ...state.config, ...config };
        }),

        setColumns: (cols) => set((state) => {
          state.config.cols = cols;
        }),

        setRowHeight: (height) => set((state) => {
          state.config.rowHeight = height;
        }),

        setGap: (gap) => set((state) => {
          state.config.gap = gap;
        }),

        // 편집 모드 액션
        enterEditMode: () => set((state) => {
          state.editState.isEditMode = true;
        }),

        exitEditMode: () => set((state) => {
          state.editState = {
            ...initialEditState,
            isEditMode: false,
          };
        }),

        startDragging: (widgetId, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widget = currentWidgets.find(w => w.id === widgetId);
          if (widget) {
            state.editState.isDragging = true;
            state.editState.draggedWidget = {
              id: widgetId,
              originalPosition: widget.position,
              currentPosition: position,
            };
          }
        }),

        updateDragging: (position) => set((state) => {
          if (state.editState.draggedWidget) {
            // 드래그 중에는 시각적 위치만 업데이트 (실제 위젯 position은 변경하지 않음)
            const constrained = constrainToBounds(position, state.config);
            state.editState.draggedWidget.currentPosition = constrained;
          }
        }),

        stopDragging: () => set((state) => {
          state.editState.isDragging = false;
          state.editState.draggedWidget = null;
          state.editState.hoveredPosition = null;
          state.editState.dragOverWidgetId = null;
        }),

        startResizing: (widgetId, position) => set((state) => {
          const currentWidgets = state.layouts[state.currentBreakpoint] || [];
          const widget = currentWidgets.find(w => w.id === widgetId);
          if (widget) {
            state.editState.isResizing = true;
            state.editState.resizingWidget = {
              id: widgetId,
              originalPosition: widget.position,
              currentPosition: position,
            };
          }
        }),

        updateResizing: (position) => set((state) => {
          if (state.editState.resizingWidget) {
            const currentWidgets = state.layouts[state.currentBreakpoint] || [];
            // 리사이즈 중에는 실제 위젯 상태를 변경하지 않고 미리보기만 업데이트
            const index = currentWidgets.findIndex(
              w => w.id === state.editState.resizingWidget!.id
            );
            if (index !== -1) {
              const widget = currentWidgets[index];
              let { x, y, w, h } = position;
              if (widget.minW) w = Math.max(w, widget.minW);
              if (widget.maxW) w = Math.min(w, widget.maxW);
              if (widget.minH) h = Math.max(h, widget.minH);
              if (widget.maxH) h = Math.min(h, widget.maxH);
              state.editState.resizingWidget.currentPosition = constrainToBounds({ x, y, w, h }, state.config);
            } else {
              state.editState.resizingWidget.currentPosition = constrainToBounds(position, state.config);
            }
          }
        }),

        stopResizing: () => set((state) => {
          state.editState.isResizing = false;
          state.editState.resizingWidget = null;
        }),

        selectWidget: (widgetId) => set((state) => {
          state.editState.selectedWidgetId = widgetId;
        }),

        setHoveredPosition: (position) => set((state) => {
          state.editState.hoveredPosition = position;
        }),

        setDragOverWidget: (widgetId) => set((state) => {
          state.editState.dragOverWidgetId = widgetId;
        }),

        // 유틸리티 액션
        resetStore: () => set((state) => {
          state.layouts = {};
          state.currentBreakpoint = 'desktop';
          state.config = initialConfig;
          state.editState = initialEditState;
        }),

        exportLayout: () => {
          const state = get();
          return JSON.stringify({
            currentBreakpoint: state.currentBreakpoint,
            layouts: state.layouts,
            config: state.config,
          }, null, 2);
        },

        importLayout: (layoutJson) => set((state) => {
          try {
            const data = JSON.parse(layoutJson);
            if (data.currentBreakpoint) {
              state.currentBreakpoint = data.currentBreakpoint;
            }
            if (data.layouts) {
              state.layouts = data.layouts;
            }
            if (data.config) {
              state.config = { ...state.config, ...data.config };
            }
          } catch (error) {
            console.error('Failed to import layout:', error);
          }
        }),

        // 프리셋 관리 액션
        savePreset: async (name, description) => {
          const state = get();
          const preset: DashboardPreset = {
            id: `preset_${Date.now()}`,
            name,
            description,
            layouts: JSON.parse(JSON.stringify(state.layouts)), // Deep copy
            config: JSON.parse(JSON.stringify(state.config)),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // LocalStorage에서 기존 프리셋 로드
          const presets = await get().listPresets();
          const fullPresets = await Promise.all(
            presets.map(p => get().getPresetById(p.id))
          );
          const existingPresets = fullPresets.filter((p): p is DashboardPreset => p !== null);

          // 최대 3개 제한
          if (existingPresets.length >= 3) {
            // 가장 오래된 프리셋 제거
            const oldest = existingPresets.sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )[0];
            await get().deletePreset(oldest.id);
            existingPresets.splice(existingPresets.indexOf(oldest), 1);
          }

          // 새 프리셋 추가
          const updatedPresets = [...existingPresets, preset];
          localStorage.setItem('weave-dashboard-presets', JSON.stringify(updatedPresets));

          console.log('✅ Preset saved:', { id: preset.id, name });
          return preset;
        },

        loadPreset: async (presetId) => {
          const preset = await get().getPresetById(presetId);
          if (!preset) {
            throw new Error(`Preset not found: ${presetId}`);
          }

          set((state) => {
            state.layouts = JSON.parse(JSON.stringify(preset.layouts));
            state.config = { ...state.config, ...preset.config };
          });

          console.log('✅ Preset loaded:', { id: preset.id, name: preset.name });
        },

        deletePreset: async (presetId) => {
          const presets = await get().listPresets();
          const fullPresets = await Promise.all(
            presets.map(p => get().getPresetById(p.id))
          );
          const existingPresets = fullPresets.filter((p): p is DashboardPreset => p !== null);

          const updatedPresets = existingPresets.filter(p => p.id !== presetId);
          localStorage.setItem('weave-dashboard-presets', JSON.stringify(updatedPresets));

          console.log('✅ Preset deleted:', presetId);
        },

        listPresets: async () => {
          try {
            const stored = localStorage.getItem('weave-dashboard-presets');
            if (!stored) return [];

            const presets: DashboardPreset[] = JSON.parse(stored);
            return presets.map(p => {
              const totalWidgets = Object.values(p.layouts).reduce(
                (sum, widgets) => sum + (widgets?.length || 0),
                0
              );
              return {
                id: p.id,
                name: p.name,
                description: p.description,
                widgetCount: totalWidgets,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
              };
            });
          } catch (error) {
            console.error('Failed to list presets:', error);
            return [];
          }
        },

        getPresetById: async (presetId) => {
          try {
            const stored = localStorage.getItem('weave-dashboard-presets');
            if (!stored) return null;

            const presets: DashboardPreset[] = JSON.parse(stored);
            return presets.find(p => p.id === presetId) || null;
          } catch (error) {
            console.error('Failed to get preset:', error);
            return null;
          }
        },
      })),
      {
        name: 'improved-dashboard-store',
      }
    )
  )
);

// 셀렉터
export const selectWidgets = (state: ImprovedDashboardStore) =>
  state.layouts[state.currentBreakpoint];
export const selectConfig = (state: ImprovedDashboardStore) => state.config;
export const selectEditState = (state: ImprovedDashboardStore) => state.editState;
export const selectIsEditMode = (state: ImprovedDashboardStore) => state.editState.isEditMode;
export const selectSelectedWidget = (state: ImprovedDashboardStore) => {
  const currentWidgets = state.layouts[state.currentBreakpoint];
  return currentWidgets?.find(w => w.id === state.editState.selectedWidgetId);
};

// shallow 비교 export
export { shallow } from 'zustand/shallow';

// ============================================================================
// Storage Integration
// ============================================================================

/**
 * Initialize dashboard store from storage
 * 브레이크포인트별 레이아웃을 로드합니다.
 */
export async function initializeDashboardStore(): Promise<void> {
  // Storage 초기화 대기
  const storageInitialized = useStorageInitStore.getState().isInitialized;
  if (!storageInitialized) {
    console.log('[initializeDashboardStore] Waiting for storage initialization...');
    // Storage가 초기화되지 않았으면 기본 설정으로 시작
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const currentBp = getBreakpointForWidth(viewportWidth);
    useImprovedDashboardStore.setState({
      isInitialized: true,
      currentBreakpoint: currentBp,
      layouts: {},
    });
    return;
  }

  try {
    console.log('🔄 Loading dashboard layout from storage...');
    const data = await dashboardService.load();

    if (data) {
      // 새 형식 데이터 확인 (currentBreakpoint, layouts 포함)
      if (data.currentBreakpoint && data.layouts) {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const currentBp = getBreakpointForWidth(viewportWidth);

        useImprovedDashboardStore.setState({
          isInitialized: true,
          currentBreakpoint: currentBp,
          layouts: data.layouts,
          config: data.config || initialConfig,
        });
        console.log('✅ Dashboard layout loaded (new format):', {
          breakpoint: currentBp,
          availableLayouts: Object.keys(data.layouts),
        });
      } else {
        // 구 형식 데이터 (widgets 배열) - 마이그레이션 필요
        console.log('⚠️ Old format detected, needs migration');
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const currentBp = getBreakpointForWidth(viewportWidth);

        // 임시로 현재 브레이크포인트에 할당
        useImprovedDashboardStore.setState({
          isInitialized: true,
          currentBreakpoint: currentBp,
          layouts: {
            [currentBp]: data.widgets || []
          },
          config: data.config || initialConfig,
        });
        console.log('✅ Dashboard layout loaded (migrated)');
      }
    } else {
      console.log('ℹ️ No saved dashboard layout found, using defaults');
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const currentBp = getBreakpointForWidth(viewportWidth);
      useImprovedDashboardStore.setState({
        isInitialized: true,
        currentBreakpoint: currentBp,
        layouts: {},
      });
    }
  } catch (error) {
    console.error('❌ Failed to load dashboard layout:', error);

    if (error instanceof Error && error.message.includes('Storage not initialized')) {
      console.warn('⚠️ Storage not yet initialized, will use default layout');
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const currentBp = getBreakpointForWidth(viewportWidth);
    useImprovedDashboardStore.setState({
      isInitialized: true,
      currentBreakpoint: currentBp,
      layouts: {},
    });
  }
}

/**
 * Save dashboard data to storage (debounced)
 */
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 300;

function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    const state = useImprovedDashboardStore.getState();
    try {
      // 새 형식으로 저장 (currentBreakpoint, layouts, config)
      const data = {
        currentBreakpoint: state.currentBreakpoint,
        layouts: state.layouts,
        config: state.config
      };
      // TODO: dashboardService.save 시그니처 변경 필요
      // 현재는 임시로 현재 브레이크포인트의 widgets만 저장
      await dashboardService.save(data.layouts[data.currentBreakpoint] || [], data.config);
      console.log('💾 Dashboard layout saved:', {
        breakpoint: data.currentBreakpoint,
        layoutCount: Object.keys(data.layouts).length
      });
    } catch (error) {
      console.error('❌ Failed to save dashboard layout:', error);
    }
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Setup auto-save subscription
 * 브레이크포인트별 레이아웃 변경을 감지하여 자동 저장합니다.
 */
export function setupDashboardAutoSave(): () => void {
  // Subscribe to layouts changes (모든 브레이크포인트)
  const unsubscribeLayouts = useImprovedDashboardStore.subscribe(
    (state) => state.layouts,
    () => debouncedSave(),
    { fireImmediately: false }
  );

  // Subscribe to currentBreakpoint changes
  const unsubscribeBreakpoint = useImprovedDashboardStore.subscribe(
    (state) => state.currentBreakpoint,
    () => debouncedSave(),
    { fireImmediately: false }
  );

  // Subscribe to config changes
  const unsubscribeConfig = useImprovedDashboardStore.subscribe(
    (state) => state.config,
    () => debouncedSave(),
    { fireImmediately: false }
  );

  // Return cleanup function
  return () => {
    unsubscribeLayouts();
    unsubscribeBreakpoint();
    unsubscribeConfig();
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
  };
}
