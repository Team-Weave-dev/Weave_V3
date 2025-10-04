'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  ProjectTableColumn,
  ProjectTableRow,
  ProjectTableConfig,
  TableFilterState,
  TableSortState
} from '@/lib/types/project-table.types';
import { PROJECT_COLUMNS } from '@/lib/config/project-columns';
import { removeCustomProject } from '@/lib/mock/projects';

// 중앙화된 칼럼 설정 사용 - 개요 탭과 동일한 데이터 소스
const DEFAULT_COLUMNS: ProjectTableColumn[] = PROJECT_COLUMNS;

const DEFAULT_FILTERS: TableFilterState = {
  searchQuery: '',
  statusFilter: 'all',
  clientFilter: 'all',
  customFilters: {}
};

const DEFAULT_SORT: TableSortState = {
  column: 'no',
  direction: 'desc'
};

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  total: 0
};

// 로컬스토리지 키 - 설정 영속화
const STORAGE_KEY = 'weave-project-table-config';

export function useProjectTable(initialData: ProjectTableRow[] = [], onProjectsChange?: () => void) {
  // 하이드레이션 상태 추적
  const [isHydrated, setIsHydrated] = useState(false);

  // 삭제 모드 관련 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 하이드레이션이 완료되면 localStorage 설정 적용
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 저장된 설정 불러오기 (중앙화된 설정 관리)
  const loadSavedConfig = useCallback((): ProjectTableConfig => {
    // 하이드레이션이 완료되지 않았다면 항상 기본 설정 반환
    if (!isHydrated || typeof window === 'undefined') {
      return {
        columns: DEFAULT_COLUMNS,
        filters: DEFAULT_FILTERS,
        sort: DEFAULT_SORT,
        pagination: DEFAULT_PAGINATION
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        return {
          ...parsedConfig,
          // 새로운 컬럼이 추가된 경우를 대비한 병합 로직
          columns: mergeColumns(parsedConfig.columns || [], DEFAULT_COLUMNS),
          pagination: { ...DEFAULT_PAGINATION, ...parsedConfig.pagination }
        };
      }
    } catch (error) {
      console.error('Failed to load saved table config:', error);
    }

    return {
      columns: DEFAULT_COLUMNS,
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      pagination: DEFAULT_PAGINATION
    };
  }, [isHydrated]);

  const [config, setConfig] = useState<ProjectTableConfig>(() => {
    // 초기 렌더링에서는 항상 기본 설정 사용
    return {
      columns: DEFAULT_COLUMNS,
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      pagination: DEFAULT_PAGINATION
    };
  });

  const [data, setData] = useState<ProjectTableRow[]>(initialData);

  // initialData가 변경되면 data 업데이트 (조건 없이 항상 동기화)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // 하이드레이션이 완료되면 저장된 설정 적용
  useEffect(() => {
    if (isHydrated) {
      const savedConfig = loadSavedConfig();
      setConfig(savedConfig);
    }
  }, [isHydrated, loadSavedConfig]);

  // 설정 저장 (중앙화된 설정 영속화)
  const saveConfig = useCallback((newConfig: ProjectTableConfig) => {
    // 하이드레이션이 완료된 후에만 localStorage 접근
    if (!isHydrated || typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save table config:', error);
    }
  }, [isHydrated]);

  // 설정 업데이트 핸들러
  const updateConfig = useCallback((newConfig: ProjectTableConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  }, [saveConfig]);

  // 데이터 업데이트 핸들러
  const updateData = useCallback((newData: ProjectTableRow[]) => {
    setData(newData);
    // config를 직접 참조하지 않고 함수형 업데이트 사용
    setConfig(prevConfig => ({
      ...prevConfig,
      pagination: {
        ...prevConfig.pagination,
        total: newData.length
      }
    }));
  }, []);

  // 필터링된 데이터 (메모이제이션으로 성능 최적화)
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // 검색 필터 적용
    if (config.filters.searchQuery.trim()) {
      const query = config.filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(row => {
        return Object.values(row).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // 상태 필터 적용
    if (config.filters.statusFilter !== 'all') {
      filtered = filtered.filter(row =>
        row.status === config.filters.statusFilter
      );
    }

    // 클라이언트 필터 적용
    if (config.filters.clientFilter && config.filters.clientFilter !== 'all') {
      filtered = filtered.filter(row =>
        row.client === config.filters.clientFilter
      );
    }

    // 사용자 정의 필터 적용
    Object.entries(config.filters.customFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(row =>
          row[key as keyof ProjectTableRow] === value
        );
      }
    });

    return filtered;
  }, [data, config.filters]);

  // 정렬된 데이터 (메모이제이션으로 성능 최적화)
  const sortedData = useMemo(() => {
    if (!config.sort.column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[config.sort.column as keyof ProjectTableRow];
      const bValue = b[config.sort.column as keyof ProjectTableRow];

      // null/undefined 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;

      // 타입별 정렬 로직
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // No 컬럼의 경우 숫자 부분을 추출하여 숫자 정렬
        if (config.sort.column === 'no' && aValue.includes('_') && bValue.includes('_')) {
          const aNum = parseInt(aValue.split('_')[1] || '0');
          const bNum = parseInt(bValue.split('_')[1] || '0');
          comparison = aNum - bNum;
        } else {
          comparison = aValue.localeCompare(bValue, 'ko-KR');
        }
      } else {
        // 날짜나 기타 타입의 경우
        const aStr = String(aValue);
        const bStr = String(bValue);
        comparison = aStr.localeCompare(bStr, 'ko-KR');
      }

      return config.sort.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, config.sort]);

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const { page, pageSize } = config.pagination;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, config.pagination]);

  // 클라이언트 목록 자동 생성
  const availableClients = useMemo(() => {
    const clients = data
      .map(row => row.client)
      .filter(client => client && client.trim() !== '')
      .filter((client, index, array) => array.indexOf(client) === index)
      .sort((a, b) => a.localeCompare(b, 'ko-KR'));

    return clients;
  }, [data]);

  // 컬럼 설정 초기화
  const resetColumnConfig = useCallback(() => {
    const resetConfig: ProjectTableConfig = {
      ...config,
      columns: DEFAULT_COLUMNS.map(col => ({ ...col }))
    };
    updateConfig(resetConfig);
  }, [config, updateConfig]);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    const resetConfig: ProjectTableConfig = {
      ...config,
      filters: { ...DEFAULT_FILTERS },
      pagination: { ...config.pagination, page: 1 }
    };
    updateConfig(resetConfig);
  }, [config, updateConfig]);

  // 페이지 크기 변경
  const updatePageSize = useCallback((newPageSize: number) => {
    const resetConfig: ProjectTableConfig = {
      ...config,
      pagination: {
        ...config.pagination,
        pageSize: newPageSize,
        page: 1 // 페이지 크기 변경 시 첫 페이지로 리셋
      }
    };
    updateConfig(resetConfig);
  }, [config, updateConfig]);

  // 페이지 변경
  const updatePage = useCallback((newPage: number) => {
    const resetConfig: ProjectTableConfig = {
      ...config,
      pagination: {
        ...config.pagination,
        page: newPage
      }
    };
    updateConfig(resetConfig);
  }, [config, updateConfig]);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / config.pagination.pageSize);
  }, [filteredData.length, config.pagination.pageSize]);

  // 페이지네이션 헬퍼 함수들
  const canGoToPreviousPage = config.pagination.page > 1;
  const canGoToNextPage = config.pagination.page < totalPages;
  const goToFirstPage = useCallback(() => updatePage(1), [updatePage]);
  const goToPreviousPage = useCallback(() => {
    if (canGoToPreviousPage) {
      updatePage(config.pagination.page - 1);
    }
  }, [canGoToPreviousPage, config.pagination.page, updatePage]);
  const goToNextPage = useCallback(() => {
    if (canGoToNextPage) {
      updatePage(config.pagination.page + 1);
    }
  }, [canGoToNextPage, config.pagination.page, updatePage]);
  const goToLastPage = useCallback(() => updatePage(totalPages), [updatePage, totalPages]);

  // 삭제 모드 관련 함수들
  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode(prev => !prev);
    setSelectedItems([]); // 삭제 모드 토글 시 선택 초기화
  }, []);

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItems(sortedData.map(row => row.id));
  }, [sortedData]);

  const handleDeselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedItems.length === 0) return;

    const projectsToDelete = data.filter(project => selectedItems.includes(project.id));
    let deletedCount = 0;

    console.log('🗑️ ListView 벌크 삭제 시작:', {
      선택된항목수: selectedItems.length,
      삭제할프로젝트: projectsToDelete.map(p => ({ id: p.id, no: p.no, name: p.name }))
    });

    // 각 프로젝트를 개별적으로 삭제 (forEach를 for...of로 변경)
    for (const project of projectsToDelete) {
      try {
        const deleted = await removeCustomProject(project.no);
        if (deleted) {
          deletedCount++;
          console.log(`✅ 프로젝트 삭제 성공: ${project.no} - ${project.name}`);
        } else {
          console.log(`⚠️ 프로젝트 삭제 실패: ${project.no} - ${project.name}`);
        }
      } catch (error) {
        console.error(`❌ 프로젝트 삭제 중 오류: ${project.no}`, error);
      }
    }

    console.log(`🎯 ListView 벌크 삭제 완료: ${deletedCount}/${projectsToDelete.length}개 삭제됨`);

    // 부모 컴포넌트에 변경사항 알림
    if (onProjectsChange) {
      onProjectsChange();
    }

    // 삭제 후 상태 초기화
    setSelectedItems([]);
    setIsDeleteMode(false);
  }, [selectedItems, data, onProjectsChange]);

  // 전체 초기화 (컬럼 + 필터)
  const resetAll = useCallback(() => {
    const resetConfig: ProjectTableConfig = {
      columns: DEFAULT_COLUMNS.map(col => ({ ...col })),
      filters: { ...DEFAULT_FILTERS },
      sort: { ...DEFAULT_SORT },
      pagination: { ...DEFAULT_PAGINATION }
    };
    updateConfig(resetConfig);
  }, [updateConfig]);

  return {
    // 데이터
    data: sortedData,
    paginatedData,
    filteredCount: filteredData.length,
    totalCount: data.length,
    availableClients,

    // 설정
    config,
    updateConfig,

    // 데이터 조작
    updateData,

    // 유틸리티
    resetColumnConfig,
    resetFilters,
    resetAll,
    updatePageSize,

    // 페이지네이션
    totalPages,
    updatePage,
    canGoToPreviousPage,
    canGoToNextPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,

    // 삭제 모드
    isDeleteMode,
    selectedItems,
    toggleDeleteMode,
    handleItemSelect,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteSelected
  };
}

// 컬럼 병합 유틸리티 - 새 컬럼이 추가되었을 때 기존 설정과 병합
function mergeColumns(
  savedColumns: ProjectTableColumn[],
  defaultColumns: ProjectTableColumn[]
): ProjectTableColumn[] {
  const savedColumnMap = new Map(savedColumns.map(col => [col.id, col]));

  return defaultColumns.map(defaultCol => {
    const savedCol = savedColumnMap.get(defaultCol.id);
    if (!savedCol) return defaultCol;

    // label은 항상 현재 코드(defaultCol)를 우선하여 하드코딩 문제 방지
    return {
      ...defaultCol,
      ...savedCol,
      label: defaultCol.label  // localStorage의 오래된 label을 현재 코드로 덮어씀
    };
  });
}