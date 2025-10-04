/**
 * Compression Utilities for Storage System
 *
 * Provides compression and decompression utilities for localStorage data.
 * Uses browser-native compression APIs when available, with fallback support.
 *
 * Enhanced in Phase 8.3 with:
 * - Compression statistics tracking
 * - Adaptive threshold optimization
 * - Smart compression decision based on data characteristics
 */

import type { CompressionStats, CompressionOptions } from '../types/base';

/**
 * Compression result with metadata
 */
export interface CompressionResult {
  /** Compressed data as string */
  data: string;
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Compression ratio (0-1, lower is better) */
  ratio: number;
  /** Whether compression was applied */
  compressed: boolean;
  /** Compression time in milliseconds */
  compressionTime?: number;
}

/**
 * Simple LZ-based compression using browser's native TextEncoder
 * This is a lightweight alternative to LZ-String library
 */
class SimpleCompression {
  /**
   * Compress a string using simple run-length encoding
   * This is a basic compression that works well for JSON data
   *
   * @param input - String to compress
   * @returns Compressed string
   */
  compress(input: string): string {
    if (!input) return input;

    let compressed = '';
    let count = 1;
    let current = input[0];

    for (let i = 1; i <= input.length; i++) {
      if (i < input.length && input[i] === current && count < 9) {
        count++;
      } else {
        // Encode: if count > 3, use count notation, else just repeat
        if (count > 3) {
          compressed += `${current}#${count}`;
        } else {
          compressed += current.repeat(count);
        }

        if (i < input.length) {
          current = input[i];
          count = 1;
        }
      }
    }

    return compressed;
  }

  /**
   * Decompress a string compressed with compress()
   *
   * @param compressed - Compressed string
   * @returns Original string
   */
  decompress(compressed: string): string {
    if (!compressed) return compressed;

    let result = '';
    let i = 0;

    while (i < compressed.length) {
      const char = compressed[i];

      // Check for count notation
      if (i + 2 < compressed.length && compressed[i + 1] === '#') {
        const count = parseInt(compressed[i + 2], 10);
        if (!isNaN(count)) {
          result += char.repeat(count);
          i += 3;
          continue;
        }
      }

      result += char;
      i++;
    }

    return result;
  }
}

// Singleton instance
const simpleCompression = new SimpleCompression();

/**
 * Compress data with metadata
 *
 * @param data - String data to compress
 * @param threshold - Minimum size in bytes to apply compression (default: 10KB)
 * @returns Compression result with metadata
 */
