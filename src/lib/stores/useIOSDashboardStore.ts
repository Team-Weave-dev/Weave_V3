import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { IOSStyleWidget } from '@/types/ios-dashboard';

// 상태 슬라이스 타입 정의
interface LayoutSlice {
  widgets: IOSStyleWidget[];
  columns: number;
  gap: number;
  padding: number;
  setWidgets: (widgets: IOSStyleWidget[]) => void;
  updateWidget: (id: string, widget: Partial<IOSStyleWidget>) => void;
  removeWidget: (id: string) => void;
  addWidget: (widget: IOSStyleWidget) => void;
  setLayoutConfig: (config: { columns?: number; gap?: number; padding?: number }) => void;
}

interface EditModeSlice {
  isEditMode: boolean;
  selectedWidgetId: string | null;
  draggedWidgetId: string | null;
  hoveredWidgetId: string | null;
  isWiggling: boolean;
  setEditMode: (enabled: boolean) => void;
  selectWidget: (id: string | null) => void;
  setDraggedWidget: (id: string | null) => void;
  setHoveredWidget: (id: string | null) => void;
  setWiggling: (wiggling: boolean) => void;
  clearEditState: () => void;
}

// 전체 스토어 타입
export interface IOSDashboardStore extends LayoutSlice, EditModeSlice {
  // 복합 액션
  enterEditMode: () => void;
  exitEditMode: (save?: boolean) => void;
  moveWidget: (widgetId: string, targetIndex: number) => void;
  resetStore: () => void;
}

// 초기 상태
const initialLayoutState: Pick<LayoutSlice, 'widgets' | 'columns' | 'gap' | 'padding'> = {
  widgets: [],
  columns: 4,
  gap: 16,
  padding: 20,
};

const initialEditState: Pick<EditModeSlice, 'isEditMode' | 'selectedWidgetId' | 'draggedWidgetId' | 'hoveredWidgetId' | 'isWiggling'> = {
  isEditMode: false,
  selectedWidgetId: null,
  draggedWidgetId: null,
  hoveredWidgetId: null,
  isWiggling: false,
};

// Zustand 스토어 생성
export const useIOSDashboardStore = create<IOSDashboardStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // Layout Slice
        ...initialLayoutState,
        setWidgets: (widgets) => set({ widgets }, false, 'setWidgets'),
        updateWidget: (id, update) => set(
          (state) => ({
            widgets: state.widgets.map(w => 
              w.id === id ? { ...w, ...update } : w
            )
          }),
          false,
          'updateWidget'
        ),
        removeWidget: (id) => set(
          (state) => ({
            widgets: state.widgets.filter(w => w.id !== id)
          }),
          false,
          'removeWidget'
        ),
        addWidget: (widget) => set(
          (state) => ({
            widgets: [...state.widgets, widget]
          }),
          false,
          'addWidget'
        ),
        setLayoutConfig: (config) => set(
          (state) => ({
            ...state,
            ...config
          }),
          false,
          'setLayoutConfig'
        ),

        // Edit Mode Slice
        ...initialEditState,
        setEditMode: (enabled) => set(
          { 
            isEditMode: enabled,
            isWiggling: enabled 
          },
          false,
          'setEditMode'
        ),
        selectWidget: (id) => set(
          { selectedWidgetId: id },
          false,
          'selectWidget'
        ),
        setDraggedWidget: (id) => set(
          { draggedWidgetId: id },
          false,
          'setDraggedWidget'
        ),
        setHoveredWidget: (id) => set(
          { hoveredWidgetId: id },
          false,
          'setHoveredWidget'
        ),
        setWiggling: (wiggling) => set(
          { isWiggling: wiggling },
          false,
          'setWiggling'
        ),
        clearEditState: () => set(
          {
            selectedWidgetId: null,
            draggedWidgetId: null,
            hoveredWidgetId: null,
            isWiggling: false,
          },
          false,
          'clearEditState'
        ),

        // 복합 액션
        enterEditMode: () => set(
          {
            isEditMode: true,
            isWiggling: true,
          },
          false,
          'enterEditMode'
        ),
        exitEditMode: () => set(
          {
            isEditMode: false,
            isWiggling: false,
            selectedWidgetId: null,
            draggedWidgetId: null,
            hoveredWidgetId: null,
          },
          false,
          'exitEditMode'
        ),
        moveWidget: (widgetId, targetIndex) => {
          const state = get();
          const widgets = [...state.widgets];
          const currentIndex = widgets.findIndex(w => w.id === widgetId);
          
          if (currentIndex !== -1 && currentIndex !== targetIndex) {
            const [widget] = widgets.splice(currentIndex, 1);
            widgets.splice(targetIndex, 0, widget);
            set({ widgets }, false, 'moveWidget');
          }
        },
        resetStore: () => set(
          {
            ...initialLayoutState,
            ...initialEditState,
          },
          false,
          'resetStore'
        ),
      }),
      {
        name: 'ios-dashboard-store',
      }
    )
  )
);

// 셀렉터들
export const selectWidgets = (state: IOSDashboardStore) => state.widgets;
export const selectEditMode = (state: IOSDashboardStore) => state.isEditMode;
export const selectWiggling = (state: IOSDashboardStore) => state.isWiggling;

// shallow 비교 export
export { shallow } from 'zustand/shallow';