<template>
  <section class="board-edit">
    <h1>게시글 수정</h1>

    <div v-if="post">
      <label>
        제목
        <input v-model="title" type="text" placeholder="제목을 입력하세요" />
      </label>

      <label>
        내용
        <textarea v-model="content" placeholder="내용을 입력하세요" rows="8" />
      </label>

      <label>
        수정/삭제용 비밀번호
        <input
          v-model="password"
          type="password"
          placeholder="등록할 때 사용한 비밀번호를 입력하세요"
        />
      </label>

      <div class="buttons">
        <button type="button" @click="submitEdit">수정 저장</button>
        <button type="button" @click="goBack">취소</button>
      </div>
    </div>

    <div v-else class="empty">
      <p>수정할 게시글을 찾을 수 없습니다.</p>
      <button type="button" @click="goBack">목록으로 돌아가기</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getPostById, updatePost } from '../services/postService.js'

const post = ref(null)
const title = ref('')
const content = ref('')
const password = ref('')

/**
 * 현재 URL hash에서 수정할 게시글 id를 파싱합니다.
 * 예: '#/edit/123' -> '123'
 */
function getPostIdFromHash() {
  const hash = location.hash || '#/'
  const match = hash.match(/^#\/edit\/(.+)$/)
  return match ? match[1] : null
}

/**
 * 수정할 게시글 정보를 불러옵니다.
 * - 기존 글의 제목과 내용을 입력란에 채워줍니다.
 */
function loadPost() {
  const id = getPostIdFromHash()
  if (!id) {
    post.value = null
    return
  }

  const found = getPostById(id)
  if (!found) {
    post.value = null
    return
  }

  post.value = found
  title.value = found.title
  content.value = found.content
}

/**
 * 수정 저장 버튼을 눌렀을 때 처리합니다.
 * - 비밀번호 4자리 이상 검증
 * - updatePost() 호출
 * - 성공하면 목록 화면으로 이동
 */
function submitEdit() {
  if (!post.value) return

  if (title.value.trim() === '') {
    alert('제목을 입력해주세요.')
    return
  }

  if (content.value.trim() === '') {
    alert('내용을 입력해주세요.')
    return
  }

  if (password.value.length < 4) {
    alert('비밀번호는 4자리 이상이어야 합니다.')
    return
  }

  const result = updatePost(post.value.id, {
    title: title.value,
    content: content.value,
    password: password.value,
  })

  if (result.success) {
    alert('수정이 완료되었습니다.')
    location.hash = '#/'
  } else {
    alert(result.message || '수정에 실패했습니다.')
  }
}

/**
 * 목록 화면으로 돌아갑니다.
 */
function goBack() {
  location.hash = '#/'
}

/**
 * 해시가 바뀌면 새로 데이터를 로드합니다.
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
.board-edit {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  font-size: 1rem;
  box-sizing: border-box;
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
  background: #3b82f6;
  color: white;
}

button:last-of-type {
  background: #f3f4f6;
}

.empty {
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff7ed;
}
</style>