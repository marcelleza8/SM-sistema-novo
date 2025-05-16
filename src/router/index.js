import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Busca from "../views/Admin/Chip/Busca.vue";
import Dashboard from "../views/Dashboard.vue";
import AdminChipListPage from "../views/Admin/Chip/Manage/List.vue";
import AdminChipFormPage from "../views/Admin/Chip/Manage/Form.vue";
import AdminOperadoraListPage from "../views/Admin/Operator/ListAll.vue";
import AdminOperadoraAccountListPage from "../views/Admin/OperatorAccount/ListAll.vue";
import AdminOperadoraPlanosListPage from "../views/Admin/OperatorPlans/ListAll.vue";
import AdminSystemJobsList from "../views/Admin/System/Jobs/JobsCreator.vue";
import ExcessConsumption from "../views/Admin/Reports/ExcessConsumption.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "Login" },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false, // Indica que não é necessário estar autenticado
      title: "Login - Admin",
    },
  },
  {
    path: "/admin",
    // component: AdminLayout, // Layout principal para rotas de admin
    meta: {
      authenticated: true, // Requer autenticação
      title: "Admin Dashboard",
    },
    children: [
      {
        path: "dashboard",
        name: "Admin/Dashboard",
        component: Dashboard,
        meta: {
          title: "Dashboard - Admin",
        },
      },
      {
        path: "chip",
        meta: {
          title: "Chip Management - Admin",
        },
        children: [
          {
            path: "busca",
            name: "Admin/Chip/Busca",
            component: Busca,
            meta: {
              title: "Busca de Chips - Admin",
            },
          },
          {
            path: "",
            name: "AdminChipListPage",
            component: AdminChipListPage,
            meta: {
              title: "Lista de Chips - Admin",
            },
          },
          {
            path: "add",
            name: "AdminChipAddFormPage",
            component: AdminChipFormPage,
            meta: {
              title: "SIM Card - Admin",
            },
          },
          {
            path: "edit/:id",
            name: "AdminChipEditFormPage",
            component: AdminChipFormPage,
            props: true,
            meta: {
              title: "SIM Card - Admin",
            },
          },
        ],
      },
      {
        path: "contract",
        meta: {
          title: "Contract Management - Admin",
        },
        children: [
          {
            path: "",
            name: "AdminContractListPage",
            component: () => import("../views/Admin/Contracts/List.vue"),
            meta: {
              title: "Lista de Contratos - Admin",
            },
          },
          {
            path: "edit/:id/:tabId?",
            name: "AdminContractEditPage",
            component: () => import("../views/Admin/Contracts/Edit.vue"),
            props: true,
            meta: {
              title: "Editar Contrato - Admin",
            },
          },
        ],
      },
      {
        path: "operadoras",
        meta: {
          title: "Operadoras - Admin",
        },
        children: [
          {
            path: "",
            name: "AdminOperadoraListPage",
            component: AdminOperadoraListPage,
            meta: {
              title: "Lista de Operadoras - Admin",
            },
          },
          {
            path: "planos",
            name: "AdminOperadoraPlanosListPage",
            component: AdminOperadoraPlanosListPage,
            meta: {
              title: "Planos - Admin",
            },
          },
          {
            path: "contas",
            name: "AdminOperadoraAccountListPage",
            component: AdminOperadoraAccountListPage,
            meta: {
              title: "Contas - Admin",
            },
          },
        ],
      },
      {
        path: "system",
        meta: {
          title: "Sistema",
        },
        children: [
          {
            path: "jobs",
            name: "AdminSystemJobsList",
            component: AdminSystemJobsList,
            meta: {
              title: "Lista de Jobs",
            },
          },
        ],
      },
      {
        path: "reports",
        meta: {
          title: "Relatorios",
        },
        children: [
          {
            path: "excess-consumption",
            name: "ExcessConsumption",
            component: ExcessConsumption,
            meta: {
              title: "Excesso de consumo",
            },
          },
          {
            path: "consumption",
            name: "ReportConsumption",
            component: () => import("../views/Admin/Reports/Consumption.vue"),
            meta: {
              title: "Excesso de consumo",
            },
          },
        ],
      },
    ],
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
