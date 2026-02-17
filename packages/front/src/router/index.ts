import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import ReservePage from '../views/ReservePage.vue'
import ProfilPage from '../views/ProfilPage.vue'
import DebugPage from '../views/DebugPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/reserve'
  },
  {
    path: '/reserve',
    name: 'Reserve',
    component: ReservePage
  },
  {
    path: '/profil',
    name: 'Profil',
    component: ProfilPage
  },
  {
    path: '/debug',
    name: 'Debug',
    component: DebugPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
