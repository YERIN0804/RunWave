<template>
  <section class="board-detail">
    <div v-if="post" class="detail-card">
      <div class="detail-header">
        <div>
          <p class="eyebrow">러닝 크루 모집</p>
          <h1>{{ post.title || '제목 없음' }}</h1>
        </div>

        <div class="header-actions">
          <button type="button" class="secondary-btn" @click="goBack">목록으로</button>
          <button type="button" class="primary-btn" @click="goToEdit">수정</button>
          <button type="button" class="danger-btn" @click="confirmDelete">삭제</button>
        </div>
      </div>

      <div class="meta-row">
        <div class="meta-box">
          <span class="meta-label">코스명</span>
          <strong>{{ post.courseName || '코스 미정' }}</strong>
        </div>
        <div class="meta-box">
          <span class="meta-label">날짜</span>
          <strong>{{ post.meetingDate || '날짜 미정' }}</strong>
        </div>
        <div class="meta-box">
          <span class="meta-label">시간</span>
          <strong>{{ post.meetingTime || '시간 미정' }}</strong>
        </div>
        <div class="meta-box">
          <span class="meta-label">인원</span>
          <strong>{{ post.maxParticipants || 0 }}명</strong>
        </div>
        <div class="meta-box">
          <span class="meta-label">난이도</span>
          <strong>{{ post.difficulty || '난이도 미정' }}</strong>
        </div>
        <div class="meta-box">
          <span class="meta-label">장소</span>
          <strong>{{ post.meetingPlace || '장소 미정' }}</strong>
        </div>
      </div>

      <div class="content-box">
        <h2>모집 소개</h2>
        <p>{{ post.content || post.description || '내용이 없습니다.' }}</p>
      </div>

      <div class="stats-row">
        <div class="stat-pill">작성일 {{ formatDate(post.createdAt) }}</div>
        <div v-if="post.updatedAt" class="stat-pill">수정일 {{ formatDate(post.updatedAt) }}</div>
        <div class="stat-pill">조회 {{ post.views || 0 }}</div>
        <button type="button" class="like-btn" @click="handleLike">
          <span>{{ liked ? '♥' : '♡' }}</span>
          <span>함께 달릴래요 {{ post.likes || 0 }}</span>
        </button>
      </div>
    </div>

    <div v-else class="empty">
      <p>존재하지 않는 게시글입니다.</p>
      <button type="button" class="secondary-btn" @click="goBack">목록으로 돌아가기</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  getPostById,
  deletePost,
  incrementPostViews,
  togglePostLike,
  isPostLiked,
} from '../services/postService.js'

const post = ref(null)
const liked = ref(false)
let viewed = false

function getPostIdFromHash() {
  const hash = location.hash || '#/'
  const match = hash.match(/^#\/post\/(.+)$/)
  return match ? match[1] : null
}

function loadPost() {
  const id = getPostIdFromHash()
  if (!id) {
    post.value = null
    liked.value = false
    viewed = false
    return
  }

  const found = getPostById(id)
  post.value = found

  if (found) {
    liked.value = isPostLiked(found.id)
  }
}

function refreshPost() {
  const id = getPostIdFromHash()
  if (!id) return

  const found = getPostById(id)
  post.value = found

  if (found) {
    liked.value = isPostLiked(found.id)
  }
}

function handleViewIncrease() {
  if (!post.value || viewed) return

  const id = post.value.id
  const updated = incrementPostViews(id)

  if (updated) {
    post.value = { ...updated }
    viewed = true
  }
}

function handleLike() {
  if (!post.value) return

  const result = togglePostLike(post.value.id)

  if (result.success) {
    refreshPost()
  } else {
    alert(result.message || '좋아요 처리에 실패했습니다.')
  }
}

function confirmDelete() {
  if (!post.value) return

  const password = prompt('삭제하려면 비밀번호를 입력하세요.')
  if (password === null) return

  const result = deletePost(post.value.id, password)
  if (result.success) {
    alert('삭제되었습니다.')
    location.hash = '#/'
  } else {
    alert(result.message || '삭제에 실패했습니다.')
  }
}

function goToEdit() {
  if (!post.value) return
  location.hash = `#/edit/${post.value.id}`
}

function goBack() {
  location.hash = '#/'
}

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
    2,
    '0'
  )}`
}

function handleHashChange() {
  viewed = false
  loadPost()
  handleViewIncrease()
}

onMounted(() => {
  loadPost()
  handleViewIncrease()
  window.addEventListener('hashchange', handleHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
})
</script>

<style scoped>
.board-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 12px 40px;
}

.detail-card {
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  border: 1px solid #e5ecf5;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-header h1 {
  margin: 0;
  font-size: 1.4rem;
  color: #111827;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.like-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn {
  background: #2563eb;
  color: white;
}

.secondary-btn {
  background: #e5e7eb;
  color: #111827;
}

.danger-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.meta-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.meta-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  color: #64748b;
  font-size: 0.85rem;
}

.content-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.content-box h2 {
  margin: 0 0 8px;
  font-size: 1.05rem;
}

.content-box p {
  margin: 0;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.stat-pill {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.95rem;
}

.like-btn {
  background: #fff1f2;
  color: #be123c;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.empty {
  padding: 24px;
  text-align: center;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  background: #f9fafb;
}

@media (max-width: 640px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-row {
    grid-template-columns: 1fr;
  }
}
</style>