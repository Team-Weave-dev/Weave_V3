'use client';

import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typography';
import Pagination from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import { getProjectStatusText } from '@/config/brand';
import type {
  ProjectTableColumn,
  ProjectTableRow,
  ProjectTableConfig,
  TableFilterState,
  TableSortState
} from '@/lib/types/project-table.types';

export interface AdvancedTableProps {
  data: ProjectTableRow[];
  config: ProjectTableConfig;
  onConfigChange: (config: ProjectTableConfig) => void;
  onRowClick?: (row: ProjectTableRow) => void;
  loading?: boolean;
  // 키보드 네비게이션 관련
  selectedProjectIndex?: number;
  // 삭제 모드 관련
  isDeleteMode?: boolean;
  selectedItems?: string[];
  onItemSelect?: (itemId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function AdvancedTable({
  data,
  config,
  onConfigChange,
  onRowClick,
  loading = false,
  selectedProjectIndex,
  isDeleteMode = false,
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  onDeselectAll
}: AdvancedTableProps) {
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [draggedColumns, setDraggedColumns] = useState<ProjectTableColumn[] | null>(null);
  // 컬럼 리사이징 상태
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);

  // 컬럼 순서 변경 핸들러 (테이블 헤더용)
  const handleColumnReorder = (result: DropResult) => {
    // 드래그 종료 시 상태 초기화
    setDraggedColumnId(null);
    setDraggedColumns(null);

    if (!result.destination) return;

    // 드래그앤드롭이 테이블 헤더에서 발생한 경우
    if (result.source.droppableId === 'table-header') {
      const visibleColumnsCopy = [...baseVisibleColumns];
      const [reorderedColumn] = visibleColumnsCopy.splice(result.source.index, 1);
      visibleColumnsCopy.splice(result.destination.index, 0, reorderedColumn);

      // 전체 컬럼 배열에서 order 값 업데이트
      const updatedColumns = config.columns.map(col => {
        const visibleIndex = visibleColumnsCopy.findIndex(vc => vc.id === col.id);
        if (visibleIndex !== -1) {
          return { ...col, order: visibleIndex };
        }
        // 숨겨진 컬럼은 기존 order 유지하되, 보이는 컬럼들 이후로 배치
        return { ...col, order: col.order + visibleColumnsCopy.length };
      }).sort((a, b) => a.order - b.order);

      onConfigChange({
        ...config,
        columns: updatedColumns
      });
    }
  };

  // 드래그 시작 핸들러
  const handleDragStart = (start: any) => {
    if (start.source.droppableId === 'table-header') {
      const draggedColumn = baseVisibleColumns[start.source.index];
      setDraggedColumnId(draggedColumn.id);
      // 드래그 시작 시 현재 컬럼 순서 저장
      setDraggedColumns([...baseVisibleColumns]);
    }
  };

  // 드래그 업데이트 핸들러 (실시간 미리보기)
  const handleDragUpdate = (update: any) => {
    if (update.destination && update.source.droppableId === 'table-header') {
      const columns = [...baseVisibleColumns];
      const [draggedColumn] = columns.splice(update.source.index, 1);
      columns.splice(update.destination.index, 0, draggedColumn);
      setDraggedColumns(columns);
    }
  };

  // 60fps 고성능 리사이징 시스템 (CSS 변수 + RAF 기반)
  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const column = config.columns.find(col => col.id === columnId);
    if (!column) return;

    const startX = e.clientX;
    const startWidth = column.width || 120;

    // 최소한의 상태만 설정
    setResizingColumnId(columnId);

    // 고성능을 위한 셀렉터 및 CSS 변수 설정
    const headerCells = document.querySelectorAll(`[data-column-id="${columnId}"]`);
    const dataCells = document.querySelectorAll(`[data-column-key="${column.key}"]`);

    // GPU 가속 및 성능 최적화 설정
    const allCells = [...headerCells, ...dataCells];
    allCells.forEach((cell: Element) => {
      const htmlCell = cell as HTMLElement;
      htmlCell.style.willChange = 'width';
      htmlCell.style.contain = 'layout style';
    });

    let currentMouseX = startX;
    let rafId = 0;
    let pendingWidth = startWidth;

    // 60fps 보장을 위한 RAF 기반 업데이트
    const updateCellWidths = (width: number) => {
      const widthPx = `${width}px`;

      allCells.forEach((cell: Element) => {
        const htmlCell = cell as HTMLElement;
        // 배칭된 스타일 업데이트
        htmlCell.style.cssText = `width: ${widthPx}; min-width: ${widthPx}; max-width: ${widthPx}; will-change: width; contain: layout style;`;
      });
    };

    const moveHandler = (e: MouseEvent) => {
      currentMouseX = e.clientX;

      // 델타 계산
      const deltaX = e.clientX - startX;
      pendingWidth = Math.max(80, Math.min(400, startWidth + deltaX));

      // RAF를 통한 60fps 업데이트 스케줄링
      if (rafId) return; // 이미 예약된 업데이트가 있으면 스킵

      rafId = requestAnimationFrame(() => {
        updateCellWidths(pendingWidth);
        rafId = 0;
      });
    };

    const upHandler = () => {
      // 마지막 RAF 취소 (필요시)
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      // 최종 너비 계산 및 적용
      const finalDeltaX = currentMouseX - startX;
      const finalWidth = Math.max(80, Math.min(400, startWidth + finalDeltaX));

      // 부드러운 완료 애니메이션과 함께 최종 너비 적용
      allCells.forEach((cell: Element) => {
        const htmlCell = cell as HTMLElement;
        htmlCell.style.transition = 'width 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)';
        htmlCell.style.cssText = `width: ${finalWidth}px; min-width: ${finalWidth}px; max-width: ${finalWidth}px; transition: width 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);`;

        // 애니메이션 완료 후 최적화 속성 정리
        setTimeout(() => {
          htmlCell.style.willChange = 'auto';
          htmlCell.style.contain = '';
          htmlCell.style.transition = '';
        }, 100);
      });

      // React 상태 업데이트 (지연시켜서 성능 향상)
      setTimeout(() => {
        const updatedColumns = config.columns.map(col =>
          col.id === columnId ? { ...col, width: finalWidth } : col
        );

        onConfigChange({
          ...config,
          columns: updatedColumns
        });

        // 상태 정리
        setResizingColumnId(null);
      }, 0);

      // 이벤트 리스너 제거
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // 이벤트 리스너 등록 (passive: false로 성능 최적화)
    document.addEventListener('mousemove', moveHandler, { passive: false });
    document.addEventListener('mouseup', upHandler, { passive: false });
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // 정렬 핸들러
  const handleSort = (columnKey: string) => {
    const newSort: TableSortState = {
      column: columnKey,
      direction:
        config.sort.column === columnKey && config.sort.direction === 'asc'
          ? 'desc'
          : 'asc'
    };

    onConfigChange({
      ...config,
      sort: newSort
    });
  };

  // 보이는 컬럼만 필터링 및 정렬
  const baseVisibleColumns = config.columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  // 드래그 중일 때는 임시 순서 사용, 아닐 때는 기본 순서 사용
  const visibleColumns = draggedColumns || baseVisibleColumns;

  // 컬럼 너비 계산
  const getColumnWidth = (column: ProjectTableColumn) => {
    return column.width || 120;
  };

  // 셀 값 포맷팅
  const statusVariantMap: Record<ProjectTableRow['status'], BadgeProps['variant']> = {
    planning: 'status-soft-planning',
    in_progress: 'status-soft-inprogress',
    review: 'status-soft-review',
    completed: 'status-soft-completed',
    on_hold: 'status-soft-onhold',
    cancelled: 'status-soft-cancelled'
  }

  const formatCellValue = (value: any, column: ProjectTableColumn) => {
    switch (column.type) {
      case 'date':
        return value ? new Date(value).toLocaleDateString('ko-KR') : '-';
      case 'currency':
        return `${Number(value).toLocaleString()}원`;
      case 'progress':
        return (
          <ProjectProgress
            value={Number(value) || 0}
            size="sm"
            showLabel
            labelPlacement="bottom"
            labelClassName="text-[11px] text-muted-foreground font-medium"
            className="max-w-[120px]"
          />
        );
      case 'payment_progress':
        return (
          <ProjectProgress
            value={Number(value) || 0}
            size="sm"
            showLabel
            labelPlacement="bottom"
            labelClassName="text-[11px] text-muted-foreground font-medium"
            className="max-w-[120px]"
          />
        );
      case 'status':
        {
          const statusValue = value as ProjectTableRow['status'];
          const variant = statusVariantMap[statusValue] ?? 'status-soft-planning';
          return (
            <Badge variant={variant} className="capitalize">
              {getProjectStatusText(statusValue, 'ko')}
            </Badge>
          );
        }
      default:
        return value || '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* 테이블 */}
      <Card>
        <Table>
          <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={handleColumnReorder}
            onDragUpdate={handleDragUpdate}
          >
            <Droppable
              droppableId="table-header"
              direction="horizontal"
              renderClone={(provided, snapshot, rubric) => {
                const column = visibleColumns[rubric.source.index];
                return (
                  <TableHead
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="select-none opacity-90 shadow-2xl scale-110 bg-background border-2 border-primary z-[1000] rounded-md"
                    style={{
                      width: getColumnWidth(column),
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div className="flex items-center gap-2 px-2">
                      <span className="flex-shrink-0 font-medium">{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col flex-shrink-0">
                          <SortAsc className="w-3 h-3 text-muted-foreground" />
                          <SortDesc className="w-3 h-3 -mt-1 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableHead>
                );
              }}
            >
              {(provided, snapshot) => (
                <TableHeader>
                  <TableRow
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {/* 삭제 모드일 때 체크박스 헤더 */}
                    {isDeleteMode && (
                      <TableHead className="w-12 px-2">
                        <Checkbox
                          checked={selectedItems.length === data.length && data.length > 0}
                          onCheckedChange={selectedItems.length === data.length ? onDeselectAll : onSelectAll}
                          aria-label="전체 선택"
                        />
                      </TableHead>
                    )}
                    {visibleColumns.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <>
                            <TableHead
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              data-column-id={column.id}
                              data-column-key={column.key}
                              className={`select-none transition-all duration-200 group relative ${snapshot.isDragging
                                  ? 'opacity-40 bg-primary/10 border-2 border-dashed border-primary cursor-grabbing'
                                  : 'hover:bg-secondary hover:shadow-sm cursor-pointer'
                                } ${resizingColumnId === column.id ? 'bg-primary/10 will-change-transform' : ''}`}
                              style={{
                                width: getColumnWidth(column),
                                minWidth: getColumnWidth(column),
                                maxWidth: getColumnWidth(column),
                                willChange: resizingColumnId === column.id ? 'width' : 'auto',
                                transform: 'translateZ(0)', // 하드웨어 가속 활성화
                                ...(!snapshot.isDragging && provided.draggableProps.style)
                              }}
                              onMouseEnter={() => setHoveredColumnIndex(index)}
                              onMouseLeave={() => setHoveredColumnIndex(null)}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 relative cursor-move"
                                onClick={(e) => {
                                  // 드래그 중이 아닐 때만 정렬 실행
                                  if (!snapshot.isDragging && column.sortable) {
                                    handleSort(column.key as string);
                                  }
                                }}
                              >
                                <span className="flex-shrink-0">{column.label}</span>
                                {column.sortable && (
                                  <div className="flex flex-col flex-shrink-0">
                                    <SortAsc className={`w-3 h-3 ${config.sort.column === column.key && config.sort.direction === 'asc'
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                      }`} />
                                    <SortDesc className={`w-3 h-3 -mt-1 ${config.sort.column === column.key && config.sort.direction === 'desc'
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                      }`} />
                                  </div>
                                )}

                                {/* 드래그 인디케이터 (호버 시에만 표시) */}
                                {!snapshot.isDragging && (
                                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* 컬럼 리사이저 */}
                              {index < visibleColumns.length - 1 && (hoveredColumnIndex === index || hoveredColumnIndex === index + 1 || resizingColumnId === column.id) && (
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group/resizer z-20"
                                  onMouseDown={(e) => handleResizeStart(column.id, e)}
                                  title="드래그해서 컬럼 너비 조절"
                                  style={{
                                    width: '4px',
                                    right: '-2px'
                                  }}
                                >
                                  {/* 기본 상태 - 컬럼 호버 시 표시되는 경계선 */}
                                  <div className="absolute inset-0 bg-primary transition-all duration-200 opacity-60 hover:opacity-100" />

                                  {/* 호버 상태 - 명확한 리사이저 */}
                                  <div className="absolute inset-0 -left-1 -right-1 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                    <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-primary rounded-full" />
                                  </div>

                                  {/* 리사이징 중 상태 */}
                                  {resizingColumnId === column.id && (
                                    <div className="absolute inset-0 -left-1 -right-1 bg-primary opacity-80">
                                      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-primary rounded-full shadow-lg" />
                                    </div>
                                  )}

                                  {/* 확장된 클릭 영역 */}
                                  <div className="absolute inset-0 -left-2 -right-2" />
                                </div>
                              )}
                            </TableHead>
                          </>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableRow>
                </TableHeader>
              )}
            </Droppable>
          </DragDropContext>
          <TableBody>
            {loading ? (
              // 로딩 스켈레톤 행들
              Array.from({ length: 8 }, (_, index) => (
                <TableRow key={`loading-${index}`}>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={`loading-${column.id}-${index}`}
                      data-column-id={column.id}
                      data-column-key={column.key}
                      className={`transition-all duration-200 ${draggedColumnId === column.id
                          ? 'opacity-40 bg-primary/10 border-x-2 border-dashed border-primary'
                          : ''
                        }`}
                      style={{
                        width: getColumnWidth(column),
                        minWidth: getColumnWidth(column),
                        maxWidth: getColumnWidth(column),
                        willChange: resizingColumnId === column.id ? 'width' : 'auto',
                        transform: 'translateZ(0)', // 하드웨어 가속
                      }}
                    >
                      <div className="animate-pulse">
                        {(column.type === 'progress' || column.type === 'payment_progress') ? (
                          <div className="w-full max-w-[100px] min-w-[80px]">
                            <div className="h-2 md:h-2.5 bg-gray-200 rounded-full mb-1"></div>
                            <div className="text-center">
                              <div className="h-2 bg-gray-200 rounded w-6 mx-auto"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-4 bg-gray-200 rounded" style={{
                            width: column.type === 'status' ? '60px' :
                              column.type === 'date' ? '80px' :
                                column.type === 'currency' ? '90px' : '120px'
                          }}></div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  onClick={() => !isDeleteMode && onRowClick?.(row)}
                  className={`${isDeleteMode ? "" : "cursor-pointer"} ${selectedProjectIndex === index ? "bg-primary/10 border-l-4 border-primary" : ""
                    }`}
                >
                  {/* 삭제 모드일 때 체크박스 */}
                  {isDeleteMode && (
                    <TableCell
                      className="w-12 px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedItems.includes(row.id)}
                        onCheckedChange={() => onItemSelect?.(row.id)}
                        aria-label={`${row.name} 선택`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      data-column-id={column.id}
                      data-column-key={column.key}
                      className={`transition-all duration-200 ${draggedColumnId === column.id
                          ? 'opacity-40 bg-primary/10 border-x-2 border-dashed border-primary'
                          : ''
                        }`}
                      style={{
                        width: getColumnWidth(column),
                        minWidth: getColumnWidth(column),
                        maxWidth: getColumnWidth(column),
                        willChange: resizingColumnId === column.id ? 'width' : 'auto',
                        transform: 'translateZ(0)', // 하드웨어 가속
                      }}
                    >
                      {formatCellValue(row[column.key], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && data.length === 0 && (
          <div className="text-center py-12">
            <Typography variant="body1" color="secondary">
              검색 결과가 없습니다.
            </Typography>
          </div>
        )}
      </Card>

      {/* 페이지네이션 */}
      {!loading && data.length > 0 && (
        <Pagination
          currentPage={config.pagination.page}
          totalPages={Math.ceil(config.pagination.total / config.pagination.pageSize)}
          onPageChange={(page) => {
            onConfigChange({
              ...config,
              pagination: {
                ...config.pagination,
                page
              }
            });
          }}
          itemsPerPage={config.pagination.pageSize}
          totalItems={config.pagination.total}
          size="sm"
          showInfo={true}
          visiblePages={5}
        />
      )}
    </div>
  );
}
