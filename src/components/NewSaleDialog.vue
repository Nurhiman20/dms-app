<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Create New Sale</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md">
          <q-input
            ref="dateInputRef"
            v-model="form.date"
            label="Date *"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Date is required']"
          />

          <q-input
            ref="productNameInputRef"
            v-model="form.productName"
            label="Product Name *"
            outlined
            dense
            :rules="[(val) => !!val || 'Product name is required']"
          />

          <q-input
            ref="quantityInputRef"
            v-model.number="form.quantity"
            label="Quantity *"
            type="number"
            outlined
            dense
            :rules="[
              (val) => (val !== null && val !== '') || 'Quantity is required',
              (val) => val > 0 || 'Quantity must be greater than 0',
            ]"
          />

          <q-input
            ref="unitPriceInputRef"
            v-model.number="form.unitPrice"
            label="Unit Price *"
            type="number"
            outlined
            dense
            prefix="Rp"
            :rules="[
              (val) => (val !== null && val !== '') || 'Unit price is required',
              (val) => val > 0 || 'Unit price must be greater than 0',
            ]"
          />

          <q-input
            ref="totalAmountInputRef"
            :model-value="totalAmount"
            label="Total Amount *"
            type="number"
            outlined
            dense
            prefix="Rp"
            readonly
          />

          <q-input
            ref="customerNameInputRef"
            v-model="form.customerName"
            label="Customer Name *"
            outlined
            dense
            :rules="[(val) => !!val || 'Customer name is required']"
          />

          <q-select
            ref="paymentMethodSelectRef"
            v-model="form.paymentMethod"
            :options="paymentMethods"
            label="Payment Method *"
            outlined
            dense
            :rules="[(val) => !!val || 'Payment method is required']"
          />

          <div class="row q-gutter-sm justify-end q-mt-md">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="$emit('update:modelValue', false)"
            />
            <q-btn label="Create" color="primary" unelevated @click="onSubmit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { QForm, QInput, QSelect, useQuasar } from 'quasar'
import { useSalesStore, type Sale } from '../stores/sales'
import { checkNetworkStatus } from '../utils/networkStatus'
import { offlineQueue } from '../utils/offlineQueue'

interface Props {
  modelValue: boolean
  outletId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'sale-created': [sale: Sale]
}>()

const salesStore = useSalesStore()
const $q = useQuasar()

const formRef = ref<QForm | null>(null)
const dateInputRef = ref<QInput | null>(null)
const productNameInputRef = ref<QInput | null>(null)
const quantityInputRef = ref<QInput | null>(null)
const unitPriceInputRef = ref<QInput | null>(null)
const totalAmountInputRef = ref<QInput | null>(null)
const customerNameInputRef = ref<QInput | null>(null)
const paymentMethodSelectRef = ref<QSelect | null>(null)

const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card']

const form = ref({
  date: new Date().toISOString().split('T')[0], // Default to today
  productName: '',
  quantity: null as number | null,
  unitPrice: null as number | null,
  customerName: '',
  paymentMethod: '',
})

// Calculate totalAmount automatically from quantity and unitPrice
const totalAmount = computed(() => {
  if (form.value.quantity !== null && form.value.unitPrice !== null) {
    const qty = Number(form.value.quantity)
    const price = Number(form.value.unitPrice)
    if (qty > 0 && price > 0) {
      return qty * price
    }
  }
  return null
})

// Reset form when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.value = {
      date: new Date().toISOString().split('T')[0],
      productName: '',
      quantity: null,
      unitPrice: null,
      customerName: '',
      paymentMethod: '',
    }
  }
})

const validateAllFields = async (): Promise<boolean> => {
  let isValid = true

  // Check all v-model values using if logic
  if (!form.value.date || form.value.date === '') {
    isValid = false
  }

  if (!form.value.productName || form.value.productName.trim() === '') {
    isValid = false
  }

  if (form.value.quantity === null || form.value.quantity <= 0) {
    isValid = false
  }

  if (form.value.unitPrice === null || form.value.unitPrice <= 0) {
    isValid = false
  }

  // totalAmount is computed from quantity * unitPrice, so no need to validate separately
  // But we should check that it's valid (both quantity and unitPrice are valid)
  if (totalAmount.value === null || totalAmount.value <= 0) {
    isValid = false
  }

  if (!form.value.customerName || form.value.customerName.trim() === '') {
    isValid = false
  }

  if (!form.value.paymentMethod || form.value.paymentMethod === '') {
    isValid = false
  }

  await Promise.allSettled([
    dateInputRef.value?.validate(),
    productNameInputRef.value?.validate(),
    quantityInputRef.value?.validate(),
    unitPriceInputRef.value?.validate(),
    customerNameInputRef.value?.validate(),
    paymentMethodSelectRef.value?.validate(),
  ])

  return isValid
}

const onSubmit = async () => {
  if (!props.outletId) return

  // Validate all fields at once to show all errors simultaneously
  const isValid = await validateAllFields()

  if (!isValid) {
    return
  }

  const saleData = {
    outletId: props.outletId,
    date: form.value.date || '',
    productName: form.value.productName || '',
    quantity: form.value.quantity!,
    unitPrice: form.value.unitPrice!,
    totalAmount: totalAmount.value!,
    customerName: form.value.customerName || '',
    paymentMethod: form.value.paymentMethod || '',
  }

  // Add sale to local store (works offline)
  const newSale = await salesStore.addSale(saleData)

  // Check if offline and queue for sync
  const isOnline = await checkNetworkStatus()
  if (!isOnline) {
    // Queue the operation for sync when online
    try {
      await offlineQueue.enqueue({
        type: 'create',
        entity: 'sale',
        data: newSale,
      })

      $q.notify({
        type: 'info',
        message: 'Sale created and queued for sync when online',
        position: 'top',
        timeout: 3000,
      })
    } catch (error) {
      console.error('[NewSaleDialog] Failed to queue operation:', error)
      $q.notify({
        type: 'warning',
        message: 'Sale created locally but failed to queue for sync',
        position: 'top',
      })
    }
  } else {
    // Online - try to sync immediately (in a real app, this would call the API)
    // For now, we just show success
    $q.notify({
      type: 'positive',
      message: 'Sale created successfully',
      position: 'top',
    })
  }

  emit('sale-created', newSale)
  emit('update:modelValue', false)
}
</script>
