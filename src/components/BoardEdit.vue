<template>
  <section class="board-edit">
    <div class="form-card">
      <div class="form-header">
        <h1>게시글 수정</h1>
        <p>기존 모집 정보와 새 정보를 함께 수정해 주세요.</p>
      </div>

      <div v-if="post">
        <label class="field">
          <span>제목</span>
          <input v-model="title" type="text" placeholder="제목을 입력하세요" />
        </label>

        <label class="field">
          <span>내용</span>
          <textarea v-model="content" rows="8" placeholder="내용을 입력하세요" />
        </label>

        <div class="grid">
          <label class="field">
            <span>러닝 코스명</span>
            <input v-model="courseName" type="text" placeholder="예: 해운대 해변 러닝" />
          </label>

          <label class="field">
            <span>모임 날짜</span>
            <input v-model="meetingDate" type="text" placeholder="예: 2026-07-20" />
          </label>

          <label class="field">
            <span>모임 시간</span>
            <input v-model="meetingTime" type="text" placeholder="예: 오전 7:00" />
          </label>

          <label class="field">
            <span>모집 인원</span>
            <input v-model="maxParticipants" type="number" min="1" placeholder="예: 5" />
          </label>

          <label class="field">
            <span>러닝 난이도</span>
            <select v-model="difficulty">
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>
          </label>

          <label class="field">
            <span>모임 장소</span>
            <input v-model="meetingPlace" type="text" placeholder="예: 해운대 해수욕장" />
          </label>
        </div>

        <label class="field">
          <span>수정/삭제용 비밀번호</span>
          <input
            v-model="password"
            type="password"
            placeholder="등록할 때 사용한 비밀번호를 입력하세요"
          />
        </label>

        <div class="buttons">
          <button type="button" class="primary" @click="submitEdit">수정</button>
          <button type="button" class="secondary" @click="goBack">취소</button>
        </div>
      </div>

      <div v-else class="empty">
        <p>수정할 게시글을 찾을 수 없습니다.</p>
        <button type="button" class="secondary" @click="goBack">목록으로 돌아가기</button>
      </div>
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

const courseName = ref('')
const meetingDate = ref('')
const meetingTime = ref('')
const maxParticipants = ref('')
const difficulty = ref('초급')
const meetingPlace = ref('')

function getPostIdFromHash() {
  const hash = location.hash || '#/'
  const match = hash.match(/^#\/edit\/(.+)$/)
  return match ? match[1] : null
}

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

  title.value = found.title || ''
  content.value = found.content || found.description || ''
  password.value = ''

  courseName.value = found.courseName || ''
  meetingDate.value = found.meetingDate || ''
  meetingTime.value = found.meetingTime || ''
  maxParticipants.value = found.maxParticipants || ''
  difficulty.value = found.difficulty || '초급'
  meetingPlace.value = found.meetingPlace || ''
}

function submitEdit() {
  if (!post.value) return

  const trimmedTitle = title.value.trim()
  const trimmedContent = content.value.trim()
  const trimmedPassword = password.value

  if (trimmedTitle === '') {
    alert('제목을 입력해주세요.')
    return
  }

  if (trimmedContent === '') {
    alert('내용을 입력해주세요.')
    return
  }

  if (trimmedPassword.length < 4) {
    alert('비밀번호는 4자리 이상이어야 합니다.')
    return
  }

  const parsedParticipants = Number(maxParticipants.value)

  if (!Number.isInteger(parsedParticipants) || parsedParticipants < 1) {
    alert('모집 인원은 1명 이상이어야 합니다.')
    return
  }

  const result = updatePost(post.value.id, {
    title: trimmedTitle,
    content: trimmedContent,
    password: trimmedPassword,
    courseName: courseName.value.trim(),
    meetingDate: meetingDate.value.trim(),
    meetingTime: meetingTime.value.trim(),
    maxParticipants: parsedParticipants,
    difficulty: difficulty.value,
    meetingPlace: meetingPlace.value.trim(),
  })

  if (result.success) {
    alert('수정되었습니다.')
    location.hash = `#/post/${post.value.id}`
  } else {
    alert(result.message || '수정에 실패했습니다.')
  }
}

function goBack() {
  if (!post.value) {
    location.hash = '#/'
    return
  }

  location.hash = `#/post/${post.value.id}`
}

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
  max-width: 780px;
  margin: 0 auto;
  padding: 20px 12px 40px;
}

.form-card {
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  border: 1px solid #e5ecf5;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.form-header {
  margin-bottom: 20px;
}

.form-header h1 {
  margin: 0 0 6px;
  font-size: 1.4rem;
  color: #1f2937;
}

.form-header p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field span {
  font-weight: 600;
  color: #374151;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 1rem;
  box-sizing: border-box;
  background: #fff;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

button {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  background: #2563eb;
  color: white;
}

.secondary {
  background: #e5e7eb;
  color: #111827;
}

.empty {
  padding: 24px;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  background: #f9fafb;
  text-align: center;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 18px;
  }
}
</style>