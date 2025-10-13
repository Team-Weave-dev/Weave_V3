# src/lib/storage/utils - 스토리지 유틸리티

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~38: 파일 라인 맵
- 39~41: 중앙화·모듈화·캡슐화
- 42~45: 작업 규칙
- 46~50: 관련 문서

## 디렉토리 목적
스토리지 시스템의 성능 최적화와 공통 연산을 담당하는 유틸리티를 제공합니다.

## 핵심 책임
- 캐시·인덱스·압축 등 성능 개선 유틸 유지
- 이벤트 브리지와 에러 헨들링 헬퍼 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- BackupManager.ts 024~460 export BackupManager
- batch.ts 024~259 export chunk - Split an array into chunks of specified size @param array - Array to split @param size - Chunk size @returns Array of chunks @example ```typescript chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]] ```
- CacheLayer.ts 021~459 export CacheLayer
- compression.ts 018~115 export CompressionResult - Compression result with metadata
- compression.ts 116~174 export compressData - Compress data with metadata @param data - String data to compress @param threshold - Minimum size in bytes to apply compression (default: 10KB) @returns Compression result with metadata
- compression.ts 175~192 export decompressData - Decompress data @param data - Compressed data string @returns Decompressed string
- compression.ts 193~201 export calculateSize - Calculate storage size in bytes Uses TextEncoder for better performance compared to Blob approach. TextEncoder is ~5x faster for typical JSON data sizes. @param data - Data to measure @returns Size in bytes
- compression.ts 202~239 export getStorageUsage - Get current localStorage usage @returns Object with usage statistics
- compression.ts 240~250 export hasEnoughSpace - Check if there's enough space for new data @param requiredBytes - Required space in bytes @returns True if space is available
- compression.ts 251~269 export formatBytes - Format bytes to human-readable string @param bytes - Number of bytes @returns Formatted string (e.g., "1.5 MB")
- compression.ts 270~517 export CompressionManager - CompressionManager - Advanced Compression System with Statistics and Adaptive Optimization This class provides an intelligent compression layer with: - Compression statistics tracking - Adaptive threshold optimization based on performance - Smart compression decision based on data characteristics - Compression time monitoring
- deviceId.ts 31~57 export getDeviceId - Get or create a device ID for this browser The device ID is stored in localStorage and persists across sessions. If no device ID exists, a new one is generated and stored. @returns The device ID for this browser/device
- deviceId.ts 58~73 export resetDeviceId - Reset the device ID (generate a new one) Useful for testing or when you want to treat this as a "new" device @returns The new device ID
- deviceId.ts 74~86 export getDeviceInfo - Get device information for debugging/logging @returns Device information object
- IndexManager.ts 023~500 export IndexManager

## 중앙화·모듈화·캡슐화
- 성능 관련 상수와 정책은 utils 디렉터리에서 정의

## 작업 규칙
- 유틸 변경 후 서비스와 테스트를 업데이트
- 성능 개선 수치를 문서화하고 모니터링과 비교

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/monitoring/claude.md
- src/lib/storage/core/claude.md
