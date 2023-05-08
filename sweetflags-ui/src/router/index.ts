import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AppList from '../components/AppList.vue';
import Home from '../components/Home.vue';
import AppDetail from '../components/AppDetail.vue';
import AppCreate from '../components/AppCreate.vue';
import FeatureFlagCreate from '../components/FeatureFlagCreate.vue';
import FeatureFlagDetail from '../components/FeatureFlagDetail.vue';
import EnvironmentCreate from '../components/EnvironmentCreate.vue';
import AppManage from '../components/AppManage.vue';
import Healthz from '../components/Healthz.vue';
import { authGuard } from '@auth0/auth0-vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: authGuard
  },
  {
    path: '/apps',
    name: 'AppList',
    component: AppList,
    beforeEnter: authGuard
  },
  {
    path: '/apps/:appId',
    name: 'AppDetail',
    component: AppDetail,
    beforeEnter: authGuard,
    props: (route) => ({ appId: route.params.appId })
  },
  {
    path: '/apps/create',
    name: 'AppCreate',
    component: AppCreate,
    beforeEnter: authGuard,
    props: true,
  },
  {
    path: '/environments/create/:appId',
    name: 'EnvironmentCreate',
    component: EnvironmentCreate,
    beforeEnter: authGuard,
    props: (route) => ({ appId: route.params.appId })
  },
  {
    path: '/apps/manage/:appId',
    name: 'AppManage',
    component: AppManage,
    beforeEnter: authGuard,
    props: (route) => ({ appId: route.params.appId })
  },
  {
    path: '/apps/:appId/flags/create',
    name: 'FeatureFlagCreate',
    component: FeatureFlagCreate,
    props: (route) => ({ appId: route.params.appId }),
  },
  {
    path: '/flags/:flagId',
    name: 'FeatureFlagDetail',
    component: FeatureFlagDetail,
    beforeEnter: authGuard,
    props: (route) => ({ flagId: route.params.flagId })
  },
  {
    path: '/healthz',
    name: 'Healthz',
    component: Healthz,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
