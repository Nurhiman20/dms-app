/**
 * Dummy Outlet API Service
 * Simulates API calls for outlet operations without a real backend
 */

import type { Outlet } from '../stores/outlet'

export interface GetOutletsResponse {
  success: boolean
  outlets: Outlet[]
  total: number
  message?: string
}

/**
 * Simulates fetching the outlet list from API
 * @returns Promise with outlet list response
 */
export async function getOutlets(): Promise<GetOutletsResponse> {
  // Simulate API delay (800ms - 1.5s)
  const delay = Math.random() * 700 + 800
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Mock outlet data matching the Outlet interface
  const mockOutlets: Outlet[] = [
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
    {
      id: '6',
      name: 'Outlet Semarang',
      region: 'Central Java',
      totalOrder: 203,
      isActive: true,
    },
    {
      id: '7',
      name: 'Outlet Makassar',
      region: 'South Sulawesi',
      totalOrder: 167,
      isActive: true,
    },
    {
      id: '8',
      name: 'Outlet Denpasar',
      region: 'Bali',
      totalOrder: 234,
      isActive: false,
    },
  ]

  return {
    success: true,
    outlets: mockOutlets,
    total: mockOutlets.length,
    message: 'Outlets fetched successfully',
  }
}

/**
 * Simulates fetching a single outlet by ID
 * @param id - The outlet ID to fetch
 * @returns Promise with outlet data
 */
export async function getOutletById(id: string): Promise<{ success: boolean; outlet: Outlet | null; message?: string }> {
  // Simulate API delay
  const delay = Math.random() * 500 + 500
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Get all outlets and find by ID
  const response = await getOutlets()
  const outlet = response.outlets.find((o) => o.id === id) || null

  if (!outlet) {
    return {
      success: false,
      outlet: null,
      message: `Outlet with ID ${id} not found`,
    }
  }

  return {
    success: true,
    outlet,
    message: 'Outlet fetched successfully',
  }
}

