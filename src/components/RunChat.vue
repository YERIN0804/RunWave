<!-- src/components/RunChat.vue -->
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import OpenAI from 'openai'
// 신규 생성한 부산 데이터 헬퍼 임포트[cite: 1]
import { loadAllLocalData, findRelevantContext } from '../utils/dataHelper'

// 1. .env에 설정한 환경변수 로드[cite: 1]
const apiKey = import.meta.env.VITE_OPENAI_API_KEY
const modelName = import.meta.env.VITE_OPENAI_MODEL

// OpenAI 인스턴스 초기화 (프론트 호출을 위해 dangerouslyAllowBrowser 허용)[cite: 1]
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
})

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messageBox = ref(null)

// [다] 대화 히스토리 유지를 위한 배열 (기본 환영 메시지 포함)[cite: 1]
const messages = ref([
  { role: 'assistant', text: '안녕하세요! 부산 지역의 러닝 정보에 대해 물어보세요! 😊' }
])

// 컴포넌트 마운트 시 공공 데이터 7종 미리 패치[cite: 1]
onMounted(async () => {
  await loadAllLocalData()
})

// 스크롤 항상 밑으로 정렬하는 유틸 기능
const scrollToBottom = async () => {
  await nextTick()
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight
  }
}

// OpenAI API에 대화 기록 및 로컬 탐색 컨텍스트를 전달할 데이터 포맷팅 함수[cite: 1]
const getApiMessages = (userQuestion, retrievedContext) => {
  // [나] 주요 질의 유형 처리를 위한 AI 페르소나 및 데이터 컨텍스트 주입 (프롬프트 튜닝)[cite: 1]
  const systemPrompt = {
    role: 'system',
    content: `
      너는 부산 지역 정보(관광지 추천, 축제 일정, 레포츠 정보, 러닝 코스 등)를 안내하는 친절하고 전문적인 가이드 로봇이야[cite: 1].
      반드시 제공된 [부산 지역 실제 데이터]가 있는 경우, 그 정보에 나온 명칭, 주소, 설명을 기반으로 아주 정확하게 사실 위주로 설명해줘.
      제공된 데이터가 빈 값이거나 관련 장소가 없다면, 질문 의도를 파악하여 부산의 대표적인 연관 정보(해운대, 광안리, 온천천 등)를 사용해 최대한 친절하고 성의 있게 답변해줘.
      답변할 때 가독성이 좋도록 단락을 나누거나 불릿 포인트(•)를 유용하게 써줘.
      너무 답변이 길면 읽기 어려우니까, 3~5문장 정도로 간결하게 요약해서 알려주고, 추가로 더 궁금하면 질문하라고 안내해줘.
    `
  }

  // 이전 대화 기록 가공 (최근 10개만 유지하여 토큰 절약)[cite: 1]
  const history = messages.value.map(m => ({
    role: m.role,
    content: m.text
  })).slice(-10)

  // 조립 완료된 프롬프트 구성 (사용자 질문 전에 탐색 컨텍스트 주입)[cite: 1]
  const userContent = retrievedContext 
    ? `${retrievedContext}\n\n질문: ${userQuestion}`
    : userQuestion;

  return [
    systemPrompt, 
    ...history, 
    { role: 'user', content: userContent }
  ]
}

// [가] OpenAI API 직접 호출 함수[cite: 1]
async function send() {
  if (!input.value.trim() || loading.value) return

  const question = input.value
  // 사용자 메시지 화면에 즉시 추가[cite: 1]
  messages.value.push({ role: 'user', text: question })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    // 환경변수 체크 확인[cite: 1]
    if (!apiKey || apiKey.includes('short-lived')) {
      throw new Error('API 키가 설정되지 않았거나 유효하지 않습니다. .env 파일을 확인해 주세요.')
    }

    // 1. 질문 키워드에 근거해 로컬 7종 데이터에서 매칭 컨텍스트 추출[cite: 1]
    const retrievedContext = findRelevantContext(question)

    // 2. OpenAI Chat Completion 호출 (추출된 컨텍스트 함께 주입)[cite: 1]
    // const response = await openai.chat.completions.create({
    //   model: modelName,
    //   messages: getApiMessages(question, retrievedContext),
    //   temperature: 0.5, // 데이터 답변 일치율을 높이기 위해 창의성 살짝 제어
    // })

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: getApiMessages(question, retrievedContext)
      // temperature 옵션 제거
    })

    const answer = response.choices[0]?.message?.content || '응답을 받지 못했습니다.'
    
    // AI 답변 화면에 추가[cite: 1]
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
    await scrollToBottom()
  }
}

// 토글 트리거 보완
const toggleOpen = () => {
  open.value = !open.value
  if (open.value) {
    scrollToBottom()
  }
}
</script>

<template>
  <!-- [다] 플로팅 및 모바일 대응 UI 구성[cite: 1] -->
  <div class="chat-widget" :class="{ open: open }">
    <!-- 플로팅 토글 버튼[cite: 1] -->
    <button class="chat-toggle" @click="toggleOpen">
      <span v-if="!open">💬 러닝 정보 챗봇</span>
      <span v-else>✖ 닫기</span>
    </button>

    <!-- 채팅 패널[cite: 1] -->
    <div v-if="open" class="chat-panel">
      <!-- 헤더[cite: 1] -->
      <div class="chat-header">
        <h3>부산 러닝 정보 AI 가이드</h3>
        <span class="model-tag">{{ modelName }}</span>
      </div>

      <!-- 메시지 리스트 (대화 히스토리 유지)[cite: 1] -->
      <div class="messages" ref="messageBox">
        <div v-for="(item, index) in messages" :key="index" :class="['message-row', item.role]">
          <div class="bubble">
            <p>{{ item.text }}</p>
          </div>
        </div>
        <!-- 로딩 애니메이션[cite: 1] -->
        <div v-if="loading" class="message-row assistant">
          <div class="bubble loading-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- 입력창[cite: 1] -->
      <div class="input-row">
        <input 
          v-model="input" 
          @keyup.enter="send" 
          placeholder="ex) 광안리 근처 러닝 코스 추천해줘" 
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
/* 기존 스타일 그대로 유지되므로 리스팅 생략 (수정된 스크롤바 바인딩 및 부드러운 전환 최적화 포함) */
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

.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
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

.loading-bubble { display: flex; gap: 4px; padding: 12px 16px; }
.dot { width: 6px; height: 6px; background: #999; border-radius: 50%; animation: blink 1.4s infinite both; }
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }

@media (max-width: 480px) {
  .chat-widget { right: 12px; bottom: 12px; left: 12px; }
  .chat-panel { width: 100%; height: calc(100vh - 100px); }
  .chat-toggle { width: 100%; text-align: center; }
}
</style>