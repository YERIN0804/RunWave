<template>
  <section class="board-list">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="hero-eyebrow">RunWave · 부산 러닝 커뮤니티</p>
        <h1>부산에서 함께 달릴 러닝 크루를 찾아보세요</h1>
        <p class="hero-text">
          코스와 일정에 맞는 러닝 메이트를 만나보세요.
        </p>
      </div>

      <div class="hero-actions">
        <button type="button" class="primary-btn" @click="goToWrite">새 글 작성</button>
        <button type="button" class="secondary-btn" @click="loadPosts">새로고침</button>
      </div>
    </div>

    <div class="search-panel">
      <div class="search-box">
        <span class="search-icon" aria-hidden="true">🔎</span>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="코스명, 장소, 제목, 내용으로 검색하세요"
        />
      </div>

      <div class="filter-row" role="tablist" aria-label="필터">
        <button
          v-for="chip in filterChips"
          :key="chip.key"
          type="button"
          class="filter-chip"
          :class="{ active: activeFilter === chip.key }"
          @click="activeFilter = chip.key"
        >
          {{ chip.label }}
        </button>
      </div>

      <p class="search-hint">실시간 검색 · 제목 · 코스 · 장소 · 내용</p>
    </div>

    <TransitionGroup v-if="filteredPosts.length" name="card-list" tag="div" class="post-grid" appear>
      <article
        v-for="(post, index) in filteredPosts"
        :key="post.id"
        class="post-card"
        :style="{ '--card-delay': `${index * 60}ms` }"
        @click="viewPost(post.id)"
      >
        <div class="card-head">
          <div>
            <h3>{{ post.title || '제목 없음' }}</h3>
            <p class="course">{{ post.courseName || '코스 미정' }}</p>
          </div>
          <span class="difficulty-badge" :class="getDifficultyClass(post.difficulty)">
            {{ post.difficulty || '난이도 미정' }}
          </span>
        </div>

        <div class="card-status-row">
          <span class="status-badge" :class="getStatusClass(post)">{{ getStatusText(post) }}</span>
          <span class="dday-badge">{{ getDdayText(post) }}</span>
        </div>

        <div class="card-meta">
          <p><strong>날짜</strong> {{ post.meetingDate || '날짜 미정' }}</p>
          <p><strong>시간</strong> {{ post.meetingTime || '시간 미정' }}</p>
          <p><strong>인원</strong> 모집 {{ post.maxParticipants || 0 }}명</p>
          <p><strong>장소</strong> {{ post.meetingPlace || '장소 미정' }}</p>
        </div>

        <div class="card-stats">
          <span class="stat-pill">조회 {{ post.views || 0 }}</span>
          <button type="button" class="like-btn" @click.stop="toggleLike(post)">
            <span>{{ isPostLiked(post.id) ? '♥' : '♡' }}</span>
            <span>참여하고 싶어요 · {{ post.likes || 0 }}</span>
          </button>
        </div>

        <div class="actions">
          <button type="button" class="action-btn" @click.stop="viewPost(post.id)">상세</button>
          <button type="button" class="action-btn" @click.stop="editPost(post.id)">수정</button>
          <button type="button" class="action-btn danger" @click.stop="confirmDelete(post)">삭제</button>
        </div>
      </article>
    </TransitionGroup>

    <Transition name="fade" mode="out-in">
      <div v-if="!filteredPosts.length" class="empty-state" key="empty">
        <div class="empty-icon">🌊</div>
        <h3>검색 결과가 없어요</h3>
        <p>다른 키워드로 다시 검색해보세요.</p>
        <button type="button" class="secondary-btn" @click="searchKeyword = ''">검색 초기화</button>
      </div>
    </Transition>

    <div v-if="filteredPosts.length && !searchKeyword.trim() && activeFilter === 'all'" class="cta-card">
      <div>
        <h3>마음에 드는 크루가 없나요?</h3>
        <p>직접 러닝 크루를 모집해보세요.</p>
      </div>
      <button type="button" class="primary-btn" @click="goToWrite">크루 모집하기</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getPosts, deletePost, togglePostLike, isPostLiked } from '../services/postService.js'

const posts = ref([])
const searchKeyword = ref('')
const activeFilter = ref('all')

const filterChips = [
  { key: 'all', label: '전체' },
  { key: '초급', label: '초급' },
  { key: '중급', label: '중급' },
  { key: '고급', label: '고급' },
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'weekend', label: '주말' },
]

