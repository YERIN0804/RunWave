<template>
  <div class="app-wrap">
    <header class="app-header">
      <h1>부산 러닝 메이트 🏃‍♂️</h1>
      <p>부산 해변 러닝을 한눈에 확인하고 기록을 관리하세요.</p>
    </header>

    <main class="app-content">
      <div class="content-layout">
        <!-- 왼쪽: 지도 + 코스 리스트 -->
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

        <!-- 오른쪽: 팝업 느낌의 사이드 대시보드 -->
        <aside class="sidebar-panel">
          <div class="popup-card ranking-card">
            <p class="card-label">🏆 부산 명예의 전당</p>
            <h3>TOP 3 러너</h3>
            <ul>
              <li v-for="(item, idx) in top3" :key="item.id">
                <div class="rank-left">
                  <span class="rank">#{{ idx + 1 }}</span>
                  <strong class="rname">{{ item.name }}</strong>
                </div>
                <span class="rvalue">{{ item.distance.toFixed(1) }} km</span>
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
                <div
                  v-for="(v, i) in last7"
                  :key="i"
                  class="bar"
                  :style="{ height: (v / maxLast7 * 100) + '%' }"
                  :title="v.toFixed(1) + ' km'"
                >
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

      <section class="community-section">
        <div class="community-panel popup-card">
          <h3 class="card-label">💬 커뮤니티</h3>

          <BoardWrite v-if="currentHash === '#/write'" />
          <BoardDetail v-else-if="currentHash.startsWith('#/post/')" />
          <BoardEdit v-else-if="currentHash.startsWith('#/edit/')" />
          <BoardList v-else />
        </div>
      </section>

      <RunChat />
    </main>

    <footer class="app-footer">
      <p>© 2026 부산 러닝 메이트. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import BoardList from '../components/BoardList.vue'
import BoardWrite from '../components/BoardWrite.vue'
import BoardDetail from '../components/BoardDetail.vue'
import BoardEdit from '../components/BoardEdit.vue'
import BeachMap from '../components/BeachMap.vue'
import CourseList from '../components/CourseList.vue'
import RunChat from '../components/RunChat.vue'
import WeatherDashBoard from '../components/WeatherDashBoard.vue'
import { getStats, getLogs } from '../utils/rankingStorage'
import { initialRankings } from '../data/rankingDummy'
import { courses } from '../data/runningCourses'

// simple hash-based routing for community
const currentHash = ref(location.hash || '#/')
function updateHash() { currentHash.value = location.hash || '#/' }
onMounted(() => window.addEventListener('hashchange', updateHash))
onBeforeUnmount(() => window.removeEventListener('hashchange', updateHash))

// map / courses
const selectedCourse = ref(courses[0])
const selectCourse = (course) => { selectedCourse.value = course }

// rankings / stats
const top3 = computed(() =>
  [...initialRankings].sort((a, b) => b.distance - a.distance).slice(0, 3)
)

const statsDay = computed(() => getStats('day'))
const statsWeek = computed(() => getStats('week'))
const statsMonth = computed(() => getStats('month'))

// 보조 데이터
const logs = computed(() => getLogs())
const runCount = computed(() => logs.value.length)

// 평균 페이스 (분:초 / km)
const avgPace = computed(() => {
  const dist = statsMonth.value.totalDistance
  const time = statsMonth.value.totalTime
  if (!dist || dist <= 0) return '-'
  const minutesPerKm = time / dist
  const mm = Math.floor(minutesPerKm)
  const ss = Math.round((minutesPerKm - mm) * 60)
  return `${mm}:${String(ss).padStart(2, '0')}/km`
})

// 최근 7일 거리 (일자별 합계)
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
/* 전체 너비 확보 */
.app-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px 8px;
  box-sizing: border-box;
}

/* 레이아웃 */
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.8fr) minmax(340px, 1fr);
  gap: 30px;
  align-items: start;
  margin-bottom: 32px;
}

/* 지도 패널 */
.map-panel {
  background: #fff;
  border-radius: 28px;
  padding: 20px;
  box-shadow: 0 28px 72px rgba(20, 24, 54, 0.08);
  min-height: 720px;
}
.panel-head h2 { margin: 0; font-size: 1.9rem; }
.panel-head p { margin: 8px 0 20px; color: #5f657e; }

/* 사이드바: 따라오는 느낌 */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 28px;
  align-self: start;
}

/* 팝업 카드 */
.popup-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: 18px;
  border: 1px solid rgba(15, 20, 60, 0.04);
  box-shadow: 0 24px 64px rgba(20, 24, 54, 0.10);
  backdrop-filter: blur(6px);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.popup-card:hover { transform: translateY(-6px); box-shadow: 0 36px 90px rgba(20,24,54,0.14); }

.card-label { display:inline-flex; gap:8px; color:#3c4a9b; font-weight:700; margin-bottom:8px; }
.ranking-card h3, .stats-card h3 { margin:0 0 12px; font-size:1.15rem; }

/* 랭킹 리스트 */
.ranking-card ul { list-style:none; padding:0; margin:0; }
.ranking-card li {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:10px 0;
  border-bottom:1px solid rgba(230,232,255,0.9);
}
.ranking-card li:last-child { border-bottom:none; }
.rank { color:#ff7a18; font-weight:800; min-width:36px; }
.rname { margin-left:8px; }

/* 대시보드 타일 */
.dashboard-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 10px;
  margin: 10px 0 14px;
}
.tile {
  background: linear-gradient(180deg,#fff,#fbf7ff);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(20,24,54,0.04);
}
.tile-label { color:#7b7b9a; font-size:0.85rem; margin-bottom:6px; display:block; }
.tile-value { font-weight:700; font-size:1.15rem; color:#222; }

.community-section { margin-top:20px; }
.community-panel { padding:16px; border-radius:14px; }


/* 스파크라인 */
.sparkline-wrap { margin-top: 8px; }
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
  background: linear-gradient(180deg,#ffceb0,#ff7a18);
  border-radius:8px 8px 4px 4px;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  position:relative;
  transition: transform .16s ease;
}
.sparkline .bar:hover { transform: translateY(-6px); box-shadow:0 10px 22px rgba(34,34,60,0.12); }
.sparkline .bar-day { position:absolute; bottom:-18px; font-size:0.72rem; color:#7f7f9c; }

/* 반응형 */
@media (max-width: 1080px) {
  .content-layout { grid-template-columns: 1fr; }
  .sidebar-panel { position: static; }
}
@media (max-width: 640px) {
  .dashboard-tiles { grid-template-columns: 1fr; }
  .sparkline { height:48px; gap:6px; }
}
</style>