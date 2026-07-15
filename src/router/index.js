// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; // 메인 화면을 별도 파일로 분리
import RankingPage from '../views/RankingPage.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/ranking', component: RankingPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;