function loadPosts() {
  posts.value = getPosts()
}

function viewPost(id) {
  location.hash = `#/post/${id}`
}

function editPost(id) {
  location.hash = `#/edit/${id}`
}

function confirmDelete(post) {
  const pw = prompt('삭제하려면 비밀번호(4자리 이상)를 입력하세요.')
  if (pw === null) return

  const result = deletePost(post.id, pw)
  if (result.success) {
    alert('삭제되었습니다.')
    loadPosts()
  } else {
    alert(result.message || '삭제에 실패했습니다.')
  }
}

function goToWrite() {
  location.hash = '#/write'
}

function toggleLike(post) {
  const result = togglePostLike(post.id)

  if (result.success) {
    loadPosts()
  } else {
    alert(result.message || '좋아요 처리에 실패했습니다.')
  }
}

function getDifficultyClass(difficulty) {
  if (difficulty === '중급') return 'medium'
  if (difficulty === '고급') return 'hard'
  if (difficulty === '초급') return 'easy'
  return 'default'
}

function parseMeetingDate(dateText) {
  if (!dateText) return null
  const parsed = new Date(dateText)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getStatusText(post) {
  const meetingDate = parseMeetingDate(post.meetingDate)
  if (!meetingDate) return '모집중'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(meetingDate)
  target.setHours(0, 0, 0, 0)

  if (target < today) return '모집 마감'
  if ((target - today) / (1000 * 60 * 60 * 24) <= 2) return '마감 임박'
  return '모집중'
}

function getStatusClass(post) {
  const status = getStatusText(post)
  if (status === '마감 임박') return 'warning'
  if (status === '모집 마감') return 'closed'
  return 'open'
}

function getDdayText(post) {
  const meetingDate = parseMeetingDate(post.meetingDate)
  if (!meetingDate) return '미정'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(meetingDate)
  target.setHours(0, 0, 0, 0)

  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))

  if (diff < 0) return '마감'
  if (diff === 0) return '오늘'
  if (diff === 1) return 'D-1'
  return `D-${diff}`
}

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const currentFilter = activeFilter.value

  let result = posts.value

  if (keyword) {
    result = result.filter((post) => {
      const searchableText = [
        post.title,
        post.content,
        post.recruitmentTitle,
        post.courseName,
        post.meetingPlace,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
  }

  if (currentFilter !== 'all') {
    if (currentFilter === 'today' || currentFilter === 'week' || currentFilter === 'weekend') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      result = result.filter((post) => {
        const meetingDate = parseMeetingDate(post.meetingDate)
        if (!meetingDate) return false

        const target = new Date(meetingDate)
        target.setHours(0, 0, 0, 0)

        if (currentFilter === 'today') {
          return target.getTime() === today.getTime()
        }

        if (currentFilter === 'week') {
          const start = new Date(today)
          const end = new Date(today)
          start.setDate(today.getDate() - today.getDay())
          end.setDate(start.getDate() + 6)
          return target >= start && target <= end
        }

        if (currentFilter === 'weekend') {
          const day = today.getDay()
          const saturday = new Date(today)
          const sunday = new Date(today)
          saturday.setDate(today.getDate() + ((6 - day + 7) % 7))
          sunday.setDate(today.getDate() + ((0 - day + 7) % 7))
          return target.getTime() === saturday.getTime() || target.getTime() === sunday.getTime()
        }

        return false
      })
    } else {
      result = result.filter((post) => (post.difficulty || '난이도 미정') === currentFilter)
    }
  }

  return result
})

function onStorageEvent(e) {
  if (e.key === 'posts' || e.key === 'likedPostIds') {
    loadPosts()
  }
}

onMounted(() => {
  loadPosts()
  window.addEventListener('storage', onStorageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorageEvent)
})
</script>

<style scoped>
:root {
  color-scheme: light;
}

.board-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  background: linear-gradient(180deg, #f5f8fc 0%, #f8fbff 100%);
}

.hero-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  padding: 32px;
  background:
    linear-gradient(120deg, rgba(37, 99, 235, 0.95), rgba(29, 78, 216, 0.9)),
    radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 40%);
  color: white;
  box-shadow: 0 20px 45px rgba(37, 99, 235, 0.16);
  margin-bottom: 18px;
  animation: heroFadeIn 0.5s ease both;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: auto -20px -40px auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,0.16);
  filter: blur(4px);
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.8);
}

