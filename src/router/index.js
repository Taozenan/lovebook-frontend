import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import BindingView from '../views/BindingView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import ShopDetailView from '../views/ShopDetailView.vue'
import ShopManageView from '../views/ShopManageView.vue'
import ShopPublishView from '../views/ShopPublishView.vue'
import ShopPublishSuccessView from '../views/ShopPublishSuccessView.vue'
import ShopCategoryView from '../views/ShopCategoryView.vue'
import ShopOrderListView from '../views/ShopOrderListView.vue'
import ShopOrderDetailView from '../views/ShopOrderDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { public: true } },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/binding', name: 'binding', component: BindingView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/shop/items/:id', name: 'shop-detail', component: ShopDetailView, meta: { requiresAuth: true } },
    { path: '/shop/manage', name: 'shop-manage', component: ShopManageView, meta: { requiresAuth: true } },
    { path: '/shop/publish', name: 'shop-publish', component: ShopPublishView, meta: { requiresAuth: true } },
    { path: '/shop/publish/success', name: 'shop-publish-success', component: ShopPublishSuccessView, meta: { requiresAuth: true } },
    { path: '/shop/category', name: 'shop-category', component: ShopCategoryView, meta: { requiresAuth: true } },
    { path: '/shop/orders', name: 'shop-orders', component: ShopOrderListView, meta: { requiresAuth: true } },
    { path: '/shop/orders/:id', name: 'shop-order-detail', component: ShopOrderDetailView, meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to) => {
  const hasToken = Boolean(JSON.parse(localStorage.getItem('tzn-auth') || '{}').token)
  if (to.meta.requiresAuth && !hasToken) return '/login'
  if (to.path === '/login' && hasToken) return '/home'
  return true
})

export default router
