'use client';

import React, { useState, useMemo } from 'react';
import { AdvancedTable } from '@/components/ui/advanced-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Checkbox reserved for future use
import { SimpleViewModeSwitch, ViewMode } from '@/components/ui/view-mode-switch';
import type { ProjectTableRow, ProjectStatus, ProjectTableColumn, ProjectTableConfig } from '@/lib/types/project-table.types';
import { calculateProjectProgress } from '@/lib/types/project-table.types';
import { getProjectPageText, getViewModeText } from '@/config/brand';
import { layout } from '@/config/constants';
import { ChevronDown, ChevronUp, Filter, Settings, Trash2, RotateCcw, GripVertical, Eye, EyeOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ProjectStatus as ProjectStatusComponent } from '@/components/projects/shared/ProjectInfoRenderer/ProjectStatus';
import { PaymentStatus } from '@/components/projects/shared/ProjectInfoRenderer/PaymentStatus';
import ProjectProgress from '@/components/ui/project-progress';
import DocumentDeleteDialog from '@/components/projects/DocumentDeleteDialog';

interface ListViewProps {
  projects: ProjectTableRow[];
  onProjectClick: (projectNo: string) => void;
  loading?: boolean;
  showColumnSettings?: boolean; // 컬럼 설정 버튼 표시 여부
  onProjectsChange?: () => void; // 프로젝트 데이터 변경 시 호출될 콜백
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // useProjectTable에서 전달받는 props들
  config: ProjectTableConfig;
  updateConfig: (config: ProjectTableConfig) => void;
  resetColumnConfig: () => void;
  resetFilters: () => void;
  updatePageSize: (size: number) => void;
  paginatedData: ProjectTableRow[];
  filteredCount: number;
  totalCount: number;
  totalPages: number;
  updatePage: (page: number) => void;
  canGoToPreviousPage: boolean;
  canGoToNextPage: boolean;
  goToFirstPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
  isDeleteMode: boolean;
  selectedItems: string[];
  toggleDeleteMode: () => void;
  handleItemSelect: (id: string) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  handleDeleteSelected: () => void;
  availableClients: string[];
}

/**
 * ListView Component
 *
 * Displays projects in a table format with advanced features:
 * - Column resizing (60fps optimized)
 * - Column drag-and-drop reordering
 * - Sorting and filtering
 * - Pagination
 * - Delete mode with bulk selection
 *
 * This component focuses solely on table display logic,
 * delegating data management to parent component.
 */
