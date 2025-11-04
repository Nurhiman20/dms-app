import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DashboardPage from '../pages/DashboardPage.vue';

// Router mock
const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Quasar mock: components and useQuasar
const notifyMock = vi.fn();
const darkState = { isActive: false };
vi.mock('quasar', () => {
  const Block = { template: '<div><slot /></div>' };
  const Spinner = { template: '<div class="spinner" />' };
  const Icon = { template: '<i />' };
  return {
    useQuasar: () => ({ notify: notifyMock, dark: darkState }),
    QPage: Block,
    QCard: Block,
    QCardSection: Block,
    QSpinner: Spinner,
    QIcon: Icon,
  };
});

// Mock Chart.js dynamic imports
const BarComponent = { template: '<div data-test="bar-chart" />' };
vi.mock('vue-chartjs', async () => ({
  Bar: BarComponent,
}));

vi.mock('chart.js', async () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

// Mock dashboard API
const getDashboardStatsMock = vi.fn();
vi.mock('../services/dashboardApi', async () => {
  const actual = await vi.importActual<any>('../services/dashboardApi');
  return {
    ...actual,
    getDashboardStats: () => getDashboardStatsMock(),
  };
});

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
  notifyMock.mockClear();
  getDashboardStatsMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

function mountDashboard() {
  return mount(DashboardPage, {
    global: {
      stubs: {
        AccessDeniedCard: { template: '<div data-test="denied"><button @click="$emit(\'action\')">Go</button></div>' },
      },
    },
  });
}

describe('DashboardPage', () => {
  it('shows access denied for non-admin and navigates to selected outlet if present', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'Sales', name: 'S' }));
    localStorage.setItem('selectedOutletId', 'out-9');

    const wrapper = mountDashboard();
    expect(wrapper.find('[data-test="denied"]').exists()).toBe(true);

    await wrapper.find('[data-test="denied"] button').trigger('click');
    expect(pushMock).toHaveBeenCalledWith({ name: 'outlet-detail', params: { id: 'out-9' } });
  });

  it('shows access denied for non-admin and warns if no selected outlet', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'Sales', name: 'S' }));
    localStorage.removeItem('selectedOutletId');

    const wrapper = mountDashboard();
    expect(wrapper.find('[data-test="denied"]').exists()).toBe(true);

    await wrapper.find('[data-test="denied"] button').trigger('click');
    expect(notifyMock).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('loads and renders chart for admin when API succeeds', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    getDashboardStatsMock.mockResolvedValue({
      success: true,
      stats: [
        { region: 'East', totalSales: 120 },
        { region: 'West', totalSales: 80 },
      ],
    });

    const wrapper = mountDashboard();

    // Wait for chart to be rendered (handles async chart loading and API call)
    await vi.waitFor(() => {
      expect(wrapper.find('[data-test="bar-chart"]').exists()).toBe(true);
    }, { timeout: 2000 });
  });

  it('shows error text when API fails', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'a1', role: 'Admin', name: 'A' }));
    getDashboardStatsMock.mockResolvedValue({ success: false, message: 'Failed' });

    const wrapper = mountDashboard();

    // Wait for error message to appear (handles async chart loading and API call)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Failed');
    }, { timeout: 2000 });
  });
})


