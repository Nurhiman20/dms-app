<template>
  <q-page class="q-pa-lg">
    <div class="outlet-detail-container">
      <!-- Back Button -->
      <q-btn
        v-if="isAdmin"
        flat
        rounded
        icon="arrow_back"
        label="Back to Outlets"
        @click="$router.push({ name: 'outlets' })"
        class="q-mb-md"
        color="primary"
      />

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Loading outlet details...</p>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!outlet" class="text-center q-pa-xl">
        <q-icon name="error_outline" size="4em" color="negative" />
        <h2 class="q-mt-md">Outlet not found</h2>
        <q-btn
          flat
          rounded
          label="Back to Outlets"
          @click="$router.push({ name: 'outlets' })"
          class="q-mt-md"
          color="primary"
        />
      </div>

      <!-- Outlet Detail Content -->
      <div v-else>
        <!-- Header -->
        <div class="outlet-detail-header q-mb-lg">
          <h1 class="outlet-detail-title">{{ outlet.name }}</h1>
          <p class="outlet-detail-subtitle">Detailed information and sales records</p>
        </div>

        <!-- Outlet Info Card -->
        <q-card flat bordered :class="['outlet-info-card', 'q-mb-lg', cardClass]">
          <q-card-section>
            <div class="outlet-info-header q-mb-md">
              <h2 class="outlet-info-title">Outlet Information</h2>
            </div>
            <div class="outlet-info-grid">
              <div class="info-item">
                <div class="info-label">
                  <q-icon name="store" class="q-mr-xs" />
                  Outlet Name
                </div>
                <div class="info-value">{{ outlet.name }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <q-icon name="location_on" class="q-mr-xs" />
                  Region
                </div>
                <div class="info-value">{{ outlet.region }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <q-icon name="shopping_cart" class="q-mr-xs" />
                  Total Orders
                </div>
                <div class="info-value">{{ outlet.totalOrder.toLocaleString() }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <q-icon name="check_circle" class="q-mr-xs" />
                  Status
                </div>
                <div class="info-value">
                  <q-badge
                    :color="outlet.isActive ? 'positive' : 'negative'"
                    :label="outlet.isActive ? 'Active' : 'Inactive'"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sales Summary Card -->
        <q-card
          flat
          bordered
          :class="['sales-summary-card', 'q-mb-lg', cardClass]"
          v-if="sales.length > 0"
        >
          <q-card-section>
            <div class="sales-summary-header q-mb-md">
              <h2 class="sales-summary-title">Sales Summary</h2>
            </div>
            <div class="sales-summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Sales Amount</div>
                <div class="summary-value primary">
                  Rp {{ totalSalesAmount.toLocaleString("id-ID") }}
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Transactions</div>
                <div class="summary-value">{{ sales.length }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Average Transaction</div>
                <div class="summary-value">
                  Rp {{ averageTransaction.toLocaleString("id-ID") }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sales Table -->
        <q-card flat bordered class="sales-table-card">
          <q-card-section>
            <div class="sales-table-header q-mb-md row items-center justify-between">
              <h2 class="sales-table-title">Sales Records</h2>
              <q-btn
                color="primary"
                icon="add"
                label="New Sale"
                @click="showNewSaleDialog = true"
                unelevated
              />
            </div>
            <q-table
              :rows="sales"
              :columns="columns"
              row-key="id"
              :rows-per-page-options="[10, 20, 50, 100]"
              :loading="loading"
              flat
              bordered
              :class="['sales-table', cardClass]"
            >
              <template v-slot:body-cell-date="props">
                <q-td :props="props">
                  {{ formatDate(props.value) }}
                </q-td>
              </template>

              <template v-slot:body-cell-quantity="props">
                <q-td :props="props" class="text-right">
                  {{ props.value.toLocaleString() }}
                </q-td>
              </template>

              <template v-slot:body-cell-unitPrice="props">
                <q-td :props="props" class="text-right">
                  {{ props.value.toLocaleString("id-ID") }}
                </q-td>
              </template>

              <template v-slot:body-cell-totalAmount="props">
                <q-td :props="props" class="text-right font-bold">
                  {{ props.value.toLocaleString("id-ID") }}
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center text-grey q-gutter-sm q-pa-xl">
                  <q-icon name="inbox" size="2em" />
                  <div class="text-center">
                    <div>No sales records found</div>
                    <div class="text-caption">
                      This outlet has no sales transactions yet
                    </div>
                  </div>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- New Sale Dialog -->
    <NewSaleDialog v-model="showNewSaleDialog" :outlet-id="outletId || ''" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useOutletStore } from '../stores/outlet'
import { useSalesStore, type Sale } from '../stores/sales'

// Lazy load NewSaleDialog component
const NewSaleDialog = defineAsyncComponent(() => import('../components/NewSaleDialog.vue'))

const route = useRoute()
const $q = useQuasar()
const outletStore = useOutletStore()
const salesStore = useSalesStore()

// Theme-aware card background
const cardClass = computed(() => {
  return $q.dark.isActive ? 'bg-grey-9' : 'bg-white'
})

const outletId = computed(() => route.params.id as string)
const showNewSaleDialog = ref<boolean>(false)

// Role-based UI: hide back button for Sales
const user = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
})

const isAdmin = computed(() => user.value?.role === 'Admin')

const outlet = computed(() => outletStore.getOutletById(outletId.value))
const loading = computed(() => outletStore.loading || salesStore.loading)

// Fetch outlet and sales if not found in store
onMounted(async () => {
  if (!outlet.value && outletId.value) {
    await outletStore.fetchOutletById(outletId.value)
  }

  // Fetch sales for this outlet
  if (outletId.value) {
    const outletSales = salesStore.getSalesByOutletId(outletId.value)
    // Only fetch if we don't have sales data for this outlet yet
    if (outletSales.length === 0) {
      await salesStore.fetchSalesByOutletId(outletId.value)
    }
  }
})

const sales = computed(() => {
  if (!outletId.value) return []
  return salesStore.getSalesByOutletId(outletId.value)
})

const totalSalesAmount = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.totalAmount, 0)
})

