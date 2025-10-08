/**
 * User Service
 *
 * Domain service for managing user profiles and authentication data.
 * Provides CRUD operations and profile-specific business logic.
 */

import type { StorageManager } from '../core/StorageManager';
import { STORAGE_KEYS } from '../config';
import type { User } from '../types/entities/user';
import { isUser } from '../types/entities/user';
import { BaseService } from './BaseService';

/**
 * User domain service
 *
 * Manages user profiles with DualWrite mode support (LocalStorage + Supabase).
 * Provides type-safe operations for user data management.
 */
export class UserService extends BaseService<User> {
  protected entityKey = STORAGE_KEYS.USERS;

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard for User entity
   */
  protected isValidEntity(data: unknown): data is User {
    return isUser(data);
  }

  // ============================================================================
  // User-Specific Operations
  // ============================================================================

  /**
   * Get user by email address
   *
   * @param email - User email address
   * @returns User or null if not found
   *
   * @example
   * ```typescript
   * const user = await userService.getByEmail('user@example.com')
   * if (user) {
   *   console.log('User found:', user.name)
   * }
   * ```
   */
  async getByEmail(email: string): Promise<User | null> {
    return this.findOne((user) => user.email === email);
  }

  /**
   * Update user profile information
   *
   * @param userId - User ID
   * @param profileData - Profile fields to update
   * @returns Updated user or null if not found
   *
   * @example
   * ```typescript
   * const updated = await userService.updateProfile('user-123', {
   *   phone: '010-1234-5678',
   *   address: '서울시 강남구',
   *   businessType: 'freelancer'
   * })
   * ```
   */
  async updateProfile(
    userId: string,
    profileData: Partial<
      Pick<User, 'name' | 'email' | 'avatar' | 'phone' | 'businessNumber' | 'address' | 'addressDetail' | 'businessType'>
    >
  ): Promise<User | null> {
    return this.update(userId, profileData);
  }

  /**
   * Get user by phone number
   *
   * @param phone - User phone number
   * @returns User or null if not found
   */
  async getByPhone(phone: string): Promise<User | null> {
    return this.findOne((user) => user.phone === phone);
  }

  /**
   * Get users by business type
   *
   * @param businessType - Business type filter
   * @returns Array of users matching the business type
   */
  async getByBusinessType(businessType: User['businessType']): Promise<User[]> {
    return this.find((user) => user.businessType === businessType);
  }

  /**
   * Update user metadata (theme, language, timezone)
   *
   * @param userId - User ID
   * @param metadata - Metadata to update
   * @returns Updated user or null if not found
   */
  async updateMetadata(userId: string, metadata: Partial<User['metadata']>): Promise<User | null> {
    const user = await this.getById(userId);
    if (!user) return null;

    const updatedMetadata = {
      ...user.metadata,
      ...metadata,
    };

    return this.update(userId, { metadata: updatedMetadata });
  }

  // ============================================================================
  // Query Helpers
  // ============================================================================

  /**
   * Search users by name (case-insensitive)
   *
   * @param query - Search query
   * @returns Array of users matching the query
   */
  async searchByName(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return this.find((user) => user.name.toLowerCase().includes(lowerQuery));
  }

  /**
   * Get recently updated users
   *
   * @param limit - Maximum number of users to return (default: 10)
   * @returns Array of users sorted by updatedAt (most recent first)
   */
  async getRecentlyUpdated(limit: number = 10): Promise<User[]> {
    const users = await this.getAll_sorted((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return users.slice(0, limit);
  }
}
