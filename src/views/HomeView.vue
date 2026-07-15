<template>
  <div class="app-wrap">
    <header class="app-header">
      <h1>부산 러닝 메이트 🏃‍♂️</h1>
      <h1>--- 여기 제목이나 로고 적을거에요 ! ---</h1>
    </header>

    <main class="app-content">
      <BeachRunView />
      


      <section class="weather-section">
        <WeatherDashBoard />
      </section>

      <BoardWrite v-if="currentHash === '#/write'" />
      <BoardDetail v-else-if="currentHash.startsWith('#/post/')" />
      <BoardEdit v-else-if="currentHash.startsWith('#/edit/')" />
      <BoardList v-else />

      <RunChat/>
      
      <div class="main-page">
        <button class="ranking-btn" @click="$router.push('/ranking')">
          🏅 부산 명예의 전당 보러가기
        </button>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2026 부산 러닝 메이트. All rights reserved.</p>
    </footer>
  </div>


</template>

<script setup>
import { ref } from 'vue'
import BeachRunView from "../views/BeachRunView.vue";
import RunChat from '../components/RunChat.vue';
import WeatherDashBoard from '../components/WeatherDashBoard.vue';
import {onMounted, onBeforeUnmount } from 'vue'
import BoardList from '../components/BoardList.vue'
import BoardWrite from '../components/BoardWrite.vue'
import BoardDetail from '../components/BoardDetail.vue'
import BoardEdit from '../components/BoardEdit.vue'

const currentHash = ref(location.hash || '#/')

function updateHash() {
  currentHash.value = location.hash || '#/'
}

onMounted(() => {
  window.addEventListener('hashchange', updateHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', updateHash)
})


const touristSpots = ref([])
</script>

<style scoped>
/* 대시보드 섹션 스타일 추가 */
.dashboard-section {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>