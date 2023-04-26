import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/location/:id",
    name: "location",
    component: () => import("../views/Location.vue"),
  },
  {
    path: "/location/:id/:page",
    name: "locationPage",
    component: () => import("../views/Location.vue"),
  },
  {
    path: "/employees",
    name: "employees",
    component: () => import("../views/Employees.vue"),
  },
  {
    path: "/absences",
    name: "absences",
    component: () => import("../views/Absences.vue"),
  },
  {
    path: "/reports",
    name: "reports",
    component: () => import("../views/Report.vue"),
  },
  {
    path: "/reports/incomes",
    name: "incomes",
    component: () => import("../views/report/Incomes.vue"),
  },
  {
    path: "/reports/outcomes",
    name: "outcomes",
    component: () => import("../views/report/Outcomes.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
