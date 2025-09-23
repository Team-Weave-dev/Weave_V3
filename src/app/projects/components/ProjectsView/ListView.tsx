'use client';

import React, { useState, useMemo } from 'react';
import { AdvancedTable } from '@/components/ui/advanced-table';
import { useProjectTable } from '@/lib/hooks/useProjectTable';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { getProjectPageText } from '@/config/brand';

interface ListViewProps {
  projects: ProjectTableRow[];
  onProjectClick: (projectNo: string) => void;
  loading?: boolean;
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
  loading = false
}: ListViewProps) {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(-1);

  // Use the project table hook for state management
  const {
    data: tableData,
    paginatedData,
    filteredCount,
    totalCount,
    config,
    updateConfig,
    resetColumnConfig,
    resetFilters,
    updatePageSize,
    availableClients,
    // Delete mode
    isDeleteMode,
    selectedItems,
    toggleDeleteMode,
    handleItemSelect,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected
  } = useProjectTable(projects);

  // Stats for display
  const stats = useMemo(() => {
    if (loading) return { inProgress: 0, completed: 0, avgProgress: 0 };
    return {
      inProgress: tableData.filter(p => p.status === 'in_progress').length,
      completed: tableData.filter(p => p.status === 'completed').length,
      avgProgress: Math.round(tableData.reduce((acc, p) => acc + p.progress, 0) / tableData.length || 0)
    };
  }, [tableData, loading]);

  // Handle row click
  const handleRowClick = (project: ProjectTableRow) => {
    onProjectClick(project.no);
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6 p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={getProjectPageText.searchPlaceholder('ko')}
            className="flex-1 px-3 py-2 border rounded-md"
            value={config.filters.searchQuery}
            onChange={(e) => updateConfig({
              ...config,
              filters: { ...config.filters, searchQuery: e.target.value },
              pagination: { ...config.pagination, page: 1 }
            })}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm border rounded-md hover:bg-muted"
            >
              {getProjectPageText.resetFilters('ko')}
            </button>
            <button
              onClick={resetColumnConfig}
              className="px-3 py-2 text-sm border rounded-md hover:bg-muted"
            >
              {getProjectPageText.resetColumns('ko')}
            </button>
          </div>

          {/* Delete Mode Toggle */}
          {!loading && tableData.length > 0 && (
            <button
              onClick={toggleDeleteMode}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                isDeleteMode
                  ? 'bg-destructive text-destructive-foreground'
                  : 'border hover:bg-muted'
              }`}
            >
              {isDeleteMode ? getProjectPageText.exitDeleteMode('ko') : getProjectPageText.deleteMode('ko')}
            </button>
          )}
        </div>

        {/* Delete Mode Actions */}
        {isDeleteMode && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-md">
            <span className="text-sm">
              {selectedItems.length} {getProjectPageText.itemsSelected('ko')}
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary hover:underline"
            >
              {getProjectPageText.selectAll('ko')}
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-primary hover:underline"
            >
              {getProjectPageText.deselectAll('ko')}
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="ml-auto px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90"
              >
                {getProjectPageText.deleteSelected('ko')} ({selectedItems.length})
              </button>
            )}
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
      />

      {/* Pagination Info */}
      {!loading && paginatedData.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {getProjectPageText.totalItems('ko')} {totalCount}, {filteredCount} {getProjectPageText.filtered('ko')}
          </div>
          <div className="flex items-center gap-2">
            <label>{getProjectPageText.pageSize('ko')}:</label>
            <select
              value={config.pagination.pageSize}
              onChange={(e) => updatePageSize(Number(e.target.value))}
              className="px-2 py-1 border rounded-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}