import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from "vue-router";

import LandingPage from "./pages/LandingPage.vue";
import MembersPage from "./pages/MembersPage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: LandingPage,
  },
  {
    path: "/members",
    name: "members",
    component: MembersPage,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  return createRouter({
    history,
    routes,
  });
}

export function createTestRouter(initialPath = "/") {
  const router = createAppRouter(createMemoryHistory());
  void router.push(initialPath);
  return router;
}