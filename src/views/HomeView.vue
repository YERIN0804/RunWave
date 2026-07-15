<template>
  <div class="app-wrap">
    <!-- Header -->
    <header class="app-header">
      <div class="brand" @click="scrollTo('top')" style="cursor:pointer">
        <div class="logo">🌊</div>
        <div class="brand-text">
          <div class="brand-title">RunWave</div>
          <div class="brand-sub">Running in Busan, Together.</div>
        </div>
      </div>

      <nav class="nav">
        <button class="nav-btn" @click="scrollTo('top')">홈</button>
        <button class="nav-btn" @click="scrollTo('community')">러닝 크루</button>
        <button class="nav-btn" @click="scrollTo('courses')">코스 추천</button>
        <button class="nav-btn" @click="scrollTo('hall')">명예의 전당</button>
        <button class="nav-btn" @click="scrollTo('records')">내 기록</button>
      </nav>
    </header>

    <main class="app-content">
      <!-- Hero: course quick buttons + today's recommendation -->
      <section id="top" class="hero">
        <div class="left">
          <h2>부산 러닝 코스 추천 한눈에 보기</h2>
          <p>원하는 코스를 눌러 지도로 확인하세요.</p>

          <div id="courses" class="course-list">
            <CourseList :courses="courses" :selectedId="selectedCourse?.id" @select="selectCourse" />
          </div>

          <div style="margin-top:12px;">
            <button class="btn btn-ghost" @click="toggleMapLarge">{{ mapLarge ? '지도 축소' : '지도 크게 보기' }}</button>
          </div>
        </div>

        <div class="right hero-right">
          <div class="popup-card">
            <div class="hero-today">
              <div class="thumb">이미지</div>
              <div>
                <div class="today-title">{{ courses[0]?.title }}</div>
                <div class="today-sub">{{ courses[0]?.distance }}</div>
                <div style="margin-top:8px;">
                  <button class="btn btn-primary" @click="selectCourse(courses[0])">지도에서 보기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main layout: map + sidebar -->
      <div class="content-layout">
        <section id="map-section" class="map-panel" :class="{ 'map-panel--large': mapLarge }">
          <div class="panel-head">
            <h2>부산 비치런 지도</h2>
            <p>코스를 선택하면 지도에 표시됩니다.</p>
          </div>

          <CourseList :courses="courses" :selectedId="selectedCourse?.id" @select="selectCourse" />

          <BeachMap ref="beachMapRef" :selectedCourse="selectedCourse" />
        </section>

        <aside class="sidebar-panel">
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

      <!-- Community area: 중앙에 BoardWrite (작성), 오른쪽은 모집글 캐러셀 -->
      <section id="community" class="community-row">
        <div class="popup-card community-form">
          <div class="card-label">러닝 크루 모집 작성</div>
          <!-- 중앙에 BoardWrite 컴포넌트 삽입 -->
          <BoardWrite />
        </div>

        <div class="popup-card crew-list">
          <div class="card-label">모집중인 러닝 크루</div>
          <div class="crew-carousel">
            <div v-for="p in posts" :key="p.id" class="crew-card">
              <strong>{{ p.title }}</strong>
              <div class="crew-body">{{ p.description || p.content }}</div>
              <div class="crew-footer">
                <small>{{ formatShortDate(p.createdAt) }}</small>
                <button class="btn btn-ghost" @click="apply(p.id)">참여하기</button>
              </div>
            </div>
            <div v-if="posts.length === 0" class="crew-empty">등록된 모집글이 없습니다.</div>
          </div>
        </div>
      </section>

      <!-- Weather and (old) in-page community list removed (no duplicate) -->
      <section class="weather-section">
        <WeatherDashBoard />
      </section>

      <RunChat />
    </main>

    <footer class="app-footer">
      <p>© 2026 RunWave. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
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
/* (기존 스타일 유지) - 필요 시 style.css 에 통합하세요. */
.app-content { width:100%; max-width:1600px; margin:0 auto; padding:16px 12px; box-sizing:border-box; }
.app-header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:12px; border-radius:12px; margin-bottom:12px; background:linear-gradient(90deg, rgba(30,136,255,0.04), rgba(14,165,233,0.02)); }
.brand { display:flex; gap:10px; align-items:center; }
.logo { width:44px; height:44px; border-radius:10px; background:linear-gradient(135deg,#1e88ff,#42a5f5); color:#fff; display:grid; place-items:center; font-weight:700; }
.nav { display:flex; gap:8px; }
.nav-btn { background:transparent; border:0; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; color:var(--muted-2); }
.nav-btn:hover{ background:rgba(30,136,255,0.06); color:var(--primary); }

.hero { display:flex; gap:20px; align-items:flex-start; margin-bottom:18px; }
.hero .left { flex:1; }
.hero-right { width:420px; }
.thumb { width:88px; height:64px; background:#eef6ff; border-radius:10px; display:flex; align-items:center; justify-content:center; }

.content-layout { display:grid; grid-template-columns: minmax(0, 2.8fr) minmax(340px, 1fr); gap:28px; align-items:start; margin-bottom:20px; }
.map-panel { background:var(--card-bg); border-radius:20px; padding:18px; box-shadow:var(--shadow-md); min-height:480px; transition:all .28s ease; }
.map-panel--large { min-height:820px; }

.community-row { display:flex; gap:18px; margin-top:18px; flex-wrap:wrap; }
.community-form { flex:1; min-width:320px; }
.crew-list { flex:1.2; min-width:300px; }
.crew-carousel { display:flex; gap:12px; overflow-x:auto; padding:8px 2px; }
.crew-card { min-width:220px; background:var(--card-bg); padding:12px; border-radius:10px; border:1px solid var(--border); box-shadow:var(--shadow-md); display:flex; flex-direction:column; gap:8px; }
.crew-footer { display:flex; justify-content:space-between; align-items:center; }

@media (max-width: 1080px) {
  .content-layout { grid-template-columns: 1fr; }
  .hero { flex-direction:column; }
  .hero-right { width:100%; }
  .sidebar-panel { position:static; }
}
</style>