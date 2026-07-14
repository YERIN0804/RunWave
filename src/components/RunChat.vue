<script setup>
import { ref } from 'vue'
import OpenAI from 'openai'

// 1. .env에 설정한 환경변수 로드
const apiKey = import.meta.env.VITE_OPENAI_API_KEY
const modelName = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

// OpenAI 인스턴스 초기화 (프론트 호출을 위해 dangerouslyAllowBrowser 허용)
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
})

const open = ref(false)
const input = ref('')
const loading = ref(false)

// [다] 대화 히스토리 유지를 위한 배열 (기본 환영 메시지 포함)
const messages = ref([
  { role: 'assistant', text: '안녕하세요! 원하시는 지역 정보(관광지 추천, 축제 일정, 모범음식점 등)에 대해 물어보세요! 😊' }
])

// OpenAI API에 대화 기록을 전달할 때 사용할 데이터 포맷팅 함수
const getApiMessages = (userQuestion) => {
  // [나] 주요 질의 유형 처리를 위한 AI 페르소나 및 데이터 컨텍스트 주입 (프롬프트 튜닝)
  const systemPrompt = {
    role: 'system',
    content: `
      너는 지역 정보(권역별 관광지 추천, 축제 일정, 모범음식점 위치 등)를 전문적으로 안내하는 친절한 가이드 로봇이야.
      사용자가 질문하면 질문 의도(관광지, 축제, 음식점, 커뮤니티 등)를 파악해서 가장 적절하고 유용한 정보를 제공해줘.
      만약 구체적인 지역 데이터(JSON)가 연동되기 전이라면, 사용자가 묻는 지역의 유명한 장소나 정보를 기반으로 자연스럽고 정성스럽게 답변해줘.
    `
  }

  // 이전 대화 기록 가공 (최근 10개만 유지하여 토큰 절약)
  const history = messages.value.map(m => ({
    role: m.role,
    content: m.text
  })).slice(-10)

  // 시스템 프롬프트 + 히스토리 + 현재 질문 결합
  return [systemPrompt, ...history, { role: 'user', content: userQuestion }]
}

// [가] OpenAI API 직접 호출 함수
async function send() {
  if (!input.value.trim() || loading.value) return

  const question = input.value
  // 사용자 메시지 화면에 즉시 추가
  messages.value.push({ role: 'user', text: question })
  input.value = ''
  loading.value = true

  try {
    // 환경변수 체크 확인
    if (!apiKey || apiKey.includes('short-lived')) {
      throw new Error('API 키가 설정되지 않았거나 유효하지 않습니다. .env 파일을 확인해 주세요.')
    }

    // OpenAI Chat Completion 호출
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: getApiMessages(question),
      temperature: 0.7,
    })

    const answer = response.choices[0]?.message?.content || '응답을 받지 못했습니다.'
    
    // AI 답변 화면에 추가
    messages.value.push({ role: 'assistant', text: answer })
  } catch (err) {
    console.error('OpenAI API Error:', err)
    messages.value.push({ 
      role: 'assistant', 
      text: err.message.includes('API 키') 
        ? err.message 
        : '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 키 제한 및 네트워크를 확인해 주세요.' 
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- [다] 플로팅 및 모바일 대응 UI 구성 -->
  <div class="chat-widget" :class="{ open: open }">
    <!-- 플로팅 토글 버튼 -->
    <button class="chat-toggle" @click="open = !open">
      <span v-if="!open">💬 지역 정보 챗봇</span>
      <span v-else>✖ 닫기</span>
    </button>

    <!-- 채팅 패널 -->
    <div v-if="open" class="chat-panel">
      <!-- 헤더 -->
      <div class="chat-header">
        <h3>지역 정보 AI 가이드</h3>
        <span class="model-tag">{{ modelName }}</span>
      </div>

      <!-- 메시지 리스트 (대화 히스토리 유지) -->
      <div class="messages">
        <div v-for="(item, index) in messages" :key="index" :class="['message-row', item.role]">
          <div class="bubble">
            <p>{{ item.text }}</p>
          </div>
        </div>
        <!-- 로딩 애니메이션 -->
        <div v-if="loading" class="message-row assistant">
          <div class="bubble loading-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- 입력창 -->
      <div class="input-row">
        <input 
          v-model="input" 
          @keyup.enter="send" 
          placeholder="ex) 부산 권역 관광지 추천해줘" 
          :disabled="loading"
        />
        <button @click="send" :disabled="loading || !input.trim()">
          {{ loading ? '...' : '전송' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* [다] 모바일 대응 및 플로팅 스타일링 */
.chat-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  z-index: 9999;
}

/* 플로팅 버튼 */
.chat-toggle {
  padding: 12px 20px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s;
}
.chat-toggle:hover {
  background-color: #0056b3;
  transform: scale(1.03);
}

/* 채팅창 메인 패널 */
.chat-panel {
  width: 360px;
  height: 550px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 헤더 */
.chat-header {
  background-color: #f8f9fa;
  padding: 14px 16px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header h3 { margin: 0; font-size: 16px; color: #333; }
.model-tag { font-size: 11px; background: #e1f0ff; color: #007aff; padding: 2px 6px; border-radius: 4px; }

/* 대화창 스크롤 영역 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fdfdfd;
}

.message-row {
  display: flex;
  width: 100%;
}
.message-row.user { justify-content: flex-end; }
.message-row.assistant { justify-content: flex-start; }

/* 말풍선 공통 */
.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap; /* 줄바꿈 허용 */
}
.user .bubble {
  background-color: #007aff;
  color: white;
  border-top-right-radius: 2px;
}
.assistant .bubble {
  background-color: #f1f1f3;
  color: #333;
  border-top-left-radius: 2px;
}
.bubble p { margin: 0; }

/* 입력창 영역 */
.input-row {
  display: flex;
  gap: 8px;
  padding: 14px;
  background-color: #ffffff;
  border-top: 1px solid #eaeaea;
}
input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dbdbdb;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}
input:focus { border-color: #007aff; }
button {
  padding: 0 16px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}
button:disabled { background-color: #cccccc; cursor: not-allowed; }

/* 말풍선 로딩 애니메이션 효과 */
.loading-bubble { display: flex; gap: 4px; padding: 12px 16px; }
.dot { width: 6px; height: 6px; background: #999; border-radius: 50%; animation: blink 1.4s infinite both; }
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }

/* [다] 모바일 환경 미디어 쿼리 대응 */
@media (max-width: 480px) {
  .chat-widget { right: 12px; bottom: 12px; left: 12px; }
  .chat-panel { width: 100%; height: calc(100vh - 100px); }
  .chat-toggle { width: 100%; text-align: center; }
}
</style>