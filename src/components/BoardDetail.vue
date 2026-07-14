<template>
  <section class="board-detail">
    <h1>게시글 상세</h1>

    <div v-if="post">
      <div class="meta">
        <h2>{{ post.title }}</h2>
        <p>작성일: {{ formatDate(post.createdAt) }}</p>
        <p v-if="post.updatedAt">수정일: {{ formatDate(post.updatedAt) }}</p>
      </div>

      <div class="content">
        <p>{{ post.content }}</p>
      </div>

      <div class="buttons">
        <button type="button" @click="goBack">목록으로</button>
        <button type="button" @click="goToEdit">수정</button>
        <button type="button" @click="confirmDelete">삭제</button>
      </div>
    </div>

    <div v-else class="empty">
      <p>존재하지 않는 게시글입니다.</p>
      <button type="button" @click="goBack">목록으로 돌아가기</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getPostById, deletePost } from '../services/postService.js'

const post = ref(null)

/**
 * 현재 URL hash에서 게시글 id를 파싱합니다.
 * 예: '#/post/123' -> '123'
 */
function getPostIdFromHash() {
  const hash = location.hash || '#/'
  const match = hash.match(/^#\/post\/(.+)$/)
  return match ? match[1] : null
}

/**
 * 게시글 데이터를 로드합니다.
 * - 왜: 상세 페이지 진입 시 해당 id의 글을 불러와야 하기 때문입니다.
 */
function loadPost() {
  const id = getPostIdFromHash()
  if (!id) {
    post.value = null
    return
  }
  post.value = getPostById(id)
}

/**
 * 삭제 버튼을 눌렀을 때 실행됩니다.
 * - 비밀번호를 prompt()로 입력받고 deletePost()로 검증합니다.
 */
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

/**
 * 수정 페이지로 이동합니다.
 * - edit 화면은 '#/edit/{id}' 형태로 이동합니다.
 */
function goToEdit() {
  if (!post.value) return
  location.hash = `#/edit/${post.value.id}`
}

/**
 * 목록으로 돌아갑니다.
 */
function goBack() {
  location.hash = '#/'
}

/**
 * 날짜 문자열을 보기 좋은 형태로 변환합니다.
 */
function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`
}

/**
 * 해시가 변경되면 다른 게시글을 보여줘야 할 수 있으므로 다시 로드합니다.
 */
function handleHashChange() {
  loadPost()
}

onMounted(() => {
  loadPost()
  window.addEventListener('hashchange', handleHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
})
</script>

<style scoped>
.board-detail {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta h2 {
  margin: 0 0 8px;
}

.meta p {
  margin: 4px 0;
  color: #555;
}

.content {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.7;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:first-of-type {
  background: #f3f4f6;
}

button:nth-of-type(2) {
  background: #3b82f6;
  color: white;
}

button:last-of-type {
  background: #ef4444;
  color: white;
}

.empty {
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff7ed;
}
</style>