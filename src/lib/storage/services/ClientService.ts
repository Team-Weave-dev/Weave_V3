/**
 * Client Service
 *
 * This file provides Client domain service.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type { Client, ClientCreate, ClientUpdate, ClientContact } from '../types/entities/client';
import { isClient } from '../types/entities/client';
import { STORAGE_KEYS } from '../config';

/**
 * Client service class
 * Manages clients with contact and address information
 */
export class ClientService extends BaseService<Client> {
  protected entityKey = STORAGE_KEYS.CLIENTS;

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard implementation
   */
  protected isValidEntity(data: unknown): data is Client {
    return isClient(data);
  }

  // ============================================================================
  // Basic Query Methods
  // ============================================================================

  /**
   * Get clients by user ID
   */
  async getClientsByUser(userId: string): Promise<Client[]> {
    return this.find((client) => client.userId === userId);
  }

  /**
   * Get clients with company
   */
  async getCompanyClients(): Promise<Client[]> {
    return this.find((client) => client.company !== undefined);
  }

  /**
   * Get individual clients (no company)
   */
  async getIndividualClients(): Promise<Client[]> {
    return this.find((client) => client.company === undefined);
  }

  // ============================================================================
  // Search Methods
  // ============================================================================

  /**
   * Search clients by name or company
   */
  async searchClients(query: string): Promise<Client[]> {
    const lowerQuery = query.toLowerCase();
    return this.find(
      (client) =>
        client.name.toLowerCase().includes(lowerQuery) || (client.company?.toLowerCase().includes(lowerQuery) ?? false)
    );
  }

  /**
   * Search clients by email
   */
  async searchByEmail(email: string): Promise<Client[]> {
    const lowerEmail = email.toLowerCase();
    return this.find((client) => client.email?.toLowerCase().includes(lowerEmail) ?? false);
  }

  /**
   * Search clients by phone
   */
  async searchByPhone(phone: string): Promise<Client[]> {
    return this.find((client) => client.phone?.includes(phone) ?? false);
  }

  /**
   * Get client by exact email
   */
  async getClientByEmail(email: string): Promise<Client | null> {
    return this.findOne((client) => client.email?.toLowerCase() === email.toLowerCase());
  }

  // ============================================================================
  // Address Management
  // ============================================================================

