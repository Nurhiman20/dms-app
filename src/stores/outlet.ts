import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getOutlets, getOutletById as getOutletByIdApi } from '../services/outletApi'

export interface Outlet {
  id: string
  name: string
  region: string
  totalOrder: number
  isActive: boolean
}

export const useOutletStore = defineStore('outlet', () => {
  const outlets = ref<Outlet[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const activeOutlets = computed(() => outlets.value.filter(outlet => outlet.isActive))
  const inactiveOutlets = computed(() => outlets.value.filter(outlet => !outlet.isActive))

  /**
   * Fetches outlets from the API
   */
  async function fetchOutlets(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await getOutlets()
      if (response.success) {
        outlets.value = response.outlets
      } else {
        error.value = response.message || 'Failed to fetch outlets'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching outlets'
      outlets.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Gets an outlet by ID from the local store
   * @param id - The outlet ID
   * @returns The outlet if found, undefined otherwise
   */
  function getOutletById(id: string): Outlet | undefined {
    return outlets.value.find(outlet => outlet.id === id)
  }

  /**
   * Fetches a single outlet by ID from the API
   * @param id - The outlet ID to fetch
   * @returns The outlet if found, null otherwise
   */
  async function fetchOutletById(id: string): Promise<Outlet | null> {
    loading.value = true
    error.value = null

    try {
      const response = await getOutletByIdApi(id)
      if (response.success && response.outlet) {
        // Update or add the outlet to the local store
        const existingIndex = outlets.value.findIndex(o => o.id === id)
        if (existingIndex >= 0) {
          outlets.value[existingIndex] = response.outlet
        } else {
          outlets.value.push(response.outlet)
        }
        return response.outlet
      } else {
        error.value = response.message || `Outlet with ID ${id} not found`
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching outlet'
      return null
    } finally {
      loading.value = false
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
  }
})