const averageTransaction = computed(() => {
  if (sales.value.length === 0) return 0
  return Math.round(totalSalesAmount.value / sales.value.length)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const columns = [
  {
    name: 'date',
    required: true,
    label: 'Date',
    align: 'left' as const,
    field: (row: Sale) => row.date,
    format: (val: string) => val,
    sortable: true,
  },
  {
    name: 'productName',
    label: 'Product',
    align: 'left' as const,
    field: (row: Sale) => row.productName,
    format: (val: string) => val,
    sortable: true,
  },
  {
    name: 'customerName',
    label: 'Customer',
    align: 'left' as const,
    field: (row: Sale) => row.customerName,
    format: (val: string) => val,
    sortable: true,
  },
  {
    name: 'quantity',
    label: 'Quantity',
    align: 'right' as const,
    field: (row: Sale) => row.quantity,
    format: (val: number) => val.toLocaleString(),
    sortable: true,
  },
  {
    name: 'unitPrice',
    label: 'Unit Price',
    align: 'right' as const,
    field: (row: Sale) => row.unitPrice,
    format: (val: number) => `Rp ${val.toLocaleString('id-ID')}`,
    sortable: true,
  },
  {
    name: 'totalAmount',
    label: 'Total Amount',
    align: 'right' as const,
    field: (row: Sale) => row.totalAmount,
    format: (val: number) => `Rp ${val.toLocaleString('id-ID')}`,
    sortable: true,
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    align: 'left' as const,
    field: (row: Sale) => row.paymentMethod,
    format: (val: string) => val,
    sortable: true,
  },
]

onMounted(() => {
  // Component is ready, data is already loaded from stores
})
</script>

<style scoped lang="sass">
.outlet-detail-container
  max-width: 1200px
  margin: 0 auto

.outlet-detail-header
  margin-bottom: 24px

.outlet-detail-title
  font-size: 28px
  font-weight: 700
  margin: 0 0 8px 0
  line-height: 1.4

.outlet-detail-subtitle
  font-size: 16px
  color: #6B7280
  margin: 0

.outlet-info-card,
.sales-summary-card,
.sales-table-card
  border-radius: 8px
  overflow: hidden

.outlet-info-header,
.sales-summary-header,
.sales-table-header
  margin-bottom: 16px

.outlet-info-title,
.sales-summary-title,
.sales-table-title
  font-size: 20px
  font-weight: 600
  margin: 0

.outlet-info-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
  gap: 24px

.info-item
  display: flex
  flex-direction: column
  gap: 8px

.info-label
  font-size: 14px
  color: #6B7280
  font-weight: 500
  display: flex
  align-items: center

.info-value
  font-size: 16px
  font-weight: 600

.sales-summary-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
  gap: 24px

.summary-item
  display: flex
  flex-direction: column
  gap: 8px

.summary-label
  font-size: 14px
  color: #6B7280
  font-weight: 500

.summary-value
  font-size: 24px
  font-weight: 700

.summary-value.primary
  color: #1976D2

.font-bold
  font-weight: 700

.sales-table
  border-radius: 8px
  overflow: hidden

@media (max-width: 599px)
  .outlet-info-grid
    grid-template-columns: 1fr

  .sales-summary-grid
    grid-template-columns: 1fr

  .outlet-detail-title
    font-size: 24px
</style>
