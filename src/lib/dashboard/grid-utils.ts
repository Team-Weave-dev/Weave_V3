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
 * 현재 아이템과 충돌하는 아이템들의 인덱스를 반환
 */
export function getCollisions(
  item: GridPosition,
  items: GridPosition[],
  excludeIndex?: number
): number[] {
  const result: number[] = [];
  for (let i = 0; i < items.length; i++) {
    if (i === excludeIndex) continue;
    if (checkCollision(item, items[i])) {
      result.push(i);
    }
  }
  return result;
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
  const { cols, maxRows = Infinity } = config;

  // 최소값 체크
  if (position.x < 0 || position.y < 0) return false;

  // 너비/높이 최소값 체크
  if (position.w < 1 || position.h < 1) return false;

  // X(가로) 최대값 체크
  if (position.x + position.w > cols) return false;

  // Y(세로) 최대값 체크 - maxRows가 Infinity가 아닐 때만
  if (maxRows !== Infinity && position.y + position.h > maxRows) return false;

  return true;
}

/**
 * 그리드 위치를 경계 내로 조정
 */
export function constrainToBounds(
  position: GridPosition,
  config: GridConfig
): GridPosition {
  const { cols, maxRows = Infinity } = config;

  // 너비/높이 최소값 보장
  const w = Math.max(1, position.w);
  const h = Math.max(1, position.h);

  // X 위치 조정 (가로만 제한)
  let x = Math.max(0, position.x);
  if (x + w > cols) {
    x = Math.max(0, cols - w);
  }

  // Y 위치 조정 (세로 무한 확장 지원)
  let y = Math.max(0, position.y);
  // maxRows가 Infinity가 아닐 때만 Y 위치 제한
  if (maxRows !== Infinity && y + h > maxRows) {
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
  const { cols, maxRows = Infinity } = config;

  // 기존 위젯들의 최대 Y 위치 계산
  const maxY = items.length > 0
    ? Math.max(...items.map(item => item.y + item.h))
    : 0;

  // 검색 범위 설정: maxRows가 Infinity면 maxY + 20까지, 아니면 maxRows까지
  const searchLimit = maxRows === Infinity
    ? maxY + 20
    : Math.min(maxRows - height + 1, maxY + 20);

  // 그리드를 순회하며 빈 공간 찾기
  for (let y = 0; y < searchLimit; y++) {
    for (let x = 0; x <= cols - width; x++) {
      const testPosition: GridPosition = { x, y, w: width, h: height };

      // 충돌 체크
      if (!checkCollisionWithItems(testPosition, items)) {
        return testPosition;
      }
    }
  }

  // 빈 공간이 없으면 기존 위젯들 아래에 배치
  return {
    x: 0,
    y: maxY,
    w: width,
    h: height
  };
}

/**
 * 컴팩트 레이아웃 생성 (충돌 해결 + 빈 공간 제거)
 * 겹쳐있는 위젯들을 분리하고, 모든 위젯을 상단으로 정렬
 */
export function compactLayout(
  items: GridPosition[],
  config: GridConfig,
  compactType: 'vertical' | 'horizontal' = 'vertical'
): GridPosition[] {
  console.log('🔧 compactLayout 시작:', { itemCount: items.length, compactType });

  if (items.length === 0) return [];

  if (compactType === 'vertical') {
    // 세로 방향 정렬: 위젯들을 상단부터 차곡차곡 쌓기
    // 1. 위젯들을 y → x 순서로 정렬 (상단 좌측부터)
    const sortedItems = [...items].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    console.log('📊 정렬된 위젯 순서:', sortedItems.map(item => ({ y: item.y, x: item.x })));

    // 2. 각 위젯을 충돌 없이 배치
    const result: GridPosition[] = [];

    sortedItems.forEach((item, index) => {
      // 첫 번째 위젯은 y=0부터 시작
      if (result.length === 0) {
        result.push({ ...item, y: 0 });
        console.log(`  ✓ 위젯 ${index}: y=0 (첫 번째 위젯)`);
        return;
      }

      // 기존 위젯들과 충돌하지 않는 최상단 위치 찾기
      let targetY = 0;
      let foundPosition = false;

      while (!foundPosition) {
        const testPosition: GridPosition = { ...item, y: targetY };

        // 모든 기존 위젯들과 충돌 검사
        const hasCollision = result.some(existingItem =>
          checkCollision(testPosition, existingItem)
        );

        if (!hasCollision) {
          // 충돌 없음 - 이 위치에 배치
          result.push(testPosition);
          console.log(`  ✓ 위젯 ${index}: y=${targetY} (충돌 없음)`);
          foundPosition = true;
        } else {
          // 충돌 있음 - 한 칸 아래로
          targetY++;
          if (targetY > 100) {
            // 무한 루프 방지
            console.error(`  ✗ 위젯 ${index}: 배치 실패 (무한 루프)`);
            result.push({ ...item, y: targetY });
            foundPosition = true;
          }
        }
      }
    });

    console.log('✅ compactLayout 완료:', result.map(r => ({ y: r.y, x: r.x, h: r.h })));

    // 원본 순서로 복원 (items 배열의 인덱스 순서 유지)
    const resultMap = new Map(sortedItems.map((item, i) => [item, result[i]]));
    return items.map(item => resultMap.get(item)!);

  } else {
    // 가로 방향 정렬: 위젯들을 좌측부터 차곡차곡 배치
    const sortedItems = [...items].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    const result: GridPosition[] = [];

    sortedItems.forEach((item) => {
      if (result.length === 0) {
        result.push({ ...item, x: 0 });
        return;
      }

      let targetX = 0;
      let foundPosition = false;

      while (!foundPosition) {
        const testPosition: GridPosition = { ...item, x: targetX };

        const hasCollision = result.some(existingItem =>
          checkCollision(testPosition, existingItem)
        );

        if (!hasCollision) {
          result.push(testPosition);
          foundPosition = true;
        } else {
          targetX++;
          if (targetX > 100) {
            result.push({ ...item, x: targetX });
            foundPosition = true;
          }
        }
      }
    });

    const resultMap = new Map(sortedItems.map((item, i) => [item, result[i]]));
    return items.map(item => resultMap.get(item)!);
  }
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
  useCSSTransforms: boolean = true,
  skipTransition: boolean = false
): any {
  const pixels = gridToPixels(position, cellWidth, cellHeight, gap);
  
  if (useCSSTransforms) {
    return {
      // Framer Motion 호환(x/y) + 일반 div 호환(transform) 병행
      x: pixels.left,
      y: pixels.top,
      transform: `translate(${pixels.left}px, ${pixels.top}px)`,
      width: `${pixels.width}px`,
      height: `${pixels.height}px`,
      position: 'absolute',
      transition: skipTransition ? 'none' : 'transform 200ms ease, width 200ms ease, height 200ms ease',
    };
  } else {
    return {
      left: `${pixels.left}px`,
      top: `${pixels.top}px`,
      width: `${pixels.width}px`,
      height: `${pixels.height}px`,
      position: 'absolute',
      transition: skipTransition ? 'none' : 'all 200ms ease',
    };
  }
}
