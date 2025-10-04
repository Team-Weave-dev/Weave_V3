/**
 * Batch Processing Utilities
 *
 * This module provides utility functions for efficient batch operations:
 * - Chunking large arrays into smaller batches
 * - Parallel execution with concurrency limits
 * - Error handling and retry logic
 */

import type { BatchOptions, BatchOperationResult } from '../types/base';

/**
 * Split an array into chunks of specified size
 *
 * @param array - Array to split
 * @param size - Chunk size
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Execute operations in parallel with concurrency limit
 *
 * @param operations - Array of async operations to execute
 * @param limit - Maximum number of concurrent operations
 * @returns Results of all operations
 */
export async function pLimit<T>(
  operations: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const operation of operations) {
    const promise = operation().then((result) => {
      results.push(result);
      // Remove completed operation from executing array
      const index = executing.indexOf(promiseWrapper);
      if (index !== -1) {
        executing.splice(index, 1);
      }
    });

    const promiseWrapper = promise as Promise<void>;
    executing.push(promiseWrapper);

    // Wait if we've reached the concurrency limit
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  // Wait for all remaining operations to complete
  await Promise.all(executing);

  return results;
}

/**
 * Process a batch of operations with chunking and error handling
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param options - Batch processing options
 * @returns Batch operation result with statistics
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<BatchOperationResult & { results: R[] }> {
  const {
    chunkSize = 50,
    maxParallel = 5,
    enableStats = true,
    retryOnError = false,
    maxRetries = 1,
  } = options;

  const startTime = Date.now();
  const results: R[] = [];
  const errors: Array<{ key: string; error: Error }> = [];

  // Split items into chunks
  const chunks = chunk(items, chunkSize);

  // Process each chunk with concurrency limit
  for (const itemChunk of chunks) {
    const chunkOperations = itemChunk.map((item) => async () => {
      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts <= (retryOnError ? maxRetries : 0)) {
        try {
          const result = await processor(item);
          return { success: true, result };
        } catch (error) {
          lastError = error as Error;
          attempts++;

          // If retry is disabled or max retries reached, break
          if (!retryOnError || attempts > maxRetries) {
            break;
          }

          // Exponential backoff delay
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts - 1) * 100)
          );
        }
      }

      // All attempts failed
      return {
        success: false,
        error: lastError || new Error('Unknown error'),
      };
    });

    // Execute chunk operations with concurrency limit
    const chunkResults = await pLimit(chunkOperations, maxParallel);

    // Separate successful results from errors
    for (let i = 0; i < chunkResults.length; i++) {
      const result = chunkResults[i];
      if (result.success && 'result' in result) {
        results.push(result.result as R);
      } else if (!result.success && 'error' in result) {
        errors.push({
          key: String(i), // Use index as key if no better identifier
          error: result.error as Error,
        });
      }
    }
  }

  const executionTime = Date.now() - startTime;
  const successCount = results.length;
  const failureCount = errors.length;
  const totalItems = items.length;

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    errors: errors.length > 0 ? errors : undefined,
    executionTime: enableStats ? executionTime : undefined,
    throughput: enableStats ? (totalItems / executionTime) * 1000 : undefined, // items/second
    results,
  };
}

/**
 * Process a map batch operation (for key-value pairs)
 *
 * @param items - Map of key-value pairs
 * @param processor - Function to process each key-value pair
 * @param options - Batch processing options
 * @returns Batch operation result with statistics
 */
export async function processMapBatch<K, V, R>(
  items: Map<K, V>,
  processor: (key: K, value: V) => Promise<R>,
  options: BatchOptions = {}
): Promise<BatchOperationResult & { results: Map<K, R> }> {
  const {
    chunkSize = 50,
    maxParallel = 5,
    enableStats = true,
    retryOnError = false,
    maxRetries = 1,
  } = options;

  const startTime = Date.now();
  const results = new Map<K, R>();
  const errors: Array<{ key: string; error: Error }> = [];

  // Convert map to array of entries for chunking
  const entries = Array.from(items.entries());
  const chunks = chunk(entries, chunkSize);

  // Process each chunk
  for (const entryChunk of chunks) {
    const chunkOperations = entryChunk.map(([key, value]) => async () => {
      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts <= (retryOnError ? maxRetries : 0)) {
        try {
          const result = await processor(key, value);
          return { success: true, key, result };
        } catch (error) {
          lastError = error as Error;
          attempts++;

          if (!retryOnError || attempts > maxRetries) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts - 1) * 100)
          );
        }
      }

      return {
        success: false,
        key,
        error: lastError || new Error('Unknown error'),
      };
    });

    const chunkResults = await pLimit(chunkOperations, maxParallel);

    // Process results
    for (const result of chunkResults) {
      if (result.success && 'result' in result) {
        results.set(result.key, result.result as R);
      } else if (!result.success && 'error' in result) {
        errors.push({
          key: String(result.key),
          error: result.error as Error,
        });
      }
    }
  }

  const executionTime = Date.now() - startTime;
  const successCount = results.size;
  const failureCount = errors.length;
  const totalItems = items.size;

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    errors: errors.length > 0 ? errors : undefined,
    executionTime: enableStats ? executionTime : undefined,
    throughput: enableStats ? (totalItems / executionTime) * 1000 : undefined,
    results,
  };
}
