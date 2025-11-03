/**
 * Dummy Dashboard API Service
 * Simulates API calls for dashboard statistics without a real backend
 */

import { db, cacheService, CACHE_EXPIRATION } from '../utils/db';
import { checkNetworkStatus } from '../utils/networkStatus';

export interface RegionSalesStat {
  region: string;
  totalSales: number;
  outletCount: number;
  averageSales: number;
}

export interface GetDashboardStatsResponse {
  success: boolean;
  stats: RegionSalesStat[];
  totalSales: number;
  totalOutlets: number;
  message?: string;
}

/**
 * Mock dashboard statistics data - aggregated sales by region
 */
const mockDashboardStats: RegionSalesStat[] = [
  {
    region: 'Jakarta',
    totalSales: 24500000,
    outletCount: 1,
    averageSales: 24500000,
  },
  {
    region: 'West Java',
    totalSales: 14175000,
    outletCount: 1,
    averageSales: 14175000,
  },
  {
    region: 'East Java',
    totalSales: 31900000,
    outletCount: 1,
    averageSales: 31900000,
  },
  {
    region: 'Yogyakarta',
    totalSales: 7750000,
    outletCount: 1,
    averageSales: 7750000,
  },
  {
    region: 'North Sumatra',
    totalSales: 26300000,
    outletCount: 1,
    averageSales: 26300000,
  },
  {
    region: 'Central Java',
    totalSales: 12900000,
    outletCount: 1,
    averageSales: 12900000,
  },
  {
    region: 'South Sulawesi',
    totalSales: 13450000,
    outletCount: 1,
    averageSales: 13450000,
  },
  {
    region: 'Bali',
    totalSales: 5700000,
    outletCount: 1,
    averageSales: 5700000,
  },
];

/**
 * Simulates fetching dashboard statistics from API
 * Returns aggregated sales data by region
 * Supports offline mode with caching
 * @param forceRefresh - If true, bypass cache and fetch from API
 * @returns Promise with dashboard statistics response
 */
export async function getDashboardStats(forceRefresh = false): Promise<GetDashboardStatsResponse> {
  try {
    // Try to load from cache first (offline-first)
    if (!forceRefresh) {
      const cached = await db.dashboardStats.get('current');
      if (cached) {
        const isExpired = await cacheService.isCacheExpired('dashboardStats');
        const online = await checkNetworkStatus();
        
        // Use cache if not expired or if offline
        if (!isExpired || !online) {
          return {
            success: true,
            stats: cached.stats,
            totalSales: cached.totalSales,
            totalOutlets: cached.totalOutlets,
            message: online ? 'Dashboard statistics loaded from cache' : 'Dashboard statistics (offline mode)',
          };
        }
      }
    }

    // Try to fetch from API if online
    const online = await checkNetworkStatus();
    if (online) {
      try {
        // Simulate API delay (600ms - 1.2s)
        const delay = Math.random() * 600 + 600;
        await new Promise((resolve) => setTimeout(resolve, delay));

        const totalSales = mockDashboardStats.reduce((sum, stat) => sum + stat.totalSales, 0);
        const totalOutlets = mockDashboardStats.reduce((sum, stat) => sum + stat.outletCount, 0);

        // Save to cache
        await db.dashboardStats.put({
          id: 'current',
          stats: mockDashboardStats,
          totalSales,
          totalOutlets,
          timestamp: Date.now(),
        });
        await cacheService.setCacheMetadata('dashboardStats', CACHE_EXPIRATION.DASHBOARD_STATS);

        return {
          success: true,
          stats: mockDashboardStats,
          totalSales,
          totalOutlets,
          message: 'Dashboard statistics fetched successfully',
        };
      } catch (apiError) {
        // Network error - use cache if available
        console.warn('[Dashboard API] Fetch failed, using cache:', apiError);
        const cached = await db.dashboardStats.get('current');
        if (cached) {
          return {
            success: true,
            stats: cached.stats,
            totalSales: cached.totalSales,
            totalOutlets: cached.totalOutlets,
            message: 'Using cached data (offline mode)',
          };
        }
        throw apiError;
      }
    } else {
      // Offline - use cache
      const cached = await db.dashboardStats.get('current');
      if (cached) {
        return {
          success: true,
          stats: cached.stats,
          totalSales: cached.totalSales,
          totalOutlets: cached.totalOutlets,
          message: 'Using cached data (offline mode)',
        };
      }
      throw new Error('No cached dashboard data available. Please connect to the internet.');
    }
  } catch (err) {
    // Last resort: try cache
    try {
      const cached = await db.dashboardStats.get('current');
      if (cached) {
        return {
          success: true,
          stats: cached.stats,
          totalSales: cached.totalSales,
          totalOutlets: cached.totalOutlets,
          message: 'Using cached data (offline mode)',
        };
      }
    } catch {
      // Ignore cache errors
    }
    throw err;
  }
}

