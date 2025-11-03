import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { getSalesByOutletId as getSalesByOutletIdApi, getAllSales as getAllSalesApi } from '../services/salesApi';
import { db, cacheService, CACHE_EXPIRATION } from '../utils/db';
import { isOnline, checkNetworkStatus } from '../utils/networkStatus';

export interface Sale {
  id: string;
  outletId: string;
  date: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  paymentMethod: string;
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const cacheInitialized = ref<boolean>(false);

  /**
   * Initialize cache and load cached data
   */
  async function initializeCache(): Promise<void> {
    if (cacheInitialized.value) return;

    try {
      const isExpired = await cacheService.isCacheExpired('sales');

      if (!isExpired) {
        const cachedSales = await db.sales.toArray();
        if (cachedSales.length > 0) {
          sales.value = cachedSales;
        }
      }

      cacheInitialized.value = true;
    } catch (err) {
      console.error('[Sales Store] Failed to initialize cache:', err);
    }
  }

  /**
   * Gets sales records by outlet ID from the local store
   * @param outletId - The outlet ID
   * @returns Array of sales records for the outlet
   */
  function getSalesByOutletId(outletId: string): Sale[] {
    return sales.value.filter(sale => sale.outletId === outletId);
  }

  /**
   * Fetches sales records by outlet ID from cache first, then API
   * @param outletId - The outlet ID to fetch sales for
   * @param forceRefresh - If true, bypass cache and fetch from API
   * @returns Array of sales records if found, empty array otherwise
   */
  async function fetchSalesByOutletId(outletId: string, forceRefresh = false): Promise<Sale[]> {
    loading.value = true;
    error.value = null;

    if (!cacheInitialized.value) {
      await initializeCache();
    }

    try {
      // Try to load from cache first (offline-first)
      const localSales = getSalesByOutletId(outletId);

      if (!forceRefresh && localSales.length === 0) {
        // Try cache using Dexie index
        const cachedSales = await db.sales.where('outletId').equals(outletId).toArray();
        if (cachedSales.length > 0) {
          // Merge with existing sales, avoiding duplicates
          const existingIds = new Set(sales.value.map(s => s.id));
          const newSales = cachedSales.filter(s => !existingIds.has(s.id));
          sales.value.push(...newSales);

          // Check if cache is still valid
          const isExpired = await cacheService.isCacheExpired('sales');
          if (!isExpired) {
            const online = await checkNetworkStatus();
            if (!online) {
              loading.value = false;
              return getSalesByOutletId(outletId); // Use cached data
            }
          }
        }
      }

      // Try to fetch from API if online
      const online = await checkNetworkStatus();
      if (online) {
        try {
          const response = await getSalesByOutletIdApi(outletId);
          if (response.success) {
            // Load all cached sales first to ensure we don't lose any data
            const allCachedSales = await db.sales.toArray();

            // Merge: start with all cached sales
            const salesMap = new Map<string, Sale>();
            allCachedSales.forEach(sale => salesMap.set(sale.id, sale));

            // Add/update with newly fetched sales
            response.sales.forEach(sale => salesMap.set(sale.id, sale));

            // Convert map back to array
            const allSales = Array.from(salesMap.values());

            // Update local store
            sales.value = allSales;

            // Save ALL sales to cache
            await db.sales.bulkPut(allSales);
            await cacheService.setCacheMetadata('sales', CACHE_EXPIRATION.SALES);

            return getSalesByOutletId(outletId);
          } else {
            error.value = response.message || `Failed to fetch sales for outlet ${outletId}`;
            // Fallback to local/cached data
            return getSalesByOutletId(outletId);
          }
        } catch (apiError) {
          // Network error - use cache if available
          console.warn('[Sales Store] API fetch failed, using cache:', apiError);
          const result = getSalesByOutletId(outletId);
          if (result.length > 0) {
            error.value = 'Using cached data (offline mode)';
            return result;
          }
          error.value = apiError instanceof Error ? apiError.message : 'An error occurred while fetching sales';
          return [];
        }
      } else {
        // Offline - use cache
        const result = getSalesByOutletId(outletId);
        if (result.length > 0) {
          error.value = 'Using cached data (offline mode)';
          return result;
        }

        // Try cache one more time
        const cachedSales = await db.sales.where('outletId').equals(outletId).toArray();
        if (cachedSales.length > 0) {
          const existingIds = new Set(sales.value.map(s => s.id));
          const newSales = cachedSales.filter(s => !existingIds.has(s.id));
          sales.value.push(...newSales);
          error.value = 'Using cached data (offline mode)';
          return getSalesByOutletId(outletId);
        }

        error.value = `No cached sales data for outlet ${outletId}. Please connect to the internet.`;
        return [];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching sales';

      // Last resort: try cache
      try {
        const cachedSales = await db.sales.where('outletId').equals(outletId).toArray();
        if (cachedSales.length > 0) {
          const existingIds = new Set(sales.value.map(s => s.id));
          const newSales = cachedSales.filter(s => !existingIds.has(s.id));
          sales.value.push(...newSales);
          return getSalesByOutletId(outletId);
        }
      } catch {
        // Ignore cache errors
      }

      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetches all sales records from cache first, then API
   * @param forceRefresh - If true, bypass cache and fetch from API
   */
  async function fetchAllSales(forceRefresh = false): Promise<void> {
    loading.value = true;
    error.value = null;

    if (!cacheInitialized.value) {
      await initializeCache();
    }

    try {
      // Try to load from cache first
      if (!forceRefresh && sales.value.length === 0) {
        const cachedSales = await db.sales.toArray();
        if (cachedSales.length > 0) {
          sales.value = cachedSales;

          // Check if cache is still valid
          const isExpired = await cacheService.isCacheExpired('sales');
          if (!isExpired) {
            const online = await checkNetworkStatus();
            if (!online) {
              loading.value = false;
              return; // Use cached data
            }
          }
        }
      }

      // Try to fetch from API if online
      const online = await checkNetworkStatus();
      if (online) {
        try {
          const response = await getAllSalesApi();
          if (response.success) {
            sales.value = response.sales;

            // Save to cache
            await db.sales.bulkPut(response.sales);
            await cacheService.setCacheMetadata('sales', CACHE_EXPIRATION.SALES);

            error.value = null;
            return;
          } else {
            error.value = response.message || 'Failed to fetch sales';
            // Fallback to cache if available
            if (sales.value.length === 0) {
              const cached = await db.sales.toArray();
              if (cached.length > 0) {
                sales.value = cached;
              }
            }
          }
        } catch (apiError) {
          // Network error - use cache if available
          console.warn('[Sales Store] API fetch failed, using cache:', apiError);
          if (sales.value.length === 0) {
            const cached = await db.sales.toArray();
            if (cached.length > 0) {
              sales.value = cached;
              error.value = 'Using cached data (offline mode)';
              return;
            }
          }
          error.value = apiError instanceof Error ? apiError.message : 'An error occurred while fetching sales';
          sales.value = [];
        }
      } else {
        // Offline - use cache only
        if (sales.value.length === 0) {
          const cached = await db.sales.toArray();
          if (cached.length > 0) {
            sales.value = cached;
            error.value = 'Using cached data (offline mode)';
          } else {
            error.value = 'No cached data available. Please connect to the internet.';
            sales.value = [];
          }
        } else {
          error.value = 'Using cached data (offline mode)';
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching sales';

      // Last resort: try cache
      try {
        if (sales.value.length === 0) {
          const cached = await db.sales.toArray();
          if (cached.length > 0) {
            sales.value = cached;
          }
        }
      } catch {
        sales.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * Add a new sale (also saves to cache)
   */
  async function addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const newSale: Sale = {
      ...sale,
      id: `s${Date.now()}`, // Generate unique ID based on timestamp
    };
    sales.value.push(newSale);

    // Save to cache
    try {
      await db.sales.put(newSale);
    } catch (err) {
      console.error('[Sales Store] Failed to save sale to cache:', err);
    }

    return newSale;
  }

  const totalSalesByOutlet = computed(() => {
    const totals = new Map<string, number>();
    sales.value.forEach(sale => {
      const current = totals.get(sale.outletId) || 0;
      totals.set(sale.outletId, current + sale.totalAmount);
    });
    return totals;
  });

  /**
   * Clear sales cache
   */
  async function clearCache(): Promise<void> {
    try {
      await db.sales.clear();
      await db.cacheMetadata.delete('sales');
      sales.value = [];
    } catch (err) {
      console.error('[Sales Store] Failed to clear cache:', err);
    }
  }

  return {
    sales,
    loading,
    error,
    getSalesByOutletId,
    fetchSalesByOutletId,
    fetchAllSales,
    addSale,
    totalSalesByOutlet,
    initializeCache,
    clearCache,
  };
})

