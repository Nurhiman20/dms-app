import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getSalesByOutletId as getSalesByOutletIdApi, getAllSales as getAllSalesApi } from '../services/salesApi'

export interface Sale {
  id: string
  outletId: string
  date: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customerName: string
  paymentMethod: string
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  /**
   * Gets sales records by outlet ID from the local store
   * @param outletId - The outlet ID
   * @returns Array of sales records for the outlet
   */
  function getSalesByOutletId(outletId: string): Sale[] {
    return sales.value.filter(sale => sale.outletId === outletId)
  }

  /**
   * Fetches sales records by outlet ID from the API
   * @param outletId - The outlet ID to fetch sales for
   * @returns Array of sales records if found, empty array otherwise
   */
  async function fetchSalesByOutletId(outletId: string): Promise<Sale[]> {
    loading.value = true
    error.value = null

    try {
      const response = await getSalesByOutletIdApi(outletId)
      if (response.success) {
        // Merge fetched sales with existing sales, avoiding duplicates
        const existingIds = new Set(sales.value.map(s => s.id))
        const newSales = response.sales.filter(s => !existingIds.has(s.id))
        sales.value.push(...newSales)
        
        // Return all sales for this outlet (from store)
        return getSalesByOutletId(outletId)
      } else {
        error.value = response.message || `Failed to fetch sales for outlet ${outletId}`
        return []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching sales'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetches all sales records from the API
   */
  async function fetchAllSales(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await getAllSalesApi()
      if (response.success) {
        sales.value = response.sales
      } else {
        error.value = response.message || 'Failed to fetch sales'
        sales.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching sales'
      sales.value = []
    } finally {
      loading.value = false
    }
  }

  function addSale(sale: Omit<Sale, 'id'>): Sale {
    const newSale: Sale = {
      ...sale,
      id: `s${Date.now()}`, // Generate unique ID based on timestamp
    }
    sales.value.push(newSale)
    return newSale
  }

  const totalSalesByOutlet = computed(() => {
    const totals = new Map<string, number>()
    sales.value.forEach(sale => {
      const current = totals.get(sale.outletId) || 0
      totals.set(sale.outletId, current + sale.totalAmount)
    })
    return totals
  })

  return {
    sales,
    loading,
    error,
    getSalesByOutletId,
    fetchSalesByOutletId,
    fetchAllSales,
    addSale,
    totalSalesByOutlet,
  }
})

