import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Busca from "../views/Admin/Chip/Busca.vue";
import Dashboard from "../views/Dashboard.vue";
import AdminChipListPage from "../views/Admin/Chip/Manage/List.vue";
import AdminOperadoraListPage from "../views/Admin/Operator/ListAll.vue";
import AdminOperadoraAccountListPage from "../views/Admin/OperatorAccount/ListAll.vue";
import AdminOperadoraPlanosListPage from "../views/Admin/OperatorPlans/ListAll.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/admin/dashboad",
    name: "Admin/Dashboard",
    component: Dashboard,
    meta: {
      authenticated: true,
    },
  },
  {
    path: "/admin/chip/busca",
    name: "Admin/Chip/Busca",
    component: Busca,
    meta: {
      authenticated: true,
    },
  },
  {
    path: "/admin/chip/",
    name: "AdminChipListPage",
    component: AdminChipListPage,
    meta: {
      authenticated: true,
    },
  },
  {
    path: "/admin/operadoras/",
    name: "AdminOperadoraListPage",
    component: AdminOperadoraListPage,
    meta: {
      authenticated: true,
    },
  },
  {
    path: "/admin/planos/",
    name: "AdminOperadoraPlanosListPage",
    component: AdminOperadoraPlanosListPage,
    meta: {
      authenticated: true,
    },
  },
  {
    path: "/admin/contas/",
    name: "AdminOperadoraAccountListPage",
    component: AdminOperadoraAccountListPage,
    meta: {
      authenticated: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;

  if (to.matched.some((record) => record.meta.authenticated) && !isLoggedIn) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
