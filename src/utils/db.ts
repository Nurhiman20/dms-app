import Dexie, { type Table } from 'dexie'
import type { Outlet } from '../stores/outlet'
import type { Sale } from '../stores/sales'
import type { QueuedOperation } from './offlineQueue'

/**
 * Database schema for caching application data
 */
export interface CacheMetadata {
  key: string
  timestamp: number
  expiresAt?: number
  version?: number
}

export interface DashboardStatsCache {
  id: string
  stats: any
  totalSales: number
  totalOutlets: number
  timestamp: number
}

class DMSDatabase extends Dexie {
  // Declare implicit table properties
  outlets!: Table<Outlet, string>
  sales!: Table<Sale, string>
  dashboardStats!: Table<DashboardStatsCache, string>
  cacheMetadata!: Table<CacheMetadata, string>
  offlineQueue!: Table<QueuedOperation, string>

  constructor() {
    super('DMSAppCache')

    // Define database schema
    this.version(1).stores({
      outlets: 'id, region, isActive, name', // Primary key: id, indexed: region, isActive, name
      sales: 'id, outletId, date, [outletId+date]', // Primary key: id, indexed: outletId, date, compound index
      dashboardStats: 'id', // Primary key: id
      cacheMetadata: 'key, timestamp', // Primary key: key, indexed: timestamp
    })
    
    // Add offlineQueue table in a new version
    this.version(2).stores({
      outlets: 'id, region, isActive, name',
      sales: 'id, outletId, date, [outletId+date]',
      dashboardStats: 'id',
      cacheMetadata: 'key, timestamp',
      offlineQueue: 'id, timestamp, type, entity', // Primary key: id, indexed: timestamp, type, entity
    })
  }
}

// Create singleton database instance
export const db = new DMSDatabase()

/**
 * Cache expiration times (in milliseconds)
 */
export const CACHE_EXPIRATION = {
  OUTLETS: 24 * 60 * 60 * 1000, // 24 hours
  SALES: 60 * 60 * 1000, // 1 hour
  DASHBOARD_STATS: 30 * 60 * 1000, // 30 minutes
} as const

/**
 * Cache service utilities
 */
export class CacheService {
  /**
   * Check if cache is expired
   */
  async isCacheExpired(key: string): Promise<boolean> {
    try {
      const metadata = await db.cacheMetadata.get(key)
      if (!metadata || !metadata.expiresAt) return false
      return Date.now() > metadata.expiresAt
    } catch {
      return true
    }
  }

  /**
   * Get cache age in milliseconds
   */
  async getCacheAge(key: string): Promise<number | null> {
    try {
      const metadata = await db.cacheMetadata.get(key)
      if (!metadata) return null
      return Date.now() - metadata.timestamp
    } catch {
      return null
    }
  }

  /**
   * Set cache metadata
   */
  async setCacheMetadata(key: string, expiresInMs?: number): Promise<void> {
    await db.cacheMetadata.put({
      key,
      timestamp: Date.now(),
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
    })
  }

  /**
   * Clear all cache data
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      db.outlets.clear(),
      db.sales.clear(),
      db.dashboardStats.clear(),
      db.cacheMetadata.clear(),
    ])
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    outletCount: number
    salesCount: number
    lastUpdated: Record<string, number | null>
  }> {
    const [outletCount, salesCount, outletsMeta, salesMeta, dashboardMeta] = await Promise.all([
      db.outlets.count(),
      db.sales.count(),
      db.cacheMetadata.get('outlets'),
      db.cacheMetadata.get('sales'),
      db.cacheMetadata.get('dashboardStats'),
    ])

    return {
      outletCount,
      salesCount,
      lastUpdated: {
        outlets: outletsMeta?.timestamp || null,
        sales: salesMeta?.timestamp || null,
        dashboardStats: dashboardMeta?.timestamp || null,
      },
    }
  }
}

export const cacheService = new CacheService()
