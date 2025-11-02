import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Outlet {
  id: string
  name: string
  region: string
  totalOrder: number
  isActive: boolean
}

export const useOutletStore = defineStore('outlet', () => {
  const outlets = ref<Outlet[]>([
    {
      id: '1',
      name: 'Outlet Jakarta Pusat',
      region: 'Jakarta',
      totalOrder: 245,
      isActive: true,
    },
    {
      id: '2',
      name: 'Outlet Bandung',
      region: 'West Java',
      totalOrder: 189,
      isActive: true,
    },
    {
      id: '3',
      name: 'Outlet Surabaya',
      region: 'East Java',
      totalOrder: 312,
      isActive: true,
    },
    {
      id: '4',
      name: 'Outlet Yogyakarta',
      region: 'Yogyakarta',
      totalOrder: 156,
      isActive: false,
    },
    {
      id: '5',
      name: 'Outlet Medan',
      region: 'North Sumatra',
      totalOrder: 278,
      isActive: true,
    },
  ])

  const activeOutlets = computed(() => outlets.value.filter(outlet => outlet.isActive))
  const inactiveOutlets = computed(() => outlets.value.filter(outlet => !outlet.isActive))

  function getOutletById(id: string): Outlet | undefined {
    return outlets.value.find(outlet => outlet.id === id)
  }

  return { outlets, activeOutlets, inactiveOutlets, getOutletById }
})

