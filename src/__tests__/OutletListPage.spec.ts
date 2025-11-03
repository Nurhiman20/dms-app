import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OutletListPage from '../pages/OutletListPage.vue';

// Router mock
const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Quasar mock
const notifyMock = vi.fn();
const darkState = { isActive: false };
vi.mock('quasar', () => {
  const Block = { template: '<div><slot /></div>' };
  const Input = { props: ['modelValue'], template: '<input />' };
  const Select = { props: ['modelValue'], template: '<select />' };
  const Table = { props: ['rows', 'columns', 'rowKey', 'rowsPerPageOptions', 'loading'], template: '<div data-test="table" />' };
  const Badge = { props: ['color', 'label'], template: '<span />' };
  const Td = { props: ['props'], template: '<td><slot /></td>' };
  const Icon = { template: '<i />' };
  return {
    useQuasar: () => ({ notify: notifyMock, dark: darkState }),
    QPage: Block,
    QInput: Input,
    QSelect: Select,
    QTable: Table,
    QBadge: Badge,
    QTd: Td,
    QIcon: Icon,
  };
});

// Mock Outlet Store
const fetchOutletsMock = vi.fn(async () => { });
let mockOutlets: any[] = [];
let mockLoading = false;
vi.mock('../stores/outlet', async () => {
  const actual = await vi.importActual<any>('../stores/outlet');
  return {
    ...actual,
    useOutletStore: () => ({
      outlets: mockOutlets,
      loading: mockLoading,
      fetchOutlets: fetchOutletsMock,
    }),
  };
});

function mountOutletList() {
  return mount(OutletListPage, {
    global: {
      stubs: {
        AccessDeniedCard: { template: '<div data-test="denied"><button @click="$emit(\'action\')">Go</button></div>' },
      },
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
  notifyMock.mockClear();
  fetchOutletsMock.mockClear();
  mockOutlets = [];
  mockLoading = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('OutletListPage', () => {
  it('shows access denied for non-admin and navigates to my outlet if present', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'Sales', name: 'S' }));
    localStorage.setItem('selectedOutletId', 'out-1');

    const wrapper = mountOutletList();
    expect(wrapper.find('[data-test="denied"]').exists()).toBe(true);
    await wrapper.find('[data-test="denied"] button').trigger('click');
    expect(pushMock).toHaveBeenCalledWith({ name: 'outlet-detail', params: { id: 'out-1' } });
  });

  it('shows access denied for non-admin and warns when no outlet selected', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'Sales', name: 'S' }));
    localStorage.removeItem('selectedOutletId');

    const wrapper = mountOutletList();
    expect(wrapper.find('[data-test="denied"]').exists()).toBe(true);
    await wrapper.find('[data-test="denied"] button').trigger('click');
    expect(notifyMock).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('fetches outlets on mount when store is empty', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlets = [];

    mountOutletList();
    await Promise.resolve();
    expect(fetchOutletsMock).toHaveBeenCalledTimes(1);
  });

  it('filters outlets by search, region, and status for admin', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlets = [
      { id: '1', name: 'Alpha Market', region: 'North', totalOrder: 100, isActive: true },
      { id: '2', name: 'Beta Store', region: 'South', totalOrder: 50, isActive: false },
      { id: '3', name: 'Gamma Mart', region: 'North', totalOrder: 75, isActive: true },
    ];

    const wrapper = mountOutletList();
    const vm: any = wrapper.vm as any;

    // Base count
    expect(vm.filteredOutlets.length).toBe(3);

    // Search: debounce normally applies, set debounced directly for determinism
    vm.debouncedSearchQuery = 'mart';
    await vm.$nextTick();
    expect(vm.filteredOutlets.map((o: any) => o.name)).toEqual(['Gamma Mart']);

    // Region filter
    vm.debouncedSearchQuery = '';
    vm.selectedRegion = 'North';
    await vm.$nextTick();
    expect(vm.filteredOutlets.length).toBe(2);

    // Status filter Active
    vm.selectedStatus = 'Active';
    await vm.$nextTick();
    expect(vm.filteredOutlets.map((o: any) => o.id)).toEqual(['1', '3']);

    // Status filter Inactive
    vm.selectedStatus = 'Inactive';
    await vm.$nextTick();
    expect(vm.filteredOutlets.map((o: any) => o.id)).toEqual([]);
  });

  it('navigates to outlet detail on row click', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    mockOutlets = [{ id: '1', name: 'Alpha Market', region: 'North', totalOrder: 100, isActive: true }];

    const wrapper = mountOutletList();
    const vm: any = wrapper.vm as any;
    await vm.$nextTick();

    // Call handler directly since table is stubbed
    await vm.handleRowClick(new Event('click'), mockOutlets[0]);
    expect(pushMock).toHaveBeenCalledWith({ name: 'outlet-detail', params: { id: '1' } });
  });
})


