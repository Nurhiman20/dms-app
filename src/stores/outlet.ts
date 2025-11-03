import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { getOutlets, getOutletById as getOutletByIdApi } from '../services/outletApi';
import { db, cacheService, CACHE_EXPIRATION } from '../utils/db';
import { isOnline, checkNetworkStatus } from '../utils/networkStatus';

export interface Outlet {
  id: string;
  name: string;
  region: string;
  totalOrder: number;
  isActive: boolean;
}

export const useOutletStore = defineStore('outlet', () => {
  const outlets = ref<Outlet[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const cacheInitialized = ref<boolean>(false);

  const activeOutlets = computed(() => outlets.value.filter(outlet => outlet.isActive));
  const inactiveOutlets = computed(() => outlets.value.filter(outlet => !outlet.isActive));

  /**
   * Initialize cache and load cached data
   */
  async function initializeCache(): Promise<void> {
    if (cacheInitialized.value) return;

    try {
      // Check if cache is expired
      const isExpired = await cacheService.isCacheExpired('outlets');

      if (!isExpired) {
        const cachedOutlets = await db.outlets.toArray();
        if (cachedOutlets.length > 0) {
          outlets.value = cachedOutlets;
        }
      }

      cacheInitialized.value = true;
    } catch (err) {
      console.error('[Outlet Store] Failed to initialize cache:', err);
    }
  }

  /**
   * Fetches outlets from cache first, then API if online
   * @param forceRefresh - If true, bypass cache and fetch from API
   */
  async function fetchOutlets(forceRefresh = false): Promise<void> {
    loading.value = true;
    error.value = null;

    // Initialize cache on first call
    if (!cacheInitialized.value) {
      await initializeCache();
    }

    try {
      // Try to load from cache first (offline-first)
      if (!forceRefresh && outlets.value.length === 0) {
        const cachedOutlets = await db.outlets.toArray();
        if (cachedOutlets.length > 0) {
          outlets.value = cachedOutlets;
          // Check if cache is still valid
          const isExpired = await cacheService.isCacheExpired('outlets');
          if (!isExpired) {
            // Cache is valid, can return early if offline
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
          const response = await getOutlets();
          if (response.success) {
            outlets.value = response.outlets;

            // Save to cache
            await db.outlets.bulkPut(response.outlets);
            await cacheService.setCacheMetadata('outlets', CACHE_EXPIRATION.OUTLETS);

            error.value = null;
            return;
          } else {
            error.value = response.message || 'Failed to fetch outlets';
            // Fallback to cache if available
            if (outlets.value.length === 0) {
              const cached = await db.outlets.toArray();
              if (cached.length > 0) {
                outlets.value = cached;
              }
            }
          }
        } catch (apiError) {
          // Network error - use cache if available
          console.warn('[Outlet Store] API fetch failed, using cache:', apiError);
          if (outlets.value.length === 0) {
            const cached = await db.outlets.toArray();
            if (cached.length > 0) {
              outlets.value = cached;
              error.value = 'Using cached data (offline mode)';
              return;
            }
          }
          error.value = apiError instanceof Error ? apiError.message : 'Failed to fetch outlets';
        }
      } else {
        // Offline - use cache only
        if (outlets.value.length === 0) {
          const cached = await db.outlets.toArray();
          if (cached.length > 0) {
            outlets.value = cached;
            error.value = 'Using cached data (offline mode)';
          } else {
            error.value = 'No cached data available. Please connect to the internet.';
            outlets.value = [];
          }
        } else {
          error.value = 'Using cached data (offline mode)';
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching outlets';

      // Last resort: try cache
      try {
        if (outlets.value.length === 0) {
          const cached = await db.outlets.toArray();
          if (cached.length > 0) {
            outlets.value = cached;
          }
        }
      } catch {
        outlets.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * Gets an outlet by ID from the local store
   * @param id - The outlet ID
   * @returns The outlet if found, undefined otherwise
   */
  function getOutletById(id: string): Outlet | undefined {
    return outlets.value.find(outlet => outlet.id === id);
  }

  /**
   * Fetches a single outlet by ID from cache first, then API
   * @param id - The outlet ID to fetch
   * @returns The outlet if found, null otherwise
   */
  async function fetchOutletById(id: string): Promise<Outlet | null> {
    loading.value = true;
    error.value = null;

    // Check local store first
    const localOutlet = getOutletById(id);
    if (localOutlet) {
      loading.value = false;
      return localOutlet;
    }

    try {
      // Check cache
      const cachedOutlet = await db.outlets.get(id);
      if (cachedOutlet) {
        // Update local store
        outlets.value.push(cachedOutlet);
      }

      // Check network status and cache expiration
      const online = await checkNetworkStatus();
      const isExpired = await cacheService.isCacheExpired('outlets');

      // If offline or cache is still valid, return cached data
      if (cachedOutlet && (!online || !isExpired)) {
        loading.value = false;
        return cachedOutlet;
      }

      // Fetch from API if online
      if (online) {
        try {
          const response = await getOutletByIdApi(id);
          if (response.success && response.outlet) {
            // Update or add to local store
            const existingIndex = outlets.value.findIndex(o => o.id === id);
            if (existingIndex >= 0) {
              outlets.value[existingIndex] = response.outlet;
            } else {
              outlets.value.push(response.outlet);
            }

            // Update cache
            await db.outlets.put(response.outlet);

            return response.outlet;
          } else {
            // Fallback to cache
            if (cachedOutlet) {
              return cachedOutlet;
            }
            error.value = response.message || `Outlet with ID ${id} not found`;
            return null;
          }
        } catch (apiError) {
          // Use cache if available
          if (cachedOutlet) {
            return cachedOutlet;
          }
          error.value = apiError instanceof Error ? apiError.message : 'An error occurred while fetching outlet';
          return null;
        }
      } else {
        // Offline - use cache
        if (cachedOutlet) {
          return cachedOutlet;
        }
        error.value = `Outlet with ID ${id} not found in cache. Please connect to the internet.`;
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching outlet';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear outlet cache
   */
  async function clearCache(): Promise<void> {
    try {
      await db.outlets.clear();
      await db.cacheMetadata.delete('outlets');
      outlets.value = [];
    } catch (err) {
      console.error('[Outlet Store] Failed to clear cache:', err);
    }
  }

  return {
    outlets,
    loading,
    error,
    activeOutlets,
    inactiveOutlets,
    fetchOutlets,
    getOutletById,
    fetchOutletById,
    initializeCache,
    clearCache,
  };
})

