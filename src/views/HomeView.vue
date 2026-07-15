<template>
  <div class="app-wrap">
    <header class="app-header">
        <div class="brand" @click="scrollTo('top')" style="cursor:pointer">
        <div class="logo">🌊</div>
        <div class="brand-text">
        <h1>RunWave</h1>
        <p>Running in Busan, Together.</p>
        </div>
    </div>

    <nav class="nav">
        <button class="nav-btn">🏠 홈</button>
        <button class="nav-btn">👥 러닝 크루</button>
        <button class="nav-btn">🗺️ 코스 추천</button>
        <button class="nav-btn">🏆 명예의 전당</button>
        <button class="nav-btn">📊 내 기록</button>
    </nav>
    </header>

    <main class="app-content">
      <!-- Hero: course quick buttons + today's recommendation -->


      <!-- Main layout: map + sidebar -->
      <div class="content-layout">
        <section id="courses" class="map-panel" :class="{ 'map-panel--large': mapLarge }">
        <div class="panel-top">
        <div>
            <h2>부산 비치런 지도</h2>
            <p class="panel-copy">선택한 코스의 출발지, 중간 지점, 도착지가 지도 위에 표시됩니다.</p>
        </div>
        <button class="btn btn-primary" @click="toggleMapLarge">
            {{ mapLarge ? '작게 보기' : '지도 크게 보기' }}
        </button>
  
        </div>

        <CourseList :courses="courses" :selectedId="selectedCourse?.id" @select="selectCourse" />
        <div class="course-summary">
            <div class="course-meta">
                <strong>{{ selectedCourse.distance }}</strong>
                <span>{{ selectedCourse.title.replace('🏃 ', '') }}</span>
            </div>
            <p class="course-description">{{ selectedCourse.description }}</p>
        </div>

        <div class="map-card">
            <BeachMap ref="beachMapRef" :selectedCourse="selectedCourse" :large="mapLarge" />
        </div>

          <section id="community" class="community-section">
            <BoardWrite v-if="currentHash === '#/write'" />
            <BoardDetail v-else-if="currentHash.startsWith('#/post/')" />
            <BoardEdit v-else-if="currentHash.startsWith('#/edit/')" />
            <BoardList v-else />
        </section>
        </section>

        <aside class="sidebar-panel">

            <div class="popup-card weather-card">
            <WeatherDashBoard />
            </div>
          <div id="hall" class="popup-card ranking-card">
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

          <div class="popup-card stats-card" id="records">
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


      <RunChat />
    </main>

    <footer class="app-footer">
      <p>© 2026 RunWave. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import '../styles/board.css';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

import BoardList from '../components/BoardList.vue';
import BoardWrite from '../components/BoardWrite.vue';
import BoardDetail from '../components/BoardDetail.vue';
import BoardEdit from '../components/BoardEdit.vue';
import BeachMap from '../components/BeachMap.vue';
import CourseList from '../components/CourseList.vue';
import RunChat from '../components/RunChat.vue';
import WeatherDashBoard from '../components/WeatherDashBoard.vue';

import { getStats, getLogs } from '../utils/rankingStorage';
import { initialRankings } from '../data/rankingDummy';
import { courses } from '../data/runningCourses';

// 게시글 서비스 (로컬스토리지)
import { getPosts } from '../services/postService.js';

// refs / state
const beachMapRef = ref(null);
const mapLarge = ref(false);

// community posts
const posts = ref([]);
function loadPosts(){ posts.value = getPosts(); }

// small helper for short date
function formatShortDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const currentHash = ref(location.hash || '#/');
function updateHash() { currentHash.value = location.hash || '#/'; loadPosts(); }
onMounted(() => {
  window.addEventListener('hashchange', updateHash);
  // initial load
  loadPosts();
});
onBeforeUnmount(() => window.removeEventListener('hashchange', updateHash));

