<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="dashboard-container">
          <!-- Header -->
          <div class="dashboard-header q-mb-md">
            <h1 class="dashboard-title">Dashboard</h1>
            <p class="dashboard-subtitle">Sales overview by region</p>
          </div>

          <!-- Chart Container -->
          <div class="chart-container">
            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header q-mb-md">
                  <h2 class="chart-title">Total Sales per Region</h2>
                </div>
                <div class="chart-wrapper">
                  <Bar
                    v-if="chartData"
                    :data="chartData"
                    :options="chartOptions"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useOutletStore } from '../stores/outlet'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const outletStore = useOutletStore()

// Calculate total sales per region
const salesByRegion = computed(() => {
  const regionMap = new Map<string, number>()
  
  outletStore.outlets.forEach((outlet) => {
    const currentTotal = regionMap.get(outlet.region) || 0
    regionMap.set(outlet.region, currentTotal + outlet.totalOrder)
  })
  
  return {
    labels: Array.from(regionMap.entries()).map(([region]) => region),
    data: Array.from(regionMap.entries()).map(([, total]) => total),
  }
})

// Prepare chart data
const chartData = computed(() => {
  const { labels, data } = salesByRegion.value
  
  return {
    labels,
    datasets: [
      {
        label: 'Total Sales',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        data,
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `Sales: ${context.parsed.y.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toLocaleString()
        },
      },
    },
  },
}
</script>

<style scoped lang="sass">
.dashboard-container
  max-width: 1200px
  margin: 0 auto

.dashboard-header
  margin-bottom: 24px

.dashboard-title
  font-size: 28px
  font-weight: 700
  color: #1D1D1D
  margin: 0 0 8px 0
  line-height: 1.4

.dashboard-subtitle
  font-size: 16px
  color: #6B7280
  margin: 0

.chart-container
  width: 100%

.chart-card
  background-color: white
  border-radius: 8px
  overflow: hidden

.chart-header
  margin-bottom: 16px

.chart-title
  font-size: 20px
  font-weight: 600
  color: #1D1D1D
  margin: 0

.chart-wrapper
  position: relative
  height: 400px
  width: 100%

@media (max-width: 599px)
  .chart-wrapper
    height: 300px
</style>

