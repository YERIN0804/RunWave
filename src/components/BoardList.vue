<template>
  <section>
    <header>
      <h1>게시판 목록</h1>
      <button @click="goToWrite">새 글 작성</button>
      <button @click="loadPosts">새로고침</button>
    </header>

    <ul v-if="posts.length">
      <!-- 게시글을 최신순으로 나열 -->
      <li v-for="post in posts" :key="post.id" class="post-item">
        <!-- 제목을 클릭하면 상세 보기로 이동합니다 (간단한 해시 라우팅 사용) -->
        <a href="javascript:void(0)" @click="viewPost(post.id)">{{ post.title }}</a>
        <small class="date">{{ formatDate(post.createdAt) }}</small>

        <!-- 편의용: 바로 편집/삭제 처리 (BoardEdit/BoardDetail과 함께 사용하거나, 해시 기반 라우팅으로 연동) -->
        <div class="actions">
          <button @click="viewPost(post.id)">상세</button>
          <button @click="editPost(post.id)">수정</button>
          <button @click="confirmDelete(post)">삭제</button>
        </div>
      </li>
    </ul>

    <p v-else>등록된 게시글이 없습니다.</p>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getPosts, deletePost } from '../services/postService.js'

/*
 설명:
 - 컴포넌트는 서비스 함수 `getPosts()`를 사용해 localStorage에서 게시글을 불러옵니다.
 - 상세/수정으로의 "이동"은 간단하게 URL 해시를 변경합니다.
   (이 프로젝트에서 Vue Router를 아직 설정하지 않았다면 해시를 사용해 컴포넌트 간 연동할 수 있습니다.)
*/

const posts = ref([])

/**
 * 게시글 목록을 로드합니다.
 * - 왜: 컴포넌트가 마운트될 때와 사용자가 새로고침 버튼을 눌렀을 때 최신 목록을 화면에 반영해야 합니다.
 * - 동작: `getPosts()` 호출 후 `posts`에 할당합니다.
 */
function loadPosts() {
  // getPosts()는 이미 최신순 정렬을 보장하도록 서비스에서 처리됩니다.
  posts.value = getPosts()
}

/**
 * 날짜 문자열을 사람이 읽기 쉬운 형태로 바꿉니다.
 * - 왜: ISO 문자열만 그대로 보여주면 가독성이 떨어지므로 간단히 형식화합니다.
 */
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

/**
 * 게시글 상세 보기로 이동합니다.
 * - 간단한 방식으로 `location.hash`를 바꿉니다.
 * - 왜: Vue Router를 아직 사용하지 않을 때도 컴포넌트 간 "네비게이션"을 쉽게 구현하기 위해 사용합니다.
 * - 다른 컴포넌트(예: BoardDetail.vue)는 해시를 관찰하여 해당 id를 읽어 처리하면 됩니다.
 */
function viewPost(id) {
  location.hash = `#/post/${id}`
}

/**
 * 수정 화면으로 이동합니다.
 * - edit 화면 또한 해시를 사용합니다: '#/edit/:id'
 * - 실제 편집 UI는 `BoardEdit.vue`에서 구현합니다.
 */
function editPost(id) {
  location.hash = `#/edit/${id}`
}

/**
 * 삭제 처리 전 비밀번호 확인 및 삭제 수행
 * - 왜: 삭제는 민감한 작업이므로 비밀번호를 요청해 검증해야 합니다.
 * - 구현: 브라우저의 간단한 `prompt()`로 비밀번호를 받고, 서비스의 `deletePost()` 호출.
 * - 응답에 따라 UI 갱신 및 알림을 처리합니다.
 */
function confirmDelete(post) {
  const pw = prompt('삭제하려면 비밀번호(4자리 이상)를 입력하세요.')
  if (pw === null) return // 취소한 경우 아무 동작 없음

  const result = deletePost(post.id, pw)
  if (result.success) {
    alert('삭제되었습니다.')
    loadPosts()
  } else {
    alert(result.message || '삭제에 실패했습니다.')
  }
}

/**
 * 새 글 작성으로 이동
 * - 작성 화면(예: BoardWrite.vue)으로 이동시키기 위해 해시를 변경합니다.
 */
function goToWrite() {
  location.hash = '#/write'
}

/*
 - 다른 탭/윈도우에서 localStorage를 변경하면 'storage' 이벤트가 발생합니다.
 - 이를 받아 목록을 자동 갱신하면 사용자 경험이 좋아집니다.
*/
function onStorageEvent(e) {
  if (e.key === 'posts') {
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
.post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.post-item a {
  font-weight: 600;
  margin-right: 12px;
}
.date {
  color: #666;
  margin-left: 8px;
}
.actions button {
  margin-left: 6px;
}
header {
  display:flex;
  gap:8px;
  align-items:center;
  margin-bottom:12px;
}
</style>