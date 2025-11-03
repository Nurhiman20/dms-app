import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OutletDetailPage from '../pages/OutletDetailPage.vue';

// Router mocks
const pushMock = vi.fn();
const routeParams = { id: 'outlet-1' };
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ params: routeParams }),
}));

// Quasar mock
const notifyMock = vi.fn();
const darkState = { isActive: false };
vi.mock('quasar', () => {
  const Block = { template: '<div><slot /></div>' };
  const Btn = { template: '<button><slot /></button>' };
  const Card = { template: '<div><slot /></div>' };
  const CardSection = { template: '<div><slot /></div>' };
  const Spinner = { template: '<div class="spinner" />' };
  const Icon = { template: '<i />' };
  const Badge = { props: ['color', 'label'], template: '<span />' };
  const Table = { props: ['rows', 'columns', 'rowKey', 'rowsPerPageOptions', 'loading'], template: '<div data-test="table"><slot /></div>' };
  const Td = { props: ['props'], template: '<td><slot /></td>' };
  return {
    useQuasar: () => ({ notify: notifyMock, dark: darkState }),
    QPage: Block,
    QBtn: Btn,
    QCard: Card,
    QCardSection: CardSection,
    QSpinner: Spinner,
    QIcon: Icon,
    QBadge: Badge,
    QTable: Table,
    QTd: Td,
  };
});

// Mock Outlet Store
const fetchOutletByIdMock = vi.fn();
let mockOutlet: any = null;
let mockOutletLoading = false;
vi.mock('../stores/outlet', async () => {
  const actual = await vi.importActual<any>('../stores/outlet');
  return {
    ...actual,
    useOutletStore: () => ({
      loading: mockOutletLoading,
      getOutletById: (id: string) => {
        if (mockOutlet && mockOutlet.id === id) return mockOutlet;
        return undefined;
      },
      fetchOutletById: fetchOutletByIdMock,
    }),
  };
});

// Mock Sales Store
const fetchSalesByOutletIdMock = vi.fn();
let mockSales: any[] = [];
let mockSalesLoading = false;
vi.mock('../stores/sales', async () => {
  const actual = await vi.importActual<any>('../stores/sales');
  return {
    ...actual,
    useSalesStore: () => ({
      loading: mockSalesLoading,
      getSalesByOutletId: (outletId: string) => {
        return mockSales.filter((s) => s.outletId === outletId);
      },
      fetchSalesByOutletId: fetchSalesByOutletIdMock,
    }),
  };
});

// Stub NewSaleDialog
function mountOutletDetail() {
  return mount(OutletDetailPage, {
    global: {
      stubs: {
        NewSaleDialog: { props: ['modelValue', 'outletId'], template: '<div data-test="new-sale-dialog" v-if="modelValue">Dialog</div>' },
      },
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
  notifyMock.mockClear();
  fetchOutletByIdMock.mockClear();
  fetchSalesByOutletIdMock.mockClear();
  mockOutlet = null;
  mockOutletLoading = false;
  mockSales = [];
  mockSalesLoading = false;
  routeParams.id = 'outlet-1';
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('OutletDetailPage', () => {
  it('shows loading state when fetching outlet', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutletLoading = true;
    mockSalesLoading = false;

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Loading outlet details');
  });

  it('shows not found state when outlet does not exist', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = null;
    mockOutletLoading = false;
    fetchOutletByIdMock.mockResolvedValue(undefined);

    const wrapper = mountOutletDetail();
    await Promise.resolve();
    await Promise.resolve();

    expect(wrapper.text()).toContain('Outlet not found');
  });

  it('renders outlet information when outlet exists', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockOutletLoading = false;
    mockSales = [];
    mockSalesLoading = false;

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Test Outlet');
    expect(wrapper.text()).toContain('North');
    expect(wrapper.text()).toContain('150');
  });

  it('shows back button for admin users', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    // Back button should exist for admin
    const vm: any = wrapper.vm as any;
    expect(vm.isAdmin).toBe(true);
  });

  it('hides back button for non-admin users', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'Sales', name: 'S' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm as any;
    expect(vm.isAdmin).toBe(false);
  });

  it('fetches outlet if not in store on mount', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = null;
    fetchOutletByIdMock.mockResolvedValue({
      id: 'outlet-1',
      name: 'Fetched Outlet',
      region: 'South',
      totalOrder: 200,
      isActive: true,
    });

    mountOutletDetail();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchOutletByIdMock).toHaveBeenCalledWith('outlet-1');
  });

  it('fetches sales if not in store on mount', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = []; // Empty, should trigger fetch

    mountOutletDetail();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchSalesByOutletIdMock).toHaveBeenCalledWith('outlet-1');
  });

  it('does not fetch sales if already in store', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = [
      { id: 's1', outletId: 'outlet-1', date: '2024-01-01', productName: 'Product A', quantity: 10, unitPrice: 1000, totalAmount: 10000, customerName: 'Customer 1', paymentMethod: 'Cash' },
    ];

    mountOutletDetail();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchSalesByOutletIdMock).not.toHaveBeenCalled();
  });

  it('calculates total sales amount correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = [
      { id: 's1', outletId: 'outlet-1', date: '2024-01-01', productName: 'Product A', quantity: 10, unitPrice: 1000, totalAmount: 10000, customerName: 'Customer 1', paymentMethod: 'Cash' },
      { id: 's2', outletId: 'outlet-1', date: '2024-01-02', productName: 'Product B', quantity: 5, unitPrice: 2000, totalAmount: 10000, customerName: 'Customer 2', paymentMethod: 'Credit' },
    ];

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm as any;
    expect(vm.totalSalesAmount).toBe(20000);
  });

  it('calculates average transaction correctly', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = [
      { id: 's1', outletId: 'outlet-1', date: '2024-01-01', productName: 'Product A', quantity: 10, unitPrice: 1000, totalAmount: 10000, customerName: 'Customer 1', paymentMethod: 'Cash' },
      { id: 's2', outletId: 'outlet-1', date: '2024-01-02', productName: 'Product B', quantity: 5, unitPrice: 2000, totalAmount: 10000, customerName: 'Customer 2', paymentMethod: 'Credit' },
    ];

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm as any;
    expect(vm.averageTransaction).toBe(10000); // (10000 + 10000) / 2
  });

  it('shows new sale dialog when button is clicked', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };

    const wrapper = mountOutletDetail();
    const vm: any = wrapper.vm as any;
    await wrapper.vm.$nextTick();

    expect(vm.showNewSaleDialog).toBe(false);
    expect(wrapper.find('[data-test="new-sale-dialog"]').exists()).toBe(false);

    vm.showNewSaleDialog = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-test="new-sale-dialog"]').exists()).toBe(true);
  });

  it('shows sales summary when sales exist', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = [
      { id: 's1', outletId: 'outlet-1', date: '2024-01-01', productName: 'Product A', quantity: 10, unitPrice: 1000, totalAmount: 10000, customerName: 'Customer 1', paymentMethod: 'Cash' },
    ];

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Sales Summary');
    expect(wrapper.text()).toContain('Total Sales Amount');
    expect(wrapper.text()).toContain('Total Transactions');
  });

  it('does not show sales summary when no sales', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlet = {
      id: 'outlet-1',
      name: 'Test Outlet',
      region: 'North',
      totalOrder: 150,
      isActive: true,
    };
    mockSales = [];

    const wrapper = mountOutletDetail();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Sales Summary');
  });
});

