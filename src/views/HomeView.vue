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
<nav class="nav">
  <button class="nav-btn" @click="scrollTo('top')">🏠 홈</button>
    <button class="nav-btn" @click="scrollTo('courses')">🗺️ 코스 추천</button>
  <button class="nav-btn" @click="scrollTo('community')">👥 러닝 크루</button>
  <button class="nav-btn" @click="scrollTo('hall')">🏆 명예의 전당</button>
  <button class="nav-btn" @click="scrollTo('records')">📊 내 기록</button>
</nav>
    </nav>
    </header>

<main class="app-content">
  <!-- Hero: course quick buttons + today's recommendation -->

  <!-- Main layout: map + sidebar -->
  <div class="content-layout">
    <!-- 왼쪽 메인 영역 -->
    <section id="courses" class="map-panel" :class="{ 'map-panel--large': mapLarge }">
      <div class="panel-top">
        <div class="panel-header">
          <div class="badge-running">🔥 부산 러닝 라이프</div>
          <h2>부산의 파도를 따라, RunWave</h2>
          <p class="panel-copy">
            광안리, 해운대, 을숙도까지! 
            <strong>지금 당신의 러닝 메이트와 함께 달릴 최고의 코스를 확인하세요.</strong>
          </p>
        </div>
  
  </div>

      <CourseList :courses="courses" :selectedId="selectedCourse?.id" @select="selectCourse" />
      
<div v-if="selectedCourse" class="course-summary">
    <div class="course-info">
      <div class="course-meta">
        <strong>{{ selectedCourse.distance }}</strong>
        <span>{{ selectedCourse.title ? selectedCourse.title.replace('🏃 ', '') : '' }}</span>
      </div>
      <p class="course-description">{{ selectedCourse.description }}</p>
    </div>
    
    <button class="btn btn-primary toggle-btn" @click="toggleMapLarge">
      {{ mapLarge ? '📍 지도 축소' : '🗺️ 크게 보기' }}
    </button>
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

    <!-- 오른쪽 사이드바 영역 -->
    <aside class="sidebar-panel">
      <!-- 날씨 카드 -->
      <div class="popup-card weather-card">
        <WeatherDashBoard />
      </div>

      <!-- 명예의 전당 카드 -->
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

      <!-- 내 기록 요약 카드 -->
      <div class="popup-card stats-card" id="records">
        <p class="card-label">📊 내 기록</p>
        <h3>요약</h3>

        <!-- 타일 영역 -->
        <div class="dashboard-tiles">
          <div class="tile tile-highlight">
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
            <div class="tile-value">{{ runCount }}회</div>
          </div>
        </div> <!-- dashboard-tiles 닫힘 -->

        <!-- 기록 입력 폼 -->
        <div class="record-form">
          <div class="record-form-grid">
            <label class="record-field">
              <span>날짜</span>
              <input v-model="newLogDate" type="date" @keydown.enter.prevent="addRunLog" />
            </label>

            <label class="record-field">
              <span>거리(km)</span>
              <input
                v-model="newLogDistance"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="예: 5.2"
                @keydown.enter.prevent="addRunLog"
              />
            </label>

            <label class="record-field">
              <span>시간(분)</span>
              <input
                v-model="newLogTime"
                type="number"
                min="1"
                step="1"
                placeholder="예: 32"
                @keydown.enter.prevent="addRunLog"
              />
            </label>
          </div>

          <div class="record-form-actions">
            <p v-if="recordMessage" class="record-message" :class="recordMessageType">
              {{ recordMessage }}
            </p>
            <button class="btn btn-primary" @click="addRunLog">기록 저장</button>
          </div>
        </div> <!-- record-form 닫힘 -->

        <!-- 최근 7일 스파크라인 차트 영역 -->
        <div class="history-card">
          <div class="history-header">
            <div>
              <p class="history-label">최근 7일 거리</p>
              <p class="history-subtitle">매일 기록한 러닝 거리 흐름</p>
            </div>
            <div class="history-badge">
              {{ weekBars ? weekBars.reduce((s, v) => s + v, 0).toFixed(1) : '0.0' }} km
            </div>
          </div>

          <!-- 모든 요일이 텍스트로만 표시되는 스파크라인 -->
          <div class="sparkline"> 
            <div v-for="(v, i) in weekBars" :key="i" class="bar"> 
              <div class="bar-track"> 
                <div class="bar-fill" :style="{ height: Math.max((v / maxWeekBar) * 100, 6) + '%' }"></div>
              </div> 
              <!-- i === todayIndex 조건과 관계없이 언제나 weekdayNames[i]를 렌더링합니다 -->
              <span class="bar-day" :class="{ today: i === todayIndex }">
                {{ weekdayNames[i] }}
              </span> 
              <span class="bar-value">{{ v.toFixed(1) }}</span> 
            </div> 
          </div> 
        </div>

      </div> <!-- stats-card 닫힘 -->
    </aside>
  </div> <!-- content-layout 닫힘 -->

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

