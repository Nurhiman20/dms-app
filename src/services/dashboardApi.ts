/**
 * Dummy Dashboard API Service
 * Simulates API calls for dashboard statistics without a real backend
 */

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
 * @returns Promise with dashboard statistics response
 */
export async function getDashboardStats(): Promise<GetDashboardStatsResponse> {
  // Simulate API delay (600ms - 1.2s)
  const delay = Math.random() * 600 + 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const totalSales = mockDashboardStats.reduce((sum, stat) => sum + stat.totalSales, 0);
  const totalOutlets = mockDashboardStats.reduce((sum, stat) => sum + stat.outletCount, 0);

  return {
    success: true,
    stats: mockDashboardStats,
    totalSales,
    totalOutlets,
    message: 'Dashboard statistics fetched successfully',
  };
}

