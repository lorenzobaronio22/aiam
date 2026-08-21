import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from "vue-router";

import AttributeTypesPage from "./pages/AttributeTypesPage.vue";
import LandingPage from "./pages/LandingPage.vue";
import MembersPage from "./pages/MembersPage.vue";

const HOME_PATH = "/";
const MEMBER_PATH = "/member";
const ATTRIBUTE_TYPES_PATH = "/attribute-types";
const LEGACY_MEMBERS_PATH = "/members/:memberId?";

function toMemberPath(memberId: unknown): string {
  return typeof memberId === "string" && memberId.length > 0
    ? `${MEMBER_PATH}/${memberId}`
    : MEMBER_PATH;
}

export const routes: RouteRecordRaw[] = [
  {
    path: HOME_PATH,
    name: "home",
    component: LandingPage,
  },
  {
    path: `${MEMBER_PATH}/new`,
    name: "member-new",
    component: MembersPage,
  },
  {
    path: `${MEMBER_PATH}/:memberId?`,
    name: "member",
    component: MembersPage,
  },
  {
    path: ATTRIBUTE_TYPES_PATH,
    name: "attribute-types",
    component: AttributeTypesPage,
  },
  {
    path: LEGACY_MEMBERS_PATH,
    redirect: (to) => toMemberPath(to.params.memberId),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: HOME_PATH,
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