import { getStats, getLogs, appendLog } from '../utils/rankingStorage';
import { initialRankings } from '../data/rankingDummy';
import { loadRunningCourses } from '../utils/courseBuilder'; // 추가

// 게시글 서비스 (로컬스토리지)
import { getPosts } from '../services/postService.js';

const newLogDate = ref(formatShortDate(new Date().toISOString()));
const newLogDistance = ref('');
const newLogTime = ref('');
const recordMessage = ref('');
const recordMessageType = ref('success');

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
onMounted(async () => {
  window.addEventListener('hashchange', updateHash);
  courses.value = await loadRunningCourses();
  selectedCourse.value = courses.value[0] || null;
  loadPosts();
});
onBeforeUnmount(() => window.removeEventListener('hashchange', updateHash));

// courses / map
const courses = ref([]);
const selectedCourse = ref(null); // 이 부분이 빠져있으면 오류 발생

function selectCourse(course){
  selectedCourse.value = course;
// HomeView.vue
setTimeout(() => beachMapRef.value?.relayout?.(), 240);
}
// HomeView.vue 내의 함수 수정
function toggleMapLarge() {
  mapLarge.value = !mapLarge.value;
  
  // DOM 업데이트가 완료된 후 실행되도록 $nextTick 사용 권장
  nextTick(() => {
    if (beachMapRef.value && typeof beachMapRef.value.invalidateSize === 'function') {
      beachMapRef.value.invalidateSize();
    }
  });
}
function scrollTo(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// rankings / stats
const top3 = computed(() =>
  [...initialRankings].sort((a, b) => b.distance - a.distance).slice(0, 3)
);


// 통계, 로그 상태 수정
const logs = ref(getLogs());
const statsDay = computed(() => getStats('day', logs.value));
const statsWeek = computed(() => getStats('week', logs.value));
const statsMonth = computed(() => getStats('month', logs.value));
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

const weekLabels = computed(() => {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return i === 6 ? '오늘' : dayNames[d.getDay()];
  });
});

const weekdayNames = ['월', '화', '수', '목', '금', '토', '일'];

const weekBars = computed(() => {
const now = new Date();
const arr = Array(7).fill(0);
for (let i = 0; i < 7; i++) {
const d = new Date(now);
d.setDate(now.getDate() - (6 - i));
const key = d.toISOString().slice(0, 10);
const weekdayIndex = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
arr[weekdayIndex] = logs.value
.filter(l => l.date === key)
.reduce((s, it) => s + Number(it.distance || 0), 0);
}
return arr;
});

const todayIndex = computed(() => {
return (new Date().getDay() + 6) % 7;
});

const maxWeekBar = computed(() => Math.max(...weekBars.value, 1));

function setRecordMessage(message, type = 'success') {
  recordMessage.value = message;
  recordMessageType.value = type;
}

