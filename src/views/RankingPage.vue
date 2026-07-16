<template>
  <div class="ranking-page page-shell">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 메인으로 돌아가기</button>
      <div>
        <p class="eyebrow">부산 러닝 메이트</p>
        <h2>🏅 부산 명예의 전당</h2>
        <p class="subtitle">일별 · 주별 · 월별 누적 통계를 확인하고 나의 기록을 비교해보세요.</p>
      </div>
    </div>

    <div class="filter-group">
      <button :class="{ active: currentFilter === 'day' }" @click="currentFilter = 'day'">일별</button>
      <button :class="{ active: currentFilter === 'week' }" @click="currentFilter = 'week'">주별</button>
      <button :class="{ active: currentFilter === 'month' }" @click="currentFilter = 'month'">월별</button>
    </div>

    <div class="ranking-grid">
      <section class="stats-card">
      <h3>내 기록</h3>
      <div class="stats-items">
        <div class="stat-box">
          <span class="stat-label">총 거리</span>
          <strong>{{ stats.totalDistance.toFixed(1) }} km</strong>
        </div>
        <div class="stat-box">
          <span class="stat-label">총 시간</span>
          <strong>{{ stats.totalTime }} 분</strong>
        </div>
      </div>
    </section>

      <section class="leaderboard-card">
        <div class="leaderboard-head">
          <h3>🏆 부산 명예의 전당</h3>
          <p>실시간 가상 랭킹 변동</p>
        </div>
        <ul>
          <li v-for="(user, idx) in rankings" :key="user.id" :class="{ top: idx < 3 }">
            <span class="rank">#{{ idx + 1 }}</span>
            <span class="name">{{ user.name }}</span>
            <span class="value">{{ user.distance.toFixed(1) }}km</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStats } from '../utils/rankingStorage'
import { initialRankings } from '../data/rankingDummy'

const currentFilter = ref('day')
const stats = computed(() => getStats(currentFilter.value))
const rankings = ref([...initialRankings].sort((a, b) => b.distance - a.distance))
</script>

<style scoped>
  .stats-card {
    background: #fff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 22px 45px rgba(20, 24, 54, 0.06);
  }

  .stats-items {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .stat-box {
    flex: 1;
    min-width: 150px;
    background: #fbf7ff;
    border-radius: 20px;
    padding: 18px 20px;
    text-align: center;
  }

  .stat-label {
    display: block;
    margin-bottom: 10px;
    color: #7a7a92;
    font-size: 0.94rem;
  }

  .stat-box strong {
    display: block;
    font-size: 1.8rem;
    line-height: 1.1;
    color: #222;
  }
  .leaderboard-card {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 22px 45px rgba(20, 24, 54, 0.06);
}

.leaderboard-card ul {
  margin-top: 20px;
}

.leaderboard-card li {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f5;
}

.leaderboard-card li:last-child {
  border-bottom: none;
}
</style>