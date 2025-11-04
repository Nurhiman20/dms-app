<template>
  <q-page class="q-pa-md">
    <div class="dashboard-container">
      <!-- Access Denied Message -->
      <AccessDeniedCard
        v-if="!isAdmin"
        :message="`You don't have permission to view the dashboard. Only administrators can access this page.`"
        button-label="Go to My Outlet"
        @action="goToMyOutlet"
      />

      <!-- Dashboard Content (Admin Only) -->
      <template v-else>
        <!-- Header -->
        <div class="dashboard-header q-mb-md">
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Sales overview by region</p>
        </div>

        <!-- Chart Container -->
        <div class="chart-container">
          <q-card flat bordered :class="['chart-card', cardClass]">
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
                <div v-else-if="chartLoading" class="chart-loading">
                  <q-spinner color="primary" size="48px" />
                  <p class="loading-text">Loading chart library...</p>
                </div>
                <div v-else-if="chartError" class="chart-error">
                  <q-icon name="error_outline" size="48px" color="negative" />
                  <p class="error-text">{{ chartError }}</p>
                </div>
                <component
                  v-else-if="chartData && Bar"
                  :is="Bar"
                  :data="chartData"
                  :options="chartOptions"
                />
                <div v-else class="chart-empty">
                  <p class="empty-text">No data available</p>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { getDashboardStats, type RegionSalesStat } from "../services/dashboardApi";
import AccessDeniedCard from "../components/AccessDeniedCard.vue";

const $q = useQuasar();
const router = useRouter();

// Theme-aware card background
const cardClass = computed(() => {
  return $q.dark.isActive ? 'bg-grey-9' : 'bg-white';
});

// Lazy load Chart.js components
const Bar = shallowRef<any>(null);
const chartLoading = ref<boolean>(false);
const chartError = ref<string | null>(null);

// Async function to load Chart.js
const loadChart = async () => {
  if (Bar.value) return; // Already loaded

  chartLoading.value = true;
  chartError.value = null;

  try {
    const [{ Bar: BarComponent }, { Chart: ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend }] = await Promise.all([
      import("vue-chartjs"),
      import("chart.js")
    ]);

    // Register Chart.js components
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    Bar.value = BarComponent;
    chartLoading.value = false;
  } catch (err) {
    chartError.value = err instanceof Error ? err.message : "Failed to load chart library";
    chartLoading.value = false;
    console.error("Failed to load Chart.js:", err);
  }
};

// Check user role from localStorage
const user = computed(() => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
});

const isAdmin = computed(() => {
  return user.value?.role === "Admin";
});

// Sales helper: navigate to user's selected outlet
const myOutletId = computed(() => localStorage.getItem('selectedOutletId'))
const goToMyOutlet = () => {
  if (myOutletId.value) {
    router.push({ name: 'outlet-detail', params: { id: myOutletId.value } })
  } else {
    $q.notify({ type: 'warning', message: 'No outlet selected', position: 'top' })
  }
}

// Dashboard data state
const dashboardStats = ref<RegionSalesStat[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Fetch dashboard statistics on component mount
onMounted(async () => {
  // Only fetch data if user is admin
  if (!isAdmin.value) {
    return;
  }

  // Load Chart.js library first (lazy load)
  await loadChart();

  loading.value = true;
  error.value = null;

  try {
    const response = await getDashboardStats();
    if (response.success) {
      dashboardStats.value = response.stats;
      // Only show error message if it's a real error, not just offline mode
      if (response.message?.includes('offline mode') || response.message?.includes('cached')) {
        // Don't show error for offline mode - it's expected behavior
        error.value = null;
      }
    } else {
      error.value = response.message || "Failed to fetch dashboard statistics";
      dashboardStats.value = [];
    }
  } catch (err) {
    // Try to load from cache as last resort
    try {
      const { db } = await import('../utils/db');
      const cached = await db.dashboardStats.get('current');
      if (cached) {
        dashboardStats.value = cached.stats;
        error.value = null;
      } else {
        error.value = err instanceof Error ? err.message : "An error occurred while fetching dashboard statistics";
        dashboardStats.value = [];
      }
    } catch {
      error.value = err instanceof Error ? err.message : "An error occurred while fetching dashboard statistics";
      dashboardStats.value = [];
    }
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

// Theme-aware chart options
const chartOptions = computed(() => {
  const isDark = $q.dark.isActive;
  const textColor = isDark ? '#e0e0e0' : '#212121';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipText = isDark ? '#e0e0e0' : '#212121';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `Sales: ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return value.toLocaleString();
          },
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };
});
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
  margin: 0 0 8px 0
  line-height: 1.4

.dashboard-subtitle
  font-size: 16px
  color: #6B7280
  margin: 0

.chart-container
  width: 100%

.chart-card
  border-radius: 8px
  overflow: hidden

.chart-header
  margin-bottom: 16px

.chart-title
  font-size: 20px
  font-weight: 600
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

.access-denied-container
  max-width: 600px
  margin: 0 auto
  margin-top: 64px

.access-denied-title
  font-size: 24px
  font-weight: 600
  margin: 16px 0
  color: #DC2626

.access-denied-text
  font-size: 16px
  color: #6B7280
  margin: 0 0 24px 0
  line-height: 1.5

@media (max-width: 599px)
  .chart-wrapper
    height: 300px
</style>