function addRunLog() {
  const date = newLogDate.value;
  const distance = Number(newLogDistance.value);
  const time = Number(newLogTime.value);

  if (!date) {
    setRecordMessage('날짜를 선택해 주세요.', 'error');
    return;
  }

  if (!Number.isFinite(distance) || distance <= 0) {
    setRecordMessage('거리는 0보다 큰 숫자로 입력해 주세요.', 'error');
    return;
  }

  if (!Number.isFinite(time) || time <= 0) {
    setRecordMessage('시간은 0보다 큰 숫자로 입력해 주세요.', 'error');
    return;
  }

  const updatedLogs = appendLog({ date, distance, time });
  logs.value = updatedLogs;

  newLogDistance.value = '';
  newLogTime.value = '';
  newLogDate.value = formatShortDate(new Date().toISOString());
  setRecordMessage(`${distance.toFixed(1)}km / ${time}분 기록이 저장됐어요.`, 'success');
}

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
  height: 700px; /* 크게 보기 모드 시 높이 */
}

.panel-top {
  padding: 40px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.panel-header .sub-title {
  color: #94a3b8; /* 차분한 회색조 */
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  font-weight: 700;
}

.panel-header h2 {
  font-size: 1.6rem;
  margin: 8px 0;
  color: #1e293b;
}

/* 자연스러운 파도 느낌의 짧은 선 */
.divider {
  width: 50px;
  height: 4px;
  background: linear-gradient(90deg, #60a5fa, #c7d2fe);
  border-radius: 2px;
  margin-bottom: 16px;
}

.panel-copy {
  color: #64748b;
  line-height: 1.6;
  font-size: 0.95rem;
}

.toggle-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #e2e8f0;
}

.badge-running {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.panel-header h2 {
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  color: #333;
}

.panel-copy {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.toggle-btn {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-btn:hover {
  background: #555;
}

.course-summary {
  margin: 18px 0 12px;
  padding: 16px 20px;
  background: rgba(30,136,255,0.06);
  border-radius: 18px;
  border: 1px solid rgba(30,136,255,0.12);
  
  /* Flex 설정 */
  display: flex;
  justify-content: space-between; /* 양 끝으로 배치 */
  align-items: center;            /* 수직 중앙 정렬 */
  gap: 20px;
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

.record-form {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(30,136,255,0.08), rgba(255,255,255,0.95));
  border: 1px solid rgba(30,136,255,0.12);
}

.record-form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.record-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--muted-2);
}

.record-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(30,136,255,0.16);
  border-radius: 12px;
  background: #fff;
  color: var(--text);
}

.record-field input:focus {
  outline: none;
  border-color: rgba(30,136,255,0.38);
  box-shadow: 0 0 0 3px rgba(30,136,255,0.12);
}

.record-form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.record-form-actions .btn {
  margin-left: auto;
}



.record-message {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.record-message.success {
  color: #0b7a3f;
}

.record-message.error {
  color: #d9480f;
}

@media (max-width: 900px) {
  .record-form-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.tile {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95));
  border: 1px solid rgba(30,136,255,0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}

.tile-highlight {
  background: linear-gradient(135deg, rgba(30,136,255,0.12), rgba(255,255,255,0.98));
}

.tile-label {
  font-size: 0.8rem;
  color: var(--muted-2);
  margin-bottom: 6px;
}

.tile-value {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--text);
}

.record-form {
  grid-column: 1 / -1;
  margin-top: 8px;
}

.history-card {
  margin-top: 12px;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95));
  border: 1px solid rgba(30,136,255,0.12);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.history-label {
  margin: 0 0 4px;
  color: var(--text);
  font-weight: 800;
}

.history-subtitle {
  margin: 0;
  color: var(--muted-2);
  font-size: 0.85rem;
}

.history-badge {
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(30,136,255,0.12);
  color: #1565c0;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.sparkline {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  min-height: 148px;
}

.bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-track {
  width: 100%;
  max-width: 28px;
  height: 92px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4px;
  border-radius: 999px;
  background: rgba(30,136,255,0.08);
}

.bar-fill {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #67b7ff 0%, #1e88ff 100%);
  min-height: 6px;
}

.bar-day {
  font-size: 0.72rem;
  color: var(--muted-2);
  font-weight: 700;
}

.bar-value {
  font-size: 0.74rem;
  color: var(--text);
  font-weight: 700;
}

@media (max-width: 900px) {
  .dashboard-tiles {
    grid-template-columns: 1fr;
  }
  .record-form {
    grid-column: 1;
  }
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>