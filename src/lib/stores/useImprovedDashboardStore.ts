/**
 * 개선된 대시보드 스토어
 * 단순화되고 최적화된 상태 관리
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ImprovedWidget, DashboardConfig, DashboardEditState } from '@/types/improved-dashboard';
import { GridPosition, checkCollisionWithItems, constrainToBounds, findEmptySpace, compactLayout, checkCollision } from '@/lib/dashboard/grid-utils';

interface ImprovedDashboardStore {
  // 위젯 상태
  widgets: ImprovedWidget[];
  
  // 설정
  config: DashboardConfig;
  
  // 편집 상태
  editState: DashboardEditState;
  
  // 위젯 액션
  setWidgets: (widgets: ImprovedWidget[]) => void;
  addWidget: (widget: ImprovedWidget) => void;
  updateWidget: (id: string, updates: Partial<ImprovedWidget>) => void;
  updateWidgetPosition: (id: string, position: GridPosition) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: GridPosition) => void;
  resizeWidget: (id: string, position: GridPosition) => void;
  swapWidgets: (id1: string, id2: string) => void;
  moveWidgetWithPush: (id: string, position: GridPosition) => void;
  
  // 레이아웃 액션
  compactWidgets: (compactType?: 'vertical' | 'horizontal') => void;
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
}

// 초기 설정
const initialConfig: DashboardConfig = {
  cols: 12,
  rowHeight: 120,
  gap: 16,
  maxRows: 50,
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

// Zustand 스토어 생성
export const useImprovedDashboardStore = create<ImprovedDashboardStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        // 초기 상태
        widgets: [],
        config: initialConfig,
        editState: initialEditState,
        
        // 위젯 액션
        setWidgets: (widgets) => set((state) => {
          state.widgets = widgets;
        }),
        
        addWidget: (widget) => set((state) => {
          // 충돌 체크
          const positions = state.widgets.map(w => w.position);
          // ID 중복 방지: 동일 ID가 있으면 접미사를 붙여 고유화
          if (state.widgets.some(w => w.id === widget.id)) {
            const base = widget.id || 'widget';
            let i = 2;
            let newId = `${base}_${i}`;
            const existingIds = new Set(state.widgets.map(w => w.id));
            while (existingIds.has(newId)) {
              i += 1;
              newId = `${base}_${i}`;
            }
            widget = { ...widget, id: newId };
          }
          if (!checkCollisionWithItems(widget.position, positions)) {
            state.widgets.push(widget);
          } else {
            // 충돌 시 빈 공간 찾기
            const emptySpace = findEmptySpace(
              widget.position.w,
              widget.position.h,
              positions,
              state.config
            );
            if (emptySpace) {
              state.widgets.push({ ...widget, position: emptySpace });
            } else {
              console.warn('No empty space for new widget');
            }
          }
        }),
        
        updateWidget: (id, updates) => set((state) => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            state.widgets[index] = { ...state.widgets[index], ...updates };
          }
        }),
        
        updateWidgetPosition: (id, position) => set((state) => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            const constrained = constrainToBounds(position, state.config);
            state.widgets[index].position = constrained;
          }
        }),
        
        removeWidget: (id) => set((state) => {
          state.widgets = state.widgets.filter(w => w.id !== id);
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
          const widget = state.widgets.find(w => w.id === id);
          if (!widget) return;
          
          // 충돌 체크 (자기 자신 제외)
          if (state.config.preventCollision) {
            const otherPositions = state.widgets
              .filter(w => w.id !== id)
              .map(w => w.position);
            
            if (checkCollisionWithItems(position, otherPositions)) {
              return; // 충돌 시 이동 취소
            }
          }
          
          // 경계 내로 제한
          const constrained = constrainToBounds(position, state.config);
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            state.widgets[index].position = constrained;
          }
        }),
        
        resizeWidget: (id, position) => set((state) => {
          const widget = state.widgets.find(w => w.id === id);
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
            const otherPositions = state.widgets
              .filter(w => w.id !== id)
              .map(w => w.position);
            
            if (checkCollisionWithItems(newPosition, otherPositions)) {
              return; // 충돌 시 크기 조정 취소
            }
          }
          
          // 경계 내로 제한
          const constrained = constrainToBounds(newPosition, state.config);
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            state.widgets[index].position = constrained;
          }
        }),
        
        moveWidgetWithPush: (id, position) => set((state) => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index === -1) return;
          const config = state.config;
          const positions = state.widgets.map(w => ({ ...w.position }));

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
                if (state.widgets[i].static) {
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

          state.widgets = state.widgets.map((w, i) => ({ ...w, position: positions[i] }));
        }),
        
        swapWidgets: (id1, id2) => set((state) => {
          const index1 = state.widgets.findIndex(w => w.id === id1);
          const index2 = state.widgets.findIndex(w => w.id === id2);
          if (index1 === -1 || index2 === -1) return;
          const config = state.config;
          const positions = state.widgets.map(w => ({ ...w.position }));

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
                if (state.widgets[i].static) {
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

          state.widgets = state.widgets.map((w, i) => ({ ...w, position: positions[i] }));
        }),
        
        // 레이아웃 액션
        compactWidgets: (compactType = 'vertical') => set((state) => {
          if (!compactType) return;
          
          const positions = state.widgets.map(w => w.position);
          const compacted = compactLayout(positions, state.config, compactType);
          
          state.widgets = state.widgets.map((widget, index) => ({
            ...widget,
            position: compacted[index],
          }));
        }),
        
        findSpaceForWidget: (width, height) => {
          const state = get();
          const positions = state.widgets.map(w => w.position);
          return findEmptySpace(width, height, positions, state.config);
        },
        
        checkCollision: (widgetId, position) => {
          const state = get();
          const otherPositions = state.widgets
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
          const widget = state.widgets.find(w => w.id === widgetId);
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
          const widget = state.widgets.find(w => w.id === widgetId);
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
            // 리사이즈 중에는 실제 위젯 상태를 변경하지 않고 미리보기만 업데이트
            const index = state.widgets.findIndex(
              w => w.id === state.editState.resizingWidget!.id
            );
            if (index !== -1) {
              const widget = state.widgets[index];
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
          state.widgets = [];
          state.config = initialConfig;
          state.editState = initialEditState;
        }),
        
        exportLayout: () => {
          const state = get();
          return JSON.stringify({
            widgets: state.widgets,
            config: state.config,
          }, null, 2);
        },
        
        importLayout: (layoutJson) => set((state) => {
          try {
            const { widgets, config } = JSON.parse(layoutJson);
            state.widgets = widgets || [];
            state.config = { ...state.config, ...(config || {}) };
          } catch (error) {
            console.error('Failed to import layout:', error);
          }
        }),
      })),
      {
        name: 'improved-dashboard-store',
      }
    )
  )
);

// 셀렉터
export const selectWidgets = (state: ImprovedDashboardStore) => state.widgets;
export const selectConfig = (state: ImprovedDashboardStore) => state.config;
export const selectEditState = (state: ImprovedDashboardStore) => state.editState;
export const selectIsEditMode = (state: ImprovedDashboardStore) => state.editState.isEditMode;
export const selectSelectedWidget = (state: ImprovedDashboardStore) => 
  state.widgets.find(w => w.id === state.editState.selectedWidgetId);

// shallow 비교 export
export { shallow } from 'zustand/shallow';