  /**
   * Update client address
   */
  async updateAddress(
    clientId: string,
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    }
  ): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client) return null;

    const updatedAddress = {
      ...(client.address || {}),
      ...address,
    };

    return this.update(clientId, { address: updatedAddress });
  }

  /**
   * Get clients by city
   */
  async getClientsByCity(city: string): Promise<Client[]> {
    return this.find((client) => client.address?.city?.toLowerCase() === city.toLowerCase());
  }

  /**
   * Get clients by country
   */
  async getClientsByCountry(country: string): Promise<Client[]> {
    return this.find((client) => client.address?.country?.toLowerCase() === country.toLowerCase());
  }

  // ============================================================================
  // Contact Management
  // ============================================================================

  /**
   * Update primary contact information
   */
  async updateContact(
    clientId: string,
    contact: {
      email?: string;
      phone?: string;
      website?: string;
    }
  ): Promise<Client | null> {
    return this.update(clientId, contact);
  }

  /**
   * Add contact person
   */
  async addContactPerson(
    clientId: string,
    contactPerson: ClientContact
  ): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client) return null;

    const contacts = client.contacts || [];
    const updatedContacts = [...contacts, contactPerson];

    return this.update(clientId, { contacts: updatedContacts });
  }

  /**
   * Remove contact person
   */
  async removeContactPerson(clientId: string, contactName: string): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client || !client.contacts) return null;

    const updatedContacts = client.contacts.filter((person) => person.name !== contactName);

    return this.update(clientId, { contacts: updatedContacts });
  }

  /**
   * Update contact person
   */
  async updateContactPerson(
    clientId: string,
    contactName: string,
    updates: Partial<ClientContact>
  ): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client || !client.contacts) return null;

    const updatedContacts = client.contacts.map((person) => {
      if (person.name === contactName) {
        return { ...person, ...updates };
      }
      return person;
    });

    return this.update(clientId, { contacts: updatedContacts });
  }

  /**
   * Set primary contact person
   */
  async setPrimaryContact(clientId: string, contactName: string): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client || !client.contacts) return null;

    const updatedContacts = client.contacts.map((person) => ({
      ...person,
      isPrimary: person.name === contactName,
    }));

    return this.update(clientId, { contacts: updatedContacts });
  }

  /**
   * Get primary contact person
   */
  async getPrimaryContact(clientId: string): Promise<ClientContact | null> {
    const client = await this.getById(clientId);
    if (!client || !client.contacts) return null;

    return client.contacts.find((person) => person.isPrimary) || null;
  }

  // ============================================================================
  // Rating Management
  // ============================================================================

  /**
   * Update client rating (1-5)
   */
  async updateRating(clientId: string, rating: number): Promise<Client | null> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return this.update(clientId, { rating });
  }

  /**
   * Get clients by rating
   */
  async getClientsByRating(rating: number): Promise<Client[]> {
    return this.find((client) => client.rating === rating);
  }

  /**
   * Get clients with minimum rating
   */
  async getClientsByMinRating(minRating: number): Promise<Client[]> {
    return this.find((client) => (client.rating || 0) >= minRating);
  }

  // ============================================================================
  // Tag Management
  // ============================================================================

  /**
   * Add tags to client
   */
  async addTags(clientId: string, tags: string[]): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client) return null;

    const existingTags = client.tags || [];
    const uniqueTags = Array.from(new Set([...existingTags, ...tags]));

    return this.update(clientId, { tags: uniqueTags });
  }

  /**
   * Remove tags from client
   */
  async removeTags(clientId: string, tags: string[]): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client || !client.tags) return null;

    const tagsToRemove = new Set(tags);
    const updatedTags = client.tags.filter((tag) => !tagsToRemove.has(tag));

    return this.update(clientId, { tags: updatedTags });
  }

  /**
   * Get clients by tag
   */
  async getClientsByTag(tag: string): Promise<Client[]> {
    return this.find((client) => client.tags?.includes(tag) ?? false);
  }

  // ============================================================================
  // Notes Management
  // ============================================================================

  /**
   * Add note to client
   */
  async addNote(clientId: string, note: string): Promise<Client | null> {
    const client = await this.getById(clientId);
    if (!client) return null;

    const currentNotes = client.notes || '';
    const timestamp = new Date().toISOString();
    const updatedNotes = currentNotes
      ? `${currentNotes}\n\n[${timestamp}]\n${note}`
      : `[${timestamp}]\n${note}`;

    return this.update(clientId, { notes: updatedNotes });
  }

  /**
   * Update notes
   */
  async updateNotes(clientId: string, notes: string): Promise<Client | null> {
    return this.update(clientId, { notes });
  }

  // ============================================================================
  // Business Information
  // ============================================================================

  /**
   * Update business information
   */
  async updateBusinessInfo(
    clientId: string,
    info: {
      businessNumber?: string;
      taxId?: string;
      website?: string;
      industry?: string;
    }
  ): Promise<Client | null> {
    return this.update(clientId, info);
  }

  /**
   * Get clients by industry
   */
  async getClientsByIndustry(industry: string): Promise<Client[]> {
    return this.find((client) => client.industry?.toLowerCase() === industry.toLowerCase());
  }

  // ============================================================================
  // Sorting and Organization
  // ============================================================================

  /**
   * Get clients sorted by name
   */
  async getClientsSortedByName(): Promise<Client[]> {
    return this.getAll_sorted((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get clients sorted by company name
   */
  async getClientsSortedByCompany(): Promise<Client[]> {
    return this.getAll_sorted((a, b) => {
      const companyA = a.company || '';
      const companyB = b.company || '';
      return companyA.localeCompare(companyB);
    });
  }

  /**
   * Get clients sorted by rating (descending)
   */
  async getClientsSortedByRating(): Promise<Client[]> {
    return this.getAll_sorted((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * Get recently added clients
   */
  async getRecentClients(limit: number = 10): Promise<Client[]> {
    const allClients = await this.getAll();
    return allClients.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)).slice(0, limit);
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get client count by type
   */
  async getClientCountByType(): Promise<{ individual: number; company: number }> {
    const allClients = await this.getAll();

    const counts = {
      individual: 0,
      company: 0,
    };

    allClients.forEach((client) => {
      if (client.company) {
        counts.company++;
      } else {
        counts.individual++;
      }
    });

    return counts;
  }

  /**
   * Get clients by country statistics
   */
  async getClientsByCountryStats(): Promise<Record<string, number>> {
    const allClients = await this.getAll();
    const stats: Record<string, number> = {};

    allClients.forEach((client) => {
      const country = client.address?.country || 'Unknown';
      stats[country] = (stats[country] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get clients by rating statistics
   */
  async getRatingStats(): Promise<Record<number, number>> {
    const allClients = await this.getAll();
    const stats: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    allClients.forEach((client) => {
      if (client.rating && client.rating >= 1 && client.rating <= 5) {
        stats[client.rating]++;
      }
    });

    return stats;
  }

  /**
   * Get average rating
   */
  async getAverageRating(): Promise<number> {
    const allClients = await this.getAll();
    const clientsWithRating = allClients.filter((client) => client.rating !== undefined);

    if (clientsWithRating.length === 0) return 0;

    const totalRating = clientsWithRating.reduce((sum, client) => sum + (client.rating || 0), 0);
    return totalRating / clientsWithRating.length;
  }
}
