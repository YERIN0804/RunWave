<template>
  <div class="weather-card">
    <h3>부산 현재 날씨</h3>
    <div v-if="loading">로딩 중...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div class="row">
        <img :src="iconUrl" alt="icon" v-if="iconUrl"/>
        <div>
          <div class="temp">{{ weather.main.temp.toFixed(1) }}°C</div>
          <div class="desc">{{ weather.weather[0].description }}</div>
          <div>풍속: {{ weather.wind.speed }} m/s</div>
        </div>
      </div>

      <div class="suitability">
        <div class="score">{{ suitability.score }} / 100 — {{ suitability.label }}</div>
        <div class="bar">
          <div class="fill" :style="{ width: suitability.score + '%' }"></div>
        </div>
        <div class="advice">{{ suitability.advice }}</div>
      </div>

      <button @click="refresh">새로고침</button>
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

// async function fetchWeather() {
//   loading.value = true
//   error.value = ''
//   try {
//     const res = await fetch(`http://localhost:3000/api/weather?lat=${lat}&lon=${lon}`)
//     if (!res.ok) throw new Error(await res.text())
//     weather.value = await res.json()
//   } catch (e) {
//     error.value = e.message || '날씨 정보를 불러올 수 없습니다.'
//   } finally {
//     loading.value = false
//   }
// }
async function fetchWeather() {
  loading.value = true
  error.value = ''
  try {
    // .env에 API 키가 제대로 설정되었는지 검증[cite: 3]
    if (!openWeatherApiKey) {
      throw new Error('.env 파일에 VITE_OPENWEATHER_API_KEY를 설정해 주세요.')
    }

    // OpenWeatherMap 공식 API로 직접 요청 (섭씨온도 및 한글 설정 추가)[cite: 3]
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=kr`
    const res = await fetch(url)
    
    if (!res.ok) {
      throw new Error(`날씨 API 요청 실패 (상태 코드: ${res.status})`)
    }
    
    weather.value = await res.json()
  } catch (e) {
    console.error('날씨 데이터 취득 실패:', e)
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

const suitability = computed(() => {
  if (!weather.value) return { score: 0, label: '-', advice: '' }
  const s = scoreFrom(weather.value)
  let label = '매우 적합'
  if (s < 30) label = '비추천'
  else if (s < 60) label = '주의'
  else if (s < 80) label = '적합'
  let advice = ''
  if (s >= 80) advice = '좋은 컨디션입니다. 해변 러닝 추천.'
  else if (s >= 60) advice = '무난하지만 준비물(물, 얇은 자켓) 챙기세요.'
  else if (s >= 30) advice = '바람/온도/약한 비 유의, 단거리 권장.'
  else advice = '오늘은 러닝을 미루고 실내 운동을 권장합니다.'
  return { score: s, label, advice }
})

const iconUrl = computed(() => {
  if (!weather.value) return ''
  const code = weather.value.weather[0].icon
  return `https://openweathermap.org/img/wn/${code}@2x.png`
})

function refresh() { fetchWeather() }

onMounted(() => {
  fetchWeather()
  intervalId = setInterval(fetchWeather, 10 * 60 * 1000) // 10분마다 갱신
})
onUnmounted(() => { clearInterval(intervalId) })
</script>

<style scoped>
.weather-card { border:1px solid #eee; padding:12px; border-radius:8px; width:320px; background:#fff; }
.row { display:flex; gap:12px; align-items:center; }
.temp { font-size:22px; font-weight:700; }
.suitability { margin-top:12px }
.bar { height:10px; background:#f0f0f0; border-radius:6px; overflow:hidden; }
.fill { height:100%; background:linear-gradient(90deg,#4caf50,#ff9800); transition:width .5s; }
.score { font-weight:600; margin-bottom:6px }
.advice { margin-top:6px; font-size:13px; color:#444 }
button { margin-top:10px; padding:6px 10px; border-radius:6px; background:#007aff; color:#fff; border:none }
</style>