// courses / map
const selectedCourse = ref(courses[0] || null);
function selectCourse(course){
  selectedCourse.value = course;
  setTimeout(()=> {
    beachMapRef.value?.invalidateSize?.();
    console.log('[HomeView] selectedCourse set', course?.id || course?.title);
  }, 180);
}
function toggleMapLarge(){
  mapLarge.value = !mapLarge.value;
  setTimeout(()=> beachMapRef.value?.invalidateSize?.(), 240);
}
function scrollTo(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// rankings / stats
const top3 = computed(() =>
  [...initialRankings].sort((a, b) => b.distance - a.distance).slice(0, 3)
);

const statsDay = computed(() => getStats('day'));
const statsWeek = computed(() => getStats('week'));
const statsMonth = computed(() => getStats('month'));

const logs = computed(() => getLogs());
const runCount = computed(() => logs.value.length);

const avgPace = computed(() => {
  const dist = statsMonth.value.totalDistance;
  const time = statsMonth.value.totalTime;
  if (!dist || dist <= 0) return '-';
  const minutesPerKm = time / dist;
  const mm = Math.floor(minutesPerKm);
  const ss = Math.round((minutesPerKm - mm) * 60);
  return `${mm}:${String(ss).padStart(2, '0')}/km`;
});

// last7
const last7 = computed(() => {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const key = d.toISOString().slice(0,10);
    return logs.value.filter(l => l.date === key).reduce((s, it) => s + Number(it.distance || 0), 0);
  });
});
const maxLast7 = computed(() => Math.max(...last7.value, 1));

// apply action for crew card
function apply(id){ alert('참여 신청(더미) - id: '+id); }
</script>

<style scoped>
.app-header {
  display:flex;
  flex-wrap:wrap;
  justify-content:space-between;
  align-items:center;
  gap:18px;
  padding:20px 22px;
  border-radius:24px;
  background: linear-gradient(90deg, rgba(30,136,255,0.11), rgba(255,255,255,0.95));
  border: 1px solid rgba(30,136,255,0.16);
  box-shadow: 0 20px 54px rgba(16,40,90,0.08);
  margin-bottom: 28px;
}

.brand-text h1 {
  margin:0;
  font-size:1.75rem;
  font-weight:800;
  color: var(--text);
}

.brand-text p {
  margin:6px 0 0;
  color: var(--muted-2);
  font-size:0.95rem;
}

.nav {
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.nav-btn {
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:10px 16px;
  border-radius:16px;
  border:1px solid transparent;
  background: rgba(255,255,255,0.92);
  color: var(--text);
  font-weight:700;
  transition: all .18s ease;
}

.nav-btn:hover {
  border-color: rgba(30,136,255,0.18);
  background: rgba(30,136,255,0.08);
}

.content-layout {
  display:grid;
  grid-template-columns: minmax(0, 2.8fr) minmax(340px, 1fr);
  gap:32px;
  align-items:start;
  margin-bottom:36px;
}

.map-panel {
  background: linear-gradient(180deg, rgba(240,248,255,0.95), #ffffff);
  border: 1px solid rgba(30,136,255,0.14);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 24px 64px rgba(16, 40, 100, 0.08);
}

.map-card {
  margin-top: 18px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(30,136,255,0.12);
  background: #fff;
}

.sidebar-panel {
  display:flex;
  flex-direction:column;
  gap:18px;
  position:sticky;
  top:28px;
  max-width:460px;
  width:100%;
}

.sidebar-panel .popup-card {
  background: linear-gradient(180deg, #ffffff, #f5f8ff);
  border: 1px solid rgba(30,136,255,0.14);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 22px 56px rgba(16,40,90,0.06);
}

.map-panel .community-section {
  margin-top: 28px;
}

.map-panel .community-panel {
  width: 100%;
  background: linear-gradient(180deg, #ffffff, #f7f9ff);
  border: 1px solid rgba(30,136,255,0.14);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 48px rgba(16,40,90,0.06);
}

.weather-card {
  width: 100%;
  background: linear-gradient(180deg, #ffffff, #f7f9ff);
  border: 1px solid rgba(30,136,255,0.14);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 20px 48px rgba(16,40,90,0.06);
}

.map-panel {
  transition: all .3s ease;
}

.map-panel--large {
  min-height: 740px;
}

.map-panel .map-card {
  min-height: 520px;
  transition: min-height .3s ease;
}

.map-panel--large .map-card {
  min-height: 760px;
}
.panel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.course-summary {
  margin: 18px 0 12px;
  padding: 16px 18px;
  background: rgba(30,136,255,0.06);
  border-radius: 18px;
  border: 1px solid rgba(30,136,255,0.12);
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.course-meta strong {
  font-size: 1rem;
  color: #1e88ff;
}

.course-description {
  margin: 0;
  color: #56627e;
  line-height: 1.6;
}
</style>