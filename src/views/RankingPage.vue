<template>
  <div class="ranking-page">
    <button @click="$router.push('/')">← 메인으로 돌아가기</button>
    
    <h2>🏃 나의 러닝 통계 및 명예의 전당</h2>

    <div class="filter-group">
      <button @click="currentFilter = 'day'">일별</button>
      <button @click="currentFilter = 'week'">주별</button>
      <button @click="currentFilter = 'month'">월별</button>
    </div>

    <section>
      <h3>내 기록 ({{ currentFilter }} 단위)</h3>
      <p>총 거리: {{ stats.totalDistance.toFixed(1) }}km | 총 시간: {{ stats.totalTime }}분</p>
    </section>

    <section>
      <h3>🏆 부산 명예의 전당</h3>
      <div v-for="(user, idx) in rankings" :key="user.id">
        {{ idx + 1 }}등: {{ user.name }} - {{ user.distance }}km
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getStats } from '../utils/rankingStorage';
import { initialRankings } from '../data/rankingDummy';

const currentFilter = ref('day');
const stats = computed(() => getStats(currentFilter.value));
const rankings = ref([...initialRankings].sort((a, b) => b.distance - a.distance));
</script>