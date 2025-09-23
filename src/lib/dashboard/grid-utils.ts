/**
 * 대시보드 그리드 시스템 유틸리티 함수
 * react-grid-layout 패턴을 참고하여 개선된 그리드 로직 구현
 */

/**
 * 단순화된 그리드 아이템 위치 인터페이스
 */
export interface GridPosition {
  x: number; // 그리드 X 위치 (0부터 시작)
  y: number; // 그리드 Y 위치 (0부터 시작)
  w: number; // 너비 (그리드 단위)
  h: number; // 높이 (그리드 단위)
}

/**
 * 그리드 아이템 경계 정보
 */
export interface GridBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * 그리드 설정
 */
export interface GridConfig {
  cols: number;          // 그리드 컬럼 수
  rowHeight: number;     // 행 높이 (px)
  gap: number;           // 그리드 간격 (px)
  maxRows?: number;      // 최대 행 수
  preventCollision?: boolean; // 충돌 방지 여부
  allowOverlap?: boolean;     // 겹침 허용 여부
}

/**
 * GridPosition을 GridBounds로 변환
 */
export function positionToBounds(position: GridPosition): GridBounds {
  return {
    left: position.x,
    right: position.x + position.w,
    top: position.y,
    bottom: position.y + position.h,
    width: position.w,
    height: position.h,
  };
}

/**
 * 두 그리드 영역이 겹치는지 확인
 */
export function checkCollision(
  item1: GridPosition,
  item2: GridPosition
): boolean {
  const bounds1 = positionToBounds(item1);
  const bounds2 = positionToBounds(item2);

  // 두 사각형이 겹치지 않는 조건
  const noOverlap = 
    bounds1.right <= bounds2.left ||  // item1이 item2의 왼쪽에 있음
    bounds1.left >= bounds2.right ||   // item1이 item2의 오른쪽에 있음
    bounds1.bottom <= bounds2.top ||   // item1이 item2의 위쪽에 있음
    bounds1.top >= bounds2.bottom;     // item1이 item2의 아래쪽에 있음

  return !noOverlap;
}

/**
 * 여러 아이템과의 충돌 체크
 */
export function checkCollisionWithItems(
  item: GridPosition,
  items: GridPosition[],
  excludeId?: string,
  itemIds?: string[]
): boolean {
  for (let i = 0; i < items.length; i++) {
    // excludeId가 있고 현재 아이템이 해당 ID면 건너뛰기
    if (excludeId && itemIds?.[i] === excludeId) continue;
    
    if (checkCollision(item, items[i])) {
      return true;
    }
  }
  return false;
}

/**
 * 그리드 경계 내에 있는지 확인
 */
export function isWithinBounds(
  position: GridPosition,
  config: GridConfig
): boolean {
  const { cols, maxRows = 50 } = config;
  
  // 최소값 체크
  if (position.x < 0 || position.y < 0) return false;
  
  // 너비/높이 최소값 체크
  if (position.w < 1 || position.h < 1) return false;
  
  // 최대값 체크
  if (position.x + position.w > cols) return false;
  if (position.y + position.h > maxRows) return false;
  
  return true;
}

/**
 * 그리드 위치를 경계 내로 조정
 */
export function constrainToBounds(
  position: GridPosition,
  config: GridConfig
): GridPosition {
  const { cols, maxRows = 50 } = config;
  
  // 너비/높이 최소값 보장
  const w = Math.max(1, position.w);
  const h = Math.max(1, position.h);
  
  // X 위치 조정
  let x = Math.max(0, position.x);
  if (x + w > cols) {
    x = Math.max(0, cols - w);
  }
  
  // Y 위치 조정
  let y = Math.max(0, position.y);
  if (y + h > maxRows) {
    y = Math.max(0, maxRows - h);
  }
  
  return { x, y, w, h };
}

/**
 * 빈 공간 찾기
 */
export function findEmptySpace(
  width: number,
  height: number,
  items: GridPosition[],
  config: GridConfig
): GridPosition | null {
  const { cols, maxRows = 50 } = config;
  
  // 그리드를 순회하며 빈 공간 찾기
  for (let y = 0; y <= maxRows - height; y++) {
    for (let x = 0; x <= cols - width; x++) {
      const testPosition: GridPosition = { x, y, w: width, h: height };
      
      // 충돌 체크
      if (!checkCollisionWithItems(testPosition, items)) {
        return testPosition;
      }
    }
  }
  
  return null;
}

/**
 * 컴팩트 레이아웃 생성 (위쪽으로 압축)
 */
