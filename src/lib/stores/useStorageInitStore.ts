/**
 * Storage 초기화 상태 전역 관리 스토어
 * StorageInitializer와 페이지/컴포넌트 간 초기화 완료 시점 동기화
 */

import { create } from 'zustand';

interface StorageInitStore {
  /** Storage 초기화 완료 여부 */
  isInitialized: boolean;
  /** 초기화 진행 중 여부 */
  isInitializing: boolean;
  /** 초기화 에러 */
  error: string | null;

  /** 초기화 시작 */
  startInitializing: () => void;
  /** 초기화 완료 */
  setInitialized: (initialized: boolean) => void;
  /** 초기화 에러 설정 */
  setError: (error: string | null) => void;
}

export const useStorageInitStore = create<StorageInitStore>((set) => ({
  isInitialized: false,
  isInitializing: false,
  error: null,

  startInitializing: () => set({ isInitializing: true, error: null }),
  setInitialized: (initialized) => set({ isInitialized: initialized, isInitializing: false }),
  setError: (error) => set({ error, isInitializing: false }),
}));
