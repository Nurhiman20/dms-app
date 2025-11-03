import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
  const sales = ref<Sale[]>([
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
  ])

  function getSalesByOutletId(outletId: string): Sale[] {
    return sales.value.filter(sale => sale.outletId === outletId)
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
    getSalesByOutletId,
    totalSalesByOutlet,
  }
})

