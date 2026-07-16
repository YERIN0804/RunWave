<template>
  <div class="weather-card" :class="suitability.class">
    <!-- 헤더 영역 -->
    <div class="card-header">
      <span class="location-tag">📍 Busan</span>
      <button class="refresh-btn" @click="refresh" :disabled="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ 'spinning': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
      </button>
    </div>

    <!-- 로딩 및 에러 상태 처리 -->
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>실시간 부산 날씨 조회 중...</p>
    </div>
    <div v-else-if="error" class="state-container error">
      <p>⚠️ {{ error }}</p>
      <button @click="refresh" class="retry-btn">다시 시도</button>
    </div>

    <!-- 메인 날씨 정보 -->
    <div v-else class="card-body">
      <div class="main-info">
        <div class="weather-icon-box">
          <img :src="iconUrl" alt="날씨 아이콘" v-if="iconUrl"/>
        </div>
        <div class="weather-text">
          <div class="temp">{{ weather.main.temp.toFixed(1) }}<span class="unit">°C</span></div>
          <div class="desc">{{ weather.weather[0].description }}</div>
        </div>
      </div>

      <!-- 세부 날씨 지표 (그리드 배치) -->
      <div class="weather-sub-details">
        <div class="detail-item">
          <span class="label">💨 풍속</span>
          <span class="value">{{ weather.wind.speed }} m/s</span>
        </div>
        <div class="detail-item">
          <span class="label">💧 습도</span>
          <span class="value">{{ weather.main.humidity }}%</span>
        </div>
      </div>

      <hr class="divider" />

      <!-- 러닝 지수 및 맞춤 코멘트 (강조 레이아웃) -->
      <div class="suitability-box">
        <div class="suitability-header">
          <span class="status-badge">{{ suitability.label }}</span>
          <span class="score-text">⚡ <strong>{{ suitability.score }}</strong> / 100</span>
        </div>
        
        <!-- 프로그레스 바 -->
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: suitability.score + '%', backgroundColor: suitability.color }"></div>
        </div>
        
        <!-- 자연스럽고 정성스러운 조언 코멘트 -->
        <p class="advice-text">{{ suitability.advice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const lat = 35.1796
const lon = 129.0756
const weather = ref(null)
const loading = ref(true)
const error = ref('')
let intervalId = null

const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

async function fetchWeather() {
  loading.value = true
  error.value = ''
  try {
    if (!openWeatherApiKey) {
      throw new Error('.env 파일에 VITE_OPENWEATHER_API_KEY를 설정해 주세요.')
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=kr`
    const res = await fetch(url)
    if (!res.ok) throw new Error('날씨 정보를 받아오지 못했습니다.')
    weather.value = await res.json()
  } catch (e) {
    error.value = e.message || '날씨 정보를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

function scoreFrom(data) {
  if (!data) return 0
  let score = 100
  const t = data.main.temp
  const w = data.wind?.speed ?? 0
  const main = (data.weather[0]?.main || '').toLowerCase()
  const rain = !!(data.rain || main.includes('rain') || main.includes('thunder'))

  if (rain) score -= 80
  if (t < 5) score -= 30
  else if (t < 10) score -= 10
  else if (t > 28) score -= 25
  else if (t > 24) score -= 10

  if (w > 10) score -= 40
  else if (w > 6) score -= 20

  if (score < 0) score = 0
  return Math.round(score)
}

// 텍스트 코멘트 및 테마 색상 최적화
const suitability = computed(() => {
  if (!weather.value) return { score: 0, label: '-', advice: '', color: '#ccc', class: '' }
  const s = scoreFrom(weather.value)
  
  let label = '매우 적합'
  let advice = '러닝하기 완벽한 날씨입니다! 지금 당장 운동화를 신고 밖으로 나가보세요! 🏃‍♂️'
  let color = '#10b981' // 초록
  let className = 'status-best'

  if (s < 30) {
    label = '기상 악화 (비추천)'
    advice = '현재 기상 조건이 러닝에 좋지 않습니다. 오늘은 안전하게 실내 스트레칭이나 홈트레이닝을 권장해요. 🧘‍♀️'
    color = '#ef4444' // 빨강
    className = 'status-worst'
  } else if (s < 60) {
    label = '기상 주의'
    advice = '기온이 다소 높거나 바람이 강해 페이스 조절이 필요합니다. 무리한 장거리보다는 가벼운 시티런이나 온천천 그늘길 산책을 추천해요! 🥤'
    color = '#f59e0b' // 주황
    className = 'status-warning'
  } else if (s < 80) {
    label = '러닝 적합'
    advice = '무난하게 달리기 좋은 날씨입니다. 땀 흡수가 잘 되는 얇은 기능성 의류와 시원한 음료를 준비해서 뛰어보세요. 👍'
    color = '#3b82f6' // 파랑
    className = 'status-good'
  }

  return { score: s, label, advice, color, class: className }
})

const iconUrl = computed(() => {
  if (!weather.value) return ''
  const code = weather.value.weather[0].icon
  return `https://openweathermap.org/img/wn/${code}@2x.png`
})

function refresh() { fetchWeather() }

onMounted(() => {
  fetchWeather()
  intervalId = setInterval(fetchWeather, 10 * 60 * 1000)
})
onUnmounted(() => { clearInterval(intervalId) })
</script>

<style scoped>
/* 카드 메인 컨테이너 */
.weather-card {
  width: 100%;
  max-width: 350px;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid #f0f0f4;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.weather-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}

/* 상단 헤더 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.location-tag {
  font-size: 13px;
  font-weight: 700;
  color: #4b5563;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.refresh-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.refresh-btn:hover { color: #3b82f6; }

/* 메인 날씨 정보 레이아웃 */
.main-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.weather-icon-box {
  background: #f8fafc;
  border-radius: 16px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.weather-icon-box img { width: 56px; height: 56px; }
.weather-text .temp {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.1;
}
.weather-text .temp .unit { font-size: 20px; font-weight: 500; color: #4b5563; }
.weather-text .desc { font-size: 14px; color: #6b7280; font-weight: 500; margin-top: 2px; }

/* 세부 서브 지표 */
.weather-sub-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.detail-item {
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-item .label { font-size: 11px; color: #9ca3af; font-weight: 600; }
.detail-item .value { font-size: 13px; color: #374151; font-weight: 700; }

.divider { border: 0; height: 1px; background: #f1f5f9; margin: 16px 0; }

/* 러닝 추천 지수 박스 구조 */
.suitability-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.suitability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-badge {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 8px;
}
.score-text { font-size: 13px; color: #6b7280; }
.score-text strong { font-size: 16px; color: #1f2937; }

/* 가변 배지 컬러 바인딩 (클래스별 상이) */
.status-best .status-badge { background-color: #10b981; }
.status-good .status-badge { background-color: #3b82f6; }
.status-warning .status-badge { background-color: #f59e0b; }
.status-worst .status-badge { background-color: #ef4444; }

/* 상태별 전체 카드 테마 톤 다운 소프트 배경 효과 */
.status-best { background: linear-gradient(to bottom right, #ffffff, #f0fdf4); }
.status-good { background: linear-gradient(to bottom right, #ffffff, #eff6ff); }
.status-warning { background: linear-gradient(to bottom right, #ffffff, #fffbeb); }
.status-worst { background: linear-gradient(to bottom right, #ffffff, #fef2f2); }

/* 프로그레스 바 */
.progress-bar-container {
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 코멘트 안내 문구 */
.advice-text {
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
  font-weight: 500;
  word-break: keep-all;
  margin: 4px 0 0 0;
}

/* 유틸리티 애니메이션 클래스 */
.state-container {
  padding: 40px 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 1.0s linear infinite;
}
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.retry-btn {
  margin-top: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>