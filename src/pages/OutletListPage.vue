<template>
  <q-page class="q-pa-lg">
    <div class="outlet-list-container">
      <!-- Header -->
      <div class="outlet-list-header q-mb-md">
        <h1 class="outlet-list-title">Outlet List</h1>
        <p class="outlet-list-subtitle">Manage and monitor all outlets</p>
      </div>

      <!-- Search and Filters -->
      <div class="outlet-filters q-mb-md">
        <div class="row outlet-filters-row">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              placeholder="Search by outlet name..."
              clearable
              class="outlet-search-input"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="selectedRegion"
              :options="regionOptions"
              label="Filter by Region"
              outlined
              clearable
              dense
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-select>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="selectedStatus"
              :options="statusOptions"
              label="Filter by Status"
              outlined
              clearable
              dense
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <q-table
        :rows="filteredOutlets"
        :columns="columns"
        row-key="id"
        :rows-per-page-options="[10, 20, 50]"
        :loading="loading"
        flat
        bordered
        class="outlet-table"
        @row-click="handleRowClick"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.isActive ? 'positive' : 'negative'"
              :label="props.row.isActive ? 'Active' : 'Inactive'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-totalOrder="props">
          <q-td :props="props" class="text-right">
            {{ props.value.toLocaleString() }}
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOutletStore, type Outlet } from '../stores/outlet'

const router = useRouter()

const outletStore = useOutletStore()
const searchQuery = ref<string | null>('')
const debouncedSearchQuery = ref<string>('')
const selectedRegion = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

// Use store's loading state
const loading = computed(() => outletStore.loading)

// Fetch outlets on mount
onMounted(async () => {
  if (outletStore.outlets.length === 0) {
    await outletStore.fetchOutlets()
  }
})

// Debounce function
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceSearch = (value: string | null | undefined) => {
  // Clear any pending debounce
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  // Normalize empty values (null, undefined, or empty string)
  const normalizedValue = value == null || value === '' ? '' : value
  
  // If cleared (empty), update immediately without debounce
  if (normalizedValue === '') {
    debouncedSearchQuery.value = ''
    return
  }
  
  // Otherwise, debounce the search
  debounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = normalizedValue
    debounceTimer = null
  }, 300)
}

// Watch search query and debounce it
watch(searchQuery, (newValue, oldValue) => {
  // Immediately sync if clearing (going from non-empty to empty)
  const isClearing = (oldValue && oldValue.trim()) && (!newValue || !newValue.trim())
  if (isClearing) {
    debouncedSearchQuery.value = ''
  }
  debounceSearch(newValue)
})

// Cleanup debounce timer on component unmount
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

const outlets = computed(() => outletStore.outlets)

// Get unique regions from outlets
const regionOptions = computed(() => {
  const regions = [...new Set(outlets.value.map((outlet) => outlet.region))]
  return regions.sort()
})

const statusOptions = ['Active', 'Inactive']

const filteredOutlets = computed(() => {
  let result = outlets.value

  // Filter by search query
  const query = debouncedSearchQuery.value.toLowerCase().trim()
  if (query) {
    result = result.filter((outlet) =>
      outlet.name.toLowerCase().includes(query)
    )
  }

  // Filter by region
  if (selectedRegion.value) {
    result = result.filter((outlet) => outlet.region === selectedRegion.value)
  }

  // Filter by status
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'Active'
    result = result.filter((outlet) => outlet.isActive === isActive)
  }

  return result
})

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Outlet Name',
    align: 'left' as const,
    field: (row: Outlet) => row.name,
    format: (val: string) => val,
    sortable: true,
  },
  {
    name: 'region',
    label: 'Region',
    align: 'left' as const,
    field: (row: Outlet) => row.region,
    format: (val: string) => val,
    sortable: true,
  },
  {
    name: 'totalOrder',
    label: 'Total Order',
    align: 'right' as const,
    field: (row: Outlet) => row.totalOrder,
    format: (val: number) => val.toLocaleString(),
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center' as const,
    field: (row: Outlet) => row.isActive,
    format: (val: boolean) => (val ? 'Active' : 'Inactive'),
    sortable: true,
  },
]

const handleRowClick = (evt: Event, row: Outlet) => {
  router.push({ name: 'outlet-detail', params: { id: row.id } })
}
</script>

<style scoped lang="sass">
.outlet-list-container
  max-width: 1200px
  margin: 0 auto

.outlet-list-header
  margin-bottom: 24px

.outlet-list-title
  font-size: 28px
  font-weight: 700
  color: #1D1D1D
  margin: 0 0 8px 0
  line-height: 1.4

.outlet-list-subtitle
  font-size: 16px
  color: #6B7280
  margin: 0

.outlet-filters
  width: 100%

.outlet-filters-row
  flex-wrap: wrap
  gap: 16px

@media (max-width: 599px)
  .outlet-filters-row > div
    width: 100%
    flex: 0 0 100%

@media (min-width: 600px) and (max-width: 959px)
  .outlet-filters-row > div
    width: calc(50% - 8px)
    flex: 0 0 calc(50% - 8px)

@media (min-width: 960px)
  .outlet-filters-row
    flex-wrap: nowrap

  .outlet-filters-row > div
    flex: 0 0 calc(33.333333% - 11px)
    max-width: calc(33.333333% - 11px)
    min-width: 0

.outlet-search-input
  background-color: white

.outlet-table
  background-color: white
  border-radius: 8px
  overflow: hidden

  :deep(tbody tr)
    cursor: pointer
    transition: background-color 0.2s

    &:hover
      background-color: #f5f5f5
</style>