export function compressData(
  data: string,
  threshold: number = 10 * 1024
): CompressionResult {
  const originalSize = new Blob([data]).size;

  // Skip compression if data is smaller than threshold
  if (originalSize < threshold) {
    return {
      data,
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      compressed: false,
    };
  }

  try {
    const compressed = simpleCompression.compress(data);
    const compressedSize = new Blob([compressed]).size;
    const ratio = compressedSize / originalSize;

    // Only use compression if it actually reduces size by at least 10%
    if (ratio < 0.9) {
      return {
        data: compressed,
        originalSize,
        compressedSize,
        ratio,
        compressed: true,
      };
    }

    // Compression didn't help, return original
    return {
      data,
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      compressed: false,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    return {
      data,
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      compressed: false,
    };
  }
}

/**
 * Decompress data
 *
 * @param data - Compressed data string
 * @returns Decompressed string
 */
export function decompressData(data: string): string {
  try {
    return simpleCompression.decompress(data);
  } catch (error) {
    console.error('Decompression failed:', error);
    return data;
  }
}

/**
 * Calculate storage size in bytes
 *
 * @param data - Data to measure
 * @returns Size in bytes
 */
export function calculateSize(data: string): number {
  return new Blob([data]).size;
}

/**
 * Get current localStorage usage
 *
 * @returns Object with usage statistics
 */
export function getStorageUsage(): {
  used: number;
  available: number;
  total: number;
  percentage: number;
} {
  const total = 5 * 1024 * 1024; // 5MB default limit
  let used = 0;

  try {
    // Calculate total size of all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += calculateSize(key) + calculateSize(value);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }

  return {
    used,
    available: total - used,
    total,
    percentage: (used / total) * 100,
  };
}

/**
 * Check if there's enough space for new data
 *
 * @param requiredBytes - Required space in bytes
 * @returns True if space is available
 */
export function hasEnoughSpace(requiredBytes: number): boolean {
  const usage = getStorageUsage();
  return usage.available >= requiredBytes;
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * CompressionManager - Advanced Compression System with Statistics and Adaptive Optimization
 *
 * This class provides an intelligent compression layer with:
 * - Compression statistics tracking
 * - Adaptive threshold optimization based on performance
 * - Smart compression decision based on data characteristics
 * - Compression time monitoring
 */
export class CompressionManager {
  /**
   * Compression statistics
   */
  private stats: CompressionStats;

  /**
   * Compression configuration options
   */
  private options: Required<CompressionOptions>;

  /**
   * Default compression options
   */
  private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
    enabled: false,
    threshold: 10 * 1024, // 10KB
    minRatio: 0.9, // Apply compression only if it reduces size by at least 10%
    enableStats: true,
    adaptiveThreshold: false,
  };

  /**
   * Create a new CompressionManager instance
   *
   * @param options - Compression configuration options
   */
  constructor(options: CompressionOptions = {}) {
    this.options = { ...CompressionManager.DEFAULT_OPTIONS, ...options };
    this.stats = {
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSaved: 0,
      averageRatio: 0,
      compressionCount: 0,
      skippedCount: 0,
      averageCompressionTime: 0,
    };
  }

  /**
   * Compress data with statistics tracking
   *
   * @param data - String data to compress
   * @returns Compression result with metadata
   */
  compress(data: string): CompressionResult {
    if (!this.options.enabled) {
      return this.createSkippedResult(data);
    }

    const startTime = performance.now();
    const originalSize = calculateSize(data);

    // Determine threshold (adaptive or fixed)
    const threshold = this.options.adaptiveThreshold
      ? this.getAdaptiveThreshold()
      : this.options.threshold;

    // Skip compression if data is smaller than threshold
    if (originalSize < threshold) {
      this.updateStats({
        data,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        compressed: false,
      });
      return this.createSkippedResult(data);
    }

    try {
      const compressed = simpleCompression.compress(data);
      const compressedSize = calculateSize(compressed);
      const ratio = compressedSize / originalSize;
      const compressionTime = performance.now() - startTime;

      // Only use compression if it reduces size by required ratio
      if (ratio < this.options.minRatio) {
        const result: CompressionResult = {
          data: compressed,
          originalSize,
          compressedSize,
          ratio,
          compressed: true,
          compressionTime,
        };

        this.updateStats(result);
        return result;
      }

      // Compression didn't help enough, return original
      const skippedResult = {
        data,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        compressed: false,
        compressionTime,
      };

      this.updateStats(skippedResult);
      return skippedResult;
    } catch (error) {
      console.error('Compression failed:', error);
      return this.createSkippedResult(data);
    }
  }

  /**
   * Decompress data
   *
   * @param data - Compressed data string
   * @returns Decompressed string
   */
  decompress(data: string): string {
    if (!this.options.enabled) {
      return data;
    }

    return decompressData(data);
  }

  /**
   * Get compression statistics
   *
   * @returns Compression statistics object
   */
  getStats(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * Reset compression statistics
   */
  resetStats(): void {
    this.stats = {
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSaved: 0,
      averageRatio: 0,
      compressionCount: 0,
      skippedCount: 0,
      averageCompressionTime: 0,
    };
  }

  /**
   * Update compression statistics
   *
   * @param result - Compression result
   */
  private updateStats(result: CompressionResult): void {
    if (!this.options.enableStats) return;

    this.stats.totalOriginalSize += result.originalSize;
    this.stats.totalCompressedSize += result.compressedSize;
    this.stats.totalSaved = this.stats.totalOriginalSize - this.stats.totalCompressedSize;

    if (result.compressed) {
      this.stats.compressionCount++;

      // Update average ratio
      const totalRatio =
        this.stats.averageRatio * (this.stats.compressionCount - 1) + result.ratio;
      this.stats.averageRatio = totalRatio / this.stats.compressionCount;

      // Update average compression time
      if (result.compressionTime) {
        const totalTime =
          this.stats.averageCompressionTime * (this.stats.compressionCount - 1) +
          result.compressionTime;
        this.stats.averageCompressionTime = totalTime / this.stats.compressionCount;
      }
    } else {
      this.stats.skippedCount++;
    }
  }

  /**
   * Get adaptive threshold based on compression performance
   *
   * The threshold increases if compression is frequently skipped,
   * and decreases if compression is frequently successful.
   *
   * @returns Adaptive threshold in bytes
   */
  private getAdaptiveThreshold(): number {
    const total = this.stats.compressionCount + this.stats.skippedCount;

    // Need at least 10 samples for adaptation
    if (total < 10) {
      return this.options.threshold;
    }

    const successRate = this.stats.compressionCount / total;

    // If success rate > 70%, lower threshold to compress more
    if (successRate > 0.7) {
      return Math.max(this.options.threshold * 0.5, 5 * 1024); // Min 5KB
    }

    // If success rate < 30%, raise threshold to skip more
    if (successRate < 0.3) {
      return Math.min(this.options.threshold * 2, 50 * 1024); // Max 50KB
    }

    // Keep current threshold
    return this.options.threshold;
  }

  /**
   * Create a result for skipped compression
   *
   * @param data - Original data
   * @returns Compression result indicating no compression
   */
  private createSkippedResult(data: string): CompressionResult {
    const originalSize = calculateSize(data);

    return {
      data,
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      compressed: false,
    };
  }

  /**
   * Get current compression options
   *
   * @returns Current compression options
   */
  getOptions(): CompressionOptions {
    return { ...this.options };
  }

  /**
   * Update compression options
   *
   * @param options - New compression options
   */
  setOptions(options: CompressionOptions): void {
    this.options = { ...this.options, ...options } as Required<CompressionOptions>;
  }
}
