import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/outlets',
      name: 'outlets',
      component: () => import('../pages/OutletListPage.vue'),
    },
  ],
})

export default router
