<template>
  <section class="board-list">
    <header class="topbar">
      <div>
        <h1>러닝 크루 모집</h1>
        <p>코스, 장소, 분위기별로 크루를 찾아보세요.</p>
      </div>

      <div class="topbar-actions">
        <button type="button" class="primary-btn" @click="goToWrite">새 글 작성</button>
        <button type="button" class="secondary-btn" @click="loadPosts">새로고침</button>
      </div>
    </header>

    <div class="search-box">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="코스명, 장소, 제목, 내용으로 검색하세요"
      />
      <span class="search-hint">실시간 검색</span>
    </div>

    <div v-if="filteredPosts.length" class="post-grid">
      <article v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="card-head">
          <div>
            <h3>{{ post.title || '제목 없음' }}</h3>
            <p class="course">{{ post.courseName || '코스 미정' }}</p>
          </div>
          <span class="difficulty-badge">{{ post.difficulty || '난이도 미정' }}</span>
        </div>

        <div class="card-meta">
          <p><strong>날짜</strong> {{ post.meetingDate || '날짜 미정' }}</p>
          <p><strong>시간</strong> {{ post.meetingTime || '시간 미정' }}</p>
          <p><strong>인원</strong> {{ post.maxParticipants || 0 }}명</p>
          <p><strong>장소</strong> {{ post.meetingPlace || '장소 미정' }}</p>
        </div>

        <div class="card-stats">
          <span>조회 {{ post.views || 0 }}</span>
          <button type="button" class="like-btn" @click="toggleLike(post)">
            <span>{{ isPostLiked(post.id) ? '♥' : '♡' }}</span>
            <span>함께 달릴래요 {{ post.likes || 0 }}</span>
          </button>
        </div>

        <div class="actions">
          <button type="button" class="action-btn" @click="viewPost(post.id)">상세</button>
          <button type="button" class="action-btn" @click="editPost(post.id)">수정</button>
          <button type="button" class="action-btn danger" @click="confirmDelete(post)">삭제</button>
        </div>
      </article>
    </div>

    <p v-else class="empty-state">
      {{ searchKeyword.trim() ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.' }}
    </p>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getPosts, deletePost, togglePostLike, isPostLiked } from '../services/postService.js'

const posts = ref([])
const searchKeyword = ref('')

function loadPosts() {
  posts.value = getPosts()
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`
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

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return posts.value
  }

  return posts.value.filter((post) => {
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
.board-list {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 12px 40px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.topbar h1 {
  margin: 0 0 4px;
  font-size: 1.4rem;
  color: #111827;
}

.topbar p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.primary-btn,
.secondary-btn,
.action-btn,
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

.search-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.search-box input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
}

.search-hint {
  color: #6b7280;
  font-size: 0.9rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.post-card {
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  border: 1px solid #e5ecf5;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 8px;
}

.card-head h3 {
  margin: 0 0 4px;
  font-size: 1.05rem;
  color: #111827;
}

.course {
  margin: 0;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.95rem;
}

.difficulty-badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.card-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.card-meta p {
  margin: 0;
  color: #4b5563;
  font-size: 0.92rem;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 0.95rem;
}

.like-btn {
  background: #fff1f2;
  color: #be123c;
  display: flex;
  gap: 6px;
  align-items: center;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  background: #f3f4f6;
  color: #111827;
}

.action-btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  background: #f9fafb;
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
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
}
</style>