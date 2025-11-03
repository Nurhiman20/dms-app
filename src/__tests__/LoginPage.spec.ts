import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../pages/LoginPage.vue';

// Mock vue-router useRouter
const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock Quasar: include useQuasar and component exports used via auto-imports
const notifyMock = vi.fn();
vi.mock('quasar', () => {
  const Block = { template: '<div><slot /></div>' };
  const Btn = { template: '<button><slot /></button>' };
  const Icon = { template: '<i />' };
  return {
    useQuasar: () => ({ notify: notifyMock }),
    QLayout: Block,
    QPageContainer: Block,
    QPage: Block,
    QSelect: Block,
    QBtn: Btn,
    QBanner: Block,
    QAvatar: Block,
    QIcon: Icon,
  };
});

// Mock network status util, override per test with mockImplementation
const checkNetworkStatusMock = vi.fn(async () => true);
vi.mock('../utils/networkStatus', () => ({
  checkNetworkStatus: () => checkNetworkStatusMock(),
}));

// Mock auth API
const loginMock = vi.fn(async (payload: { role: string; }) => ({
  success: true,
  user: {
    id: 'user-1',
    role: payload.role,
    name: payload.role === 'Admin' ? 'Admin User' : 'Sales User',
    email: `${payload.role.toLowerCase()}@dmsapp.com`,
  },
  token: 'token-123',
}));
vi.mock('../services/authApi', () => ({
  login: (payload: { role: string; }) => loginMock(payload),
}));

// Mock outlet store used in LoginPage watch() logic
const fetchOutletsMock = vi.fn(async () => { });
vi.mock('../stores/outlet', () => ({
  useOutletStore: () => ({
    outlets: [],
    loading: false,
    error: null,
    activeOutlets: [],
    fetchOutlets: fetchOutletsMock,
  }),
}));

function mountLoginPage() {
  return mount(LoginPage, {
    global: {
      // per-component stubs are provided via quasar mock exports above
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
  notifyMock.mockClear();
  loginMock.mockClear();
  fetchOutletsMock.mockClear();
  checkNetworkStatusMock.mockReset();
  checkNetworkStatusMock.mockResolvedValue(true); // default online
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('disables login until a role is selected; Admin path logs in and redirects to dashboard', async () => {
    const wrapper = mountLoginPage();
    const vm: any = wrapper.vm as any;

    // Initially disabled
    expect(vm.isLoginDisabled).toBe(true);

    // Admin selected enables login
    vm.selectedRole = 'Admin';
    await vm.$nextTick();
    expect(vm.isLoginDisabled).toBe(false);

    // Perform login
    await vm.handleLogin();

    expect(loginMock).toHaveBeenCalledWith({ role: 'Admin' });
    expect(localStorage.getItem('user')).toBeTruthy();
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('selectedOutletId')).toBeNull();
    expect(notifyMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith({ name: 'dashboard' });
  });

  it('requires outlet selection for Sales and redirects to outlet-detail when provided', async () => {
    const wrapper = mountLoginPage();
    const vm: any = wrapper.vm as any;

    // Select Sales: still disabled without outlet
    vm.selectedRole = 'Sales';
    await vm.$nextTick();
    expect(fetchOutletsMock).toHaveBeenCalledTimes(1);
    expect(vm.isLoginDisabled).toBe(true);

    // Set outlet then login
    vm.selectedOutletId = 'out-1';
    await vm.$nextTick();
    expect(vm.isLoginDisabled).toBe(false);

    await vm.handleLogin();

    expect(loginMock).toHaveBeenCalledWith({ role: 'Sales' });
    expect(localStorage.getItem('selectedOutletId')).toBe('out-1');
    expect(pushMock).toHaveBeenCalledWith({ name: 'outlet-detail', params: { id: 'out-1' } });
  });

  it('allows offline access with cached credentials and skips API login', async () => {
    // Prepare cached credentials
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Cached User' }));
    localStorage.setItem('token', 'cached-token');

    // Simulate offline
    checkNetworkStatusMock.mockResolvedValue(false);

    const wrapper = mountLoginPage();
    const vm: any = wrapper.vm as any;
    vm.selectedRole = 'Admin';
    await vm.$nextTick();

    await vm.handleLogin();

    expect(loginMock).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith({ name: 'dashboard' });
  });
});
