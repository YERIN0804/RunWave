<template>
  <div class="dashboard">
    <section class="my-stats">
      <h3>🏃 나의 러닝 통계</h3>
      <div class="stats-grid">
        <p>오늘: {{ stats.day.totalDistance.toFixed(1) }}km / {{ stats.day.totalTime }}분</p>
        <p>이번주: {{ stats.week.totalDistance.toFixed(1) }}km</p>
        <p>이번달: {{ stats.month.totalDistance.toFixed(1) }}km</p>
      </div>
    </section>

    <section class="hall-of-fame">
      <h3>🏆 부산 명예의 전당</h3>
      <div v-for="(user, idx) in rankings" :key="user.id" class="rank-item">
        <span>{{ idx + 1 }}등 {{ user.name }}</span>
        <span>{{ user.distance }}km</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { initialRankings } from '../data/rankingDummy';
import { getStats } from '../utils/rankingStorage';

const stats = computed(() => ({
  day: getStats('day'),
  week: getStats('week'),
  month: getStats('month')
}));

const rankings = ref([...initialRankings].sort((a, b) => b.distance - a.distance));

onMounted(() => {
  setInterval(() => {
    rankings.value = rankings.value.map(u => ({
      ...u,
      distance: parseFloat((u.distance + Math.random() * 0.5).toFixed(1))
    })).sort((a, b) => b.distance - a.distance);
  }, 3000);
});
</script>

<style scoped>
.dashboard { padding: 20px; border: 1px solid #ddd; border-radius: 15px; background: #fff; max-width: 400px; }
.stats-grid { color: #444; margin-bottom: 20px; }
.rank-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
h3 { color: #2b7cff; }
</style>