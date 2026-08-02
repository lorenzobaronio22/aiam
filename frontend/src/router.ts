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
    path: "/member/:memberId?",
    name: "member",
    component: MembersPage,
  },
  {
    path: "/members/:memberId?",
    redirect: (to) => {
      const memberId = typeof to.params.memberId === "string" ? to.params.memberId : "";
      return memberId ? `/member/${memberId}` : "/member";
    },
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