export default function ListView({
  projects,
  onProjectClick,
  loading = false,
  showColumnSettings = true, // 기본값은 true (ListView에서는 표시)
  onProjectsChange: _onProjectsChange,
  viewMode,
  onViewModeChange,
  // useProjectTable에서 전달받은 props들
  config,
  updateConfig,
  resetColumnConfig,
  resetFilters,
  updatePageSize,
  paginatedData,
  filteredCount: _filteredCount,
  totalCount: _totalCount,
  totalPages: _totalPages,
  updatePage: _updatePage,
  canGoToPreviousPage: _canGoToPreviousPage,
  canGoToNextPage: _canGoToNextPage,
  goToFirstPage: _goToFirstPage,
  goToPreviousPage: _goToPreviousPage,
  goToNextPage: _goToNextPage,
  goToLastPage: _goToLastPage,
  isDeleteMode,
  selectedItems,
  toggleDeleteMode,
  handleItemSelect,
  handleSelectAll,
  handleDeselectAll,
  handleDeleteSelected,
  availableClients
}: ListViewProps) {
  const [selectedProjectIndex, _setSelectedProjectIndex] = useState(-1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Stats for display - WBS 기반 진행률 사용 (단일 진실 공급원)
  const _stats = useMemo(() => {
    if (loading) return { inProgress: 0, completed: 0, avgProgress: 0 };
    return {
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      avgProgress: Math.round(
        projects.reduce((acc, p) => acc + calculateProjectProgress(p.wbsTasks || []), 0) / projects.length || 0
      )
    };
  }, [projects, loading]);

  // 공통 컴포넌트를 사용하는 커스텀 셀 렌더러
  const customCellRenderer = (value: any, column: ProjectTableColumn, row: ProjectTableRow) => {
    switch (column.type) {
      case 'status':
        return (
          <ProjectStatusComponent
            project={row}
            mode="table"
            lang="ko"
          />
        );
      case 'payment_progress':
        return (
          <PaymentStatus
            project={row}
            mode="table"
            lang="ko"
          />
        );
      case 'progress':
        // WBS 기반 진행률 계산 (단일 진실 공급원) - 프로그레스바로 표시
        const progressValue = calculateProjectProgress(row.wbsTasks || []);
        return (
          <ProjectProgress
            value={progressValue}
            size="sm"
            showLabel
            labelPlacement="bottom"
            labelClassName="text-[11px] text-muted-foreground"
            className="max-w-[120px]"
          />
        );
      default:
        // 다른 타입은 기본 렌더링 사용
        return undefined;
    }
  };

  // Handle row click
  const handleRowClick = (project: ProjectTableRow) => {
    onProjectClick(project.no);
  };

  // Handle delete request - show confirmation modal
  const handleDeleteRequest = () => {
    if (selectedItems.length === 0) return;
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation - execute actual deletion
  const handleDeleteConfirm = () => {
    handleDeleteSelected();
    setDeleteDialogOpen(false);
  };

  // 컬럼 드래그 앤 드롭 핸들러
  const handleColumnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = [...config.columns];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // order 값 업데이트
    const updatedColumns = items.map((col, index) => ({
      ...col,
      order: index
    }));

    updateConfig({
      ...config,
      columns: updatedColumns
    });
  };

  // 컬럼 표시/숨김 토글
  const handleColumnVisibilityToggle = (columnId: string) => {
    const updatedColumns = config.columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );

    updateConfig({
      ...config,
      columns: updatedColumns
    });
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6 p-4 bg-background rounded-lg border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SimpleViewModeSwitch
            mode={viewMode}
            onModeChange={onViewModeChange}
            labels={{
              list: getViewModeText.listView('ko'),
              detail: getViewModeText.detailView('ko')
            }}
            ariaLabel={getViewModeText.title('ko')}
            className="sm:flex-shrink-0"
          />
          <Input
            type="text"
            placeholder={getProjectPageText.searchPlaceholder('ko')}
            className="flex-1 min-w-0 sm:min-w-64"
            value={config.filters.searchQuery}
            onChange={(e) => updateConfig({
              ...config,
              filters: { ...config.filters, searchQuery: e.target.value },
              pagination: { ...config.pagination, page: 1 }
            })}
          />

          <div className={`flex flex-wrap items-center ${layout.page.header.actions} gap-2`}>
            {/* 삭제 버튼 */}
            {!loading && paginatedData.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleDeleteMode}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Trash2 className={layout.heights.icon} />
                <span className="hidden sm:inline">{isDeleteMode ? getProjectPageText.exitDeleteMode('ko') : getProjectPageText.deleteButton('ko')}</span>
                <span className="sm:hidden">{isDeleteMode ? '종료' : '삭제'}</span>
              </Button>
            )}

            {/* 필터 버튼 */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Filter className={layout.heights.icon} />
              {getProjectPageText.filterButton('ko')}
              {isFilterOpen ? (
                <ChevronUp className={layout.heights.icon} />
              ) : (
                <ChevronDown className={layout.heights.icon} />
              )}
            </Button>

            {/* 컬럼 설정 버튼 - 조건부 표시 */}
            {showColumnSettings && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsColumnSettingsOpen(!isColumnSettingsOpen)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Settings className={layout.heights.icon} />
                <span className="hidden sm:inline">{getProjectPageText.columnSettingsButton('ko')}</span>
                <span className="sm:hidden">컬럼</span>
                {isColumnSettingsOpen ? (
                  <ChevronUp className={layout.heights.icon} />
                ) : (
                  <ChevronDown className={layout.heights.icon} />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Delete Mode Actions */}
        {isDeleteMode && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-md">
            <span className="text-sm">
              {selectedItems.length} {getProjectPageText.itemsSelected('ko')}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={handleSelectAll}
              className="h-auto p-0 text-sm"
            >
              {getProjectPageText.selectAll('ko')}
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleDeselectAll}
              className="h-auto p-0 text-sm"
            >
              {getProjectPageText.deselectAll('ko')}
            </Button>
            {selectedItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteRequest}
                className="ml-auto"
              >
                {getProjectPageText.deleteSelected('ko')} ({selectedItems.length})
              </Button>
            )}
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-background border border-border rounded-md space-y-4">
            <h3 className="text-sm font-medium">{getProjectPageText.filterButton('ko')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 상태 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterStatusLabel('ko')}
                </label>
                <Select
                  value={config.filters.statusFilter}
                  onValueChange={(value) => updateConfig({
                    ...config,
                    filters: { ...config.filters, statusFilter: value as ProjectStatus | 'all' },
                    pagination: { ...config.pagination, page: 1 }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterStatusAll('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getProjectPageText.filterStatusAll('ko')}</SelectItem>
                    <SelectItem value="in_progress">{getProjectPageText.filterStatusInProgress('ko')}</SelectItem>
                    <SelectItem value="review">{getProjectPageText.filterStatusReview('ko')}</SelectItem>
                    <SelectItem value="completed">{getProjectPageText.filterStatusCompleted('ko')}</SelectItem>
                    <SelectItem value="on_hold">{getProjectPageText.filterStatusOnHold('ko')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 클라이언트 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterClientLabel('ko')}
                </label>
                <Select
                  value={config.filters.clientFilter}
                  onValueChange={(value) => updateConfig({
                    ...config,
                    filters: { ...config.filters, clientFilter: value },
                    pagination: { ...config.pagination, page: 1 }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterClientAll('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getProjectPageText.filterClientAll('ko')}</SelectItem>
                    {availableClients.map((client) => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 페이지 개수 필터 */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {getProjectPageText.filterPageCountLabel('ko')}
                </label>
                <Select
                  value={config.pagination.pageSize.toString()}
                  onValueChange={(value) => updatePageSize(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getProjectPageText.filterPageCount10('ko')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">{getProjectPageText.filterPageCount5('ko')}</SelectItem>
                    <SelectItem value="10">{getProjectPageText.filterPageCount10('ko')}</SelectItem>
                    <SelectItem value="20">{getProjectPageText.filterPageCount20('ko')}</SelectItem>
                    <SelectItem value="50">{getProjectPageText.filterPageCount50('ko')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Reset Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RotateCcw className={layout.heights.icon} />
                {getProjectPageText.resetFilters('ko')}
              </Button>
            </div>
          </div>
        )}

        {/* Column Settings Panel - 조건부 표시 */}
        {showColumnSettings && isColumnSettingsOpen && (
          <div className="mt-4 p-4 bg-background border border-border rounded-md space-y-4">
            <h3 className="text-sm font-medium">{getProjectPageText.columnSettingsButton('ko')}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{getProjectPageText.columnDragToReorder('ko')}</p>
                <p className="text-sm text-muted-foreground">{getProjectPageText.columnEyeIconDescription('ko')}</p>
              </div>

              <DragDropContext onDragEnd={handleColumnDragEnd}>
                <Droppable droppableId="column-settings">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {config.columns
                        .sort((a, b) => a.order - b.order)
                        .map((column, index) => (
                          <Draggable
                            key={column.id}
                            draggableId={column.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center space-x-3 p-3 rounded-md border transition-all ${
                                  snapshot.isDragging
                                    ? 'bg-muted border-primary shadow-md'
                                    : 'bg-background hover:bg-muted/50'
                                }`}
                              >
                                {/* 드래그 핸들 */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className={`${layout.heights.icon} text-muted-foreground`} />
                                </div>

                                {/* 표시/숨김 토글 */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleColumnVisibilityToggle(column.id)}
                                  className="h-8 w-8 p-0"
                                  title={column.visible ? getProjectPageText.columnHideColumn('ko') : getProjectPageText.columnShowColumn('ko')}
                                >
                                  {column.visible ? (
                                    <Eye className={`${layout.heights.icon} text-primary`} />
                                  ) : (
                                    <EyeOff className={`${layout.heights.icon} text-muted-foreground`} />
                                  )}
                                </Button>

                                {/* 컬럼명 */}
                                <span className="flex-1 text-sm font-medium">
                                  {column.label}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Column Reset Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetColumnConfig}
                className="gap-2"
              >
                <RotateCcw className={layout.heights.icon} />
                {getProjectPageText.resetColumns('ko')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Table */}
      <AdvancedTable
        data={paginatedData}
        config={config}
        onConfigChange={updateConfig}
        onRowClick={handleRowClick}
        loading={loading}
        selectedProjectIndex={selectedProjectIndex}
        isDeleteMode={isDeleteMode}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        customCellRenderer={customCellRenderer}
        disableColumnDrag={isColumnSettingsOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        open={deleteDialogOpen}
        mode={selectedItems.length === 1 ? 'single' : 'bulk'}
        targetName={selectedItems.length === 1 ? paginatedData.find(p => p.id === selectedItems[0])?.name : undefined}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}