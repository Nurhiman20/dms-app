import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NewSaleDialog from '../components/NewSaleDialog.vue';

// Quasar mock
const notifyMock = vi.fn();
vi.mock('quasar', () => {
  const Block = { template: '<div><slot /></div>' };
  const Dialog = { props: ['modelValue'], template: '<div><slot /></div>' };
  const Btn = { props: ['label'], template: '<button><slot /></button>' };
  // Inputs/Select expose validate() to satisfy refs in component
  const Input = {
    props: ['modelValue'],
    methods: { validate: () => true },
    template: '<div><slot /></div>',
  };
  const Select = {
    props: ['modelValue', 'options'],
    methods: { validate: () => true },
    template: '<div><slot /></div>',
  };
  const Space = { template: '<span />' };
  const Form = { template: '<form><slot /></form>' };
  const Td = { template: '<td><slot /></td>' };
  return {
    useQuasar: () => ({ notify: notifyMock }),
    QDialog: Dialog,
    QCard: Block,
    QCardSection: Block,
    QBtn: Btn,
    QInput: Input,
    QSelect: Select,
    QSpace: Space,
    QForm: Form,
    QTd: Td,
  };
});

// Sales store mock
const addSaleMock = vi.fn(async (sale) => ({ id: 's-new', ...sale }));
vi.mock('../stores/sales', async () => {
  const actual = await vi.importActual<any>('../stores/sales');
  return {
    ...actual,
    useSalesStore: () => ({ addSale: addSaleMock, loading: false }),
  };
});

// Network status and offline queue mocks
const checkNetworkStatusMock = vi.fn(async () => true);
const enqueueMock = vi.fn(async () => undefined);
vi.mock('../utils/networkStatus', () => ({
  checkNetworkStatus: () => checkNetworkStatusMock(),
}));
vi.mock('../utils/offlineQueue', () => ({
  offlineQueue: { enqueue: enqueueMock },
}));

function mountDialog(props?: Partial<{ modelValue: boolean; outletId: string; }>) {
  return mount(NewSaleDialog, {
    props: {
      modelValue: true,
      outletId: 'out-1',
      ...props,
    },
  });
}

beforeEach(() => {
  notifyMock.mockClear();
  addSaleMock.mockClear();
  checkNetworkStatusMock.mockReset();
  checkNetworkStatusMock.mockResolvedValue(true);
  enqueueMock.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('NewSaleDialog', () => {
  it('computes totalAmount from quantity and unitPrice', async () => {
    const wrapper = mountDialog();
    const vm: any = wrapper.vm as any;
    vm.form.quantity = 2;
    vm.form.unitPrice = 500;
    await vm.$nextTick();
    expect(vm.totalAmount).toBe(1000);
  });

  it('does not submit when validation fails', async () => {
    const wrapper = mountDialog();
    const vm: any = wrapper.vm as any;

    // Leave required fields empty
    vm.form = { date: '', productName: '', quantity: null, unitPrice: null, customerName: '', paymentMethod: '' };
    await vm.$nextTick();
    await vm.onSubmit();

    expect(addSaleMock).not.toHaveBeenCalled();
  });

  it('submits and shows success when online', async () => {
    checkNetworkStatusMock.mockResolvedValue(true);

    const wrapper = mountDialog();
    const vm: any = wrapper.vm as any;
    vm.form = {
      date: '2024-01-01',
      productName: 'Item',
      quantity: 2,
      unitPrice: 500,
      customerName: 'John',
      paymentMethod: 'Cash',
    };
    await vm.$nextTick();

    await vm.onSubmit();

    expect(addSaleMock).toHaveBeenCalled();
    expect(checkNetworkStatusMock).toHaveBeenCalled();
    expect(enqueueMock).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled(); // positive path
  });

  it('queues when offline and notifies info', async () => {
    checkNetworkStatusMock.mockResolvedValue(false);

    const wrapper = mountDialog();
    const vm: any = wrapper.vm as any;
    vm.form = {
      date: '2024-01-01',
      productName: 'Item',
      quantity: 2,
      unitPrice: 500,
      customerName: 'John',
      paymentMethod: 'Cash',
    };
    await vm.$nextTick();

    await vm.onSubmit();

    expect(addSaleMock).toHaveBeenCalled();
    expect(checkNetworkStatusMock).toHaveBeenCalled();
    expect(enqueueMock).toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled();
  });

  it('emits sale-created and closes after submit', async () => {
    const wrapper = mountDialog();
    const vm: any = wrapper.vm as any;
    vm.form = {
      date: '2024-01-01',
      productName: 'Item',
      quantity: 1,
      unitPrice: 1000,
      customerName: 'John',
      paymentMethod: 'Cash',
    };
    await vm.$nextTick();

    await vm.onSubmit();

    const emitted = wrapper.emitted();
    expect(emitted['sale-created']).toBeTruthy();
    expect((emitted['update:modelValue'] as any)?.[0]?.[0]).toBe(false);
  });

  it('resets the form when dialog opens', async () => {
    const wrapper = mountDialog({ modelValue: false });
    const vm: any = wrapper.vm as any;

    // set non-defaults
    vm.form = {
      date: '2023-01-01',
      productName: 'X',
      quantity: 5,
      unitPrice: 10,
      customerName: 'Y',
      paymentMethod: 'Cash',
    };

    await wrapper.setProps({ modelValue: true });
    await vm.$nextTick();

    expect(vm.form.productName).toBe('');
    expect(vm.form.quantity).toBeNull();
    expect(vm.form.unitPrice).toBeNull();
    expect(vm.form.customerName).toBe('');
    expect(vm.form.paymentMethod).toBe('');
  });
})
