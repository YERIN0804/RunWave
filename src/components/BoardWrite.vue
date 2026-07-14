<template>
  <section class="board-write">
    <h1>게시글 작성</h1>

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
        placeholder="비밀번호를 4자리 이상 입력하세요"
      />
    </label>

    <div class="buttons">
      <button type="button" @click="submitPost">등록</button>
      <button type="button" @click="goBack">취소</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { addPost } from '../services/postService.js'

/*
  이 컴포넌트는 새 게시글을 작성하는 화면입니다.
  Vue 3의 script setup 문법을 사용하여 더 간단히 작성합니다.
  초보자도 이해하기 쉽게 각 변수와 함수에 주석을 달았습니다.
*/

const title = ref('')
const content = ref('')
const password = ref('')

/**
 * 등록 버튼을 눌렀을 때 실행됩니다.
 * - 제목/내용/비밀번호를 검증합니다.
 * - 성공하면 localStorage에 저장하고 목록 화면으로 이동합니다.
 */
function submitPost() {
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

  try {
    addPost({
      title: title.value,
      content: content.value,
      password: password.value,
    })

    alert('게시글이 등록되었습니다.')
    // 등록 후 목록 화면으로 이동
    location.hash = '#/'
  } catch (error) {
    // addPost 내부에서 발생한 에러 메시지를 사용자에게 보여줍니다.
    alert(error.message || '등록에 실패했습니다.')
  }
}

/**
 * 목록으로 돌아가기 위해 해시를 변경합니다.
 * 이 프로젝트는 Vue Router 대신 해시 기반 네비게이션을 사용합니다.
 */
function goBack() {
  location.hash = '#/'
}
</script>

<style scoped>
.board-write {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

input,
textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 1rem;
  width: 100%;
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
</style>