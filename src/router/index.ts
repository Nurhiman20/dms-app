import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../pages/DashboardPage.vue'),
        },
        {
          path: 'outlets',
          name: 'outlets',
          component: () => import('../pages/OutletListPage.vue'),
        },
        {
          path: 'outlets/:id',
          name: 'outlet-detail',
          component: () => import('../pages/OutletDetailPage.vue'),
        },
      ],
    },
  ],
});

/**
 * Check if user is authenticated by verifying token in localStorage
 */
function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Route guard to protect authenticated routes and redirect authenticated users from login
 */
router.beforeEach((to, from, next) => {
  const isUserAuthenticated = isAuthenticated();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Redirect authenticated users away from login page
  if (to.name === 'login' && isUserAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  // Redirect unauthenticated users away from protected routes
  if (requiresAuth && !isUserAuthenticated) {
    next({ name: 'login' });
    return;
  }

  next();
});

export default router;
