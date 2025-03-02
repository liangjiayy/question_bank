import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import QuestionImport from "@/views/question/QuestionImport.vue";
import QuestionMain from "@/views/question/QuestionMain.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/import",
      name: "import",
      component: QuestionImport,
    },
    {
      path: "/main",
      name: "main",
      component: QuestionMain,
    },
  ],
});

export default router;
