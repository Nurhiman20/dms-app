<template>
  <q-page class="q-pa-md">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header q-mb-md">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Sales overview by region</p>
      </div>

      <!-- Chart Container -->
      <div class="chart-container">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="chart-header q-mb-md">
              <h2 class="chart-title">Total Sales per Region</h2>
            </div>
            <div class="chart-wrapper">
              <div v-if="loading" class="chart-loading">
                <q-spinner color="primary" size="48px" />
                <p class="loading-text">Loading dashboard data...</p>
              </div>
              <div v-else-if="error" class="chart-error">
                <q-icon name="error_outline" size="48px" color="negative" />
                <p class="error-text">{{ error }}</p>
              </div>
              <Bar v-else-if="chartData" :data="chartData" :options="chartOptions" />
              <div v-else class="chart-empty">
                <p class="empty-text">No data available</p>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getDashboardStats, type RegionSalesStat } from "../services/dashboardApi";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dashboard data state
const dashboardStats = ref<RegionSalesStat[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Fetch dashboard statistics on component mount
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getDashboardStats();
    if (response.success) {
      dashboardStats.value = response.stats;
    } else {
      error.value = response.message || "Failed to fetch dashboard statistics";
      dashboardStats.value = [];
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An error occurred while fetching dashboard statistics";
    dashboardStats.value = [];
  } finally {
    loading.value = false;
  }
});

// Prepare chart data from API response
const chartData = computed(() => {
  if (!dashboardStats.value || dashboardStats.value.length === 0) {
    return null;
  }

  return {
    labels: dashboardStats.value.map((stat) => stat.region),
    datasets: [
      {
        label: "Total Sales",
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        data: dashboardStats.value.map((stat) => stat.totalSales),
      },
    ],
  };
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `Sales: ${context.parsed.y.toLocaleString()}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toLocaleString();
        },
      },
    },
  },
};
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

.chart-loading,
.chart-error,
.chart-empty
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  height: 100%
  width: 100%

.loading-text,
.error-text,
.empty-text
  margin-top: 16px
  font-size: 14px
  color: #6B7280

.error-text
  color: #DC2626

@media (max-width: 599px)
  .chart-wrapper
    height: 300px
</style>
