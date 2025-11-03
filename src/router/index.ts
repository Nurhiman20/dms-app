import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'

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
})

export default router
