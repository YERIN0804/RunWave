<template>
  <section class="board-write">
    <div class="form-card">
      <div class="form-header">
        <h1>게시글 작성</h1>
        <p>러닝 크루 모집 정보를 입력해 주세요.</p>
      </div>

      <label class="field">
        <span>제목</span>
        <input
          v-model="title"
          type="text"
          placeholder="예: 부산 해운대 10km 함께 달려요"
        />
      </label>

      <label class="field">
        <span>내용</span>
        <textarea
          v-model="content"
          rows="8"
          placeholder="모집 내용과 함께 달리고 싶은 분위기를 적어주세요."
        />
      </label>

      <div class="grid">
        <label class="field">
          <span>러닝 코스명</span>
          <input v-model="courseName" type="text" placeholder="예: 해운대 해변 러닝" />
        </label>

        <label class="field">
  <span>모임 날짜</span>
  <div class="input-with-icon">
    <span class="input-icon" aria-hidden="true">📅</span>
    <input v-model="meetingDate" type="date" :min="minDate" />
  </div>
</label>

<label class="field">
  <span>모임 시간</span>
  <div class="input-with-icon">
    <span class="input-icon" aria-hidden="true">⏰</span>
    <input v-model="meetingTime" type="time" step="600" />
  </div>
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
          placeholder="비밀번호를 4자리 이상 입력하세요"
        />
      </label>

      <div class="buttons">
        <button type="button" class="primary" @click="submitPost">등록</button>
        <button type="button" class="secondary" @click="goBack">취소</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { addPost } from '../services/postService.js'

/*
  이 컴포넌트는 새 게시글을 작성하는 화면입니다.
  기존 제목 / 내용 / 비밀번호 흐름은 그대로 유지하고,
  러닝 크루 모집 정보를 추가로 입력받습니다.
*/

const title = ref('')
const content = ref('')
const password = ref('')

const courseName = ref('')
const meetingDate = ref('')
const meetingTime = ref('')
const maxParticipants = ref('')
const difficulty = ref('초급')
const meetingPlace = ref('')
const today = new Date()

const minDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
/**
 * 등록 버튼을 눌렀을 때 실행됩니다.
 * - 제목, 내용, 비밀번호는 필수입니다.
 * - 모집 인원은 숫자로 변환해서 1명 이상이어야 합니다.
 * - 성공하면 addPost()로 저장하고 목록 화면으로 이동합니다.
 */
function submitPost() {
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

  try {
    addPost({
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

    alert('등록되었습니다.')
    location.hash = '#/'
  } catch (error) {
    alert(error.message || '등록에 실패했습니다.')
  }
}

/**
 * 취소 버튼을 눌렀을 때 목록 화면으로 돌아갑니다.
 */
function goBack() {
  location.hash = '#/'
}
</script>

<style scoped>
.board-write {
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
.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-left: 42px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #6b7280;
  pointer-events: none;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:hover,
textarea:hover,
select:hover {
  border-color: #2563eb;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  outline: none;
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