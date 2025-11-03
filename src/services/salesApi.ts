/**
 * Dummy Sales API Service
 * Simulates API calls for sales operations without a real backend
 */

import type { Sale } from '../stores/sales'

export interface GetSalesByOutletResponse {
  success: boolean
  sales: Sale[]
  total: number
  message?: string
}

export interface GetAllSalesResponse {
  success: boolean
  sales: Sale[]
  total: number
  message?: string
}

/**
 * Mock sales data matching the Sale interface
 */
const mockSales: Sale[] = [
  // Sales for Outlet Jakarta Pusat (id: '1')
  {
    id: 's1',
    outletId: '1',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 10,
    unitPrice: 50000,
    totalAmount: 500000,
    customerName: 'PT ABC',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's2',
    outletId: '1',
    date: '2024-01-16',
    productName: 'Product B',
    quantity: 5,
    unitPrice: 75000,
    totalAmount: 375000,
    customerName: 'CV XYZ',
    paymentMethod: 'Cash',
  },
  {
    id: 's3',
    outletId: '1',
    date: '2024-01-17',
    productName: 'Product A',
    quantity: 8,
    unitPrice: 50000,
    totalAmount: 400000,
    customerName: 'PT DEF',
    paymentMethod: 'Credit Card',
  },
  {
    id: 's4',
    outletId: '1',
    date: '2024-01-18',
    productName: 'Product C',
    quantity: 15,
    unitPrice: 30000,
    totalAmount: 450000,
    customerName: 'PT GHI',
    paymentMethod: 'Bank Transfer',
  },
  // Sales for Outlet Bandung (id: '2')
  {
    id: 's5',
    outletId: '2',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 7,
    unitPrice: 50000,
    totalAmount: 350000,
    customerName: 'PT JKL',
    paymentMethod: 'Cash',
  },
  {
    id: 's6',
    outletId: '2',
    date: '2024-01-16',
    productName: 'Product B',
    quantity: 4,
    unitPrice: 75000,
    totalAmount: 300000,
    customerName: 'CV MNO',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's7',
    outletId: '2',
    date: '2024-01-17',
    productName: 'Product C',
    quantity: 12,
    unitPrice: 30000,
    totalAmount: 360000,
    customerName: 'PT PQR',
    paymentMethod: 'Credit Card',
  },
  // Sales for Outlet Surabaya (id: '3')
  {
    id: 's8',
    outletId: '3',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 20,
    unitPrice: 50000,
    totalAmount: 1000000,
    customerName: 'PT STU',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's9',
    outletId: '3',
    date: '2024-01-16',
    productName: 'Product B',
    quantity: 8,
    unitPrice: 75000,
    totalAmount: 600000,
    customerName: 'CV VWX',
    paymentMethod: 'Cash',
  },
  {
    id: 's10',
    outletId: '3',
    date: '2024-01-17',
    productName: 'Product C',
    quantity: 18,
    unitPrice: 30000,
    totalAmount: 540000,
    customerName: 'PT YZA',
    paymentMethod: 'Credit Card',
  },
  {
    id: 's11',
    outletId: '3',
    date: '2024-01-18',
    productName: 'Product A',
    quantity: 12,
    unitPrice: 50000,
    totalAmount: 600000,
    customerName: 'PT BCD',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's12',
    outletId: '3',
    date: '2024-01-19',
    productName: 'Product B',
    quantity: 6,
    unitPrice: 75000,
    totalAmount: 450000,
    customerName: 'CV EFG',
    paymentMethod: 'Cash',
  },
  // Sales for Outlet Yogyakarta (id: '4')
  {
    id: 's13',
    outletId: '4',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 5,
    unitPrice: 50000,
    totalAmount: 250000,
    customerName: 'PT HIJ',
    paymentMethod: 'Cash',
  },
  {
    id: 's14',
    outletId: '4',
    date: '2024-01-16',
    productName: 'Product C',
    quantity: 10,
    unitPrice: 30000,
    totalAmount: 300000,
    customerName: 'CV KLM',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's15',
    outletId: '4',
    date: '2024-01-17',
    productName: 'Product B',
    quantity: 3,
    unitPrice: 75000,
    totalAmount: 225000,
    customerName: 'PT NOP',
    paymentMethod: 'Credit Card',
  },
  // Sales for Outlet Medan (id: '5')
  {
    id: 's16',
    outletId: '5',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 14,
    unitPrice: 50000,
    totalAmount: 700000,
    customerName: 'PT QRS',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's17',
    outletId: '5',
    date: '2024-01-16',
    productName: 'Product B',
    quantity: 9,
    unitPrice: 75000,
    totalAmount: 675000,
    customerName: 'CV TUV',
    paymentMethod: 'Cash',
  },
  {
    id: 's18',
    outletId: '5',
    date: '2024-01-17',
    productName: 'Product C',
    quantity: 11,
    unitPrice: 30000,
    totalAmount: 330000,
    customerName: 'PT WXY',
    paymentMethod: 'Credit Card',
  },
  {
    id: 's19',
    outletId: '5',
    date: '2024-01-18',
    productName: 'Product A',
    quantity: 8,
    unitPrice: 50000,
    totalAmount: 400000,
    customerName: 'PT ZAB',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's20',
    outletId: '5',
    date: '2024-01-19',
    productName: 'Product B',
    quantity: 7,
    unitPrice: 75000,
    totalAmount: 525000,
    customerName: 'CV CDE',
    paymentMethod: 'Cash',
  },
  // Sales for Outlet Semarang (id: '6')
  {
    id: 's21',
    outletId: '6',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 9,
    unitPrice: 50000,
    totalAmount: 450000,
    customerName: 'PT FGH',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's22',
    outletId: '6',
    date: '2024-01-16',
    productName: 'Product C',
    quantity: 13,
    unitPrice: 30000,
    totalAmount: 390000,
    customerName: 'CV IJK',
    paymentMethod: 'Cash',
  },
  {
    id: 's23',
    outletId: '6',
    date: '2024-01-17',
    productName: 'Product B',
    quantity: 6,
    unitPrice: 75000,
    totalAmount: 450000,
    customerName: 'PT LMN',
    paymentMethod: 'Credit Card',
  },
  // Sales for Outlet Makassar (id: '7')
  {
    id: 's24',
    outletId: '7',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 11,
    unitPrice: 50000,
    totalAmount: 550000,
    customerName: 'PT OPQ',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 's25',
    outletId: '7',
    date: '2024-01-16',
    productName: 'Product B',
    quantity: 5,
    unitPrice: 75000,
    totalAmount: 375000,
    customerName: 'CV RST',
    paymentMethod: 'Cash',
  },
  {
    id: 's26',
    outletId: '7',
    date: '2024-01-17',
    productName: 'Product C',
    quantity: 14,
    unitPrice: 30000,
    totalAmount: 420000,
    customerName: 'PT UVW',
    paymentMethod: 'Credit Card',
  },
  // Sales for Outlet Denpasar (id: '8')
  {
    id: 's27',
    outletId: '8',
    date: '2024-01-15',
    productName: 'Product A',
    quantity: 6,
    unitPrice: 50000,
    totalAmount: 300000,
    customerName: 'PT XYZ',
    paymentMethod: 'Cash',
  },
  {
    id: 's28',
    outletId: '8',
    date: '2024-01-16',
    productName: 'Product C',
    quantity: 9,
    unitPrice: 30000,
    totalAmount: 270000,
    customerName: 'CV AAA',
    paymentMethod: 'Bank Transfer',
  },
]

/**
 * Simulates fetching sales records by outlet ID from API
 * @param outletId - The outlet ID to fetch sales for
 * @returns Promise with sales list response filtered by outlet ID
 */
export async function getSalesByOutletId(outletId: string): Promise<GetSalesByOutletResponse> {
  // Simulate API delay (600ms - 1.2s)
  const delay = Math.random() * 600 + 600
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Filter sales by outlet ID
  const outletSales = mockSales.filter((sale) => sale.outletId === outletId)

  return {
    success: true,
    sales: outletSales,
    total: outletSales.length,
    message: `Sales records for outlet ${outletId} fetched successfully`,
  }
}

/**
 * Simulates fetching all sales records from API
 * @returns Promise with all sales list response
 */
export async function getAllSales(): Promise<GetAllSalesResponse> {
  // Simulate API delay (800ms - 1.5s)
  const delay = Math.random() * 700 + 800
  await new Promise((resolve) => setTimeout(resolve, delay))

  return {
    success: true,
    sales: mockSales,
    total: mockSales.length,
    message: 'All sales records fetched successfully',
  }
}