.hero-card h1 {
  margin: 0 0 8px;
  font-size: clamp(1.4rem, 2.2vw, 2.2rem);
  line-height: 1.15;
  color: white;
}

.hero-text {
  margin: 0;
  font-size: 1rem;
  color: rgba(255,255,255,0.9);
}

.hero-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.primary-btn,
.secondary-btn,
.action-btn,
.like-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.primary-btn {
  background: linear-gradient(90deg, #ffffff, #eff6ff);
  color: #1d4ed8;
  box-shadow: 0 10px 22px rgba(255,255,255,0.2);
}

.secondary-btn {
  background: rgba(255,255,255,0.16);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
}

.primary-btn:hover,
.secondary-btn:hover,
.action-btn:hover,
.like-btn:hover {
  transform: translateY(-2px);
}

.primary-btn:active,
.secondary-btn:active,
.action-btn:active,
.like-btn:active {
  transform: scale(0.97);
}

.primary-btn:focus-visible,
.secondary-btn:focus-visible,
.action-btn:focus-visible,
.like-btn:focus-visible,
.search-box input:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

.search-panel {
  margin-bottom: 18px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #dbe4ef;
  border-radius: 999px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.search-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.search-box:focus-within .search-icon {
  transform: scale(1.08);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #0f172a;
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 10px 2px 2px;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex: 0 0 auto;
  border: 1px solid #dbe4ef;
  background: #fff;
  color: #475569;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.filter-chip.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.search-hint {
  display: block;
  margin-top: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.post-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
  animation: cardFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--card-delay, 0ms);
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 18px 38px rgba(37, 99, 235, 0.16);
  border-color: rgba(37, 99, 235, 0.22);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 8px;
}

.card-head h3 {
  margin: 0 0 6px;
  font-size: 1.08rem;
  color: #0f172a;
}

.course {
  margin: 0;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.95rem;
}

.difficulty-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.difficulty-badge.easy {
  color: #166534;
  background: #dcfce7;
}

.difficulty-badge.medium {
  color: #92400e;
  background: #fef3c7;
}

.difficulty-badge.hard {
  color: #b91c1c;
  background: #fee2e2;
}

.difficulty-badge.default {
  color: #475569;
  background: #e2e8f0;
}

.card-status-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge,
.dday-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-badge.open {
  color: #166534;
  background: #dcfce7;
}

.status-badge.warning {
  color: #a16207;
  background: #fef3c7;
}

.status-badge.closed {
  color: #b91c1c;
  background: #fee2e2;
}

.dday-badge {
  color: #1d4ed8;
  background: #dbeafe;
}

.card-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.card-meta p {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 0.95rem;
}

.stat-pill {
  padding: 7px 10px;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
}

.like-btn {
  background: #fff1f2;
  color: #e11d48;
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
}

.like-btn.is-liked {
  background: #ffe4eb;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.action-btn {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.action-btn.danger {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.action-btn.danger:hover {
  color: #b91c1c;
}

.empty-state {
  padding: 28px 20px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 22px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  color: #475569;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.empty-icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.empty-state h3 {
  margin: 0 0 6px;
  color: #0f172a;
}

.empty-state p {
  margin: 0 0 12px;
  color: #64748b;
}

.cta-card {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  background: linear-gradient(120deg, #ffffff, #f3f8ff);
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.cta-card h3 {
  margin: 0 0 4px;
  color: #0f172a;
}

.cta-card p {
  margin: 0;
  color: #64748b;
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .board-list {
    padding: 16px 12px 36px;
  }

  .hero-card {
    padding: 22px;
  }

  .post-grid {
    grid-template-columns: 1fr;
  }

  .card-meta {
    grid-template-columns: 1fr;
  }

  .card-stats {
    flex-direction: column;
    align-items: flex-start;
  }

  .primary-btn,
  .secondary-btn,
  .action-btn,
  .like-btn {
    min-height: 44px;
    width: 100%;
    justify-content: center;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cta-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-card,
  .post-card,
  .primary-btn,
  .secondary-btn,
  .action-btn,
  .like-btn,
  .search-box,
  .search-icon {
    animation: none !important;
    transition: none !important;
  }
}
</style>