export function compactLayout(
  items: GridPosition[],
  config: GridConfig,
  compactType: 'vertical' | 'horizontal' = 'vertical'
): GridPosition[] {
  const sorted = [...items].sort((a, b) => {
    if (compactType === 'vertical') {
      // Y 좌표 우선, 같으면 X 좌표로 정렬
      return a.y - b.y || a.x - b.x;
    } else {
      // X 좌표 우선, 같으면 Y 좌표로 정렬
      return a.x - b.x || a.y - b.y;
    }
  });
  
  const compacted: GridPosition[] = [];
  
  for (const item of sorted) {
    let newPosition = { ...item };
    
    if (compactType === 'vertical') {
      // 위쪽으로 최대한 이동
      while (newPosition.y > 0) {
        const testPosition = { ...newPosition, y: newPosition.y - 1 };
        if (!checkCollisionWithItems(testPosition, compacted)) {
          newPosition = testPosition;
        } else {
          break;
        }
      }
    } else {
      // 왼쪽으로 최대한 이동
      while (newPosition.x > 0) {
        const testPosition = { ...newPosition, x: newPosition.x - 1 };
        if (!checkCollisionWithItems(testPosition, compacted)) {
          newPosition = testPosition;
        } else {
          break;
        }
      }
    }
    
    compacted.push(newPosition);
  }
  
  return compacted;
}

/**
 * 픽셀 좌표를 그리드 좌표로 변환
 */
export function pixelsToGrid(
  pixelX: number,
  pixelY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number
): GridPosition {
  const x = Math.round(pixelX / (cellWidth + gap));
  const y = Math.round(pixelY / (cellHeight + gap));
  return { x, y, w: 1, h: 1 };
}

/**
 * 그리드 좌표를 픽셀 좌표로 변환
 */
export function gridToPixels(
  position: GridPosition,
  cellWidth: number,
  cellHeight: number,
  gap: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: position.x * (cellWidth + gap),
    top: position.y * (cellHeight + gap),
    width: position.w * cellWidth + (position.w - 1) * gap,
    height: position.h * cellHeight + (position.h - 1) * gap,
  };
}

/**
 * 드래그 델타를 그리드 단위로 변환
 */
export function deltaToGrid(
  deltaX: number,
  deltaY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number,
  snapThreshold: number = 0.5
): { dx: number; dy: number } {
  const gridDeltaX = deltaX / (cellWidth + gap);
  const gridDeltaY = deltaY / (cellHeight + gap);
  
  // 스냅 임계값 적용
  const dx = Math.abs(gridDeltaX) >= snapThreshold 
    ? Math.round(gridDeltaX) 
    : 0;
  const dy = Math.abs(gridDeltaY) >= snapThreshold 
    ? Math.round(gridDeltaY) 
    : 0;
  
  return { dx, dy };
}

/**
 * 두 위젯의 겹침 비율 계산
 */
export function getOverlapRatio(
  item1: GridPosition,
  item2: GridPosition
): number {
  const bounds1 = positionToBounds(item1);
  const bounds2 = positionToBounds(item2);
  
  // 겹치는 영역 계산
  const overlapLeft = Math.max(bounds1.left, bounds2.left);
  const overlapRight = Math.min(bounds1.right, bounds2.right);
  const overlapTop = Math.max(bounds1.top, bounds2.top);
  const overlapBottom = Math.min(bounds1.bottom, bounds2.bottom);
  
  // 겹치지 않으면 0 반환
  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
    return 0;
  }
  
  // 겹치는 영역의 크기
  const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  
  // 작은 위젯 기준으로 비율 계산
  const area1 = bounds1.width * bounds1.height;
  const area2 = bounds2.width * bounds2.height;
  const smallerArea = Math.min(area1, area2);
  
  return overlapArea / smallerArea;
}

/**
 * 위젯 스왑 가능 여부 확인
 */
export function canSwapWidgets(
  widget1: GridPosition,
  widget2: GridPosition,
  config: GridConfig
): boolean {
  // 각 위젯이 서로의 자리에 들어갈 수 있는지 확인
  const widget1InWidget2Pos: GridPosition = {
    x: widget2.x,
    y: widget2.y,
    w: widget1.w,
    h: widget1.h,
  };
  
  const widget2InWidget1Pos: GridPosition = {
    x: widget1.x,
    y: widget1.y,
    w: widget2.w,
    h: widget2.h,
  };
  
  // 두 위젯 모두 경계 내에 있어야 함
  return isWithinBounds(widget1InWidget2Pos, config) && 
         isWithinBounds(widget2InWidget1Pos, config);
}

/**
 * CSS Transform 스타일 생성 (성능 최적화)
 */
export function getTransformStyle(
  position: GridPosition,
  cellWidth: number,
  cellHeight: number,
  gap: number,
  useCSSTransforms: boolean = true
): React.CSSProperties {
  const pixels = gridToPixels(position, cellWidth, cellHeight, gap);
  
  if (useCSSTransforms) {
    return {
      transform: `translate(${pixels.left}px, ${pixels.top}px)`,
      width: `${pixels.width}px`,
      height: `${pixels.height}px`,
      position: 'absolute',
      transition: 'transform 200ms ease',
    };
  } else {
    return {
      left: `${pixels.left}px`,
      top: `${pixels.top}px`,
      width: `${pixels.width}px`,
      height: `${pixels.height}px`,
      position: 'absolute',
      transition: 'left 200ms ease, top 200ms ease',
    };
  }
}