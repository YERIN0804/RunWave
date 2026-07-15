<template>
  <div class="dashboard">
    <section class="my-stats">
      <h3>나의 러닝 통계</h3>
      <div class="stats-grid">
        <p>오늘: {{ stats.day.totalDistance }}km / {{ stats.day.totalTime }}분</p>
        <p>이번주: {{ stats.week.totalDistance }}km</p>
        <p>이번달: {{ stats.month.totalDistance }}km</p>
      </div>
    </section>

    <section class="hall-of-fame">
      <h3>부산 명예의 전당</h3>
      <div v-for="(user, idx) in rankings" :key="user.id" class="rank-item">
        <span>{{ idx + 1 }}등 {{ user.name }}</span>
        <span>{{ user.distance }}km</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { initialRankings } from '../data/rankingDummy';
import { getStats } from '../utils/rankingStorage';

const stats = ref({
  day: getStats('day') || { totalDistance: 0, totalTime: 0 },
  week: getStats('week') || { totalDistance: 0, totalTime: 0 },
  month: getStats('month') || { totalDistance: 0, totalTime: 0 }
});

const rankings = ref(initialRankings.sort((a, b) => b.distance - a.distance));

// 3초마다 랭킹 변동 시뮬레이션
onMounted(() => {
  setInterval(() => {
    rankings.value = rankings.value.map(u => ({
      ...u,
      distance: parseFloat((u.distance + Math.random() * 0.5).toFixed(1))
    })).sort((a, b) => b.distance - a.distance);
  }, 3000);
});
</script>