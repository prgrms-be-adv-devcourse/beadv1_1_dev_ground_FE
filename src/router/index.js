import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    children: [
      { path: '', name: 'home', component: () => import('@/components/Product.vue') },
      { path: 'product', name: 'product', component: () => import('@/components/Product.vue') },
      { path: 'login', name: 'login', component: () => import('@/components/Login.vue') },
      { path: 'signup', name: 'signup', component: () => import('@/components/SignUp.vue') },
      { path: 'cart', name: 'cart', component: () => import('@/components/Cart.vue') },
      { path: 'deposit', name: 'deposit', component: () => import('@/components/Deposit.vue') },
      { path: 'profile', name: 'profile', component: () => import('@/components/Profile.vue') },
      {
        path: 'productDetail/:id',
        name: 'productDetail',
        component: () => import('@/components/ProductDetail.vue'),
      },
      {
        path: 'register',
        name: 'productRegist',
        component: () => import('@/components/ProductRegist.vue'),
      },
      {
        path: '/productregist',
        name: 'ProductRegist',
        component: () => import('@/components/ProductRegist.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/components/Checkout.vue'),
      },
      {
        path: 'view/payments/success',
        name: 'paymentSuccess',
        component: () => import('@/components/Success.vue'),
      },
      {
        path: 'success',
        name: 'success',
        component: () => import('@/components/Success.vue'),
      },
      {
        path: 'fail',
        name: 'fail',
        component: () => import('@/components/Fail.vue'),
      },
      {
        path: 'view/payments/fail',
        name: 'paymentFail',
        component: () => import('@/components/Fail.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
