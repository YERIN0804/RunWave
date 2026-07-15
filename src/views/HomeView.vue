<template>
  <div class="app-wrap">
    <header class="app-header">
      <h1>부산 러닝 메이트 🏃‍♂️</h1>
      <p>부산 해변 러닝을 한눈에 확인하고 기록을 관리하세요.</p>
    </header>

    <main class="app-content">
      <div class="content-layout">
        <section class="map-panel">
          <div class="panel-head">
            <h2>부산 비치런 지도</h2>
            <p>코스를 선택하면 지도에 표시됩니다.</p>
          </div>

          <CourseList
            :courses="courses"
            :selectedId="selectedCourse.id"
            @select="selectCourse"
          />

          <BeachMap :selectedCourse="selectedCourse" />
        </section>

        <aside class="sidebar-panel">
          <div class="popup-card ranking-card">
            <p class="card-label">🏆 부산 명예의 전당</p>
            <h3>TOP 3 러너</h3>
            <ul>
              <li v-for="(item, idx) in top3" :key="item.id">
                <span class="rank">#{{ idx + 1 }}</span>
                <strong>{{ item.name }}</strong>
                <span>{{ item.distance.toFixed(1) }}km</span>
              </li>
            </ul>
          </div>

          <div class="popup-card stats-card">
  <p class="card-label">📊 내 기록</p>
  <h3>요약</h3>

  <div class="dashboard-tiles">
    <div class="tile">
      <div class="tile-label">이번 달 거리</div>
      <div class="tile-value">{{ statsMonth.totalDistance.toFixed(1) }} km</div>
    </div>

    <div class="tile">
      <div class="tile-label">이번 달 시간</div>
      <div class="tile-value">{{ statsMonth.totalTime }} 분</div>
    </div>

    <div class="tile">
      <div class="tile-label">평균 페이스</div>
      <div class="tile-value">{{ avgPace }}</div>
    </div>

    <div class="tile">
      <div class="tile-label">런 횟수</div>
      <div class="tile-value">{{ runCount }}</div>
    </div>
  </div>

  <div class="sparkline-wrap">
    <div class="sparkline-label">최근 7일 거리 (km)</div>
    <div class="sparkline">
      <div v-for="(v, i) in last7" :key="i" class="bar" :style="{ height: (v / maxLast7 * 100) + '%' }" :title="v.toFixed(1) + ' km'">
        <span class="bar-day">{{ i === 6 ? '오늘' : '' }}</span>
      </div>
    </div>
  </div>
</div>
        </aside>
      </div>

      <section class="weather-section">
        <WeatherDashBoard />
      </section>

      <RunChat />
    </main>

    <footer class="app-footer">
      <p>© 2026 부산 러닝 메이트. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BeachMap from '../components/BeachMap.vue'
import CourseList from '../components/CourseList.vue'
import RunChat from '../components/RunChat.vue'
import WeatherDashBoard from '../components/WeatherDashBoard.vue'
import { getStats, getLogs } from '../utils/rankingStorage'
import { initialRankings } from '../data/rankingDummy'
import { courses } from '../data/runningCourses'

const selectedCourse = ref(courses[0])
const selectCourse = (course) => { selectedCourse.value = course }

const top3 = computed(() =>
  [...initialRankings].sort((a, b) => b.distance - a.distance).slice(0, 3)
)

const statsDay = computed(() => getStats('day'))
const statsWeek = computed(() => getStats('week'))
const statsMonth = computed(() => getStats('month'))

// 로그 / 통계 보조 계산
const logs = computed(() => getLogs())
const runCount = computed(() => logs.value.length)

const avgPace = computed(() => {
  const dist = statsMonth.value.totalDistance
  const time = statsMonth.value.totalTime
  if (!dist || dist <= 0) return '-'
  const minutesPerKm = time / dist
  const mm = Math.floor(minutesPerKm)
  const ss = Math.round((minutesPerKm - mm) * 60)
  return `${mm}:${String(ss).padStart(2, '0')}/km`
})

const last7 = computed(() => {
  const now = new Date()
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return logs.value
      .filter(l => l.date === key)
      .reduce((s, it) => s + Number(it.distance || 0), 0)
  })
})
const maxLast7 = computed(() => Math.max(...last7.value, 1))
</script>


<style scoped>
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.8fr) minmax(340px, 1fr);
  gap: 30px;
  align-items: start;
  margin-bottom: 32px;
}

.app-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.map-panel {
  background: #fff;
  border-radius: 32px;
  padding: 28px;
  box-shadow: 0 28px 72px rgba(20, 24, 54, 0.1);
  min-height: 720px;
}

/* 사이드바를 따라오는 느낌 */

.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: sticky;
  top: 28px;
  align-self: start;
}

/* 팝업 카드 느낌 */
.popup-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 32px 90px rgba(20, 24, 54, 0.14);
  backdrop-filter: blur(16px);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}


.popup-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 44px 110px rgba(20, 24, 54, 0.18);
}

/* 대시보드 타일 */
.dashboard-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 12px;
  margin: 12px 0 18px;
}
.tile {
  background: linear-gradient(180deg,#fff,#fbf7ff);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 10px 22px rgba(20,24,54,0.04);
}
.tile-label { color: #7b7b9a; font-size: 0.85rem; margin-bottom: 6px; display:block; }
.tile-value { font-weight:700; font-size:1.3rem; color:#222; }

/* 스파크라인 */
.sparkline-wrap { margin-top: 12px; }
.sparkline-label { color:#7f7f9c; font-size:0.85rem; margin-bottom:8px; }
.sparkline {
  display:flex;
  gap:8px;
  align-items:end;
  height:60px;
  padding:6px 4px;
}
.sparkline .bar {
  flex:1;
  min-width:8px;
  background: linear-gradient(180deg,#ffb38a,#ff7a18);
  border-radius:8px 8px 4px 4px;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  position:relative;
  transition: transform .18s ease;
}
.sparkline .bar:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(34,34,60,0.12); }
.sparkline .bar-day { position:absolute; bottom:-18px; font-size:0.7rem; color:#7f7f9c; }

/* 반응형: 타일 하나씩 */
@media (max-width:600px){
  .dashboard-tiles { grid-template-columns: 1fr; }
  .sparkline { height:48px; gap:6px; }
}

.card-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3c4a9b;
  font-weight: 700;
  margin-bottom: 12px;
}

.ranking-card h3,
.stats-card h3 {
  margin: 0 0 14px;
  font-size: 1.25rem;
}

.ranking-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(224, 229, 255, 0.9);
}

.ranking-card li:last-child {
  border-bottom: none;
}

.rank {
  color: #ff7a18;
  font-weight: 800;
  min-width: 36px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-row div {
  background: #f7f5ff;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
}

.stat-row span {
  display: block;
  color: #7f7f9c;
  margin-bottom: 10px;
}
.stat-row strong {
  display: block;
  font-size: 1.6rem;
  margin-bottom: 6px;
}
.stat-row small {
  color: #656576;
}

@media (max-width: 1080px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .stat-row {
    grid-template-columns: 1fr;
  }
}

</style>